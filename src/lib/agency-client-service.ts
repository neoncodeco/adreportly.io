import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { hasDatabase, prisma } from "@/lib/db";
import { isValidId } from "@/lib/id";
import {
  deleteSharesForAgencyClientEmail,
  deleteSharesForAgencyClientId,
  findLatestActiveShareFinancials,
  findLatestActiveShareFinancialsByClientId,
  findLatestActiveShareUrl,
  findLatestActiveShareUrlByClientId,
  listClientEmailsForAgency,
  updateActiveShareFinancialsForClient,
} from "@/lib/share-service";

export type AgencyClientDoc = {
  id: string;
  agencyId: string;
  name: string;
  email: string;
  createdAt: Date;
  deletedAt?: Date | null;
};

export type AgencyClientShareSettings = {
  totalDeposit: number | null;
  dollarRateBdt: number | null;
};

type MemAgencyClient = AgencyClientDoc;

const memoryAgencyClients: MemAgencyClient[] = [];

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function toAgencyClientDoc(row: {
  id: string;
  agencyId: string;
  name: string;
  email: string;
  createdAt: Date;
  deletedAt: Date | null;
}): AgencyClientDoc {
  return {
    id: row.id,
    agencyId: row.agencyId,
    name: row.name,
    email: row.email,
    createdAt: row.createdAt,
    deletedAt: row.deletedAt ?? null,
  };
}

export async function countAgencyClients(agencyId: string): Promise<number> {
  if (!hasDatabase()) {
    return memoryAgencyClients.filter((c) => c.agencyId === agencyId).length;
  }
  return prisma.agencyClient.count({ where: { agencyId, deletedAt: null } });
}

/** Lifetime count — does not decrease when a client is deleted. */
export async function countAgencyClientsLifetime(agencyId: string): Promise<number> {
  if (!hasDatabase()) {
    // In-memory storage deletes rows, so we cannot keep lifetime history here.
    // Best effort: treat active count as lifetime in dev mode.
    return memoryAgencyClients.filter((c) => c.agencyId === agencyId).length;
  }
  return prisma.agencyClient.count({ where: { agencyId } });
}

export async function agencyClientExists(agencyId: string, email: string): Promise<boolean> {
  const e = normalizeEmail(email);
  if (!hasDatabase()) {
    return memoryAgencyClients.some((c) => c.agencyId === agencyId && c.email === e);
  }
  const n = await prisma.agencyClient.count({
    where: { agencyId, email: { equals: e, mode: "insensitive" }, deletedAt: null },
  });
  return n > 0;
}

export async function findSingleAgencyClientByEmail(
  agencyId: string,
  email: string,
): Promise<AgencyClientDoc | null> {
  const e = normalizeEmail(email);
  if (!hasDatabase()) {
    const matches = memoryAgencyClients.filter((c) => c.agencyId === agencyId && c.email === e);
    return matches.length === 1 ? matches[0] : null;
  }
  const rows = await prisma.agencyClient.findMany({
    where: { agencyId, email: { equals: e, mode: "insensitive" }, deletedAt: null },
    take: 2,
  });
  if (rows.length !== 1) return null;
  return toAgencyClientDoc(rows[0]);
}

/**
 * One-time migration: if an agency has share links but no roster rows yet, copy distinct
 * recipients into AgencyClient (capped by plan limit).
 */
export async function backfillAgencyClientsFromSharesIfEmpty(
  agencyId: string,
  maxClients: number | null,
) {
  const historicalExisting = await countAgencyClientsLifetime(agencyId);
  if (historicalExisting > 0) return;

  const rows = await listClientEmailsForAgency(agencyId);
  const slice = maxClients === null ? rows : rows.slice(0, maxClients);

  if (!hasDatabase()) {
    const now = new Date();
    for (const r of slice) {
      const email = normalizeEmail(r.email);
      const name =
        r.clientName?.trim() ||
        email
          .split("@")[0]
          ?.replace(/[._]/g, " ")
          .split(" ")
          .filter(Boolean)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" ") ||
        email;
      memoryAgencyClients.push({
        id: randomUUID(),
        agencyId,
        name,
        email,
        createdAt: now,
      });
    }
    return;
  }

  if (slice.length === 0) return;
  const docs = slice.map((r) => {
    const email = normalizeEmail(r.email);
    const name =
      r.clientName?.trim() ||
      email
        .split("@")[0]
        ?.replace(/[._]/g, " ")
        .split(" ")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ") ||
      email;
    return { agencyId, email, name, createdAt: r.lastShared };
  });
  try {
    await prisma.agencyClient.createMany({ data: docs, skipDuplicates: true });
  } catch {
    /* ignore duplicate key noise from parallel requests */
  }
}

export async function listAgencyClients(agencyId: string): Promise<AgencyClientDoc[]> {
  if (!hasDatabase()) {
    return memoryAgencyClients
      .filter((c) => c.agencyId === agencyId)
      .slice()
      .sort((a, b) => a.email.localeCompare(b.email));
  }
  const rows = await prisma.agencyClient.findMany({
    where: { agencyId, deletedAt: null },
    orderBy: { email: "asc" },
  });
  return rows.map(toAgencyClientDoc);
}

