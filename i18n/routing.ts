import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["bn", "en"],

  // Used when no locale matches
  defaultLocale: "bn",
});

export type Locale = (typeof routing.locales)[number];
