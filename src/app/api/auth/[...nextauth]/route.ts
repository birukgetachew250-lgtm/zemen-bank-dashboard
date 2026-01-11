
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import config from '@/lib/config';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@zemen.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Attempt to connect to the database and find the user
          const user = await db.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            return null;
          }

          // In a real app, you'd use bcrypt to compare passwords
          const isPasswordValid = user.password === credentials.password;

          if (!isPasswordValid) {
            return null;
          }
          
          // Return a user object without the password
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;

        } catch (error) {
          console.error("Database connection failed during auth:", error);
          // If in development/demo mode, allow login with mock data as a fallback
          if (config.db.isProduction === false && credentials.email === 'admin@zemen.com' && credentials.password === 'password') {
            console.log("Database connection failed, falling back to demo mode user.");
            return { 
              id: "1", 
              name: 'Demo Admin', 
              email: 'admin@zemen.com', 
              role: 'Super Admin' 
            };
          }
          // In production, or if credentials don't match demo user, fail authentication
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
      // On sign-in, add user details to the token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as any).role; // Cast to access custom properties
      }
      return token;
    },
    async session({ session, token }) {
      // Add token details to the session object
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
