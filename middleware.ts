// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { getToken } from "next-auth/jwt";

type UserRole = "centraladmin" | "superadmin" | "divisionadmin" | "markazadmin" | string;

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
  }
}

// Public (unauthenticated) paths — base only; matching handles subpaths.
const PUBLIC_PATHS = ["/", "/login", "/signup", "/forgot-password"] as const;

// Admin roles
const ADMIN_ROLES: UserRole[] = ["centraladmin", "superadmin", "divisionadmin", "markazadmin"];

function stripLocale(pathname: string): string {
  const locales = routing.locales;
  for (const l of locales) {
    if (pathname === `/${l}` || pathname === `/${l}/`) return "/";
    if (pathname.startsWith(`/${l}/`)) {
      const rest = pathname.slice(l.length + 1); // keeps the leading slash before the rest
      return rest.startsWith("/") ? rest : `/${rest}`;
    }
  }
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function isPublicPath(pathNoLocale: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathNoLocale === p || pathNoLocale.startsWith(`${p}/`)
  );
}

const intl = createIntlMiddleware(routing);

export default async function middleware(req: NextRequest) {
  const intlRes = intl(req);
  if (intlRes && intlRes.headers.get("Location")) {
    return intlRes;
  }
  const res = intlRes ?? NextResponse.next();

  const pathname = req.nextUrl.pathname || "/";
  const activeLocale =
    routing.locales.find(
      (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
    ) || routing.defaultLocale;

  const pathNoLocale = stripLocale(pathname);

  if (isPublicPath(pathNoLocale)) {
    return res;
  }

  const token = (await getToken({ req, secret: process.env.NEXTAUTH_SECRET })) as { role?: UserRole } | null;

  const isAuthPath =
    pathNoLocale === "/login" ||
    pathNoLocale === "/signup" ||
    pathNoLocale === "/forgot-password" ||
    pathNoLocale.startsWith("/login/") ||
    pathNoLocale.startsWith("/signup/") ||
    pathNoLocale.startsWith("/forgot-password/");

  if (!token) {
    if (!isAuthPath) {
      const loginUrl = new URL(`/${activeLocale}/login`, req.url);
      loginUrl.searchParams.set("error", "unauthenticated");
      return NextResponse.redirect(loginUrl);
    }
    return res;
  }

  const isAdminPath = pathNoLocale === "/admin" || pathNoLocale.startsWith("/admin/");
  const isNotAdmin = !ADMIN_ROLES.includes(token.role || "");

  if (isAdminPath && isNotAdmin) {
    const dashboardUrl = new URL(`/${activeLocale}/dashboard`, req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return res;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
