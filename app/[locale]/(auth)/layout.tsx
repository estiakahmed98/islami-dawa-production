//Estiak

import Image from "next/image";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

const AuthLayout = async ({ children, params }: Props) => {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Inform next-intl about the active locale for this request
  setRequestLocale(locale);

  const messages = (await import(`@/locale/${locale}.json`)).default;
  const t = await getTranslations("header");

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="grid h-screen place-items-center px-4 py-8">
        <main className="flex w-full max-w-sm flex-col gap-8">
          <div className="flex items-center justify-center bg-[#155E75] p-2 rounded-lg">
            <Image
              src="/logo_img.png"
              width={100}
              height={100}
              alt="logo"
              priority
            />
            <h1 className="text-xl font-bold text-center text-white">{t("instituteName")}</h1>
          </div>
          {children}
        </main>
      </div>
    </NextIntlClientProvider>
  );
};

export default AuthLayout;
