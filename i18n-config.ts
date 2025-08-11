export const i18n = {
  defaultLocale: "bn",
  locales: ["bn", "en"],
} as const

export type Locale = (typeof i18n)["locales"][number]
