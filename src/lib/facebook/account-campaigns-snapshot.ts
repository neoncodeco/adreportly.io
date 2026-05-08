import { connectDb } from "@/lib/db";
import { getDecryptedTokenForAgency } from "@/lib/agency-service";
import { AccountCampaignsSnapshotModel } from "@/models/account-campaigns-snapshot";
import { fetchCampaignsForAdAccount } from "@/services/facebook";

const DEFAULT_TTL_MS = 60 * 1000;
const inFlight = new Map<string, Promise<unknown[]>>();

function ttlMs() {
  const env = Number(process.env.FACEBOOK_ACCOUNT_CAMPAIGNS_TTL_MS ?? "");
  return Number.isFinite(env) && env > 0 ? env : DEFAULT_TTL_MS;
}

export function isAccountCampaignsSnapshotFresh(fetchedAt: Date | string | null | undefined) {
  if (!fetchedAt) return false;
  const at = new Date(fetchedAt).valueOf();
  if (!Number.isFinite(at)) return false;
  return Date.now() - at <= ttlMs();
}

export async function getAccountCampaignsSnapshot(agencyId: string, accountId: string) {
  if (!process.env.MONGODB_URI) return null;
  await connectDb();
  return AccountCampaignsSnapshotModel.findOne({ agencyId, accountId })
    .select("payload fetchedAt")
    .lean()
    .exec();
}

export async function syncAccountCampaignsSnapshot(params: {
  agencyId: string;
  accountId: string;
  maxCampaigns: number | null;
}) {
  const k = `${params.agencyId}:${params.accountId}:${params.maxCampaigns ?? "all"}`;
  const pending = inFlight.get(k);
  if (pending) return pending;

  const task = (async () => {
    if (!process.env.MONGODB_URI) return [] as unknown[];
    await connectDb();
    const token = await getDecryptedTokenForAgency(params.agencyId);
    if (!token) return [] as unknown[];
    const rows = await fetchCampaignsForAdAccount(token, params.accountId);
    const visibleRows = params.maxCampaigns === null ? rows : rows.slice(0, params.maxCampaigns);
    const payload = visibleRows.map((c) => ({
      id: c.id,
      name: c.name ?? "",
      objective: c.objective ?? "",
      status: c.effective_status ?? c.status ?? "",
    }));
    await AccountCampaignsSnapshotModel.updateOne(
      { agencyId: params.agencyId, accountId: params.accountId },
      {
        $set: {
          agencyId: params.agencyId,
          accountId: params.accountId,
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
      const message = error instanceof Error ? error.message : "Account campaigns sync failed";
      if (process.env.MONGODB_URI) {
        await connectDb();
        await AccountCampaignsSnapshotModel.updateOne(
          { agencyId: params.agencyId, accountId: params.accountId },
          {
            $set: {
              agencyId: params.agencyId,
              accountId: params.accountId,
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
