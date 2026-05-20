import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { connectDb } from "@/lib/db";
import { AgencyClientModel } from "@/models/agency-client";
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

export async function countAgencyClients(agencyId: string): Promise<number> {
  if (!process.env.MONGODB_URI) {
    return memoryAgencyClients.filter((c) => c.agencyId === agencyId).length;
  }
  await connectDb();
  return AgencyClientModel.countDocuments({ agencyId, deletedAt: null });
}

/** Lifetime count — does not decrease when a client is deleted. */
export async function countAgencyClientsLifetime(agencyId: string): Promise<number> {
  if (!process.env.MONGODB_URI) {
    // In-memory storage deletes rows, so we cannot keep lifetime history here.
    // Best effort: treat active count as lifetime in dev mode.
    return memoryAgencyClients.filter((c) => c.agencyId === agencyId).length;
  }
  await connectDb();
  return AgencyClientModel.countDocuments({ agencyId });
}

export async function agencyClientExists(agencyId: string, email: string): Promise<boolean> {
  const e = normalizeEmail(email);
  if (!process.env.MONGODB_URI) {
    return memoryAgencyClients.some((c) => c.agencyId === agencyId && c.email === e);
  }
  await connectDb();
  const n = await AgencyClientModel.countDocuments({ agencyId, email: e, deletedAt: null });
  return n > 0;
}

export async function findSingleAgencyClientByEmail(
  agencyId: string,
  email: string,
): Promise<AgencyClientDoc | null> {
  const e = normalizeEmail(email);
  if (!process.env.MONGODB_URI) {
    const matches = memoryAgencyClients.filter((c) => c.agencyId === agencyId && c.email === e);
    return matches.length === 1 ? matches[0] : null;
  }
  await connectDb();
  const rows = (await AgencyClientModel.find({ agencyId, email: e, deletedAt: null })
    .limit(2)
    .lean()
    .exec()) as unknown as Array<{
    _id: unknown;
    agencyId: string;
    name: string;
    email: string;
    createdAt: Date;
    deletedAt?: Date | null;
  }>;
  if (rows.length !== 1) return null;
  const row = rows[0];
  return {
    id: String(row._id),
    agencyId: row.agencyId,
    name: row.name,
    email: row.email,
    createdAt: row.createdAt,
    deletedAt: row.deletedAt ?? null,
  };
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

  if (!process.env.MONGODB_URI) {
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
  await connectDb();
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
    await AgencyClientModel.insertMany(docs, { ordered: false });
  } catch {
    /* ignore duplicate key noise from parallel requests */
  }
}

export async function listAgencyClients(agencyId: string): Promise<AgencyClientDoc[]> {
  if (!process.env.MONGODB_URI) {
    return memoryAgencyClients
      .filter((c) => c.agencyId === agencyId)
      .slice()
      .sort((a, b) => a.email.localeCompare(b.email));
  }
  await connectDb();
  const rows = (await AgencyClientModel.find({ agencyId, deletedAt: null })
    .sort({ email: 1 })
    .lean()
    .exec()) as unknown as Array<{
    _id: unknown;
    agencyId: string;
    name: string;
    email: string;
    createdAt: Date;
    deletedAt?: Date | null;
  }>;
  return rows.map((r) => ({
    id: String(r._id),
    agencyId: r.agencyId,
    name: r.name,
    email: r.email,
    createdAt: r.createdAt,
    deletedAt: r.deletedAt ?? null,
  }));
}

let mongoIndexesSynced: Promise<void> | null = null;
async function ensureAgencyClientIndexes(force = false) {
  if (!process.env.MONGODB_URI) return;
  if (!mongoIndexesSynced || force) {
    mongoIndexesSynced = (async () => {
      await connectDb();
      try {
        // Align DB indexes with schema (drops old unique index on {agencyId,email}).
        await AgencyClientModel.syncIndexes();
        // Some deployments keep the old unique index even after syncIndexes.
        // Drop it explicitly if present.
        try {
          const idx = (await AgencyClientModel.collection.indexes()) as Array<{
            name: string;
            key: Record<string, number>;
            unique?: boolean;
          }>;
          const legacy = idx.find(
            (i) =>
              i.unique === true &&
              i.key?.agencyId === 1 &&
              i.key?.email === 1 &&
              Object.keys(i.key ?? {}).length === 2,
          );
          if (legacy?.name) {
            await AgencyClientModel.collection.dropIndex(legacy.name);
          }
        } catch {
          /* ignore */
        }
      } catch {
        // Ignore in case the DB user lacks permissions; app will still function in memory/dev.
      }
    })();
  }
  await mongoIndexesSynced;
}

