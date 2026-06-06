import { NextRequest, NextResponse } from "next/server";
import type { Prisma, SubscriptionStatus } from "@prisma/client";
import {
  clampPageSize,
  clampSkip,
  escapeRegex,
  sanitizeSearchQuery,
} from "@/lib/admin-route-utils";
import { prisma, requireDb } from "@/lib/db";
import { isUuid } from "@/lib/id";
import { requireAdmin } from "@/lib/require-admin";
import { ADMIN_CACHE_HEADERS, getOrSetCache } from "@/lib/server-cache";

const ALLOWED_STATUS = new Set<SubscriptionStatus>([
  "pending",
  "active",
  "past_due",
  "canceled",
  "expired",
  "incomplete",
]);

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
  const status = sanitizeSearchQuery(searchParams.get("status"), 40);
  const q = sanitizeSearchQuery(searchParams.get("q"));
  const limit = clampPageSize(searchParams.get("limit"), 50, 100);
  const skip = clampSkip(searchParams.get("skip"));
  const safeQ = escapeRegex(q);

  const where: Prisma.SubscriptionWhereInput = {};
  if (status && ALLOWED_STATUS.has(status as SubscriptionStatus)) {
    where.status = status as SubscriptionStatus;
  }
  if (q) {
    const or: Prisma.SubscriptionWhereInput[] = [
      { providerSubscriptionId: { contains: safeQ, mode: "insensitive" } },
      { providerReference: { contains: safeQ, mode: "insensitive" } },
      { user: { email: { contains: safeQ, mode: "insensitive" } } },
      { user: { fullName: { contains: safeQ, mode: "insensitive" } } },
    ];
    if (isUuid(q)) {
      or.unshift({ userId: q });
    }
    where.OR = or;
  }

  const payload = await getOrSetCache(`admin:billing:${request.url}`, 12_000, async () => {
    const [rows, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.subscription.count({ where }),
    ]);

    return {
      success: true,
      total,
      limit,
      skip,
      subscriptions: rows.map((row) => ({
        id: row.id,
        userId: row.userId,
        planId: row.planId,
        status: row.status,
        amount: row.amount,
        currency: row.currency,
        providerSubscriptionId: row.providerSubscriptionId,
        providerReference: row.providerReference,
        nextBillingAt: row.nextBillingAt,
        updatedAt: row.updatedAt,
      })),
    };
  });

  return NextResponse.json(payload, { headers: ADMIN_CACHE_HEADERS });
}
