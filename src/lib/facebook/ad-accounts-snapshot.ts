import { Prisma } from "@prisma/client";
import { hasDatabase, prisma } from "@/lib/db";
import { getDecryptedTokenForAgency } from "@/lib/agency-service";
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
  if (!hasDatabase()) return null;
  return prisma.adAccountsSnapshot.findUnique({
    where: { agencyId },
    select: { payload: true, fetchedAt: true },
  });
}

export async function syncAdAccountsSnapshot(agencyId: string, maxAccounts: number | null) {
  const key = `${agencyId}:${maxAccounts ?? "all"}`;
  const pending = inFlight.get(key);
  if (pending) return pending;

  const task = (async () => {
    if (!hasDatabase()) return [] as unknown[];
    const token = await getDecryptedTokenForAgency(agencyId);
    if (!token) return [] as unknown[];
    const data = await fetchAdAccounts(token);
    const accounts = data.data ?? [];
    const payload = maxAccounts === null ? accounts : accounts.slice(0, maxAccounts);
    const fetchedAt = new Date();
    await prisma.adAccountsSnapshot.upsert({
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
    return payload;
  })()
    .catch(async (error: unknown) => {
      const message = error instanceof Error ? error.message : "Ad accounts sync failed";
      if (hasDatabase()) {
        await prisma.adAccountsSnapshot.upsert({
          where: { agencyId },
          create: {
            agencyId,
            payload: [],
            fetchedAt: new Date(),
            lastError: message,
          },
          update: {
            lastError: message,
            fetchedAt: new Date(),
          },
        });
      }
      throw error;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, task);
  return task;
}
