import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { requireMongo } from "@/lib/db";
import { UserModel } from "@/models/user";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    await requireMongo();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const user = (await UserModel.findById(session.user.id).lean().exec()) as {
    email?: string;
    fullName?: string;
    organization?: string;
  } | null;
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    email: user.email ?? "",
    full_name: user.fullName ?? "",
    organization: user.organization ?? "",
  });
}

const patchSchema = z.object({
  full_name: z.string().trim().max(100).optional(),
  organization: z.string().trim().max(100).optional(),
});

export async function PATCH(request: Request) {
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

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    await requireMongo();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const update: { fullName?: string; organization?: string } = {};
  if (parsed.data.full_name !== undefined) update.fullName = parsed.data.full_name;
  if (parsed.data.organization !== undefined) update.organization = parsed.data.organization;

  await UserModel.updateOne({ _id: session.user.id }, { $set: update });

  return NextResponse.json({ ok: true });
}
