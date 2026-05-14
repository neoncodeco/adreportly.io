import { NextResponse } from "next/server";
import { requireMongo } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { hashToken } from "@/lib/security/token";
import { UserModel } from "@/models/user";

export async function GET(request: Request) {
  const rate = checkRateLimit({
    key: `auth:verify-email:ip:${getClientIp(request)}`,
    limit: 30,
    windowMs: 15 * 60 * 1000,
  });
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const redirectBase =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : url.origin);

  if (!rate.allowed) {
    return NextResponse.redirect(`${redirectBase}/login?verify=rate_limited`);
  }

  if (!token || token.length < 20) {
    return NextResponse.redirect(`${redirectBase}/login?verify=invalid`);
  }

  try {
    await requireMongo();
  } catch {
    return NextResponse.redirect(`${redirectBase}/login?verify=error`);
  }

  const tokenHash = hashToken(token);
  const updated = await UserModel.updateOne(
    {
      emailVerificationToken: tokenHash,
      emailVerificationExpires: { $gt: new Date() },
    },
    {
      $set: { isEmailVerified: true },
      $unset: { emailVerificationToken: "", emailVerificationExpires: "" },
    },
  );

  if (updated.matchedCount === 0) {
    return NextResponse.redirect(`${redirectBase}/login?verify=expired`);
  }
  return NextResponse.redirect(`${redirectBase}/login?verify=success`);
}
