import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { ADMIN_CACHE_HEADERS, getOrSetCache } from "@/lib/server-cache";
import { SubscriptionModel } from "@/models/subscription";

export async function GET(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status")?.trim() || "";
  const q = searchParams.get("q")?.trim() || "";
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10) || 50));
  const skip = Math.max(0, parseInt(searchParams.get("skip") ?? "0", 10) || 0);

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (q) {
    filter.$or = [
      { userId: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
      {
        providerSubscriptionId: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" },
      },
      { providerReference: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
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
