import { NextRequest, NextResponse } from "next/server";
import {
  clampPageSize,
  clampSkip,
  escapeRegex,
  sanitizeSearchQuery,
} from "@/lib/admin-route-utils";
import { FEEDBACK_AREAS, FEEDBACK_STATUSES, FEEDBACK_TYPES } from "@/lib/feedback";
import { requireAdmin } from "@/lib/require-admin";
import { ADMIN_CACHE_HEADERS, getOrSetCache } from "@/lib/server-cache";
import { FeedbackModel } from "@/models/feedback";

const ALLOWED_TYPES = new Set<string>(FEEDBACK_TYPES);
const ALLOWED_AREAS = new Set<string>(FEEDBACK_AREAS);
const ALLOWED_STATUSES = new Set<string>(FEEDBACK_STATUSES);

function serializeFeedback(row: {
  _id: { toString(): string };
  userId: string;
  userEmail: string;
  userName: string;
  organization: string;
  type: string;
  area: string;
  rating: number;
  message: string;
  pageUrl?: string | null;
  status: string;
  adminNote: string;
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row._id.toString(),
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

  const filter: Record<string, unknown> = {};
  if (status && ALLOWED_STATUSES.has(status)) filter.status = status;
  if (type && ALLOWED_TYPES.has(type)) filter.type = type;
  if (area && ALLOWED_AREAS.has(area)) filter.area = area;
  if (rating && rating >= 1 && rating <= 5) filter.rating = rating;
  if (q) {
    const safe = escapeRegex(q);
    filter.$or = [
      { message: { $regex: safe, $options: "i" } },
      { userEmail: { $regex: safe, $options: "i" } },
      { userName: { $regex: safe, $options: "i" } },
      { organization: { $regex: safe, $options: "i" } },
      { pageUrl: { $regex: safe, $options: "i" } },
    ];
  }

  const payload = await getOrSetCache(`admin:feedback:${request.url}`, 8_000, async () => {
    const [rows, total] = await Promise.all([
      FeedbackModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      FeedbackModel.countDocuments(filter),
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
