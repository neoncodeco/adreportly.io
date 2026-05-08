import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { syncAgencyOverviewSnapshot } from "@/lib/facebook/overview-snapshot";
import { AgencyModel } from "@/models/agency";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

function isAuthorized(request: NextRequest) {
  const secret = process.env.INTERNAL_SYNC_SECRET;
  if (!secret) return false;
  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;
  const provided = request.headers.get("x-internal-sync-secret");
  return Boolean(provided && provided === secret);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return unauthorized();

  let body: { agencyId?: string; limit?: number } = {};
  try {
    body = (await request.json()) as { agencyId?: string; limit?: number };
  } catch {
    // Body is optional for this endpoint.
  }

  if (body.agencyId) {
    const payload = await syncAgencyOverviewSnapshot(body.agencyId);
    return NextResponse.json({ ok: true, synced: 1, agencyId: body.agencyId, payload });
  }

  await connectDb();
  const limit = Math.min(200, Math.max(1, body.limit ?? 50));
  const agencies = (await AgencyModel.find({})
    .select("agencyId")
    .limit(limit)
    .lean()
    .exec()) as Array<{ agencyId?: string }>;
  const ids = agencies.map((a) => a.agencyId).filter((id): id is string => Boolean(id));

  const BATCH = 4;
  let ok = 0;
  let failed = 0;
  for (let i = 0; i < ids.length; i += BATCH) {
    const chunk = ids.slice(i, i + BATCH);
    const results = await Promise.allSettled(chunk.map((id) => syncAgencyOverviewSnapshot(id)));
    for (const result of results) {
      if (result.status === "fulfilled") ok += 1;
      else failed += 1;
    }
  }

  return NextResponse.json({ ok: true, requested: ids.length, synced: ok, failed });
}
