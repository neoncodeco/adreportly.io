import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/jwt";

const COOKIES_TO_CLEAR = [
  COOKIE_NAME,
  "fb_oauth_state",
  "fb_oauth_app_user",
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "authjs.callback-url",
  "__Secure-authjs.callback-url",
  "authjs.csrf-token",
  "__Host-authjs.csrf-token",
  "authjs.pkce.code_verifier",
  "__Secure-authjs.pkce.code_verifier",
  "authjs.state",
  "__Secure-authjs.state",
  "authjs.nonce",
  "__Secure-authjs.nonce",
  "authjs.challenge",
  "__Secure-authjs.challenge",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.callback-url",
  "__Secure-next-auth.callback-url",
  "next-auth.csrf-token",
  "__Host-next-auth.csrf-token",
] as const;

function clearAuthCookiesWithSecurity(res: NextResponse, secure: boolean) {
  for (const name of COOKIES_TO_CLEAR) {
    res.cookies.set(name, "", {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
  }
}

function clearAuthCookies(res: NextResponse) {
  // Clear both variants so logout works even if upstream/proxy changed cookie security mode.
  clearAuthCookiesWithSecurity(res, false);
  clearAuthCookiesWithSecurity(res, true);
}

export async function GET(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/login", request.url));
  clearAuthCookies(res);
  return res;
}

export async function POST(_request: NextRequest) {
  const res = NextResponse.json({ success: true });
  clearAuthCookies(res);
  return res;
}
