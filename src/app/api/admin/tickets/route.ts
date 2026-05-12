import { NextRequest, NextResponse } from "next/server";
import {
  clampPageSize,
  clampSkip,
  escapeRegex,
  sanitizeSearchQuery,
} from "@/lib/admin-route-utils";
import { requireAdmin } from "@/lib/require-admin";
import { ADMIN_CACHE_HEADERS, getOrSetCache } from "@/lib/server-cache";
import { TicketModel } from "@/models/ticket";

const ALLOWED_STATUS = new Set(["open", "in_progress", "waiting_user", "resolved", "closed"]);
const ALLOWED_PRIORITY = new Set(["low", "medium", "high", "urgent"]);
const ALLOWED_CATEGORY = new Set(["billing", "technical", "feature_request", "account", "general"]);

export async function GET(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const status = sanitizeSearchQuery(searchParams.get("status"), 40);
  const priority = sanitizeSearchQuery(searchParams.get("priority"), 40);
  const category = sanitizeSearchQuery(searchParams.get("category"), 40);
  const q = sanitizeSearchQuery(searchParams.get("q"));
  const limit = clampPageSize(searchParams.get("limit"), 60, 100);
  const skip = clampSkip(searchParams.get("skip"));

  const filter: Record<string, unknown> = {};
  if (status && ALLOWED_STATUS.has(status)) filter.status = status;
  if (priority && ALLOWED_PRIORITY.has(priority)) filter.priority = priority;
  if (category && ALLOWED_CATEGORY.has(category)) filter.category = category;
  if (q) {
    const safe = escapeRegex(q);
    filter.$or = [
      { ticketNumber: { $regex: safe, $options: "i" } },
      { subject: { $regex: safe, $options: "i" } },
      { userEmail: { $regex: safe, $options: "i" } },
      { userName: { $regex: safe, $options: "i" } },
    ];
  }

  const payload = await getOrSetCache(`admin:tickets:${request.url}`, 8_000, async () => {
    const [rows, total] = await Promise.all([
      TicketModel.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-replies")
        .lean()
        .exec(),
      TicketModel.countDocuments(filter),
    ]);

    return {
      success: true,
      total,
      limit,
      skip,
      tickets: rows.map((t) => ({
        id: t._id.toString(),
        ticketNumber: t.ticketNumber,
        userId: t.userId,
        userEmail: t.userEmail,
        userName: t.userName,
        subject: t.subject,
        category: t.category,
        priority: t.priority,
        status: t.status,
        repliesCount: (t.replies ?? []).length,
        lastRepliedByAdmin: t.lastRepliedByAdmin,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
    };
  });

  return NextResponse.json(payload, { headers: ADMIN_CACHE_HEADERS });
}
