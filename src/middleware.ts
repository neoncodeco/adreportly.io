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
  const hasAgencySession = !!request.cookies.get("ar_agency")?.value;
  const path = request.nextUrl.pathname;
  const isAdmin = token?.role === "admin";
  const isBanned = token?.isBanned === true;
  const isMetaConnectRoute = path === "/dashboard/meta-connect";
  const loginUrl = new URL("/login", request.nextUrl);
  loginUrl.searchParams.set("next", `${path}${request.nextUrl.search}`);

  // Meta OAuth callback can land here even when app session is missing.
  // Access to data is still gated by agency JWT cookie in API routes.
  if (isMetaConnectRoute) {
    return NextResponse.next();
  }

  if (path.startsWith("/dashboard") && !loggedIn && !hasAgencySession) {
    return NextResponse.redirect(loginUrl);
  }
  if ((path.startsWith("/dashboard") || path.startsWith("/admin")) && isBanned) {
    return NextResponse.redirect(new URL("/login?error=account_banned", request.nextUrl));
  }
  if (path.startsWith("/admin") && !loggedIn) {
    return NextResponse.redirect(loginUrl);
  }
  if (path.startsWith("/admin") && loggedIn && !isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }
  // Only skip login/signup when there is a real NextAuth session. `ar_agency` alone must NOT
  // redirect away from /login — otherwise after logout (or if agency cookie lingers) users
  // bounce /login → /dashboard and appear "not logged out".
  if ((path === "/login" || path === "/signup") && loggedIn) {
    const dest = isAdmin ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(dest, request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
