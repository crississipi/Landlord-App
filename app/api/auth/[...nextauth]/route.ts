import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        try {
          if (!credentials?.username || !credentials?.password) return null;

          const user = await prisma.users.findUnique({
            where: { username: credentials.username },
          });

          if (!user) return null;

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;

          return { 
            id: user.userID.toString(), 
            name: user.username,
            email: user.email || undefined,
            role: user.role,
            firstName: user.firstName || null,
            lastName: user.lastName || null,
          };
        } catch (err) {
          console.error("Error in authorize:", err);
          return null;
        }
      }
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60,
      },
    },
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.user = {
          id: user.id,
          name: user.name,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token.user) {
        session.user.id = token.user.id;
        session.user.role = token.user.role;
        session.user.firstName = token.user.firstName;
        session.user.lastName = token.user.lastName;
        session.user.name = token.user.name || session.user.name;
      }
      return session;
    },
    async redirect({ url, baseUrl }: any) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
};

// ✅ Export both GET and POST handlers
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };