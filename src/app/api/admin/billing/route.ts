import { NextRequest, NextResponse } from "next/server";
import {
  clampPageSize,
  clampSkip,
  escapeRegex,
  sanitizeSearchQuery,
} from "@/lib/admin-route-utils";
import { requireAdmin } from "@/lib/require-admin";
import { ADMIN_CACHE_HEADERS, getOrSetCache } from "@/lib/server-cache";
import { SubscriptionModel } from "@/models/subscription";

const ALLOWED_STATUS = new Set([
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

  const { searchParams } = new URL(request.url);
  const status = sanitizeSearchQuery(searchParams.get("status"), 40);
  const q = sanitizeSearchQuery(searchParams.get("q"));
  const limit = clampPageSize(searchParams.get("limit"), 50, 100);
  const skip = clampSkip(searchParams.get("skip"));
  const safeQ = escapeRegex(q);

  const filter: Record<string, unknown> = {};
  if (status && ALLOWED_STATUS.has(status)) filter.status = status;
  if (q) {
    filter.$or = [
      { userId: { $regex: safeQ, $options: "i" } },
      {
        providerSubscriptionId: { $regex: safeQ, $options: "i" },
      },
      { providerReference: { $regex: safeQ, $options: "i" } },
    ];
  }

  const payload = await getOrSetCache(`admin:billing:${request.url}`, 12_000, async () => {
    const [rows, total] = await Promise.all([
      SubscriptionModel.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean().exec(),
      SubscriptionModel.countDocuments(filter),
    ]);

    return {
      success: true,
      total,
      limit,
      skip,
      subscriptions: rows.map((row) => ({
        id: row._id.toString(),
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
