import { connectDb } from "@/lib/db";
import { getDecryptedTokenForAgency } from "@/lib/agency-service";
import { CampaignInsightsSnapshotModel } from "@/models/campaign-insights-snapshot";
import { fetchCampaignInsights } from "@/services/facebook";

const DEFAULT_TTL_MS = 60 * 1000;
const inFlight = new Map<string, Promise<unknown[]>>();

function ttlMs() {
  const env = Number(process.env.FACEBOOK_CAMPAIGN_INSIGHTS_TTL_MS ?? "");
  return Number.isFinite(env) && env > 0 ? env : DEFAULT_TTL_MS;
}

function key(agencyId: string, campaignId: string, datePreset: string, timeIncrement: string) {
  return `${agencyId}:${campaignId}:${datePreset}:${timeIncrement}`;
}

export function isFresh(fetchedAt: Date | string | null | undefined) {
  if (!fetchedAt) return false;
  const at = new Date(fetchedAt).valueOf();
  if (!Number.isFinite(at)) return false;
  return Date.now() - at <= ttlMs();
}

export async function getCampaignInsightsSnapshot(params: {
  agencyId: string;
  campaignId: string;
  datePreset: string;
  timeIncrement: string;
}) {
  if (!process.env.MONGODB_URI) return null;
  await connectDb();
  return CampaignInsightsSnapshotModel.findOne({
    agencyId: params.agencyId,
    campaignId: params.campaignId,
    datePreset: params.datePreset,
    timeIncrement: params.timeIncrement,
  })
    .select("payload fetchedAt")
    .lean()
    .exec();
}

export async function syncCampaignInsightsSnapshot(params: {
  agencyId: string;
  campaignId: string;
  datePreset: string;
  timeIncrement: string;
}) {
  const k = key(params.agencyId, params.campaignId, params.datePreset, params.timeIncrement);
  const pending = inFlight.get(k);
  if (pending) return pending;

  const task = (async () => {
    if (!process.env.MONGODB_URI) return [] as unknown[];
    await connectDb();
    const token = await getDecryptedTokenForAgency(params.agencyId);
    if (!token) return [] as unknown[];

    const res = await fetchCampaignInsights(token, params.campaignId, {
      datePreset: params.datePreset,
      timeIncrement: params.timeIncrement || undefined,
    });
    const payload = res.data ?? [];
    await CampaignInsightsSnapshotModel.updateOne(
      {
        agencyId: params.agencyId,
        campaignId: params.campaignId,
        datePreset: params.datePreset,
        timeIncrement: params.timeIncrement,
      },
      {
        $set: {
          agencyId: params.agencyId,
          campaignId: params.campaignId,
          datePreset: params.datePreset,
          timeIncrement: params.timeIncrement,
          payload,
          fetchedAt: new Date(),
          lastError: null,
        },
      },
      { upsert: true },
    );
    return payload;
  })()
    .catch(async (error: unknown) => {
      const message = error instanceof Error ? error.message : "Campaign insights sync failed";
      if (process.env.MONGODB_URI) {
        await connectDb();
        await CampaignInsightsSnapshotModel.updateOne(
          {
            agencyId: params.agencyId,
            campaignId: params.campaignId,
            datePreset: params.datePreset,
            timeIncrement: params.timeIncrement,
          },
          {
            $set: {
              agencyId: params.agencyId,
              campaignId: params.campaignId,
              datePreset: params.datePreset,
              timeIncrement: params.timeIncrement,
              lastError: message,
              fetchedAt: new Date(),
            },
          },
          { upsert: true },
        );
      }
      throw error;
    })
    .finally(() => {
      inFlight.delete(k);
    });

  inFlight.set(k, task);
  return task;
}
