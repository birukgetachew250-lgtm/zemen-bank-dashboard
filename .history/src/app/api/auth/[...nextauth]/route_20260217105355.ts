
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/activity-log';
import crypto from 'crypto';
import { sendEmail } from '@/services/email-service';

async function getUserPermissions(roleName: string): Promise<string[]> {
    if (roleName === 'Super Admin') {
        return ['all'];
    }
    try {
        const role = await db.role.findUnique({
            where: { name: roleName },
        });

        if (role?.description) {
            try {
                // The permissions are stored in a JSON string within the description field
                const descObj = JSON.parse(role.description);
                return descObj.permissions || [];
            } catch (e) {
                // If parsing fails, it's a plain description with no permissions.
                return [];
            }
        }
        return [];
    } catch (e) {
        console.error("Failed to get user permissions:", e);
        return []; // Return no permissions on error
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

        const ip = req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'] || req.socket?.remoteAddress;
        
        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            await logActivity({ userEmail: credentials.email, action: 'LOGIN_FAILURE', status: 'Failure', details: 'User not found.', ipAddress: typeof ip === 'string' ? ip : undefined });
            return null;
          }
          
          if (user.password !== credentials.password) {
            await logActivity({ userEmail: user.email, action: 'LOGIN_FAILURE', status: 'Failure', details: `Invalid password.`, ipAddress: typeof ip === 'string' ? ip : undefined });
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
              }
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


            const emailResult = await sendEmail(
              user.email,
              'Your Zemen Admin Center Login Code',
              emailBody
            );

            if (emailResult.success) {
                await logActivity({
                    userEmail: user.email,
                    action: 'OTP_EMAIL_SENT',
                    status: 'Success',
                    details: 'MFA required. OTP sent to email.',
                    ipAddress: typeof ip === 'string' ? ip : undefined,
                });
            } else {
                 await logActivity({
                    userEmail: user.email,
                    action: 'OTP_EMAIL_SENT',
                    status: 'Failure',
                    details: `MFA email failed to send for user ${user.email}.`,
                    ipAddress: typeof ip === 'string' ? ip : undefined,
                });
            }
          
            return { ...user, permissions, mfaRequired: true };
          }
          
          await logActivity({ userEmail: user.email, action: 'LOGIN_SUCCESS', status: 'Success', details: 'User successfully logged in (MFA not enabled).', ipAddress: typeof ip === 'string' ? ip : undefined });

          const { password, ...userWithoutPassword } = user;
          return { ...userWithoutPassword, permissions, mfaRequired: false };

        } catch (error: any) {
            console.error("Authorization error:", error);
            throw new Error(error.message || 'An unexpected error occurred during login.');
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login', // Redirect users to login page on error
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // This block runs only on initial sign-in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as any).role;
        token.mfaRequired = (user as any).mfaRequired;
        token.permissions = (user as any).permissions;
      }
      
      // This block ensures permissions are present on existing sessions
      // It populates the token if a user has a role but no permissions array yet (e.g. from an old session)
      if (token.role && !token.permissions) {
        const permissions = await getUserPermissions(token.role as string);
        token.permissions = permissions;
      }

      if (trigger === "update" && (session as any)?.mfaValidated) {
        token.mfaRequired = false;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      session.permissions = token.permissions;
      session.mfaRequired = token.mfaRequired;
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours – session expires after this
  },
  jwt: {
    maxAge: 8 * 60 * 60, // 8 hours – JWT token expires after this
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
