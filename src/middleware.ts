import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Fetch user authorization token payload directly from server session data
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isUserLoggedIn = !!token;

  // 🛑 Rule A: If user is logged in, ban them from visiting login/signup landing pages
  if (isUserLoggedIn && (pathname === "/login" || pathname === "/signup")) {
    const response = NextResponse.redirect(
      new URL("/dashboard/author", request.url),
    );

    // ✅ Kill browser history cache so the back button cannot render a stale login page
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  }

  // 🛑 Rule B: If user is NOT logged in, block them from entering secure dashboard views
  if (!isUserLoggedIn && pathname.startsWith("/dashboard")) {
    const response = NextResponse.redirect(new URL("/login", request.url));

    // ✅ Kill dashboard memory cache upon logout / session expiration
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  }

  // Standard path forward handling
  const response = NextResponse.next();

  // Apply mild cache validation rules globally across checked route structures
  if (
    pathname.startsWith("/dashboard") ||
    pathname === "/login" ||
    pathname === "/signup"
  ) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
  }
  return response;
}

// Define explicit pattern match configurations for optimization execution bounds
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};
