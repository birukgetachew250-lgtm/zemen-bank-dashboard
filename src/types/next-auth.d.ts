import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string; // Changed from number to string to accommodate mock and real user IDs
      role: string;
    } & DefaultSession["user"];
    mfaRequired?: boolean;
  }
}


declare module "next-auth/jwt" {
  interface JWT {
    mfaRequired?: boolean;
    role?: string;
  }
}
