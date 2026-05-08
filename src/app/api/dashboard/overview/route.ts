import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { metaAccessContext } from "@/lib/agency-from-request";
import { getOrSetCache, USER_CACHE_HEADERS } from "@/lib/server-cache";
import { emptyOverviewPayload } from "@/lib/facebook/overview-payload";
import {
  getOverviewSnapshot,
  isOverviewSnapshotFresh,
  syncAgencyOverviewSnapshot,
} from "@/lib/facebook/overview-snapshot";

export async function GET(req: NextRequest) {
  const { agencyId, isAuthenticated } = await metaAccessContext(req);
  await auth();

  if (!isAuthenticated) {
    return NextResponse.json({ success: false, error: "Sign in required." }, { status: 401 });
  }

  if (!agencyId) {
    return NextResponse.json(emptyOverviewPayload(false), { headers: USER_CACHE_HEADERS });
  }

  try {
    const payload = await getOrSetCache(`user:dashboard-overview:${agencyId}`, 20_000, async () => {
      const snapshot = await getOverviewSnapshot(agencyId);
      if (snapshot?.payload && isOverviewSnapshotFresh(snapshot.fetchedAt)) {
        return snapshot.payload;
      }

      if (snapshot?.payload) {
        void syncAgencyOverviewSnapshot(agencyId).catch(() => undefined);
        return snapshot.payload;
      }
      return syncAgencyOverviewSnapshot(agencyId);
    });

    return NextResponse.json(payload, { headers: USER_CACHE_HEADERS });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Facebook API error";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
