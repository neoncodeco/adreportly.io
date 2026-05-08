import { NextResponse } from "next/server";
import { z } from "zod";
import { requireMongo } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email/mailer";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { createRandomToken, hashToken } from "@/lib/security/token";
import { UserModel } from "@/models/user";

const schema = z.object({
  email: z.string().trim().email(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rate = checkRateLimit({
    key: `auth:resend-verification:ip:${ip}`,
    limit: 8,
    windowMs: 15 * 60 * 1000,
  });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  try {
    await requireMongo();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const email = parsed.data.email.toLowerCase();
  const user = await UserModel.findOne({ email }).select("isEmailVerified").lean().exec();
  if (!user || user.isEmailVerified) {
    return NextResponse.json({ ok: true });
  }

  const token = createRandomToken(32);
  await UserModel.updateOne(
    { email },
    {
      $set: {
        emailVerificationToken: hashToken(token),
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    },
  );
  await sendVerificationEmail(email, token);
  return NextResponse.json({ ok: true });
}
