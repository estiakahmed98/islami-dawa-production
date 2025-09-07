import { db } from "@/lib/db";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { NextAuthOptions } from "next-auth";

export const nextAuthOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const user = await (db as any).users.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;
        // Find credentials account
        const account = await (db as any).accounts.findFirst({
          where: { providerId: "credentials", accountId: credentials.email },
        });
        if (!account || !account.password) return null;
        const isValid = await compare(credentials.password, account.password);
        if (!isValid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // On initial sign in, persist needed fields into the token
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role ?? null;
      }

      // For Google sign-in, ensure a corresponding user exists in our `users` table
      if (account?.provider === "google" && profile && token?.email) {
        try {
          const existing = await (db as any).users.findUnique({
            where: { email: token.email },
          });
          if (!existing) {
            const created = await (db as any).users.create({
              data: {
                email: token.email,
                name: (profile as any).name ?? null,
                image: (profile as any).picture ?? null,
                emailVerified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });
            token.id = created.id;
            token.role = created.role ?? null;
          } else {
            token.id = existing.id;
            token.role = existing.role ?? null;
          }
        } catch (e) {
          // ignore upsert errors to not block auth flow
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Expose fields from token to session
      if (session?.user) {
        (session as any).user.id = (token as any).id as string;
        (session as any).user.role = ((token as any).role ?? null) as any;
      }
      return session;
    },
    async signIn({ account, profile, user, credentials }) {
      // For credentials sign-in we already validated via authorize
      if (account?.provider === "credentials") return true;

      // For Google, allow only if email exists or was just created in jwt callback
      if (account?.provider === "google") {
        try {
          const found = await (db as any).users.findUnique({
            where: { email: (profile as any)?.email || user?.email || "" },
          });
          return !!found;
        } catch {
          return false;
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

// Compatibility layer for code that imports `auth` from the old better-auth API.
export const auth = {
  handler: async (req: any, res: any) => {
    // NextAuth will handle via the app route. This is a noop compatibility placeholder.
    return res ? res : null;
  },
  api: {
    async getSession(opts?: any) {
      // server-side helper: use next-auth getServerSession
      const { getServerSession } = await import("next-auth");
      return (await getServerSession(nextAuthOptions as any)) as any;
    },
  },
  // minimal admin placeholder (server-side operations should use server routes)
  admin: {
    async banUser(opts: any) {
      // call internal API
      await fetch("/api/banuser", {
        method: "POST",
        body: JSON.stringify({ userId: opts.userId, banned: true }),
        headers: { "Content-Type": "application/json" },
      });
    },
    async unbanUser(opts: any) {
      await fetch("/api/banuser", {
        method: "POST",
        body: JSON.stringify({ userId: opts.userId, banned: false }),
        headers: { "Content-Type": "application/json" },
      });
    },
  },
};

export async function getServerAuthSession() {
  const { getServerSession } = await import("next-auth");
  return (await getServerSession(nextAuthOptions as any)) as any;
}
