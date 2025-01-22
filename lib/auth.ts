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
      role: {
        type: "string",
        required: true,
      },
      division: {
        type: "string",
        required: true,
      },
      district: {
        type: "string",
        required: true,
      },
      area: {
        type: "string",
        required: true,
      },
      upazila: {
        type: "string",
        required: true,
      },
      union: {
        type: "string",
        required: true,
      },
      markaz: {
        type: "string",
        required: false,
      },
      phone: {
        type: "string",
        required: true,
      },
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
