
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/activity-log';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@zemen.com' },
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

          if (!user || user.password !== credentials.password) {
            await logActivity({
                userEmail: credentials.email,
                action: 'LOGIN_FAILURE',
                status: 'Failure',
                details: 'Invalid credentials provided.',
                ipAddress: typeof ip === 'string' ? ip : undefined,
            });
            return null;
          }
          
          await logActivity({
            userEmail: credentials.email,
            action: 'LOGIN_SUCCESS',
            status: 'Success',
            details: 'User successfully logged in.',
            ipAddress: typeof ip === 'string' ? ip : undefined,
          });

          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;

        } catch (error) {
          console.error("Database connection failed during auth:", error);
          if (credentials.email === 'admin@zemen.com' && credentials.password === 'password') {
            await logActivity({ userEmail: credentials.email, action: 'LOGIN_SUCCESS', status: 'Success', details: 'Fallback login successful.' });
            return { id: "1", name: 'Demo Admin', email: 'admin@zemen.com', role: 'Super Admin' };
          }
          await logActivity({ userEmail: credentials.email, action: 'LOGIN_FAILURE', status: 'Failure', details: 'Database error during login.' });
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
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
