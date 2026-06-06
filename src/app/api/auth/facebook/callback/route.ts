import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/services/facebook";
import { upsertAgencyFromFacebook } from "@/lib/agency-service";
import { signAgencyJwt, COOKIE_NAME } from "@/lib/jwt";
import { hasDatabase, prisma } from "@/lib/db";
import { decryptSecret } from "@/lib/encryption";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

async function getUserFbCredentials(
  userId: string,
): Promise<{ appId: string; appSecret: string } | null> {
  if (!hasDatabase()) return null;
  try {
    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: { fbAppId: true, encryptedFbAppSecret: true },
    });
    if (!u?.fbAppId || !u?.encryptedFbAppSecret) return null;
    const appSecret = decryptSecret(u.encryptedFbAppSecret);
    return { appId: u.fbAppId, appSecret };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const rate = checkRateLimit({
    key: `auth:facebook:callback:ip:${getClientIp(request)}`,
    limit: 30,
    windowMs: 15 * 60 * 1000,
  });
  if (!rate.allowed) {
    return NextResponse.redirect(
      new URL(
        "/dashboard/meta-connect?error=rate_limited",
        process.env.NEXT_PUBLIC_SITE_URL ??
          (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : request.nextUrl.origin),
      ),
    );
  }

  const site =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const redirectUri =
    process.env.FACEBOOK_REDIRECT_URI ?? `${site.replace(/\/$/, "")}/api/auth/facebook/callback`;

  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = request.cookies.get("fb_oauth_state")?.value;
  const appUserId = request.cookies.get("fb_oauth_app_user")?.value;

  if (!code || !state || state !== cookieState) {
    return NextResponse.redirect(new URL("/dashboard/meta-connect?error=oauth", site));
  }

  if (!process.env.JWT_SECRET || !process.env.ENCRYPTION_KEY) {
    return NextResponse.redirect(new URL("/dashboard/meta-connect?error=secrets", site));
  }

  // Resolve App ID and Secret: DB credentials take priority over .env
  let appId = process.env.FACEBOOK_APP_ID ?? null;
  let appSecret = process.env.FACEBOOK_APP_SECRET ?? null;

  if (appUserId) {
    const dbCreds = await getUserFbCredentials(appUserId);
    if (dbCreds) {
      appId = dbCreds.appId;
      appSecret = dbCreds.appSecret;
    }
  }

  if (!appId || !appSecret) {
    return NextResponse.redirect(new URL("/dashboard/meta-connect?error=token", site));
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
