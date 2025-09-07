// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { getToken } from "next-auth/jwt";

const DEVICE_COOKIE = "boe_device_id";

function ensureDeviceIdCookie(request: NextRequest, response: NextResponse) {
  let deviceId = request.cookies.get(DEVICE_COOKIE)?.value;
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    response.cookies.set({
      name: DEVICE_COOKIE,
      value: deviceId,
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return deviceId;
}

const intlMiddleware = createIntlMiddleware(routing);

export default async function authMiddleware(request: NextRequest) {
  // First handle internationalization
  const intlResponse = intlMiddleware(request);
  if (intlResponse) {
    return intlResponse;
  }

  const { pathname } = request.nextUrl;

  const protectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  const authRoute = pathname === "/";

  const response = NextResponse.next();

  const deviceId = ensureDeviceIdCookie(request, response);

  // Read NextAuth JWT (does not trigger any network call)
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });

  const redirectWithError = (url: string, error: string) => {
    const u = new URL(url, request.url);
    u.searchParams.set("error", error);
    return NextResponse.redirect(u);
  };

  if (protectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    const userId = (token as any).id || (token as any).sub || (token as any).email;
    const sessionId = (token as any).jti || String((token as any).iat || "");

    const lockRes = await fetch(
      `${request.nextUrl.origin}/api/session-lock?userId=${encodeURIComponent(
        String(userId)
      )}`,
      { headers: { "x-internal": "1" } }
    );

    if (!lockRes.ok) {
      return redirectWithError("/", "lock_error");
    }

    const data = (await lockRes.json()) as {
      activeDeviceId?: string | null;
      activeSessionId?: string | null;
    };

    if (!data.activeDeviceId || !data.activeSessionId) {
      const claim = await fetch(`${request.nextUrl.origin}/api/session-lock`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-internal": "1",
        },
        body: JSON.stringify({
          userId,
          activeDeviceId: deviceId,
          activeSessionId: sessionId,
        }),
      });

      if (!claim.ok) {
        return redirectWithError("/", "lock_error");
      }
      return response;
    }

    if (data.activeDeviceId !== deviceId) {
      return redirectWithError("/", "already_logged_in_elsewhere");
    }

    return response;
  }

  if (authRoute) {
    if (token) {
      const userId = (token as any).id || (token as any).sub || (token as any).email;
      const lockRes = await fetch(
        `${request.nextUrl.origin}/api/session-lock?userId=${encodeURIComponent(
          String(userId)
        )}`,
        { headers: { "x-internal": "1" } }
      );

      if (lockRes.ok) {
        const data = (await lockRes.json()) as {
          activeDeviceId?: string | null;
          activeSessionId?: string | null;
        };

        if (!data.activeDeviceId || data.activeDeviceId === deviceId) {
          if (!data.activeDeviceId) {
            const sessionId = (token as any).jti || String((token as any).iat || "");
            await fetch(`${request.nextUrl.origin}/api/session-lock`, {
              method: "POST",
              headers: {
                "content-type": "application/json",
                "x-internal": "1",
              },
              body: JSON.stringify({
                userId,
                activeDeviceId: deviceId,
                activeSessionId: sessionId,
              }),
            });
          }
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }

        return NextResponse.next();
      }
    }
    return response;
  }

  return response;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};