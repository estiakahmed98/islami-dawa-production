// app/[locale]/admin/register/page.tsx (server component)
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/lib/auth";
import RegisterTabs from "@/components/RegisterTabs";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = (await getServerSession(nextAuthOptions as any)) as any;
  if (!session?.user) {
    redirect(`/${locale}`);
  }

  const role = (session.user as any).role as string | undefined;
  const allowed = new Set(["centraladmin", "divisionadmin", "markazadmin"]);
  if (!role || !allowed.has(role)) {
    redirect(`/${locale}`);
  }

  return (
    <div className="mx-auto bg-white shadow-lg rounded-lg">
      <RegisterTabs />
    </div>
  );
}
