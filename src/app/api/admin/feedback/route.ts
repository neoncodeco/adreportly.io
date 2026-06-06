import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { clampPageSize, clampSkip, sanitizeSearchQuery } from "@/lib/admin-route-utils";
import { FEEDBACK_AREAS, FEEDBACK_STATUSES, FEEDBACK_TYPES } from "@/lib/feedback";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { ADMIN_CACHE_HEADERS, getOrSetCache } from "@/lib/server-cache";

const ALLOWED_TYPES = new Set<string>(FEEDBACK_TYPES);
const ALLOWED_AREAS = new Set<string>(FEEDBACK_AREAS);
const ALLOWED_STATUSES = new Set<string>(FEEDBACK_STATUSES);

function serializeFeedback(row: {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  organization: string;
  type: string;
  area: string;
  rating: number;
  message: string;
  pageUrl: string | null;
  status: string;
  adminNote: string;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    userId: row.userId,
    userEmail: row.userEmail,
    userName: row.userName,
    organization: row.organization,
    type: row.type,
    area: row.area,
    rating: row.rating,
    message: row.message,
    pageUrl: row.pageUrl ?? null,
    status: row.status,
    adminNote: row.adminNote,
    reviewedAt: row.reviewedAt ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function GET(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const status = sanitizeSearchQuery(searchParams.get("status"), 40);
  const type = sanitizeSearchQuery(searchParams.get("type"), 40);
  const area = sanitizeSearchQuery(searchParams.get("area"), 40);
  const q = sanitizeSearchQuery(searchParams.get("q"));
  const ratingRaw = searchParams.get("rating");
  const rating = ratingRaw ? parseInt(ratingRaw, 10) : null;
  const limit = clampPageSize(searchParams.get("limit"), 60, 100);
  const skip = clampSkip(searchParams.get("skip"));

  const where: Prisma.FeedbackWhereInput = {};
  if (status && ALLOWED_STATUSES.has(status))
    where.status = status as Prisma.EnumFeedbackStatusFilter;
  if (type && ALLOWED_TYPES.has(type)) where.type = type as Prisma.EnumFeedbackTypeFilter;
  if (area && ALLOWED_AREAS.has(area)) where.area = area as Prisma.EnumFeedbackAreaFilter;
  if (rating && rating >= 1 && rating <= 5) where.rating = rating;
  if (q) {
    where.OR = [
      { message: { contains: q, mode: "insensitive" } },
      { userEmail: { contains: q, mode: "insensitive" } },
      { userName: { contains: q, mode: "insensitive" } },
      { organization: { contains: q, mode: "insensitive" } },
      { pageUrl: { contains: q, mode: "insensitive" } },
    ];
  }

  const payload = await getOrSetCache(`admin:feedback:${request.url}`, 8_000, async () => {
    const [rows, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.feedback.count({ where }),
    ]);

    return {
      success: true,
      total,
      limit,
      skip,
      feedback: rows.map(serializeFeedback),
    };
  });

  return NextResponse.json(payload, { headers: ADMIN_CACHE_HEADERS });
}
