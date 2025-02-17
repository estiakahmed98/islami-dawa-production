import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";

export const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      scope: [
        // Add calendar scopes
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/calendar.events",
      ],
    },
  },

  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  user: {
    modelName: "users",
    additionalFields: {
      role: { type: "string", required: true },
      division: { type: "string", required: false },
      district: { type: "string", required: false },
      area: { type: "string", required: false },
      upazila: { type: "string", required: false },
      union: { type: "string", required: false },
      markaz: { type: "string", required: false },
      phone: { type: "string", required: false },
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
