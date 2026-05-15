import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";
import { FEEDBACK_STATUSES } from "@/lib/feedback";
import { requireAdmin } from "@/lib/require-admin";
import { invalidateCacheByPrefix } from "@/lib/server-cache";
import { FeedbackModel } from "@/models/feedback";

const patchSchema = z
  .object({
    status: z.enum(FEEDBACK_STATUSES).optional(),
    adminNote: z.string().trim().max(1000).optional(),
  })
  .refine((value) => value.status || value.adminNote !== undefined, {
    message: "Nothing to update.",
  });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ success: false, error: "Invalid feedback id." }, { status: 400 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const update: Record<string, unknown> = {};
  if (parsed.data.status) {
    update.status = parsed.data.status;
    update.reviewedAt = parsed.data.status === "new" ? null : new Date();
  }
  if (parsed.data.adminNote !== undefined) {
    update.adminNote = parsed.data.adminNote;
  }

  const feedback = await FeedbackModel.findByIdAndUpdate(id, { $set: update }, { new: true })
    .lean()
    .exec();

  if (!feedback) {
    return NextResponse.json({ success: false, error: "Feedback not found." }, { status: 404 });
  }

  invalidateCacheByPrefix("admin:feedback:");
  invalidateCacheByPrefix("admin:overview:");

  return NextResponse.json({ success: true, ok: true });
}
