import NextAuth, { DefaultSession } from "next-auth";
import authConfig from "@/auth.config";
import { db } from "@/lib/db";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { getUserById } from "@/lib/getData";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "USER";
    } & DefaultSession["user"];
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") return true;

      const existingUser = await getUserById(user.id as string);

      if (!existingUser?.emailVerified) return false;

      return true;
    },
    async session({ token, session }) {
      // Add user id & role to session
      if (token.sub && token.role && session.user) {
        session.user.id = token.sub;
        session.user.role = token.role as "ADMIN" | "USER";
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      // Check user
      const existingUser = await getUserById(token.sub);
      if (!existingUser) return token;

      // Add role to token
      token.role = existingUser.role;

      return token;
    },
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          emailVerified: new Date(),
        },
      });
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});
