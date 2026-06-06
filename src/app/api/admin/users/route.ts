import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  clampPageSize,
  clampSkip,
  escapeRegex,
  sanitizeSearchQuery,
} from "@/lib/admin-route-utils";
import { prisma, requireDb } from "@/lib/db";
import { isValidId } from "@/lib/id";
import { requireAdmin } from "@/lib/require-admin";
import { ADMIN_CACHE_HEADERS, getOrSetCache, invalidateCacheByPrefix } from "@/lib/server-cache";

const patchSchema = z.object({
  userId: z.string().trim().min(1).max(100),
  action: z.enum(["banUser", "unbanUser", "unlinkAgency", "resetBilling", "deleteUser"]),
});

export async function GET(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    await requireDb();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable";
    return NextResponse.json({ success: false, error: msg }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const limit = clampPageSize(searchParams.get("limit"), 50, 100);
  const skip = clampSkip(searchParams.get("skip"));
  const q = sanitizeSearchQuery(searchParams.get("q"));
  const safeQ = escapeRegex(q);

  const where =
    q.length > 0
      ? {
          OR: [
            { email: { contains: safeQ, mode: "insensitive" as const } },
            { fullName: { contains: safeQ, mode: "insensitive" as const } },
          ],
        }
      : {};

  const payload = await getOrSetCache(`admin:users:${request.url}`, 15_000, async () => {
    const [rows, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          organization: true,
          role: true,
          agencyId: true,
          billingPlanId: true,
          billingStatus: true,
          isBanned: true,
          bannedAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      success: true,
      total,
      users: rows.map((u) => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName ?? "",
        organization: u.organization ?? "",
        role: u.role === "admin" ? "admin" : "user",
        metaLinked: Boolean(u.agencyId),
        agencyId: u.agencyId ?? null,
        billingPlanId: u.billingPlanId ?? "free",
        billingStatus: u.billingStatus ?? "inactive",
        isBanned: Boolean(u.isBanned),
        bannedAt: u.bannedAt?.toISOString() ?? null,
        createdAt: u.createdAt.toISOString(),
      })),
      limit,
      skip,
    };
  });

  return NextResponse.json(payload, { headers: ADMIN_CACHE_HEADERS });
}

export async function PATCH(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid input.", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const payload = parsed.data;

  if (!isValidId(payload.userId)) {
    return NextResponse.json({ success: false, error: "Invalid user id." }, { status: 400 });
  }

  if (
    (payload.action === "deleteUser" || payload.action === "banUser") &&
    payload.userId === gate.userId
  ) {
    return NextResponse.json(
      { success: false, error: "You cannot apply this action on your own account." },
      { status: 400 },
    );
  }

  try {
    await requireDb();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable";
    return NextResponse.json({ success: false, error: msg }, { status: 503 });
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { role: true, isBanned: true },
  });
  if (!targetUser) {
    return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
  }

  if (payload.action === "banUser") {
    await prisma.user.update({
      where: { id: payload.userId },
      data: { isBanned: true, bannedAt: new Date(), role: "user" },
    });
  } else if (payload.action === "unbanUser") {
    await prisma.user.update({
      where: { id: payload.userId },
      data: { isBanned: false, bannedAt: null },
    });
  } else if (payload.action === "unlinkAgency") {
    await prisma.user.update({
      where: { id: payload.userId },
      data: { agencyId: null },
    });
  } else if (payload.action === "resetBilling") {
    await prisma.user.update({
      where: { id: payload.userId },
      data: {
        billingPlanId: "free",
        billingStatus: "inactive",
        billingCurrentPeriodEnd: null,
        billingCycle: null,
        billingScheduledPlanId: null,
        billingScheduledCycle: null,
        billingScheduledChangeAt: null,
      },
    });
  } else if (payload.action === "deleteUser") {
    try {
      const { createServiceClient } = await import("@/lib/supabase/admin");
      const supabase = createServiceClient();
      await supabase.auth.admin.deleteUser(payload.userId);
    } catch {
      // Profile row may exist without auth.users (dev); still delete app data.
    }
    await prisma.user.delete({ where: { id: payload.userId } });
  } else {
    return NextResponse.json({ success: false, error: "Unsupported action." }, { status: 400 });
  }

  invalidateCacheByPrefix("admin:users:");
  invalidateCacheByPrefix("admin:agencies:");
  invalidateCacheByPrefix("admin:overview:");
  return NextResponse.json({ success: true });
}
