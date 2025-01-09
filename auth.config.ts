import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
// import bcrypt from "bcryptjs";
import { signInSchema } from "@/validators/authValidators";
import { getUserByEmail } from "@/lib/getData";

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = await signInSchema.validate(credentials);

        const { email, password } = validatedFields;

        const user = await getUserByEmail(email);
        console.log(user, "Hello");
        if (!user || !user.password) return null;

        const passwordMatch = password === user.password;

        if (passwordMatch) return user;
        console.log(user, "Hello");

        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
