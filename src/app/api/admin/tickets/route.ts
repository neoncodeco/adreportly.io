import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { clampPageSize, clampSkip, sanitizeSearchQuery } from "@/lib/admin-route-utils";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { ADMIN_CACHE_HEADERS, getOrSetCache } from "@/lib/server-cache";

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

  const where: Prisma.TicketWhereInput = {};
  if (status && ALLOWED_STATUS.has(status)) where.status = status as Prisma.EnumTicketStatusFilter;
  if (priority && ALLOWED_PRIORITY.has(priority))
    where.priority = priority as Prisma.EnumTicketPriorityFilter;
  if (category && ALLOWED_CATEGORY.has(category))
    where.category = category as Prisma.EnumTicketCategoryFilter;
  if (q) {
    where.OR = [
      { ticketNumber: { contains: q, mode: "insensitive" } },
      { subject: { contains: q, mode: "insensitive" } },
      { userEmail: { contains: q, mode: "insensitive" } },
      { userName: { contains: q, mode: "insensitive" } },
    ];
  }

  const payload = await getOrSetCache(`admin:tickets:${request.url}`, 8_000, async () => {
    const [rows, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
        include: { _count: { select: { replies: true } } },
      }),
      prisma.ticket.count({ where }),
    ]);

    return {
      success: true,
      total,
      limit,
      skip,
      tickets: rows.map((t) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        userId: t.userId,
        userEmail: t.userEmail,
        userName: t.userName,
        subject: t.subject,
        category: t.category,
        priority: t.priority,
        status: t.status,
        repliesCount: t._count.replies,
        lastRepliedByAdmin: t.lastRepliedByAdmin,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
    };
  });

  return NextResponse.json(payload, { headers: ADMIN_CACHE_HEADERS });
}
