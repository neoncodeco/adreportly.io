import { NextResponse } from "next/server";
import { z } from "zod";
import { requireMongo } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { NotificationModel } from "@/models/notification";

const bodySchema = z.object({
  title: z.string().trim().min(2).max(120),
  message: z.string().trim().min(2).max(1000),
  link: z.string().trim().max(300).optional().or(z.literal("")),
  targetRole: z.enum(["all", "user", "admin"]).optional(),
  recipientUserId: z.string().trim().max(100).optional().or(z.literal("")),
});

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    await requireMongo();
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Database unavailable" },
      { status: 503 },
    );
  }

  const payload = parsed.data;
  const recipientUserId =
    payload.recipientUserId && payload.recipientUserId.length > 0 ? payload.recipientUserId : null;

  const row = await NotificationModel.create({
    title: payload.title,
    message: payload.message,
    link: payload.link && payload.link.length > 0 ? payload.link : null,
    targetRole: recipientUserId ? "all" : (payload.targetRole ?? "all"),
    recipientUserId,
    createdByUserId: guard.userId,
  });

  return NextResponse.json({ success: true, id: row._id.toString() });
}
