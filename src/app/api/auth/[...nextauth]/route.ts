
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from '@/lib/db';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials) {
            return null;
        }

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(credentials.email);

        if (user && user.password === credentials.password) {
          // Return the user object to be encoded in the session token
          return { id: user.id, name: user.name, email: user.email, role: user.role };
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login', // Redirect users to login page on error
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
        // user object is only available on first sign-in
        if (user) {
            token.id = user.id;
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
})

export { handler as GET, handler as POST }
