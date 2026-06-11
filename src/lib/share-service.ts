import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { hasDatabase, prisma } from "@/lib/db";
import { normalizeDollarRateBdt, positiveFiniteNumber } from "@/lib/share-financial";
import { getPublicSiteCallbackUrl } from "@/lib/site-url";

export type ShareRecord = {
  shareToken: string;
  campaignId: string;
  agencyId: string;
  clientId?: string | null;
  clientEmail: string;
  clientName: string;
  totalDeposit?: number | null;
  dollarRateBdt?: number | null;
  expiresAt: Date;
  createdAt: Date;
};

const memoryShares = new Map<string, ShareRecord>();

function normEmail(email: string) {
  return email.trim().toLowerCase();
}

function emailWhere(want: string): Prisma.StringFilter {
  return { equals: want, mode: "insensitive" };
}

export async function persistShareLink(record: ShareRecord) {
  const normalized: ShareRecord = {
    ...record,
    clientEmail: normEmail(record.clientEmail),
    totalDeposit: positiveFiniteNumber(record.totalDeposit),
    dollarRateBdt: normalizeDollarRateBdt(record.dollarRateBdt),
  };
  memoryShares.set(record.shareToken, normalized);
  if (!hasDatabase()) return;
  await prisma.sharedLink.create({
    data: {
      token: normalized.shareToken,
      campaignId: normalized.campaignId,
      agencyId: normalized.agencyId,
      clientId: normalized.clientId ?? null,
      clientEmail: normalized.clientEmail,
      clientName: normalized.clientName || "",
      totalDeposit: normalized.totalDeposit,
      dollarRateBdt: normalized.dollarRateBdt ?? 126,
      expiresAt: normalized.expiresAt,
      createdAt: normalized.createdAt,
    },
  });
}

export async function getShareByToken(token: string): Promise<ShareRecord | null> {
  const mem = memoryShares.get(token);
  if (mem) return mem;
  if (!hasDatabase()) return null;
  const doc = await prisma.sharedLink.findUnique({ where: { token } });
  if (!doc) return null;
  return {
    shareToken: doc.token,
    campaignId: doc.campaignId,
    agencyId: doc.agencyId,
    clientId: doc.clientId ?? null,
    clientEmail: doc.clientEmail,
    clientName: doc.clientName,
    totalDeposit: positiveFiniteNumber(doc.totalDeposit),
    dollarRateBdt: normalizeDollarRateBdt(doc.dollarRateBdt),
    expiresAt: doc.expiresAt,
    createdAt: doc.createdAt,
  };
}

export function buildShareUrl(token: string) {
  return getPublicSiteCallbackUrl(`/view/${token}`);
}

export function newShareToken() {
  return randomUUID();
}

/** Latest non-expired share URL for this agency + client email, or null. */
export async function findLatestActiveShareUrl(
  agencyId: string,
  clientEmail: string,
): Promise<string | null> {
  const want = normEmail(clientEmail);
  const now = Date.now();
  if (!hasDatabase()) {
    let best: ShareRecord | null = null;
    for (const r of memoryShares.values()) {
      if (r.agencyId !== agencyId || normEmail(r.clientEmail) !== want) continue;
      const exp = r.expiresAt instanceof Date ? r.expiresAt : new Date(r.expiresAt);
      if (exp.getTime() <= now) continue;
      const created = r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt);
      if (!best) {
        best = r;
        continue;
      }
      const bCreated = best.createdAt instanceof Date ? best.createdAt : new Date(best.createdAt);
      if (created > bCreated) best = r;
    }
    return best ? buildShareUrl(best.shareToken) : null;
  }
  const doc = await prisma.sharedLink.findFirst({
    where: {
      agencyId,
      expiresAt: { gt: new Date() },
      clientEmail: emailWhere(want),
    },
    orderBy: { createdAt: "desc" },
    select: { token: true },
  });
  return doc?.token ? buildShareUrl(doc.token) : null;
}

