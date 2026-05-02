import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireMongo } from "@/lib/db";
import { UserModel } from "@/models/user";

const schema = z.object({
  email: z.string().trim().email(),
});

export async function POST(request: Request) {
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
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  await UserModel.updateOne(
    { email },
    { $set: { resetPasswordToken: token, resetPasswordExpires: expires } },
  );

  return NextResponse.json({ ok: true });
}
