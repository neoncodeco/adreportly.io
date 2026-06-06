import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/jwt";
import { createClient } from "@/lib/supabase/server";

const COOKIES_TO_CLEAR = [COOKIE_NAME, "fb_oauth_state", "fb_oauth_app_user"] as const;

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
  clearAuthCookiesWithSecurity(res, false);
  clearAuthCookiesWithSecurity(res, true);
}

async function signOutSupabase() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Env may be unset during local dev without Supabase keys.
  }
}

export async function GET(request: NextRequest) {
  await signOutSupabase();
  const res = NextResponse.redirect(new URL("/login", request.url));
  clearAuthCookies(res);
  return res;
}

export async function POST(_request: NextRequest) {
  await signOutSupabase();
  const res = NextResponse.json({ success: true });
  clearAuthCookies(res);
  return res;
}
