import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
      firstName?: string | null;
      lastName?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name?: string;
    role?: string;
    firstName?: string | null;
    lastName?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: {
      id: string;
      name?: string;
      role?: string;
      firstName?: string | null;
      lastName?: string | null;
    };
  }
}