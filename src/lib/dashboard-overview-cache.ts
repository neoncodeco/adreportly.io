import { getOrSetCache } from "@/lib/server-cache";
import { getDecryptedTokenForAgency, getDisabledAdAccountIdSet } from "@/lib/agency-service";
import { resolvePlanForUsage } from "@/lib/billing/usage";
import { emptyOverviewPayload } from "@/lib/facebook/overview-payload";
import { buildOverviewPayloadFromFacebook } from "@/lib/facebook/overview-payload";
import {
  getOverviewSnapshot,
  isOverviewSnapshotFresh,
  syncAgencyOverviewSnapshot,
} from "@/lib/facebook/overview-snapshot";

/** Same in-memory cache as `/api/dashboard/overview` — no duplicate Meta calls. */
export async function getCachedDashboardOverviewPayload(agencyId: string, datePreset = "last_30d") {
  return getOrSetCache(`user:dashboard-overview:${agencyId}:${datePreset}`, 20_000, async () => {
    if (datePreset !== "last_30d") {
      const token = await getDecryptedTokenForAgency(agencyId);
      if (!token) return emptyOverviewPayload(false) as Record<string, unknown>;
      const plan = await resolvePlanForUsage({ agencyId });
      const disabledAdAccountIds = await getDisabledAdAccountIdSet(agencyId);
      return buildOverviewPayloadFromFacebook(
        token,
        {
          adAccounts: plan.limits.adAccounts,
          campaigns: plan.limits.campaigns,
        },
        { disabledAdAccountIds, datePreset },
      );
    }

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
