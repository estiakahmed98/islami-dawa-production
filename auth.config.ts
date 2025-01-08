import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
// import bcrypt from "bcryptjs";
import { signInSchema } from "@/validators/authValidators";
import { getUserByEmail } from "@/lib/getData";

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const validatedFields = await signInSchema.validate(credentials);

        const { email, password } = validatedFields;

        const user = await getUserByEmail(email);
        console.log(user, "Hello");
        if (!user || !user.password) return null;

        const passwordMatch = password == user.password;

        if (passwordMatch) return user;

        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
