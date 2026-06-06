import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  clampPageSize,
  clampSkip,
  escapeRegex,
  sanitizeSearchQuery,
} from "@/lib/admin-route-utils";
import { prisma, requireDb } from "@/lib/db";
import { isUuid } from "@/lib/id";
import { requireAdmin } from "@/lib/require-admin";
import { ADMIN_CACHE_HEADERS, getOrSetCache, invalidateCacheByPrefix } from "@/lib/server-cache";

const patchSchema = z.object({
  agencyId: z.string().trim().min(1).max(120),
  action: z.enum(["unlinkUsers", "deleteAgency"]),
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
            { agencyId: { contains: safeQ, mode: "insensitive" as const } },
            { name: { contains: safeQ, mode: "insensitive" as const } },
            { email: { contains: safeQ, mode: "insensitive" as const } },
            { fbUserId: { contains: safeQ, mode: "insensitive" as const } },
            ...(isUuid(q) ? [{ appUserId: q }] : []),
          ],
        }
      : {};

  const payload = await getOrSetCache(`admin:agencies:${request.url}`, 15_000, async () => {
    const [rows, total, userCounts] = await Promise.all([
      prisma.agency.findMany({
        where,
        select: {
          agencyId: true,
          name: true,
          email: true,
          fbUserId: true,
          appUserId: true,
        },
        orderBy: { agencyId: "asc" },
        skip,
        take: limit,
      }),
      prisma.agency.count({ where }),
      prisma.user.groupBy({
        by: ["agencyId"],
        where: { agencyId: { not: null } },
        _count: true,
      }),
    ]);

    const linkedMap = new Map(
      userCounts.filter((row) => row.agencyId !== null).map((row) => [row.agencyId!, row._count]),
    );

    return {
      success: true,
      total,
      limit,
      skip,
      agencies: rows.map((a) => ({
        agencyId: a.agencyId,
        name: a.name ?? "",
        email: a.email ?? "",
        fbUserId: a.fbUserId ?? null,
        appUserId: a.appUserId ?? null,
        linkedUsers: linkedMap.get(a.agencyId) ?? 0,
      })),
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

  try {
    await requireDb();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable";
    return NextResponse.json({ success: false, error: msg }, { status: 503 });
  }

  if (payload.action === "unlinkUsers") {
    await prisma.user.updateMany({
      where: { agencyId: payload.agencyId },
      data: { agencyId: null },
    });
    invalidateCacheByPrefix("admin:agencies:");
    invalidateCacheByPrefix("admin:users:");
    invalidateCacheByPrefix("admin:overview:");
    return NextResponse.json({ success: true });
  }

  if (payload.action === "deleteAgency") {
    await prisma.user.updateMany({
      where: { agencyId: payload.agencyId },
      data: { agencyId: null },
    });
    await prisma.agency.delete({ where: { agencyId: payload.agencyId } });
    invalidateCacheByPrefix("admin:agencies:");
    invalidateCacheByPrefix("admin:users:");
    invalidateCacheByPrefix("admin:overview:");
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: "Unsupported action." }, { status: 400 });
}
