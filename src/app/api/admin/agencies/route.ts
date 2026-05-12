import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  clampPageSize,
  clampSkip,
  escapeRegex,
  sanitizeSearchQuery,
} from "@/lib/admin-route-utils";
import { requireAdmin } from "@/lib/require-admin";
import { ADMIN_CACHE_HEADERS, getOrSetCache, invalidateCacheByPrefix } from "@/lib/server-cache";
import { AgencyModel } from "@/models/agency";
import { UserModel } from "@/models/user";

const patchSchema = z.object({
  agencyId: z.string().trim().min(1).max(120),
  action: z.enum(["unlinkUsers", "deleteAgency"]),
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
            { agencyId: { $regex: safeQ, $options: "i" } },
            { name: { $regex: safeQ, $options: "i" } },
            { email: { $regex: safeQ, $options: "i" } },
            { fbUserId: { $regex: safeQ, $options: "i" } },
            { appUserId: { $regex: safeQ, $options: "i" } },
          ],
        }
      : {};

  const payload = await getOrSetCache(`admin:agencies:${request.url}`, 15_000, async () => {
    const rowsAgg = await AgencyModel.aggregate<{
      rows: Array<{
        agencyId: string;
        name?: string;
        email?: string;
        fbUserId?: string | null;
        appUserId?: string | null;
        linkedUsers?: number;
      }>;
      meta: Array<{ total: number }>;
    }>([
      { $match: filter },
      { $sort: { agencyId: 1 } },
      {
        $facet: {
          rows: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: UserModel.collection.name,
                let: { agencyId: "$agencyId" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$agencyId", "$$agencyId"] } } },
                  { $count: "count" },
                ],
                as: "linkedUserAgg",
              },
            },
            {
              $addFields: {
                linkedUsers: {
                  $ifNull: [{ $arrayElemAt: ["$linkedUserAgg.count", 0] }, 0],
                },
              },
            },
            {
              $project: {
                agencyId: 1,
                name: 1,
                email: 1,
                fbUserId: 1,
                appUserId: 1,
                linkedUsers: 1,
              },
            },
          ],
          meta: [{ $count: "total" }],
        },
      },
    ]).exec();

    const bucket = rowsAgg[0] ?? { rows: [], meta: [] };
    const total = bucket.meta[0]?.total ?? 0;

    return {
      success: true,
      total,
      limit,
      skip,
      agencies: bucket.rows.map((a) => ({
        agencyId: a.agencyId,
        name: a.name ?? "",
        email: a.email ?? "",
        fbUserId: a.fbUserId ?? null,
        appUserId: a.appUserId ?? null,
        linkedUsers: a.linkedUsers ?? 0,
      })),
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
