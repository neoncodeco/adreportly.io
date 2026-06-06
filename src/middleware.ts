import { NextResponse, type NextRequest } from "next/server";
import { getMiddlewareProfile } from "@/lib/auth/middleware-profile";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  let response: NextResponse;
  let loggedIn = false;
  let isAdmin = false;
  let isBanned = false;

  try {
    const { response: supabaseResponse, user } = await updateSession(request);
    response = supabaseResponse;
    loggedIn = !!user?.id;

    if (user?.id) {
      const profile = await getMiddlewareProfile(user.id);
      if (profile) {
        isAdmin = profile.role === "admin";
        isBanned = profile.isBanned;
      }
    }
  } catch {
    return NextResponse.next();
  }

  const hasAgencySession = !!request.cookies.get("ar_agency")?.value;
  const path = request.nextUrl.pathname;
  const isMetaConnectRoute = path === "/dashboard/meta-connect";
  const loginUrl = new URL("/login", request.nextUrl);
  loginUrl.searchParams.set("next", `${path}${request.nextUrl.search}`);

  if (isMetaConnectRoute) {
    return response;
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
  if ((path === "/login" || path === "/signup") && loggedIn) {
    const dest = safeRedirectPath(
      request.nextUrl.searchParams.get("next"),
      isAdmin ? "/admin" : "/dashboard",
    );
    return NextResponse.redirect(new URL(dest, request.nextUrl));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
