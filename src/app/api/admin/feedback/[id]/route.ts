import { NextResponse } from "next/server";
import { z } from "zod";
import { FEEDBACK_STATUSES } from "@/lib/feedback";
import { prisma } from "@/lib/db";
import { isValidId } from "@/lib/id";
import { requireAdmin } from "@/lib/require-admin";
import { invalidateCacheByPrefix } from "@/lib/server-cache";

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
  if (!isValidId(id)) {
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

  const data: {
    status?: (typeof FEEDBACK_STATUSES)[number];
    adminNote?: string;
    reviewedAt?: Date | null;
  } = {};
  if (parsed.data.status) {
    data.status = parsed.data.status;
    data.reviewedAt = parsed.data.status === "new" ? null : new Date();
  }
  if (parsed.data.adminNote !== undefined) {
    data.adminNote = parsed.data.adminNote;
  }

  try {
    await prisma.feedback.update({ where: { id }, data });
  } catch {
    return NextResponse.json({ success: false, error: "Feedback not found." }, { status: 404 });
  }

  invalidateCacheByPrefix("admin:feedback:");
  invalidateCacheByPrefix("admin:overview:");

  return NextResponse.json({ success: true, ok: true });
}
