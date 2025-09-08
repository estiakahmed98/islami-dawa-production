// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/forgot-password"];

function stripLocale(pathname: string) {
  const locales = routing.locales as readonly string[];
  for (const l of locales) {
    if (pathname === `/${l}`) return "/";
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1);
  }
  return pathname;
}

const intl = createIntlMiddleware(routing);

export default async function middleware(req: NextRequest) {
  const intlRes = intl(req);
  if (intlRes && intlRes.headers.get("Location")) return intlRes;

  const res = intlRes ?? NextResponse.next();

  const pathname = req.nextUrl.pathname || "/";
  const locale =
    (routing.locales as readonly string[]).find(
      (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
    ) || routing.defaultLocale;

  const pathNoLocale = stripLocale(pathname); 
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathNoLocale === p || pathNoLocale.startsWith(`${p}/`)
  );

  if (isPublic) return res;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const url = new URL(`/${locale}`, req.url); 
    url.searchParams.set("error", "unauthenticated");
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
