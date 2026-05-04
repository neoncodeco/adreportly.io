import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAuthSecret } from "@/lib/auth-secret";

export async function middleware(request: NextRequest) {
  const secret = getAuthSecret();
  if (!secret) {
    return NextResponse.next();
  }

  // On HTTPS (e.g. Vercel), session cookies use the `__Secure-` prefix. getToken defaults to
  // `secureCookie: false`, so it looks for the wrong cookie name and always returns null — users
  // get bounced from /dashboard back to /login after a successful sign-in.
  const token = await getToken({
    req: request,
    secret,
    secureCookie: request.nextUrl.protocol === "https:",
  });
  const loggedIn = !!token;
  const path = request.nextUrl.pathname;
  const isAdmin = token?.role === "admin";

  if (path.startsWith("/dashboard") && !loggedIn) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }
  if (path.startsWith("/admin") && !loggedIn) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }
  if (path.startsWith("/admin") && loggedIn && !isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }
  if ((path === "/login" || path === "/signup") && loggedIn) {
    const dest = isAdmin ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(dest, request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
