import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { TicketModel } from "@/models/ticket";

export async function GET(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status")?.trim() || "";
  const priority = searchParams.get("priority")?.trim() || "";
  const category = searchParams.get("category")?.trim() || "";
  const q = searchParams.get("q")?.trim() || "";
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "60", 10) || 60));
  const skip = Math.max(0, parseInt(searchParams.get("skip") ?? "0", 10) || 0);

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;
  if (q) {
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { ticketNumber: { $regex: safe, $options: "i" } },
      { subject: { $regex: safe, $options: "i" } },
      { userEmail: { $regex: safe, $options: "i" } },
      { userName: { $regex: safe, $options: "i" } },
    ];
  }

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

  return NextResponse.json({
    success: true,
    total,
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
  });
}