export async function createAgencyClient(
  agencyId: string,
  params: { name: string; email: string },
): Promise<{ ok: true; client: AgencyClientDoc } | { ok: false; error: string; code?: string }> {
  const name = params.name.trim();
  const email = normalizeEmail(params.email);
  if (!name) return { ok: false, error: "Name is required." };
  if (!email || !email.includes("@")) return { ok: false, error: "Valid email is required." };

  if (!hasDatabase()) {
    const doc: AgencyClientDoc = {
      id: randomUUID(),
      agencyId,
      name,
      email,
      createdAt: new Date(),
      deletedAt: null,
    };
    memoryAgencyClients.push(doc);
    return { ok: true, client: doc };
  }

  try {
    const created = await prisma.agencyClient.create({
      data: { agencyId, name, email, deletedAt: null },
    });
    return { ok: true, client: toAgencyClientDoc(created) };
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return {
        ok: false,
        code: "duplicate",
        error: "A client with this email already exists for this agency.",
      };
    }
    throw e;
  }
}

export async function deleteAgencyClient(agencyId: string, clientId: string): Promise<boolean> {
  if (hasDatabase() && !isValidId(clientId)) {
    return false;
  }
  if (!hasDatabase()) {
    const i = memoryAgencyClients.findIndex((c) => c.agencyId === agencyId && c.id === clientId);
    if (i === -1) return false;
    const email = memoryAgencyClients[i].email;
    memoryAgencyClients.splice(i, 1);
    await deleteSharesForAgencyClientEmail(agencyId, email);
    return true;
  }
  const existing = await prisma.agencyClient.findFirst({
    where: { id: clientId, agencyId, deletedAt: null },
    select: { email: true },
  });
  if (!existing) return false;
  const now = new Date();
  await prisma.agencyClient.update({
    where: { id: clientId },
    data: { deletedAt: now },
  });
  const email = existing.email;
  await deleteSharesForAgencyClientId(agencyId, clientId);
  const otherActiveWithEmail = await prisma.agencyClient.count({
    where: {
      agencyId,
      deletedAt: null,
      email: { equals: email, mode: "insensitive" },
      NOT: { id: clientId },
    },
  });
  if (otherActiveWithEmail === 0 && email) {
    await deleteSharesForAgencyClientEmail(agencyId, email);
  }
  return true;
}

export async function getAgencyClientById(
  agencyId: string,
  clientId: string,
): Promise<AgencyClientDoc | null> {
  if (hasDatabase() && !isValidId(clientId)) return null;
  if (!hasDatabase()) {
    return memoryAgencyClients.find((c) => c.agencyId === agencyId && c.id === clientId) ?? null;
  }
  const row = await prisma.agencyClient.findFirst({
    where: { id: clientId, agencyId, deletedAt: null },
  });
  return row ? toAgencyClientDoc(row) : null;
}

export async function updateAgencyClientShareSettings(
  agencyId: string,
  clientId: string,
  settings: { totalDeposit: number | null; dollarRateBdt: number },
): Promise<{ ok: true; updatedCount: number } | { ok: false; error: string }> {
  const client = await getAgencyClientById(agencyId, clientId);
  if (!client) return { ok: false, error: "Client not found." };

  const clients = await listAgencyClients(agencyId);
  const allowEmailFallback = clients.filter((c) => c.email === client.email).length <= 1;
  const updatedCount = await updateActiveShareFinancialsForClient({
    agencyId,
    clientId,
    clientEmail: client.email,
    totalDeposit: settings.totalDeposit,
    dollarRateBdt: settings.dollarRateBdt,
    allowEmailFallback,
  });
  return { ok: true, updatedCount };
}

export async function listAgencyClientsWithShareUrls(agencyId: string): Promise<
  Array<
    AgencyClientDoc & {
      latestShareUrl: string | null;
      shareSettings: AgencyClientShareSettings;
    }
  >
> {
  const clients = await listAgencyClients(agencyId);
  const emailCounts = new Map<string, number>();
  for (const c of clients) {
    emailCounts.set(c.email, (emailCounts.get(c.email) ?? 0) + 1);
  }
  const out: Array<
    AgencyClientDoc & { latestShareUrl: string | null; shareSettings: AgencyClientShareSettings }
  > = [];
  for (const c of clients) {
    const byClientId = await findLatestActiveShareUrlByClientId(agencyId, c.id);
    const allowEmailFallback = (emailCounts.get(c.email) ?? 0) <= 1;
    const latestShareUrl =
      byClientId ?? (allowEmailFallback ? await findLatestActiveShareUrl(agencyId, c.email) : null);
    const byClientIdFinancials = await findLatestActiveShareFinancialsByClientId(agencyId, c.id);
    const shareSettings =
      byClientIdFinancials ??
      (allowEmailFallback ? await findLatestActiveShareFinancials(agencyId, c.email) : null);
    out.push({
      ...c,
      latestShareUrl,
      shareSettings: {
        totalDeposit: shareSettings?.totalDeposit ?? null,
        dollarRateBdt: shareSettings?.dollarRateBdt ?? null,
      },
    });
  }
  return out;
}
