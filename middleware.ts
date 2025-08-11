// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

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

  let session: any = null;
  try {
    const sessRes = await fetch(
      `${process.env.BETTER_AUTH_URL}/api/auth/get-session`,
      {
        headers: { cookie: request.headers.get("cookie") || "" },
      }
    );

    if (sessRes.ok) {
      session = await sessRes.json();
      if (session && session.session == null && session.id) {
        session = { session, user: session.user };
      }
    }
  } catch {
    // Ignore errors
  }

  const redirectWithError = (url: string, error: string) => {
    const u = new URL(url, request.url);
    u.searchParams.set("error", error);
    return NextResponse.redirect(u);
  };

  if (protectedRoute) {
    if (!session || !session.session || !session.user) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    const userId = session.user.id ?? session.user.userId ?? session.user.email;
    const sessionId =
      session.session.id ?? session.session.sessionId ?? session.session.jti;

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
    if (session && session.session && session.user) {
      const userId = session.user.id ?? session.user.userId ?? session.user.email;
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
            const sessionId =
              session.session.id ??
              session.session.sessionId ??
              session.session.jti;
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