/** Latest non-expired share URL for this agency + roster clientId, or null. */
export async function findLatestActiveShareUrlByClientId(
  agencyId: string,
  clientId: string,
): Promise<string | null> {
  const now = Date.now();
  if (!hasDatabase()) {
    let best: ShareRecord | null = null;
    for (const r of memoryShares.values()) {
      if (r.agencyId !== agencyId || (r.clientId ?? null) !== clientId) continue;
      const exp = r.expiresAt instanceof Date ? r.expiresAt : new Date(r.expiresAt);
      if (exp.getTime() <= now) continue;
      const created = r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt);
      if (!best) {
        best = r;
        continue;
      }
      const bCreated = best.createdAt instanceof Date ? best.createdAt : new Date(best.createdAt);
      if (created > bCreated) best = r;
    }
    return best ? buildShareUrl(best.shareToken) : null;
  }
  const doc = await prisma.sharedLink.findFirst({
    where: {
      agencyId,
      clientId,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    select: { token: true },
  });
  return doc?.token ? buildShareUrl(doc.token) : null;
}

export type ClientShareFinancials = {
  totalDeposit: number | null;
  dollarRateBdt: number;
};

/** Latest non-expired share financial settings for this agency + client email, or null. */
export async function findLatestActiveShareFinancials(
  agencyId: string,
  clientEmail: string,
): Promise<ClientShareFinancials | null> {
  const want = normEmail(clientEmail);
  const now = Date.now();
  if (!hasDatabase()) {
    let best: ShareRecord | null = null;
    for (const r of memoryShares.values()) {
      if (r.agencyId !== agencyId || normEmail(r.clientEmail) !== want) continue;
      const exp = r.expiresAt instanceof Date ? r.expiresAt : new Date(r.expiresAt);
      if (exp.getTime() <= now) continue;
      const created = r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt);
      if (!best) {
        best = r;
        continue;
      }
      const bCreated = best.createdAt instanceof Date ? best.createdAt : new Date(best.createdAt);
      if (created > bCreated) best = r;
    }
    return best
      ? {
          totalDeposit: positiveFiniteNumber(best.totalDeposit),
          dollarRateBdt: normalizeDollarRateBdt(best.dollarRateBdt),
        }
      : null;
  }
  const doc = await prisma.sharedLink.findFirst({
    where: {
      agencyId,
      expiresAt: { gt: new Date() },
      clientEmail: emailWhere(want),
    },
    orderBy: { createdAt: "desc" },
    select: { totalDeposit: true, dollarRateBdt: true },
  });
  return doc
    ? {
        totalDeposit: positiveFiniteNumber(doc.totalDeposit),
        dollarRateBdt: normalizeDollarRateBdt(doc.dollarRateBdt),
      }
    : null;
}

/** Latest non-expired share financial settings for this agency + roster clientId, or null. */
export async function findLatestActiveShareFinancialsByClientId(
  agencyId: string,
  clientId: string,
): Promise<ClientShareFinancials | null> {
  const now = Date.now();
  if (!hasDatabase()) {
    let best: ShareRecord | null = null;
    for (const r of memoryShares.values()) {
      if (r.agencyId !== agencyId || (r.clientId ?? null) !== clientId) continue;
      const exp = r.expiresAt instanceof Date ? r.expiresAt : new Date(r.expiresAt);
      if (exp.getTime() <= now) continue;
      const created = r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt);
      if (!best) {
        best = r;
        continue;
      }
      const bCreated = best.createdAt instanceof Date ? best.createdAt : new Date(best.createdAt);
      if (created > bCreated) best = r;
    }
    return best
      ? {
          totalDeposit: positiveFiniteNumber(best.totalDeposit),
          dollarRateBdt: normalizeDollarRateBdt(best.dollarRateBdt),
        }
      : null;
  }
  const doc = await prisma.sharedLink.findFirst({
    where: {
      agencyId,
      clientId,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    select: { totalDeposit: true, dollarRateBdt: true },
  });
  return doc
    ? {
        totalDeposit: positiveFiniteNumber(doc.totalDeposit),
        dollarRateBdt: normalizeDollarRateBdt(doc.dollarRateBdt),
      }
    : null;
}

