import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerUser } from "@/lib/auth/session";
import { prisma, requireDb } from "@/lib/db";
import { isValidId } from "@/lib/id";
import { markNotificationsRead } from "@/lib/notification-scope";
import { invalidateCacheByPrefix } from "@/lib/server-cache";

const bodySchema = z.object({
  id: z.string().optional(),
  all: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  const authUser = await getServerUser();
  if (!authUser?.id) {
    return NextResponse.json({ success: false, error: "Sign in required." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    await requireDb();
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Database unavailable" },
      { status: 503 },
    );
  }

  const me = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { role: true },
  });
  const role = me?.role === "admin" ? "admin" : "user";
  const uid = authUser.id;

  if (parsed.data.all) {
    await markNotificationsRead(uid, role);
    invalidateCacheByPrefix(`user:notifications:${uid}`);
    return NextResponse.json({ success: true });
  }

  if (!parsed.data.id) {
    return NextResponse.json({ success: false, error: "id or all is required" }, { status: 400 });
  }

  if (!isValidId(parsed.data.id)) {
    return NextResponse.json(
      { success: false, error: "Invalid notification id." },
      { status: 400 },
    );
  }

  await markNotificationsRead(uid, role, parsed.data.id);
  invalidateCacheByPrefix(`user:notifications:${uid}`);

  return NextResponse.json({ success: true });
}
