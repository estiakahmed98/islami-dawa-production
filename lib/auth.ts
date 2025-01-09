import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { signInSchema } from "@/validators/authValidators";
import { getUserByEmail } from "./authActions";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";

export const { auth, handlers, signIn, signOut } = NextAuth({
  debug: true,
  adapter: PrismaAdapter(db),
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const { email, password } = await signInSchema.validate(credentials, {
          abortEarly: false,
        });

        const user = await getUserByEmail(email);
        const matchPassword = await bcrypt.compare(
          password,
          user?.password as unknown as string
        );

        // If no user found, throw invalid credentials
        if (!user || !matchPassword) {
          throw new Error("Invalid credentials.");
        }

        console.log(user);

        // return user
        return user;
      },
    }),
  ],
});
