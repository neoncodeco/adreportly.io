import { randomUUID } from "node:crypto";
import { hasDatabase, prisma } from "@/lib/db";
import { encryptSecret, decryptSecret } from "@/lib/encryption";
import { isValidId } from "@/lib/id";
import { normalizeActId } from "@/services/facebook";

type AgencyRow = {
  agencyId: string;
  encryptedToken: string;
  fbUserId: string;
  name?: string;
  email?: string;
};

const memoryAgenciesById = new Map<string, AgencyRow>();
const memoryByFb = new Map<string, string>();
/** In-memory link app user id → Meta agency id when database is off. */
const memoryAppUserToAgency = new Map<string, string>();
/** When database is off: disabled ad account ids (`act_*`) per agency */
const memoryDisabledAdAccountIds = new Map<string, string[]>();

export async function getAgencyIdForAppUser(appUserId: string): Promise<string | null> {
  const mem = memoryAppUserToAgency.get(appUserId);
  if (mem) return mem;
  if (!hasDatabase()) return null;
  if (!isValidId(appUserId)) return null;
  const doc = await prisma.user.findUnique({
    where: { id: appUserId },
    select: { agencyId: true },
  });
  const aid = doc?.agencyId;
  return typeof aid === "string" && aid.length > 0 ? aid : null;
}

export async function upsertAgencyFromFacebook(params: {
  accessToken: string;
  fbUserId: string;
  name?: string;
  email?: string;
  /** Logged-in app user to bind this Meta agency to (Prisma `User.id`). */
  appUserId?: string;
}): Promise<string> {
  const encryptedToken = encryptSecret(params.accessToken);

  let agencyId: string | undefined;

  if (hasDatabase()) {
    const existing = await prisma.agency.findUnique({
      where: { fbUserId: params.fbUserId },
      select: { agencyId: true },
    });
    agencyId = existing?.agencyId ?? randomUUID();
    await prisma.agency.upsert({
      where: { fbUserId: params.fbUserId },
      create: {
        agencyId,
        encryptedToken,
        fbUserId: params.fbUserId,
        name: params.name,
        email: params.email,
        appUserId: params.appUserId,
      },
      update: {
        encryptedToken,
        name: params.name,
        email: params.email,
        ...(params.appUserId ? { appUserId: params.appUserId } : {}),
      },
    });
    if (params.appUserId && isValidId(params.appUserId)) {
      await prisma.user.update({
        where: { id: params.appUserId },
        data: { agencyId },
      });
    }
  } else {
    agencyId = memoryByFb.get(params.fbUserId) ?? randomUUID();
    if (params.appUserId) memoryAppUserToAgency.set(params.appUserId, agencyId);
  }

  const row: AgencyRow = {
    agencyId,
    encryptedToken,
    fbUserId: params.fbUserId,
    name: params.name,
    email: params.email,
  };

  memoryAgenciesById.set(agencyId, row);
  memoryByFb.set(params.fbUserId, agencyId);

  return agencyId;
}

export async function getDecryptedTokenForAgency(agencyId: string): Promise<string | null> {
  let row = memoryAgenciesById.get(agencyId);
  if (!row && hasDatabase()) {
    const doc = await prisma.agency.findUnique({
      where: { agencyId },
      select: {
        agencyId: true,
        encryptedToken: true,
        fbUserId: true,
        name: true,
        email: true,
      },
    });
    if (doc) {
      row = {
        agencyId: doc.agencyId,
        encryptedToken: doc.encryptedToken,
        fbUserId: doc.fbUserId ?? "",
        name: doc.name ?? undefined,
        email: doc.email ?? undefined,
      };
    }
  }
  if (!row) return null;
  try {
    return decryptSecret(row.encryptedToken);
  } catch {
    return null;
  }
}

export async function getDisabledAdAccountIdSet(agencyId: string): Promise<Set<string>> {
  if (!hasDatabase()) {
    const raw = memoryDisabledAdAccountIds.get(agencyId) ?? [];
    return new Set(raw.map((id) => normalizeActId(id)));
  }
  const doc = await prisma.agency.findUnique({
    where: { agencyId },
    select: { disabledAdAccountIds: true },
  });
  const ids = doc?.disabledAdAccountIds ?? [];
  return new Set(ids.map((id) => normalizeActId(id)));
}

/** Clear in-memory Meta link (dev / no database). */
export function clearInMemoryMetaForUser(appUserId: string): void {
  const agencyId = memoryAppUserToAgency.get(appUserId);
  if (!agencyId) return;
  const row = memoryAgenciesById.get(agencyId);
  if (row?.fbUserId) memoryByFb.delete(row.fbUserId);
  memoryAgenciesById.delete(agencyId);
  memoryDisabledAdAccountIds.delete(agencyId);
  memoryAppUserToAgency.delete(appUserId);
}

export async function setAdAccountEnabledForAgency(
  agencyId: string,
  adAccountId: string,
  enabled: boolean,
): Promise<void> {
  const norm = normalizeActId(adAccountId);
  if (!hasDatabase()) {
    const cur = new Set(
      (memoryDisabledAdAccountIds.get(agencyId) ?? []).map((id) => normalizeActId(id)),
    );
    if (enabled) cur.delete(norm);
    else cur.add(norm);
    memoryDisabledAdAccountIds.set(agencyId, [...cur]);
    return;
  }
  const doc = await prisma.agency.findUnique({
    where: { agencyId },
    select: { disabledAdAccountIds: true },
  });
  const cur = new Set((doc?.disabledAdAccountIds ?? []).map((id) => normalizeActId(id)));
  if (enabled) cur.delete(norm);
  else cur.add(norm);
  await prisma.agency.update({
    where: { agencyId },
    data: { disabledAdAccountIds: [...cur] },
  });
}
