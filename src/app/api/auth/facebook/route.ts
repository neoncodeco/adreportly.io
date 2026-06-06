import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { hasDatabase, prisma } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

async function getUserFbAppId(userId: string): Promise<string | null> {
  if (!hasDatabase()) return null;
  try {
    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: { fbAppId: true },
    });
    return u?.fbAppId ?? null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const rate = checkRateLimit({
    key: `auth:facebook:start:ip:${getClientIp(request)}`,
    limit: 20,
    windowMs: 15 * 60 * 1000,
  });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } },
    );
  }

  const authUser = await getServerUser();

  const site =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const redirectUri =
    process.env.FACEBOOK_REDIRECT_URI ?? `${site.replace(/\/$/, "")}/api/auth/facebook/callback`;

  // Per-user App ID from DB takes priority over .env
  let appId = process.env.FACEBOOK_APP_ID ?? null;
  if (authUser?.id) {
    const dbAppId = await getUserFbAppId(authUser.id);
    if (dbAppId) appId = dbAppId;
  }

  if (!appId) {
    return NextResponse.json(
      { error: "Facebook App ID not configured. Add it in Dashboard → Settings." },
      { status: 500 },
    );
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
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  if (authUser?.id) {
    res.cookies.set("fb_oauth_app_user", authUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });
  } else {
    res.cookies.set("fb_oauth_app_user", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }
  return res;
}
