import Header from "@/components/dashboard/header";
import ImpersonateSidebar from "@/components/ImpersonateSidebar";
import { SidebarProvider } from "@/providers/sidebar-provider";
import { roleList } from "@/lib/_role-list";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

const AdmindLayout = async ({ children, params }: Props) => {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!roleList.includes(session?.user?.role as string)) {
    redirect("/dashboard");
  }

  return (
    <NextIntlClientProvider locale={locale}>
      <SidebarProvider>
        <div className="flex fixed size-full">
          <ImpersonateSidebar />
          <div className="w-full overflow-hidden">
            <Header />
            <main className="h-[calc(100vh-80px)] overflow-y-auto p-2 lg:p-6 ">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </NextIntlClientProvider>
  );
};

export default AdmindLayout;
