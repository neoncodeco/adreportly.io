import { getOrSetCache } from "@/lib/server-cache";
import { emptyOverviewPayload } from "@/lib/facebook/overview-payload";
import {
  getOverviewSnapshot,
  isOverviewSnapshotFresh,
  syncAgencyOverviewSnapshot,
} from "@/lib/facebook/overview-snapshot";

/** Same in-memory cache as `/api/dashboard/overview` — no duplicate Meta calls. */
export async function getCachedDashboardOverviewPayload(agencyId: string) {
  return getOrSetCache(`user:dashboard-overview:${agencyId}`, 20_000, async () => {
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
}

export function emptyOverviewPayloadDisconnected() {
  return emptyOverviewPayload(false) as Record<string, unknown>;
}