export async function createAgencyClient(
  agencyId: string,
  params: { name: string; email: string },
): Promise<{ ok: true; client: AgencyClientDoc } | { ok: false; error: string; code?: string }> {
  const name = params.name.trim();
  const email = normalizeEmail(params.email);
  if (!name) return { ok: false, error: "Name is required." };
  if (!email || !email.includes("@")) return { ok: false, error: "Valid email is required." };

  if (!process.env.MONGODB_URI) {
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

  await connectDb();
  await ensureAgencyClientIndexes();
  const attemptCreate = async () => {
    const created = await AgencyClientModel.create({
      agencyId,
      name,
      email,
      deletedAt: null,
    });
    const lean = created.toObject();
    return {
      ok: true as const,
      client: {
        id: String(lean._id),
        agencyId,
        name: lean.name,
        email: lean.email,
        createdAt: lean.createdAt,
        deletedAt: lean.deletedAt ?? null,
      },
    };
  };

  try {
    return await attemptCreate();
  } catch (e: unknown) {
    const code = (e as { code?: number })?.code;
    if (code !== 11000) throw e;

    // Legacy unique index on (agencyId,email) may still exist; drop + retry once.
    await ensureAgencyClientIndexes(true);
    try {
      return await attemptCreate();
    } catch (e2: unknown) {
      const code2 = (e2 as { code?: number })?.code;
      if (code2 === 11000) {
        return {
          ok: false,
          code: "duplicate",
          error:
            "Could not create duplicate-email client because the database still enforces a legacy unique index. Please ensure the DB user has permission to drop indexes, then retry.",
        };
      }
      throw e2;
    }
  }
}

export async function deleteAgencyClient(agencyId: string, clientId: string): Promise<boolean> {
  if (process.env.MONGODB_URI && !mongoose.Types.ObjectId.isValid(clientId)) {
    return false;
  }
  if (!process.env.MONGODB_URI) {
    const i = memoryAgencyClients.findIndex((c) => c.agencyId === agencyId && c.id === clientId);
    if (i === -1) return false;
    const email = memoryAgencyClients[i].email;
    memoryAgencyClients.splice(i, 1);
    await deleteSharesForAgencyClientEmail(agencyId, email);
    return true;
  }
  await connectDb();
  // Use the underlying collection update to avoid dev-server model caching issues
  // (an older compiled Mongoose model might strip unknown fields like deletedAt).
  const now = new Date();
  const raw = await AgencyClientModel.collection.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(clientId),
      agencyId,
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    },
    { $set: { deletedAt: now } },
    { returnDocument: "before", projection: { email: 1 } },
  );
  const doc = (raw && typeof raw === "object" && "value" in raw ? raw.value : raw) ?? null;
  if (!doc) return false;
  const email =
    typeof (doc as { email?: unknown }).email === "string"
      ? ((doc as { email?: unknown }).email as string)
      : "";
  // Prefer clientId-based cleanup.
  await deleteSharesForAgencyClientId(agencyId, clientId);
  // Only delete legacy email-based shares if no other active client uses this email.
  const otherActiveWithEmail = await AgencyClientModel.countDocuments({
    agencyId,
    deletedAt: null,
    email,
    _id: { $ne: clientId },
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
  if (process.env.MONGODB_URI && !mongoose.Types.ObjectId.isValid(clientId)) return null;
  if (!process.env.MONGODB_URI) {
    return memoryAgencyClients.find((c) => c.agencyId === agencyId && c.id === clientId) ?? null;
  }
  await connectDb();
  const row = (await AgencyClientModel.findOne({
    _id: new mongoose.Types.ObjectId(clientId),
    agencyId,
    deletedAt: null,
  })
    .lean()
    .exec()) as {
    _id: unknown;
    agencyId: string;
    name: string;
    email: string;
    createdAt: Date;
    deletedAt?: Date | null;
  } | null;
  return row
    ? {
        id: String(row._id),
        agencyId: row.agencyId,
        name: row.name,
        email: row.email,
        createdAt: row.createdAt,
        deletedAt: row.deletedAt ?? null,
      }
    : null;
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
    // Only fall back to email-based links when the email is unique in the roster.
    // Otherwise, we might show another client's link.
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
