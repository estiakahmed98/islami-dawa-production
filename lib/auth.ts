//auth.ts
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
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events'
          ].join(' '),
        },
      },
      httpOptions: {
        timeout: 10000,
      },
      allowDangerousEmailAccountLinking: true,
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
        
        // Check if user is banned
        if (user.banned) {
          throw new Error('This account has been banned. Please contact support for assistance.');
        }
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

      // For Google sign-in, ensure a corresponding user exists and link to existing credentials user by email
      if (account?.provider === "google") {
        try {
          // Resolve email from profile/user/token
          const resolvedEmail =
            (profile as any)?.email ||
            (user as any)?.email ||
            (token as any)?.email ||
            (token as any)?.user?.email ||
            token?.email ||
            null;

          if (!resolvedEmail) return token;

          // Find or create user with this email (so Google links to the same row)
          let existing = await (db as any).users.findUnique({
            where: { email: resolvedEmail },
          });
          if (!existing) {
            existing = await (db as any).users.create({
              data: {
                email: resolvedEmail,
                name: (profile as any)?.name ?? null,
                image: (profile as any)?.picture ?? null,
                emailVerified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });
          }

          // Ensure token.id reflects the linked user
          token.id = existing.id;
          token.role = existing.role ?? null;

          // Persist Google OAuth tokens and metadata to accounts table for Calendar access
          const userId = existing.id as string;
          const providerId = "google";
          const accessToken = (account as any).access_token || null;
          const refreshToken = (account as any).refresh_token || null;
          const idToken = (account as any).id_token || null;
          const scope = (account as any).scope || null;
          const providerAccountId = (account as any).providerAccountId || (profile as any)?.sub || resolvedEmail || "";
          const expiresAt = (account as any).expires_at
            ? new Date(((account as any).expires_at as number) * 1000)
            : null;

          const existingAccount = await (db as any).accounts.findFirst({
            where: { userId, providerId },
          });

          if (existingAccount) {
            await (db as any).accounts.update({
              where: { id: existingAccount.id },
              data: {
                accountId: providerAccountId || existingAccount.accountId,
                accessToken: accessToken ?? existingAccount.accessToken,
                refreshToken: refreshToken ?? existingAccount.refreshToken,
                idToken: idToken ?? existingAccount.idToken,
                scope: scope ?? existingAccount.scope,
                accessTokenExpiresAt: expiresAt ?? existingAccount.accessTokenExpiresAt,
                updatedAt: new Date(),
              },
            });
          } else {
            await (db as any).accounts.create({
              data: {
                userId,
                providerId,
                accountId: providerAccountId,
                accessToken,
                refreshToken,
                idToken,
                scope,
                accessTokenExpiresAt: expiresAt,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });
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
    async signIn({ account, user }) {
      // Only allow social logins (Google) or credentials
      if (account?.provider !== "google" && account?.provider !== "credentials") {
        return false;
      }

      // For social logins, check if user is banned
      if (account?.provider === "google" && user?.email) {
        const dbUser = await (db as any).users.findUnique({
          where: { email: user.email },
          select: { banned: true }
        });
        
        if (dbUser?.banned) {
          throw new Error('This account has been banned. Please contact support for assistance.');
        }
      }
      
      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin", // Redirect to signin page on errors
  },
  debug: process.env.NODE_ENV === 'development', // Enable debug in development
  logger: {
    error(code, metadata) {
      console.error('Auth Error:', code, metadata);
    },
    warn(code) {
      console.warn('Auth Warning:', code);
    },
    debug(code, metadata) {
      console.log('Auth Debug:', code, metadata);
    },
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
