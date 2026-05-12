import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { invalidateCacheByPrefix } from "@/lib/server-cache";
import { requireMongo } from "@/lib/db";
import { CouponModel } from "@/models/coupon";

const patchSchema = z.object({
  active: z.boolean().optional(),
  percentOff: z.coerce.number().int().min(1).max(100).optional(),
  maxRedemptions: z.union([z.coerce.number().int().min(1), z.null()]).optional(),
  expiresAt: z.union([z.string().min(4).max(40), z.null()]).optional(),
});

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ success: false, error: "Invalid id." }, { status: 400 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid input", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const $set: Record<string, unknown> = {};
  if (parsed.data.active !== undefined) $set.active = parsed.data.active;
  if (parsed.data.percentOff !== undefined) $set.percentOff = parsed.data.percentOff;
  if (parsed.data.maxRedemptions !== undefined) {
    $set.maxRedemptions = parsed.data.maxRedemptions === null ? null : parsed.data.maxRedemptions;
  }
  if (parsed.data.expiresAt !== undefined) {
    if (parsed.data.expiresAt === null) {
      $set.expiresAt = null;
    } else {
      const raw = parsed.data.expiresAt.trim();
      const d = new Date(raw.length <= 10 ? `${raw}T23:59:59.999Z` : raw);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ success: false, error: "Invalid expiresAt." }, { status: 400 });
      }
      $set.expiresAt = d;
    }
  }

  if (Object.keys($set).length === 0) {
    return NextResponse.json({ success: false, error: "No fields to update." }, { status: 400 });
  }

  try {
    await requireMongo();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable";
    return NextResponse.json({ success: false, error: msg }, { status: 503 });
  }

  const updated = await CouponModel.findByIdAndUpdate(id, { $set }, { new: true }).lean().exec();
  if (!updated) {
    return NextResponse.json({ success: false, error: "Coupon not found." }, { status: 404 });
  }

  invalidateCacheByPrefix("admin:coupons:");

  return NextResponse.json({
    success: true,
    coupon: {
      id: updated._id.toString(),
      code: updated.code,
      percentOff: updated.percentOff,
      active: updated.active,
      maxRedemptions: updated.maxRedemptions ?? null,
      redemptionCount: updated.redemptionCount,
      expiresAt: updated.expiresAt ? updated.expiresAt.toISOString() : null,
    },
  });
}
