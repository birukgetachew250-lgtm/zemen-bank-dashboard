
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';

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
            // If user not found, try demo user as a fallback in any environment if DB fails to connect
            if (credentials.email === 'admin@zemen.com' && credentials.password === 'password') {
                return { 
                  id: "1", 
                  name: 'Demo Admin', 
                  email: 'admin@zemen.com', 
                  role: 'Super Admin' 
                };
            }
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
          // If any DB error occurs, allow login with mock data as a fallback
          if (credentials.email === 'admin@zemen.com' && credentials.password === 'password') {
            console.log("Database connection failed, falling back to demo mode user.");
            return { 
              id: "1", 
              name: 'Demo Admin', 
              email: 'admin@zemen.com', 
              role: 'Super Admin' 
            };
          }
          // If credentials don't match demo user, fail authentication
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
