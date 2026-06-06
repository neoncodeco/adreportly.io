import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerUser } from "@/lib/auth/session";
import { prisma, requireDb } from "@/lib/db";
import { getOrSetCache, invalidateCacheByPrefix, USER_CACHE_HEADERS } from "@/lib/server-cache";

export async function GET() {
  const authUser = await getServerUser();
  if (!authUser?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    await requireDb();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const payload = await getOrSetCache(`user:profile:${authUser.id}`, 30_000, async () => {
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { email: true, fullName: true, organization: true },
    });
    if (!user) {
      return null;
    }
    return {
      email: user.email ?? "",
      full_name: user.fullName ?? "",
      organization: user.organization ?? "",
    };
  });
  if (!payload) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json(payload, { headers: USER_CACHE_HEADERS });
}

const patchSchema = z.object({
  full_name: z.string().trim().max(100).optional(),
  organization: z.string().trim().max(100).optional(),
});

export async function PATCH(request: Request) {
  const authUser = await getServerUser();
  if (!authUser?.id) {
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
    await requireDb();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const data: { fullName?: string; organization?: string } = {};
  if (parsed.data.full_name !== undefined) data.fullName = parsed.data.full_name;
  if (parsed.data.organization !== undefined) data.organization = parsed.data.organization;

  await prisma.user.update({
    where: { id: authUser.id },
    data,
  });
  invalidateCacheByPrefix(`user:profile:${authUser.id}`);

  return NextResponse.json({ ok: true });
}
