import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerUser } from "@/lib/auth/session";
import { prisma, requireDb } from "@/lib/db";
import { encryptSecret } from "@/lib/encryption";
import { getOrSetCache, invalidateCacheByPrefix, USER_CACHE_HEADERS } from "@/lib/server-cache";

export async function GET() {
  const authUser = await getServerUser();
  if (!authUser?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  try {
    await requireDb();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Database unavailable" },
      { status: 503 },
    );
  }

  const payload = await getOrSetCache(`user:fb-app:${authUser.id}`, 30_000, async () => {
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { fbAppId: true, encryptedFbAppSecret: true, agencyId: true },
    });
    return {
      fbAppId: user?.fbAppId ?? null,
      hasSecret: Boolean(user?.encryptedFbAppSecret),
      metaLinked: Boolean(user?.agencyId),
    };
  });

  return NextResponse.json(payload, { headers: USER_CACHE_HEADERS });
}

const patchSchema = z.object({
  fbAppId: z.string().min(1).max(64).trim(),
  fbAppSecret: z.string().max(128).trim().optional(),
});

export async function PATCH(request: NextRequest) {
  const authUser = await getServerUser();
  if (!authUser?.id) {
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
    await requireDb();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Database unavailable" },
      { status: 503 },
    );
  }

  const fbAppSecret = parsed.data.fbAppSecret?.trim();

  const existingUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { encryptedFbAppSecret: true },
  });
  if (!fbAppSecret && !existingUser?.encryptedFbAppSecret) {
    return NextResponse.json({ error: "App Secret is required." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: authUser.id },
    data: {
      fbAppId: parsed.data.fbAppId,
      ...(fbAppSecret ? { encryptedFbAppSecret: encryptSecret(fbAppSecret) } : {}),
    },
  });
  invalidateCacheByPrefix(`user:fb-app:${authUser.id}`);
  invalidateCacheByPrefix("user:dashboard-overview:");
  invalidateCacheByPrefix("user:ad-accounts:");

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const authUser = await getServerUser();
  if (!authUser?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  try {
    await requireDb();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Database unavailable" },
      { status: 503 },
    );
  }
  await prisma.user.update({
    where: { id: authUser.id },
    data: { fbAppId: null, encryptedFbAppSecret: null },
  });
  invalidateCacheByPrefix(`user:fb-app:${authUser.id}`);
  invalidateCacheByPrefix("user:dashboard-overview:");
  invalidateCacheByPrefix("user:ad-accounts:");
  return NextResponse.json({ ok: true });
}
