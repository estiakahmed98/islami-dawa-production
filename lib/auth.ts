import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
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
        required: false,
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

  plugins: [
    admin({
      defaultRole: false,
      adminRole: [
        "centraladmin",
        "superadmin",
        "divisionadmin",
        "districtadmin",
        "areaadmin",
        "upozilaadmin",
        "unionadmin",
      ],
    }),
  ],
});
