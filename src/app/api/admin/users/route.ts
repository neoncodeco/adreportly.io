import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import {
  clampPageSize,
  clampSkip,
  escapeRegex,
  sanitizeSearchQuery,
} from "@/lib/admin-route-utils";
import { requireAdmin } from "@/lib/require-admin";
import { ADMIN_CACHE_HEADERS, getOrSetCache, invalidateCacheByPrefix } from "@/lib/server-cache";
import { UserModel } from "@/models/user";

const patchSchema = z.object({
  userId: z.string().trim().min(1).max(100),
  action: z.enum(["banUser", "unbanUser", "unlinkAgency", "resetBilling", "deleteUser"]),
});

export async function GET(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const limit = clampPageSize(searchParams.get("limit"), 50, 100);
  const skip = clampSkip(searchParams.get("skip"));
  const q = sanitizeSearchQuery(searchParams.get("q"));
  const safeQ = escapeRegex(q);

  const filter =
    q.length > 0
      ? {
          $or: [
            { email: { $regex: safeQ, $options: "i" } },
            { fullName: { $regex: safeQ, $options: "i" } },
          ],
        }
      : {};

  const payload = await getOrSetCache(`admin:users:${request.url}`, 15_000, async () => {
    const [rows, total] = await Promise.all([
      UserModel.find(filter)
        .select(
          "email fullName organization role agencyId billingPlanId billingStatus isBanned bannedAt createdAt",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      UserModel.countDocuments(filter),
    ]);

    return {
      success: true,
      total,
      users: rows.map((u) => {
        const id = (u as { _id: { toString(): string } })._id.toString();
        const createdAt = (u as { createdAt?: Date }).createdAt;
        return {
          id,
          email: u.email,
          fullName: u.fullName ?? "",
          organization: u.organization ?? "",
          role: u.role === "admin" ? "admin" : "user",
          metaLinked: Boolean(u.agencyId),
          agencyId: u.agencyId ?? null,
          billingPlanId: u.billingPlanId ?? "free",
          billingStatus: u.billingStatus ?? "inactive",
          isBanned: Boolean(u.isBanned),
          bannedAt:
            (u as { bannedAt?: Date | null }).bannedAt instanceof Date
              ? ((u as { bannedAt?: Date }).bannedAt?.toISOString() ?? null)
              : null,
          createdAt: createdAt instanceof Date ? createdAt.toISOString() : null,
        };
      }),
      limit,
      skip,
    };
  });

  return NextResponse.json(payload, { headers: ADMIN_CACHE_HEADERS });
}

export async function PATCH(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid input.", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const payload = parsed.data;

  if (!mongoose.isValidObjectId(payload.userId)) {
    return NextResponse.json({ success: false, error: "Invalid user id." }, { status: 400 });
  }

  if (
    (payload.action === "deleteUser" || payload.action === "banUser") &&
    payload.userId === gate.userId
  ) {
    return NextResponse.json(
      { success: false, error: "You cannot apply this action on your own account." },
      { status: 400 },
    );
  }

  const targetUser = await UserModel.findById(payload.userId).select("role isBanned").lean().exec();
  if (!targetUser) {
    return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
  }

  if (payload.action === "banUser") {
    await UserModel.updateOne(
      { _id: payload.userId },
      { $set: { isBanned: true, bannedAt: new Date(), role: "user" } },
    );
  } else if (payload.action === "unbanUser") {
    await UserModel.updateOne(
      { _id: payload.userId },
      { $set: { isBanned: false, bannedAt: null } },
    );
  } else if (payload.action === "unlinkAgency") {
    await UserModel.updateOne({ _id: payload.userId }, { $set: { agencyId: null } });
  } else if (payload.action === "resetBilling") {
    await UserModel.updateOne(
      { _id: payload.userId },
      {
        $set: {
          billingPlanId: "free",
          billingStatus: "inactive",
          billingCurrentPeriodEnd: null,
        },
        $unset: {
          billingCycle: 1,
          billingScheduledPlanId: 1,
          billingScheduledCycle: 1,
          billingScheduledChangeAt: 1,
        },
      },
    );
  } else if (payload.action === "deleteUser") {
    await UserModel.deleteOne({ _id: payload.userId });
  } else {
    return NextResponse.json({ success: false, error: "Unsupported action." }, { status: 400 });
  }

  invalidateCacheByPrefix("admin:users:");
  invalidateCacheByPrefix("admin:agencies:");
  invalidateCacheByPrefix("admin:overview:");
  return NextResponse.json({ success: true });
}
