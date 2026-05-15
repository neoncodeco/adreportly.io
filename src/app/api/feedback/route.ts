import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { isSafeInternalLink } from "@/lib/admin-route-utils";
import { requireMongo } from "@/lib/db";
import {
  FEEDBACK_AREA_LABELS,
  FEEDBACK_AREAS,
  FEEDBACK_TYPE_LABELS,
  FEEDBACK_TYPES,
} from "@/lib/feedback";
import { invalidateCacheByPrefix } from "@/lib/server-cache";
import { FeedbackModel } from "@/models/feedback";
import { NotificationModel } from "@/models/notification";
import { UserModel } from "@/models/user";

const createSchema = z.object({
  type: z.enum(FEEDBACK_TYPES),
  area: z.enum(FEEDBACK_AREAS).default("overall"),
  rating: z.number().int().min(1).max(5),
  message: z.string().trim().min(10, "Feedback must be at least 10 characters").max(3000),
  pageUrl: z.string().trim().max(300).optional().or(z.literal("")),
});

function serializeFeedback(row: {
  _id: { toString(): string };
  type: string;
  area: string;
  rating: number;
  message: string;
  pageUrl?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row._id.toString(),
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
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    await requireMongo();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Database unavailable" },
      { status: 503 },
    );
  }

  const rows = await FeedbackModel.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(25)
    .lean()
    .exec();

  return NextResponse.json({ feedback: rows.map(serializeFeedback) });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
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
    await requireMongo();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Database unavailable" },
      { status: 503 },
    );
  }

  const userRow = (await UserModel.findById(session.user.id)
    .select("fullName organization")
    .lean()
    .exec()) as { fullName?: string; organization?: string } | null;

  const row = await FeedbackModel.create({
    userId: session.user.id,
    userEmail: session.user.email,
    userName: userRow?.fullName ?? session.user.name ?? "",
    organization: userRow?.organization ?? "",
    type: parsed.data.type,
    area: parsed.data.area,
    rating: parsed.data.rating,
    message: parsed.data.message,
    pageUrl,
  });

  const displayName = userRow?.fullName || session.user.email;
  await NotificationModel.create({
    title: "New customer feedback",
    message: `${displayName} rated ${parsed.data.rating}/5 for ${
      FEEDBACK_AREA_LABELS[parsed.data.area]
    } (${FEEDBACK_TYPE_LABELS[parsed.data.type]}).`,
    link: "/admin/feedback",
    targetRole: "admin",
    recipientUserId: null,
    createdByUserId: session.user.id,
  });

  invalidateCacheByPrefix("admin:feedback:");
  invalidateCacheByPrefix("admin:overview:");
  invalidateCacheByPrefix("user:notifications:");

  return NextResponse.json({ id: row._id.toString(), status: row.status });
}
