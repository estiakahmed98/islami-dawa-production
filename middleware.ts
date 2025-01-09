import { auth } from "@/lib/auth";

export default auth((req) => {
  // Check if the user is authenticated and trying to access "/"
  if (req.auth && req.nextUrl.pathname === "/") {
    // If authenticated, redirect them back to the previous page or a default page (e.g., "/dashboard")
    const referer = req.headers.get("referer");

    // If referer is available, redirect back to that page
    if (referer) {
      return Response.redirect(referer);
    }

    // If no referer, redirect them to "/dashboard" (or any other page)
    const newUrl = new URL("/dashboard", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }

  // Handle other cases: if not authenticated and trying to access "/dashboard", redirect to "/"
  if (!req.auth && req.nextUrl.pathname.startsWith("/dashboard")) {
    const newUrl = new URL("/", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
