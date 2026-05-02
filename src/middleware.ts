import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAuthSecret } from "@/lib/auth-secret";

export async function middleware(request: NextRequest) {
  const secret = getAuthSecret();
  if (!secret) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret });
  const loggedIn = !!token;
  const path = request.nextUrl.pathname;

  if (path.startsWith("/dashboard") && !loggedIn) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }
  if ((path === "/login" || path === "/signup") && loggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
