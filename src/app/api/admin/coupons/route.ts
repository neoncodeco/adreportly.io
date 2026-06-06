import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { clampPageSize, clampSkip, sanitizeSearchQuery } from "@/lib/admin-route-utils";
import { normalizeCouponCode } from "@/lib/billing/coupon-discount";
import { prisma, requireDb } from "@/lib/db";
import { isPrismaUniqueViolation } from "@/lib/prisma-errors";
import { requireAdmin } from "@/lib/require-admin";
import { ADMIN_CACHE_HEADERS, getOrSetCache, invalidateCacheByPrefix } from "@/lib/server-cache";

const createSchema = z.object({
  code: z.string().max(40).optional(),
  percentOff: z.coerce.number().int().min(1).max(100),
  maxRedemptions: z.union([z.coerce.number().int().min(1), z.null()]).optional(),
  expiresAt: z.union([z.string().min(4).max(40), z.null()]).optional(),
  active: z.boolean().optional(),
});

function generateCouponCode(): string {
  const part = crypto.randomBytes(5).toString("hex").toUpperCase();
  return `AR-${part}`;
}

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
  const limit = clampPageSize(searchParams.get("limit"), 25, 100);
  const skip = clampSkip(searchParams.get("skip"));
  const q = sanitizeSearchQuery(searchParams.get("q"), 40);
  const where: Prisma.CouponWhereInput = q ? { code: { contains: q, mode: "insensitive" } } : {};

  const payload = await getOrSetCache(`admin:coupons:${request.url}`, 15_000, async () => {
    const [rows, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.coupon.count({ where }),
    ]);

    return {
      success: true,
      total,
      limit,
      skip,
      coupons: rows.map((r) => ({
        id: r.id,
        code: r.code,
        percentOff: r.percentOff,
        active: r.active,
        maxRedemptions: r.maxRedemptions ?? null,
        redemptionCount: r.redemptionCount,
        expiresAt: r.expiresAt ? r.expiresAt.toISOString() : null,
        createdBy: r.createdBy,
        createdAt: r.createdAt?.toISOString() ?? null,
        updatedAt: r.updatedAt?.toISOString() ?? null,
      })),
    };
  });

  return NextResponse.json(payload, { headers: ADMIN_CACHE_HEADERS });
}

export async function POST(request: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid input", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const rawCode = parsed.data.code?.trim() ? parsed.data.code.trim() : generateCouponCode();
  const code = normalizeCouponCode(rawCode);
  if (code.length < 4 || code.length > 32) {
    return NextResponse.json(
      { success: false, error: "Coupon code must be 4–32 characters (letters, numbers, hyphen)." },
      { status: 400 },
    );
  }

  let expiresAt: Date | null = null;
  if (parsed.data.expiresAt === null) {
    expiresAt = null;
  } else if (typeof parsed.data.expiresAt === "string" && parsed.data.expiresAt.trim()) {
    const raw = parsed.data.expiresAt.trim();
    const d = new Date(raw.length <= 10 ? `${raw}T23:59:59.999Z` : raw);
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ success: false, error: "Invalid expiresAt." }, { status: 400 });
    }
    expiresAt = d;
  }

  const maxRedemptions =
    parsed.data.maxRedemptions === undefined
      ? null
      : parsed.data.maxRedemptions === null
        ? null
        : parsed.data.maxRedemptions;

  try {
    await requireDb();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable";
    return NextResponse.json({ success: false, error: msg }, { status: 503 });
  }

  try {
    const doc = await prisma.coupon.create({
      data: {
        code,
        percentOff: parsed.data.percentOff,
        active: parsed.data.active ?? true,
        maxRedemptions,
        redemptionCount: 0,
        expiresAt,
        createdBy: gate.userId,
      },
    });

    invalidateCacheByPrefix("admin:coupons:");

    return NextResponse.json({
      success: true,
      coupon: {
        id: doc.id,
        code: doc.code,
        percentOff: doc.percentOff,
        active: doc.active,
        maxRedemptions: doc.maxRedemptions ?? null,
        redemptionCount: doc.redemptionCount,
        expiresAt: doc.expiresAt ? doc.expiresAt.toISOString() : null,
      },
    });
  } catch (e: unknown) {
    if (isPrismaUniqueViolation(e, "code")) {
      return NextResponse.json(
        { success: false, error: "A coupon with this code already exists." },
        { status: 409 },
      );
    }
    const msg = e instanceof Error ? e.message : "Could not create coupon.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
