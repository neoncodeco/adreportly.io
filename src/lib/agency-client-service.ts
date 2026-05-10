import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { connectDb } from "@/lib/db";
import { AgencyClientModel } from "@/models/agency-client";
import {
  deleteSharesForAgencyClientEmail,
  findLatestActiveShareUrl,
  listClientEmailsForAgency,
} from "@/lib/share-service";

export type AgencyClientDoc = {
  id: string;
  agencyId: string;
  name: string;
  email: string;
  createdAt: Date;
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
  return AgencyClientModel.countDocuments({ agencyId });
}

export async function agencyClientExists(agencyId: string, email: string): Promise<boolean> {
  const e = normalizeEmail(email);
  if (!process.env.MONGODB_URI) {
    return memoryAgencyClients.some((c) => c.agencyId === agencyId && c.email === e);
  }
  await connectDb();
  const n = await AgencyClientModel.countDocuments({ agencyId, email: e });
  return n > 0;
}

/**
 * One-time migration: if an agency has share links but no roster rows yet, copy distinct
 * recipients into AgencyClient (capped by plan limit).
 */
export async function backfillAgencyClientsFromSharesIfEmpty(
  agencyId: string,
  maxClients: number | null,
) {
  const existing = await countAgencyClients(agencyId);
  if (existing > 0) return;

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
  const rows = (await AgencyClientModel.find({ agencyId })
    .sort({ email: 1 })
    .lean()
    .exec()) as unknown as Array<{
    _id: unknown;
    agencyId: string;
    name: string;
    email: string;
    createdAt: Date;
  }>;
  return rows.map((r) => ({
    id: String(r._id),
    agencyId: r.agencyId,
    name: r.name,
    email: r.email,
    createdAt: r.createdAt,
  }));
}

export async function createAgencyClient(
  agencyId: string,
  params: { name: string; email: string },
): Promise<{ ok: true; client: AgencyClientDoc } | { ok: false; error: string; code?: string }> {
  const name = params.name.trim();
  const email = normalizeEmail(params.email);
  if (!name) return { ok: false, error: "Name is required." };
  if (!email || !email.includes("@")) return { ok: false, error: "Valid email is required." };

  if (await agencyClientExists(agencyId, email)) {
    return { ok: false, error: "A client with this email already exists.", code: "duplicate" };
  }

  if (!process.env.MONGODB_URI) {
    const doc: AgencyClientDoc = {
      id: randomUUID(),
      agencyId,
      name,
      email,
      createdAt: new Date(),
    };
    memoryAgencyClients.push(doc);
    return { ok: true, client: doc };
  }

  await connectDb();
  try {
    const created = await AgencyClientModel.create({
      agencyId,
      name,
      email,
    });
    const lean = created.toObject();
    return {
      ok: true,
      client: {
        id: String(lean._id),
        agencyId,
        name: lean.name,
        email: lean.email,
        createdAt: lean.createdAt,
      },
    };
  } catch (e: unknown) {
    const code = (e as { code?: number })?.code;
    if (code === 11000) {
      return { ok: false, error: "A client with this email already exists.", code: "duplicate" };
    }
    throw e;
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
  const docRaw = await AgencyClientModel.findOneAndDelete({
    _id: clientId,
    agencyId,
  }).lean();
  const doc = Array.isArray(docRaw) ? docRaw[0] : docRaw;
  if (!doc || typeof doc !== "object" || !("email" in doc)) return false;
  const email = typeof doc.email === "string" ? doc.email : "";
  await deleteSharesForAgencyClientEmail(agencyId, email);
  return true;
}

export async function listAgencyClientsWithShareUrls(agencyId: string): Promise<
  Array<
    AgencyClientDoc & {
      latestShareUrl: string | null;
    }
  >
> {
  const clients = await listAgencyClients(agencyId);
  const out: Array<AgencyClientDoc & { latestShareUrl: string | null }> = [];
  for (const c of clients) {
    const latestShareUrl = await findLatestActiveShareUrl(agencyId, c.email);
    out.push({ ...c, latestShareUrl });
  }
  return out;
}
