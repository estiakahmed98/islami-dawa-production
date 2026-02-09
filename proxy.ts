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
      const rest = pathname.slice(l.length + 1);
      return rest.startsWith("/") ? rest : `/${rest}`;
    }
  }
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function isPublicPath(pathNoLocale: string): boolean {
  return PUBLIC_PATHS.some((p) => pathNoLocale === p || pathNoLocale.startsWith(`${p}/`));
}

const intl = createIntlMiddleware(routing);

export default async function middleware(req: NextRequest) {
  // Run locale routing first
  const intlRes = intl(req);
  if (intlRes && intlRes.headers.get("Location")) {
    return intlRes;
  }
  const res = intlRes ?? NextResponse.next();

  const pathname = req.nextUrl.pathname || "/";
  const activeLocale =
    routing.locales.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)) ||
    routing.defaultLocale;

  const pathNoLocale = stripLocale(pathname);

  // Public pages pass through
  if (isPublicPath(pathNoLocale)) {
    return res;
  }

  // Read the same secret used by NextAuth
  const token = (await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
  })) as { role?: UserRole } | null;

  // Treat "/" as your login page (locale root), plus other auth pages
  const isAuthPath =
    pathNoLocale === "/" ||
    pathNoLocale === "/login" ||
    pathNoLocale === "/signup" ||
    pathNoLocale === "/forgot-password" ||
    pathNoLocale.startsWith("/login/") ||
    pathNoLocale.startsWith("/signup/") ||
    pathNoLocale.startsWith("/forgot-password/");

  // If unauthenticated and not visiting an auth page, send to locale root (your login)
  if (!token) {
    if (!isAuthPath) {
      const loginUrl = new URL(`/${activeLocale}`, req.url);
      loginUrl.searchParams.set("error", "unauthenticated");
      return NextResponse.redirect(loginUrl);
    }
    return res;
  }

  // Admin gate
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