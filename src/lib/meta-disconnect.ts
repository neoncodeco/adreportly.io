import { connectDb } from "@/lib/db";
import { invalidateCacheByPrefix } from "@/lib/server-cache";
import { clearInMemoryMetaForUser } from "@/lib/agency-service";
import { AccountCampaignsSnapshotModel } from "@/models/account-campaigns-snapshot";
import { AdAccountsSnapshotModel } from "@/models/ad-accounts-snapshot";
import { AgencyClientModel } from "@/models/agency-client";
import { AgencyModel } from "@/models/agency";
import { AnalyticsOverviewSnapshotModel } from "@/models/analytics-overview-snapshot";
import { CampaignInsightsSnapshotModel } from "@/models/campaign-insights-snapshot";
import { SharedLinkModel } from "@/models/shared-link";
import { UserModel } from "@/models/user";

/**
 * Removes Meta OAuth link, Facebook app credentials, agency row, and agency-scoped data
 * for the given app user. Clears server caches; caller should clear `ar_agency` cookie.
 */
export async function disconnectMetaForUser(userId: string): Promise<void> {
  if (!process.env.MONGODB_URI) {
    clearInMemoryMetaForUser(userId);
    invalidateCaches(userId, null);
    return;
  }

  await connectDb();
  const user = (await UserModel.findById(userId).select("agencyId").lean().exec()) as {
    agencyId?: string | null;
  } | null;
  const agencyId =
    typeof user?.agencyId === "string" && user.agencyId.length > 0 ? user.agencyId : null;

  if (agencyId) {
    await Promise.all([
      CampaignInsightsSnapshotModel.deleteMany({ agencyId }).exec(),
      AccountCampaignsSnapshotModel.deleteMany({ agencyId }).exec(),
      AdAccountsSnapshotModel.deleteMany({ agencyId }).exec(),
      AnalyticsOverviewSnapshotModel.deleteMany({ agencyId }).exec(),
      AgencyClientModel.deleteMany({ agencyId }).exec(),
      SharedLinkModel.deleteMany({ agencyId }).exec(),
    ]);
  }

  await AgencyModel.deleteMany({
    $or: [...(agencyId ? [{ agencyId }] : []), { appUserId: userId }],
  }).exec();

  await UserModel.findByIdAndUpdate(userId, {
    $set: {
      agencyId: null,
      fbAppId: null,
      encryptedFbAppSecret: null,
    },
  }).exec();

  invalidateCaches(userId, agencyId);
}

function invalidateCaches(userId: string, agencyId: string | null) {
  invalidateCacheByPrefix(`user:fb-app:${userId}`);
  invalidateCacheByPrefix(`user:profile:${userId}`);
  invalidateCacheByPrefix("user:dashboard-overview:");
  invalidateCacheByPrefix("user:ad-accounts:");
  if (agencyId) invalidateCacheByPrefix(`user:clients:${agencyId}`);
}
