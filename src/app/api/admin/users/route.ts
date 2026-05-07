import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { ADMIN_CACHE_HEADERS, getOrSetCache, invalidateCacheByPrefix } from "@/lib/server-cache";
import { UserModel } from "@/models/user";

export async function GET(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10) || 50));
  const skip = Math.max(0, parseInt(searchParams.get("skip") ?? "0", 10) || 0);
  const q = searchParams.get("q")?.trim() ?? "";

  const filter =
    q.length > 0
      ? {
          $or: [
            { email: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
            { fullName: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
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

  const payload = body as {
    userId?: string;
    action?: "banUser" | "unbanUser" | "unlinkAgency" | "resetBilling" | "deleteUser";
  };
  if (!payload.userId || !payload.action) {
    return NextResponse.json(
      { success: false, error: "userId and action are required." },
      { status: 400 },
    );
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
