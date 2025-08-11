import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { SidebarProvider } from "@/providers/sidebar-provider";

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function DashboardLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate locale
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Load messages for the locale
  // const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale}>
      <SidebarProvider>
        <div className="flex fixed size-full">
          <Sidebar />
          <div className="w-full overflow-hidden">
            <Header />
            <main className="h-[calc(100vh-80px)] overflow-y-auto p-2 lg:p-6">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </NextIntlClientProvider>
  );
}
