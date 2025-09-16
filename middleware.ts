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

const PUBLIC_PATHS = ["/", "/login", "/signup", "/forgot-password"];

// Define roles and the paths they are allowed to access.
const ADMIN_ROLES: UserRole[] = ["centraladmin", "superadmin", "divisionadmin", "markazadmin"];

function stripLocale(pathname: string): string {
  const locales = routing.locales;
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
    (routing.locales).find(
      (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
    ) || routing.defaultLocale;

  const pathNoLocale = stripLocale(pathname);
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathNoLocale === p || pathNoLocale.startsWith(`${p}/`)
  );

  // If the path is public, allow the request to proceed.
  if (isPublic) {
    return res;
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET }) as { role?: UserRole } | null;
  
  // If no token is found, redirect to the login page.
  if (!token) {
    const loginUrl = new URL(`/${locale}/login`, req.url);
    loginUrl.searchParams.set("error", "unauthenticated");
    return NextResponse.redirect(loginUrl);
  }

  // Check if the user is trying to access an admin path
  const isAdminPath = pathNoLocale.startsWith("/admin");

  // Check if the user's role is not an admin role
  const isNotAdmin = !ADMIN_ROLES.includes(token?.role || '');

  // If the path is an admin path and the user is not an admin, redirect them.
  if (isAdminPath && isNotAdmin) {
    const dashboardUrl = new URL(`/${locale}/dashboard`, req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // If the user has a valid token and is authorized, allow the request to proceed.
  return res;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};