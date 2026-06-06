import { Prisma } from "@prisma/client";
import { hasDatabase, prisma } from "@/lib/db";
import { getDecryptedTokenForAgency, getDisabledAdAccountIdSet } from "@/lib/agency-service";
import { resolvePlanForUsage } from "@/lib/billing/usage";
import {
  buildOverviewPayloadFromFacebook,
  emptyOverviewPayload,
} from "@/lib/facebook/overview-payload";

const DEFAULT_TTL_MS = 60 * 1000;
const inFlight = new Map<string, Promise<Record<string, unknown>>>();

function snapshotTtlMs() {
  const env = Number(process.env.FACEBOOK_OVERVIEW_SNAPSHOT_TTL_MS ?? "");
  return Number.isFinite(env) && env > 0 ? env : DEFAULT_TTL_MS;
}

export async function getOverviewSnapshot(agencyId: string) {
  if (!hasDatabase()) return null;
  return prisma.analyticsOverviewSnapshot.findUnique({
    where: { agencyId },
    select: { payload: true, fetchedAt: true },
  });
}

export function isOverviewSnapshotFresh(fetchedAt: Date | string | null | undefined) {
  if (!fetchedAt) return false;
  const at = new Date(fetchedAt).valueOf();
  if (!Number.isFinite(at)) return false;
  return Date.now() - at <= snapshotTtlMs();
}

export async function syncAgencyOverviewSnapshot(agencyId: string) {
  const existing = inFlight.get(agencyId);
  if (existing) return existing;

  const task = (async () => {
    if (!hasDatabase()) {
      return emptyOverviewPayload(false) as Record<string, unknown>;
    }

    const token = await getDecryptedTokenForAgency(agencyId);
    const plan = await resolvePlanForUsage({ agencyId });
    const disabledAdAccountIds = await getDisabledAdAccountIdSet(agencyId);
    const payload = token
      ? await buildOverviewPayloadFromFacebook(
          token,
          {
            adAccounts: plan.limits.adAccounts,
            campaigns: plan.limits.campaigns,
          },
          { disabledAdAccountIds },
        )
      : emptyOverviewPayload(false);

    const fetchedAt = new Date();
    await prisma.analyticsOverviewSnapshot.upsert({
      where: { agencyId },
      create: {
        agencyId,
        payload: payload as Prisma.InputJsonValue,
        fetchedAt,
        lastError: null,
      },
      update: {
        payload: payload as Prisma.InputJsonValue,
        fetchedAt,
        lastError: null,
      },
    });

    return payload as Record<string, unknown>;
  })()
    .catch(async (error: unknown) => {
      const message = error instanceof Error ? error.message : "Overview sync failed";
      if (hasDatabase()) {
        await prisma.analyticsOverviewSnapshot.upsert({
          where: { agencyId },
          create: {
            agencyId,
            payload: {},
            fetchedAt: new Date(),
            lastError: message,
          },
          update: { lastError: message },
        });
      }
      throw error;
    })
    .finally(() => {
      inFlight.delete(agencyId);
    });

  inFlight.set(agencyId, task);
  return task;
}
