import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/services/facebook";
import { upsertAgencyFromFacebook } from "@/lib/agency-service";
import { signAgencyJwt, COOKIE_NAME } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  const site =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const redirectUri =
    process.env.FACEBOOK_REDIRECT_URI ?? `${site.replace(/\/$/, "")}/api/auth/facebook/callback`;

  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = request.cookies.get("fb_oauth_state")?.value;

  if (!appId || !appSecret || !code || !state || state !== cookieState) {
    return NextResponse.redirect(new URL("/dashboard/meta-connect?error=oauth", site));
  }

  if (!process.env.JWT_SECRET || !process.env.ENCRYPTION_KEY) {
    return NextResponse.redirect(new URL("/dashboard/meta-connect?error=secrets", site));
  }

  try {
    const tokenRes = await exchangeCodeForToken({
      clientId: appId,
      clientSecret: appSecret,
      redirectUri,
      code,
    });

    const meUrl = new URL("https://graph.facebook.com/v18.0/me");
    meUrl.searchParams.set("fields", "id,name,email");
    meUrl.searchParams.set("access_token", tokenRes.access_token);
    const meRes = await fetch(meUrl.toString(), { cache: "no-store" });
    const me = (await meRes.json()) as { id?: string; name?: string; email?: string };

    if (!me?.id) {
      return NextResponse.redirect(new URL("/dashboard/meta-connect?error=profile", site));
    }

    const appUserId = request.cookies.get("fb_oauth_app_user")?.value;
    const agencyId = await upsertAgencyFromFacebook({
      accessToken: tokenRes.access_token,
      fbUserId: me.id,
      name: me.name,
      email: me.email,
      appUserId: appUserId && appUserId.length > 0 ? appUserId : undefined,
    });

    const jwt = await signAgencyJwt({ agencyId });
    const res = NextResponse.redirect(new URL("/dashboard/meta-connect?connected=1", site));
    res.cookies.set(COOKIE_NAME, jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    res.cookies.delete("fb_oauth_state");
    res.cookies.set("fb_oauth_app_user", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
    return res;
  } catch {
    return NextResponse.redirect(new URL("/dashboard/meta-connect?error=token", site));
  }
}
