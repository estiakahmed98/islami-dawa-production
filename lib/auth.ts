import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  user: {
    modelName: "users",
    additionalFields: {
      division: { type: "string", required: false },
      district: { type: "string", required: false },
      area: { type: "string", required: false },
      upazila: { type: "string", required: false },
      union: { type: "string", required: false },
      markaz: { type: "string", required: false },
      phone: { type: "string", required: false },
      role: { type: "string", required: false },
    },
  },
  session: {
    modelName: "sessions",
  },
  account: {
    modelName: "accounts",
  },
  verification: {
    modelName: "verifications",
  },
  emailAndPassword: {
    enabled: true,
  },
});
