import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      role?: string | null;
      division?: string | null;
      district?: string | null;
      upazila?: string | null;
      union?: string | null;
      phone?: string | null;
      markaz?: string | null;
      image?: string | null;
    } & DefaultSession["user"];
  }
  interface User {
    id: string;
    role?: string | null;
    division?: string | null;
    district?: string | null;
    upazila?: string | null;
    union?: string | null;
    phone?: string | null;
    markaz?: string | null;
  }
}

export {};
