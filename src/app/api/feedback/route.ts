import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerUser } from "@/lib/auth/session";
import { isSafeInternalLink } from "@/lib/admin-route-utils";
import { prisma, requireDb } from "@/lib/db";
import {
  FEEDBACK_AREA_LABELS,
  FEEDBACK_AREAS,
  FEEDBACK_TYPE_LABELS,
  FEEDBACK_TYPES,
} from "@/lib/feedback";
import { invalidateCacheByPrefix } from "@/lib/server-cache";

const createSchema = z.object({
  type: z.enum(FEEDBACK_TYPES),
  area: z.enum(FEEDBACK_AREAS).default("overall"),
  rating: z.number().int().min(1).max(5),
  message: z.string().trim().min(10, "Feedback must be at least 10 characters").max(3000),
  pageUrl: z.string().trim().max(300).optional().or(z.literal("")),
});

function serializeFeedback(row: {
  id: string;
  type: string;
  area: string;
  rating: number;
  message: string;
  pageUrl: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    type: row.type,
    area: row.area,
    rating: row.rating,
    message: row.message,
    pageUrl: row.pageUrl ?? null,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function GET() {
  const authUser = await getServerUser();
  if (!authUser?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    await requireDb();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Database unavailable" },
      { status: 503 },
    );
  }

  const rows = await prisma.feedback.findMany({
    where: { userId: authUser.id },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  return NextResponse.json({ feedback: rows.map(serializeFeedback) });
}

export async function POST(request: Request) {
  const authUser = await getServerUser();
  if (!authUser?.id || !authUser.email) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstMessage =
      Object.values(fieldErrors)
        .flat()
        .find((m) => typeof m === "string") ?? "Validation failed. Check your input.";
    return NextResponse.json({ error: firstMessage, fieldErrors }, { status: 400 });
  }

  const pageUrl = parsed.data.pageUrl?.trim() || null;
  if (pageUrl && !isSafeInternalLink(pageUrl)) {
    return NextResponse.json({ error: "Page URL must be an internal path." }, { status: 400 });
  }

  try {
    await requireDb();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Database unavailable" },
      { status: 503 },
    );
  }

  const userRow = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { fullName: true, organization: true },
  });

  const row = await prisma.feedback.create({
    data: {
      userId: authUser.id,
      userEmail: authUser.email,
      userName: userRow?.fullName ?? "",
      organization: userRow?.organization ?? "",
      type: parsed.data.type,
      area: parsed.data.area,
      rating: parsed.data.rating,
      message: parsed.data.message,
      pageUrl,
    },
  });

  const displayName = userRow?.fullName || authUser.email;
  await prisma.notification.create({
    data: {
      title: "New customer feedback",
      message: `${displayName} rated ${parsed.data.rating}/5 for ${
        FEEDBACK_AREA_LABELS[parsed.data.area]
      } (${FEEDBACK_TYPE_LABELS[parsed.data.type]}).`,
      link: "/admin/feedback",
      targetRole: "admin",
      recipientUserId: null,
      createdByUserId: authUser.id,
    },
  });

  invalidateCacheByPrefix("admin:feedback:");
  invalidateCacheByPrefix("admin:overview:");
  invalidateCacheByPrefix("user:notifications:");

  return NextResponse.json({ id: row.id, status: row.status });
}
