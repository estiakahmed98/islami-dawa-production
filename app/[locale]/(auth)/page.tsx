import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import SigninForm from "./signin-form";

export default async function SignInPage({
  searchParams,
  params,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  params: Promise<{ locale: string }>;
}) {
  const session = await getServerAuthSession();
  const { locale } = await params;

  if (session?.user) {
    const role = (session.user as any)?.role as string | undefined;
    redirect(role === "daye" ? `/${locale}/dashboard` : `/${locale}/admin`);
  }

  const sp = await searchParams;
  const raw = sp?.error;
  const error = Array.isArray(raw) ? raw[0] : raw ?? "";

  return <SigninForm initialError={error} />;
}
