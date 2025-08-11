// app/(auth)/page.tsx

import SigninForm from "./signin-form";

export default async function SignInPage({
  searchParams,
}: {
  // Next 15: searchParams is a Promise
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;               // ✅ await before using
  const raw = sp?.error;
  const error = Array.isArray(raw) ? raw[0] : raw ?? "";

  return <SigninForm initialError={error} />;
}
