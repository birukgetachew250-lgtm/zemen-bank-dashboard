import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/activity-log';
import crypto from 'crypto';
import { sendEmail } from '@/services/email-service';

const DEFAULT_SESSION_TIMEOUT_MINUTES = 30;

const MAX_LOGIN_ATTEMPTS = 5;

async function getSessionTimeoutMinutes(): Promise<number> {
  try {
    const policy = await db.securityPolicy.findUnique({ where: { id: 1 } });
    return Math.max(1, Number(policy?.sessionTimeout || DEFAULT_SESSION_TIMEOUT_MINUTES));
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
            throw new Error('Invalid email or password.');
          }

          // If account is locked, prevent authentication
          if ((user as any).isLocked) {
            await logActivity({
              userEmail: user.email,
              action: 'LOGIN_FAILURE',
              status: 'Failure',
              details: 'Attempt to login to locked account.',
              ipAddress: ip,
            });
            throw new Error('Your account is locked due to multiple failed login attempts.');
          }

          if (user.password !== credentials.password) {
            // increment failed attempts
            try {
              await db.user.update({
                where: { id: user.id },
                data: { failedLoginAttempts: { increment: 1 } as any },
              });
            } catch (e) {
              console.error('Failed to increment failedLoginAttempts:', e);
            }

            // re-fetch to check count
            const refreshed = await db.user.findUnique({ where: { id: user.id } });
            const attempts = Number((refreshed as any)?.failedLoginAttempts || 0);

            if (attempts >= MAX_LOGIN_ATTEMPTS) {
              try {
                await db.user.update({
                  where: { id: user.id },
                  data: { isLocked: true, status: 'Suspended' },
                });
              } catch (e) {
                console.error('Failed to lock user account:', e);
              }
              await logActivity({
                userEmail: user.email,
                action: 'LOGIN_FAILURE',
                status: 'Failure',
                details: `Account locked after ${attempts} failed attempts.`,
                ipAddress: ip,
              });
              throw new Error('Your account has been locked due to multiple failed login attempts. Please contact an administrator.');
            }

            await logActivity({
              userEmail: user.email,
              action: 'LOGIN_FAILURE',
              status: 'Failure',
              details: 'Invalid password.',
              ipAddress: ip,
            });
            throw new Error('Invalid email or password.');
          }

          if (user.status === 'Suspended') {
            await logActivity({
              userEmail: user.email,
              action: 'LOGIN_FAILURE',
              status: 'Failure',
              details: 'Login blocked for suspended account.',
              ipAddress: ip,
            });
            throw new Error('Your account is suspended. Please contact an administrator.');
          }

          const mustChangePassword = user.status === 'PasswordChangeRequired';

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

            const timeoutMinutes = await getSessionTimeoutMinutes();

            return {
              id: user.id.toString(),
              email: user.email,
              name: user.name,
              role: user.role,
              permissions,
              mfaRequired: true,
              mustChangePassword,
              sessionTimeoutMinutes: timeoutMinutes,
            } as any;
          }

          // reset failed attempts and invalidate previous sessions on successful login
          try {
            const now = new Date();
            await db.user.update({
              where: { id: user.id },
              data: { failedLoginAttempts: 0, isLocked: false, sessionInvalidatedAt: now } as any,
            });
          } catch (e) {
            console.error('Failed to reset failedLoginAttempts or set sessionInvalidatedAt after successful login:', e);
          }

          await logActivity({
            userEmail: user.email,
            action: 'LOGIN_SUCCESS',
            status: 'Success',
            details: 'User successfully logged in (MFA not enabled). Previous sessions invalidated.',
            ipAddress: ip,
          });

          const timeoutMinutes = await getSessionTimeoutMinutes();

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            permissions,
            mfaRequired: false,
            mustChangePassword,
            sessionTimeoutMinutes: timeoutMinutes,
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
        token.mustChangePassword = (user as any).mustChangePassword;
        token.permissions = (user as any).permissions;
        token.lastActivityAt = now;
        token.sessionExpired = false;
        token.sessionTimeoutMinutes = (user as any).sessionTimeoutMinutes;
      }

      if (token.role && !token.permissions) {
        token.permissions = await getUserPermissions(token.role as string);
      }

      if (trigger === 'update' && (session as any)?.mfaValidated) {
        token.mfaRequired = false;
      }

      if (trigger === 'update' && (session as any)?.passwordChanged) {
        token.mustChangePassword = false;
      }

      if (trigger === 'update' && typeof (session as any)?.touchSessionAt === 'number') {
        token.lastActivityAt = (session as any).touchSessionAt;
        token.sessionExpired = false;
      }

      // Always recalculate timeout on every JWT callback to pick up DB changes
      if (!token.sessionTimeoutMinutes) {
        const timeoutMinutes = await getSessionTimeoutMinutes();
        token.sessionTimeoutMinutes = timeoutMinutes;
      }

      // Check for server-side session invalidation (e.g., after suspicious activity)
      try {
        if (token.email) {
          const dbUser = await db.user.findUnique({ where: { email: token.email as string } });
          if (dbUser?.sessionInvalidatedAt) {
            const invalidatedAt = new Date(dbUser.sessionInvalidatedAt).getTime();
            const tokenLastActivity = Number(token.lastActivityAt || 0);
            if (tokenLastActivity < invalidatedAt) {
              token.sessionExpired = true;
            }
          }
        }
      } catch (e) {
        console.error('Failed to check session invalidation timestamp for user:', e);
      }

      const lastActivityAt = Number(token.lastActivityAt || now);
      const timeoutMs = (Number(token.sessionTimeoutMinutes) || DEFAULT_SESSION_TIMEOUT_MINUTES) * 60 * 1000;
      token.sessionExpired = now - lastActivityAt > timeoutMs;

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }

      session.permissions = token.permissions as string[] | undefined;
      session.mfaRequired = token.mfaRequired as boolean | undefined;
      session.mustChangePassword = token.mustChangePassword as boolean | undefined;
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
