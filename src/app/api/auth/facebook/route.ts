import { NextResponse } from "next/server";

export async function GET() {
  const appId = process.env.FACEBOOK_APP_ID;
  const site =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const redirectUri =
    process.env.FACEBOOK_REDIRECT_URI ?? `${site.replace(/\/$/, "")}/api/auth/facebook/callback`;

  if (!appId) {
    return NextResponse.json({ error: "FACEBOOK_APP_ID is not configured" }, { status: 500 });
  }

  const state = crypto.randomUUID();
  const scope = "ads_management,business_management";
  const url = new URL("https://www.facebook.com/v18.0/dialog/oauth");
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("scope", scope);

  const res = NextResponse.redirect(url.toString());
  res.cookies.set("fb_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return res;
}
