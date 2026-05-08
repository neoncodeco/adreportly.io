import { connectDb } from "@/lib/db";
import { getDecryptedTokenForAgency } from "@/lib/agency-service";
import { AdAccountsSnapshotModel } from "@/models/ad-accounts-snapshot";
import { fetchAdAccounts } from "@/services/facebook";

const DEFAULT_TTL_MS = 60 * 1000;
const inFlight = new Map<string, Promise<unknown[]>>();

function ttlMs() {
  const env = Number(process.env.FACEBOOK_AD_ACCOUNTS_TTL_MS ?? "");
  return Number.isFinite(env) && env > 0 ? env : DEFAULT_TTL_MS;
}

export function isAdAccountsSnapshotFresh(fetchedAt: Date | string | null | undefined) {
  if (!fetchedAt) return false;
  const at = new Date(fetchedAt).valueOf();
  if (!Number.isFinite(at)) return false;
  return Date.now() - at <= ttlMs();
}

export async function getAdAccountsSnapshot(agencyId: string) {
  if (!process.env.MONGODB_URI) return null;
  await connectDb();
  return AdAccountsSnapshotModel.findOne({ agencyId }).select("payload fetchedAt").lean().exec();
}

export async function syncAdAccountsSnapshot(agencyId: string, maxAccounts: number | null) {
  const key = `${agencyId}:${maxAccounts ?? "all"}`;
  const pending = inFlight.get(key);
  if (pending) return pending;

  const task = (async () => {
    if (!process.env.MONGODB_URI) return [] as unknown[];
    await connectDb();
    const token = await getDecryptedTokenForAgency(agencyId);
    if (!token) return [] as unknown[];
    const data = await fetchAdAccounts(token);
    const accounts = data.data ?? [];
    const payload = maxAccounts === null ? accounts : accounts.slice(0, maxAccounts);
    await AdAccountsSnapshotModel.updateOne(
      { agencyId },
      { $set: { agencyId, payload, fetchedAt: new Date(), lastError: null } },
      { upsert: true },
    );
    return payload;
  })()
    .catch(async (error: unknown) => {
      const message = error instanceof Error ? error.message : "Ad accounts sync failed";
      if (process.env.MONGODB_URI) {
        await connectDb();
        await AdAccountsSnapshotModel.updateOne(
          { agencyId },
          { $set: { agencyId, lastError: message, fetchedAt: new Date() } },
          { upsert: true },
        );
      }
      throw error;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, task);
  return task;
}
