import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface session {
    user: {
      id: String?;
      name: String?;
      role: String;
      email: String;
      emailVerified: DateTime?;
      password: String;
      image: String?;
      division: String;
      district: String;
      upazila: String;
      union: String;
      area: String;
      markaz: String;
      phone: String;
    } & DefaultSession["user"];
  }
}
