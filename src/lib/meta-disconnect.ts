import { hasDatabase, prisma } from "@/lib/db";
import { invalidateCacheByPrefix } from "@/lib/server-cache";
import { clearInMemoryMetaForUser } from "@/lib/agency-service";

/**
 * Removes Meta OAuth link, Facebook app credentials, agency row, and agency-scoped data
 * for the given app user. Clears server caches; caller should clear `ar_agency` cookie.
 */
export async function disconnectMetaForUser(userId: string): Promise<void> {
  if (!hasDatabase()) {
    clearInMemoryMetaForUser(userId);
    invalidateCaches(userId, null);
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { agencyId: true },
  });
  const agencyId =
    typeof user?.agencyId === "string" && user.agencyId.length > 0 ? user.agencyId : null;

  if (agencyId) {
    await Promise.all([
      prisma.campaignInsightsSnapshot.deleteMany({ where: { agencyId } }),
      prisma.accountCampaignsSnapshot.deleteMany({ where: { agencyId } }),
      prisma.adAccountsSnapshot.deleteMany({ where: { agencyId } }),
      prisma.analyticsOverviewSnapshot.deleteMany({ where: { agencyId } }),
      prisma.agencyClient.deleteMany({ where: { agencyId } }),
      prisma.sharedLink.deleteMany({ where: { agencyId } }),
    ]);
  }

  await prisma.agency.deleteMany({
    where: {
      OR: [...(agencyId ? [{ agencyId }] : []), { appUserId: userId }],
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      agencyId: null,
      fbAppId: null,
      encryptedFbAppSecret: null,
    },
  });

  invalidateCaches(userId, agencyId);
}

function invalidateCaches(userId: string, agencyId: string | null) {
  invalidateCacheByPrefix(`user:fb-app:${userId}`);
  invalidateCacheByPrefix(`user:profile:${userId}`);
  invalidateCacheByPrefix("user:dashboard-overview:");
  invalidateCacheByPrefix("user:ad-accounts:");
  if (agencyId) invalidateCacheByPrefix(`user:clients:${agencyId}`);
}
