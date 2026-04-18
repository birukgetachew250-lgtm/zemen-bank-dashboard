import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/activity-log';
import crypto from 'crypto';
import { sendEmail } from '@/services/email-service';

const DEFAULT_SESSION_TIMEOUT_MINUTES = 30;

async function getSessionTimeoutMinutes(): Promise<number> {
  try {
    const policy = await db.securityPolicy.findUnique({ where: { id: 1 } });
    return Math.max(5, Number(policy?.sessionTimeout || DEFAULT_SESSION_TIMEOUT_MINUTES));
  } catch {
    return DEFAULT_SESSION_TIMEOUT_MINUTES;
  }
}

async function getUserPermissions(roleName: string): Promise<string[]> {
  if (roleName === 'Super Admin') {
    return ['all'];
  }

  try {
    const role = await db.role.findUnique({ where: { name: roleName } });

    if (role?.description) {
      try {
        const descObj = JSON.parse(role.description);
        return descObj.permissions || [];
      } catch {
        return [];
      }
    }

    return [];
  } catch (e) {
    console.error('Failed to get user permissions:', e);
    return [];
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const forwardedFor = req.headers?.['x-forwarded-for'];
        const realIp = req.headers?.['x-real-ip'];
        const ip = Array.isArray(forwardedFor)
          ? forwardedFor[0]
          : (forwardedFor as string | undefined) || (realIp as string | undefined);

        try {
          const user = await db.user.findUnique({ where: { email: credentials.email } });

          if (!user) {
            await logActivity({
              userEmail: credentials.email,
              action: 'LOGIN_FAILURE',
              status: 'Failure',
              details: 'User not found.',
              ipAddress: ip,
            });
            return null;
          }

          if (user.password !== credentials.password) {
            await logActivity({
              userEmail: user.email,
              action: 'LOGIN_FAILURE',
              status: 'Failure',
              details: 'Invalid password.',
              ipAddress: ip,
            });
            throw new Error('Invalid email or password.');
          }

          const permissions = await getUserPermissions(user.role);

          if (user.mfaEnabled) {
            const otp = crypto.randomInt(100000, 999999).toString();
            const expires = new Date();
            expires.setMinutes(expires.getMinutes() + 5);

            await db.otpCode.create({
              data: {
                UserId: user.id.toString(),
                Code: otp,
                Purpose: 'LOGIN_MFA',
                OtpType: 'Email',
                ExpiresAt: expires,
              },
            });

            const emailBody = `
              <html>
                <body>
                  <h2>One-Time Password (OTP)</h2>
                  <p>Dear customer,</p>
                  <p>Your OTP for verification is: <strong style='font-size: 18px;'>${otp}</strong></p>
                  <p>This code is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
                  <br/>
                  <p>Best regards,<br/><strong>Zemen Mobile Banking Team</strong></p>
                </body>
              </html>`;

            const emailResult = await sendEmail(user.email, 'Your Zemen Admin Center Login Code', emailBody);

            await logActivity({
              userEmail: user.email,
              action: 'OTP_EMAIL_SENT',
              status: emailResult.success ? 'Success' : 'Failure',
              details: emailResult.success ? 'MFA required. OTP sent to email.' : `MFA email failed to send for user ${user.email}.`,
              ipAddress: ip,
            });

            return {
              id: user.id.toString(),
              email: user.email,
              name: user.name,
              role: user.role,
              permissions,
              mfaRequired: true,
            } as any;
          }

          await logActivity({
            userEmail: user.email,
            action: 'LOGIN_SUCCESS',
            status: 'Success',
            details: 'User successfully logged in (MFA not enabled).',
            ipAddress: ip,
          });

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            permissions,
            mfaRequired: false,
          } as any;
        } catch (error: any) {
          console.error('Authorization error:', error);
          throw new Error(error.message || 'An unexpected error occurred during login.');
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      const now = Date.now();

      if (user) {
        token.id = user.id as string;
        token.email = user.email as string;
        token.name = user.name as string;
        token.role = (user as any).role;
        token.mfaRequired = (user as any).mfaRequired;
        token.permissions = (user as any).permissions;
        token.lastActivityAt = now;
        token.sessionExpired = false;
      }

      if (token.role && !token.permissions) {
        token.permissions = await getUserPermissions(token.role as string);
      }

      if (trigger === 'update' && (session as any)?.mfaValidated) {
        token.mfaRequired = false;
      }

      if (trigger === 'update' && typeof (session as any)?.touchSessionAt === 'number') {
        token.lastActivityAt = (session as any).touchSessionAt;
        token.sessionExpired = false;
      }

      const timeoutMinutes = await getSessionTimeoutMinutes();
      token.sessionTimeoutMinutes = timeoutMinutes;

      const lastActivityAt = Number(token.lastActivityAt || now);
      token.sessionExpired = now - lastActivityAt > timeoutMinutes * 60 * 1000;

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }

      session.permissions = token.permissions as string[] | undefined;
      session.mfaRequired = token.mfaRequired as boolean | undefined;
      session.sessionTimeoutMinutes = Number(token.sessionTimeoutMinutes || DEFAULT_SESSION_TIMEOUT_MINUTES);
      session.lastActivityAt = Number(token.lastActivityAt || Date.now());
      session.sessionExpired = Boolean(token.sessionExpired);
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60,
  },
  jwt: {
    maxAge: 8 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
