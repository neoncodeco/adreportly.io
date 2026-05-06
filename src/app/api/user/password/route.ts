import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/auth";
import { requireMongo } from "@/lib/db";
import { UserModel } from "@/models/user";

const bodySchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8).max(72),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
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

  const { currentPassword, newPassword } = parsed.data;

  try {
    await requireMongo();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const user = await UserModel.findById(session.user.id).select("passwordHash").lean().exec();
  const hash = user?.passwordHash as string | undefined;
  if (!user || !hash) {
    return NextResponse.json({ error: "Could not update password." }, { status: 400 });
  }

  const currentOk = await bcrypt.compare(currentPassword, hash);
  if (!currentOk) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
  }

  if (currentPassword === newPassword) {
    return NextResponse.json(
      { error: "New password must be different from your current password." },
      { status: 400 },
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await UserModel.updateOne({ _id: session.user.id }, { $set: { passwordHash } });

  return NextResponse.json({ ok: true });
}
