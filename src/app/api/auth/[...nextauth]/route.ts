
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/activity-log';
import crypto from 'crypto';
import { sendEmail } from '@/services/email-service';

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

            await sendEmail(
              user.email,
              'Your Zemen Admin Center Login Code',
              `<p>Your login verification code is: <strong>${otp}</strong></p><p>This code will expire in 5 minutes.</p>`
            );
          
            await logActivity({
                userEmail: user.email,
                action: 'LOGIN_SUCCESS',
                status: 'Success',
                details: 'MFA required. OTP sent to email.',
                ipAddress: typeof ip === 'string' ? ip : undefined,
            });

            return { ...user, mfaRequired: true };
          }
          
          await logActivity({ userEmail: user.email, action: 'LOGIN_SUCCESS', status: 'Success', details: 'User successfully logged in (MFA not enabled).', ipAddress: typeof ip === 'string' ? ip : undefined });

          const { password, ...userWithoutPassword } = user;
          return { ...userWithoutPassword, mfaRequired: false };

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
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as any).role;
        token.mfaRequired = (user as any).mfaRequired;
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
      (session as any).mfaRequired = token.mfaRequired;
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
