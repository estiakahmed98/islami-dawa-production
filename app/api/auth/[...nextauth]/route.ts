import NextAuth from "next-auth";
import { nextAuthOptions } from "@/lib/auth";

const handler = NextAuth(nextAuthOptions as any);

export { handler as GET, handler as POST };
