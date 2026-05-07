import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { ADMIN_CACHE_HEADERS, getOrSetCache, invalidateCacheByPrefix } from "@/lib/server-cache";
import { AgencyModel } from "@/models/agency";
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
            { agencyId: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
            { name: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
            { email: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
            { fbUserId: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
            { appUserId: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
          ],
        }
      : {};

  const payload = await getOrSetCache(`admin:agencies:${request.url}`, 15_000, async () => {
    const [rows, total] = await Promise.all([
      AgencyModel.find(filter)
        .select("agencyId name email fbUserId appUserId")
        .sort({ agencyId: 1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      AgencyModel.countDocuments(filter),
    ]);

    const withLinkedCount = await Promise.all(
      rows.map(async (a) => {
        const linkedUsers = await UserModel.countDocuments({ agencyId: a.agencyId });
        return {
          agencyId: a.agencyId,
          name: a.name ?? "",
          email: a.email ?? "",
          fbUserId: a.fbUserId ?? null,
          appUserId: a.appUserId ?? null,
          linkedUsers,
        };
      }),
    );

    return {
      success: true,
      total,
      limit,
      skip,
      agencies: withLinkedCount,
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

  const payload = body as { agencyId?: string; action?: "unlinkUsers" | "deleteAgency" };
  if (!payload.agencyId || !payload.action) {
    return NextResponse.json(
      { success: false, error: "agencyId and action are required." },
      { status: 400 },
    );
  }

  if (payload.action === "unlinkUsers") {
    await UserModel.updateMany({ agencyId: payload.agencyId }, { $set: { agencyId: null } });
    invalidateCacheByPrefix("admin:agencies:");
    invalidateCacheByPrefix("admin:users:");
    invalidateCacheByPrefix("admin:overview:");
    return NextResponse.json({ success: true });
  }

  if (payload.action === "deleteAgency") {
    await UserModel.updateMany({ agencyId: payload.agencyId }, { $set: { agencyId: null } });
    await AgencyModel.deleteOne({ agencyId: payload.agencyId });
    invalidateCacheByPrefix("admin:agencies:");
    invalidateCacheByPrefix("admin:users:");
    invalidateCacheByPrefix("admin:overview:");
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: "Unsupported action." }, { status: 400 });
}
