import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireMongo } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { hashToken } from "@/lib/security/token";
import { UserModel } from "@/models/user";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(72),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rate = checkRateLimit({
    key: `auth:reset-password:ip:${ip}`,
    limit: 20,
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
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { token, password } = parsed.data;
  const tokenHash = hashToken(token);

  try {
    await requireMongo();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const user = await UserModel.findOne({
    resetPasswordToken: tokenHash,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await UserModel.updateOne(
    { _id: user._id },
    {
      $set: { passwordHash, isEmailVerified: true },
      $unset: {
        resetPasswordToken: "",
        resetPasswordExpires: "",
        emailVerificationToken: "",
        emailVerificationExpires: "",
      },
    },
  );

  return NextResponse.json({ ok: true });
}