export async function updateActiveShareFinancialsForClient(params: {
  agencyId: string;
  clientId: string;
  clientEmail: string;
  totalDeposit: number | null;
  dollarRateBdt: number;
  allowEmailFallback: boolean;
}): Promise<number> {
  const totalDeposit = positiveFiniteNumber(params.totalDeposit);
  const dollarRateBdt = normalizeDollarRateBdt(params.dollarRateBdt);
  const now = new Date();
  if (!hasDatabase()) {
    let n = 0;
    const want = normEmail(params.clientEmail);
    for (const r of memoryShares.values()) {
      const exp = r.expiresAt instanceof Date ? r.expiresAt : new Date(r.expiresAt);
      const byId = (r.clientId ?? null) === params.clientId;
      const byEmail = params.allowEmailFallback && normEmail(r.clientEmail) === want;
      if (r.agencyId !== params.agencyId || exp <= now || (!byId && !byEmail)) continue;
      r.totalDeposit = totalDeposit;
      r.dollarRateBdt = dollarRateBdt;
      n += 1;
    }
    return n;
  }
  const orFilters: Prisma.SharedLinkWhereInput[] = [{ clientId: params.clientId }];
  if (params.allowEmailFallback) {
    orFilters.push({ clientEmail: emailWhere(normEmail(params.clientEmail)) });
  }
  const result = await prisma.sharedLink.updateMany({
    where: {
      agencyId: params.agencyId,
      expiresAt: { gt: now },
      OR: orFilters,
    },
    data: { totalDeposit, dollarRateBdt },
  });
  return result.count;
}

export async function deleteSharesForAgencyClientEmail(agencyId: string, clientEmail: string) {
  const want = normEmail(clientEmail);
  if (!hasDatabase()) {
    for (const [k, v] of memoryShares) {
      if (v.agencyId === agencyId && normEmail(v.clientEmail) === want) memoryShares.delete(k);
    }
    return;
  }
  await prisma.sharedLink.deleteMany({
    where: {
      agencyId,
      clientEmail: emailWhere(want),
    },
  });
}

export async function deleteSharesForAgencyClientId(agencyId: string, clientId: string) {
  if (!hasDatabase()) {
    for (const [k, v] of memoryShares) {
      if (v.agencyId === agencyId && (v.clientId ?? null) === clientId) memoryShares.delete(k);
    }
    return;
  }
  await prisma.sharedLink.deleteMany({ where: { agencyId, clientId } });
}

export type AgencyClientEmailRow = {
  email: string;
  shareCount: number;
  lastShared: Date;
  clientName: string;
};

/** Distinct client emails this agency has created share links for. */
export async function listClientEmailsForAgency(agencyId: string): Promise<AgencyClientEmailRow[]> {
  if (hasDatabase()) {
    const rows = await prisma.sharedLink.findMany({
      where: { agencyId },
      select: { clientEmail: true, clientName: true, createdAt: true },
      orderBy: [{ clientEmail: "asc" }, { createdAt: "desc" }],
    });
    const byEmail = new Map<string, { shareCount: number; lastShared: Date; clientName: string }>();
    for (const row of rows) {
      const key = normEmail(row.clientEmail);
      const nm = (row.clientName || "").trim();
      const prev = byEmail.get(key);
      if (!prev) {
        byEmail.set(key, { shareCount: 1, lastShared: row.createdAt, clientName: nm });
      } else {
        prev.shareCount += 1;
        if (row.createdAt > prev.lastShared) {
          prev.lastShared = row.createdAt;
          if (nm) prev.clientName = nm;
        }
      }
    }
    return [...byEmail.entries()]
      .map(([email, v]) => ({ email, ...v }))
      .sort((a, b) => a.email.localeCompare(b.email));
  }

  const fromMem = new Map<string, { shareCount: number; lastShared: Date; clientName: string }>();
  for (const r of memoryShares.values()) {
    if (r.agencyId !== agencyId) continue;
    const key = normEmail(r.clientEmail);
    const prev = fromMem.get(key);
    const created = r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt);
    const nm = (r.clientName || "").trim();
    if (!prev) {
      fromMem.set(key, { shareCount: 1, lastShared: created, clientName: nm });
    } else {
      prev.shareCount += 1;
      if (created > prev.lastShared) {
        prev.lastShared = created;
        if (nm) prev.clientName = nm;
      }
    }
  }
  return [...fromMem.entries()]
    .map(([email, v]) => ({ email, ...v }))
    .sort((a, b) => a.email.localeCompare(b.email));
}
