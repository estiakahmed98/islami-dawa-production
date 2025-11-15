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

  return (
    <NextIntlClientProvider locale={locale}>
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <Header />
            <main className="flex-1 overflow-y-auto">
              <div className="min-h-full">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </NextIntlClientProvider>
  );
}
