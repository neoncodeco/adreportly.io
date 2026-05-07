import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { requireMongo } from "@/lib/db";
import { encryptSecret } from "@/lib/encryption";
import { getOrSetCache, invalidateCacheByPrefix, USER_CACHE_HEADERS } from "@/lib/server-cache";
import { UserModel } from "@/models/user";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  try {
    await requireMongo();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Database unavailable" },
      { status: 503 },
    );
  }

  const payload = await getOrSetCache(`user:fb-app:${session.user.id}`, 30_000, async () => {
    const user = await UserModel.findById(session.user.id)
      .select("fbAppId encryptedFbAppSecret")
      .lean()
      .exec();
    return {
      fbAppId: user?.fbAppId ?? null,
      hasSecret: Boolean(user?.encryptedFbAppSecret),
    };
  });

  return NextResponse.json(payload, { headers: USER_CACHE_HEADERS });
}

const patchSchema = z.object({
  fbAppId: z.string().min(1).max(64).trim(),
  fbAppSecret: z.string().min(1).max(128).trim(),
});

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    await requireMongo();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Database unavailable" },
      { status: 503 },
    );
  }

  const encryptedFbAppSecret = encryptSecret(parsed.data.fbAppSecret);

  await UserModel.findByIdAndUpdate(session.user.id, {
    $set: {
      fbAppId: parsed.data.fbAppId,
      encryptedFbAppSecret,
    },
  }).exec();
  invalidateCacheByPrefix(`user:fb-app:${session.user.id}`);
  invalidateCacheByPrefix("user:dashboard-overview:");
  invalidateCacheByPrefix("user:ad-accounts:");

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  try {
    await requireMongo();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Database unavailable" },
      { status: 503 },
    );
  }
  await UserModel.findByIdAndUpdate(session.user.id, {
    $set: { fbAppId: null, encryptedFbAppSecret: null },
  }).exec();
  invalidateCacheByPrefix(`user:fb-app:${session.user.id}`);
  invalidateCacheByPrefix("user:dashboard-overview:");
  invalidateCacheByPrefix("user:ad-accounts:");
  return NextResponse.json({ ok: true });
}
