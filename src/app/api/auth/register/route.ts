import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireMongo } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email/mailer";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { createRandomToken, hashToken } from "@/lib/security/token";
import { UserModel } from "@/models/user";

const bodySchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
  full_name: z.string().trim().min(2).max(100),
  organization: z.string().trim().min(2).max(100),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rate = checkRateLimit({
    key: `auth:register:ip:${ip}`,
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many signup attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { email, password, full_name, organization } = parsed.data;

  try {
    await requireMongo();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const existing = await UserModel.findOne({ email: email.toLowerCase() }).lean();
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const rawVerifyToken = createRandomToken(32);
  const verifyTokenHash = hashToken(rawVerifyToken);
  const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await UserModel.create({
    email: email.toLowerCase(),
    passwordHash,
    fullName: full_name,
    organization,
    isEmailVerified: false,
    emailVerificationToken: verifyTokenHash,
    emailVerificationExpires: verifyExpires,
  });

  await sendVerificationEmail(email.toLowerCase(), rawVerifyToken);

  return NextResponse.json({
    ok: true,
    message: "Account created. Please verify your email before signing in.",
  });
}
