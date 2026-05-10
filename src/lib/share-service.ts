import { randomUUID } from "node:crypto";
import { connectDb } from "@/lib/db";
import { SharedLinkModel } from "@/models/shared-link";

export type ShareRecord = {
  shareToken: string;
  campaignId: string;
  agencyId: string;
  clientEmail: string;
  clientName: string;
  expiresAt: Date;
  createdAt: Date;
};

const memoryShares = new Map<string, ShareRecord>();

function normEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function persistShareLink(record: ShareRecord) {
  const normalized: ShareRecord = {
    ...record,
    clientEmail: normEmail(record.clientEmail),
  };
  memoryShares.set(record.shareToken, normalized);
  if (!process.env.MONGODB_URI) return;
  await connectDb();
  await SharedLinkModel.create({
    token: normalized.shareToken,
    campaignId: normalized.campaignId,
    agencyId: normalized.agencyId,
    clientEmail: normalized.clientEmail,
    clientName: normalized.clientName || "",
    expiresAt: normalized.expiresAt,
    createdAt: normalized.createdAt,
  });
}

export async function getShareByToken(token: string): Promise<ShareRecord | null> {
  const mem = memoryShares.get(token);
  if (mem) return mem;
  if (!process.env.MONGODB_URI) return null;
  await connectDb();
  const doc = (await SharedLinkModel.findOne({ token }).lean().exec()) as {
    token: string;
    campaignId: string;
    agencyId: string;
    clientEmail: string;
    clientName?: string;
    expiresAt: Date;
    createdAt: Date;
  } | null;
  if (!doc) return null;
  return {
    shareToken: doc.token,
    campaignId: doc.campaignId,
    agencyId: doc.agencyId,
    clientEmail: doc.clientEmail,
    clientName: typeof doc.clientName === "string" ? doc.clientName : "",
    expiresAt: doc.expiresAt,
    createdAt: doc.createdAt,
  };
}

export function buildShareUrl(token: string) {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return `${base.replace(/\/$/, "")}/view/${token}`;
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
  if (!process.env.MONGODB_URI) {
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
  await connectDb();
  const doc = (await SharedLinkModel.findOne({
    agencyId,
    expiresAt: { $gt: new Date() },
    $expr: {
      $eq: [{ $toLower: { $trim: { input: { $ifNull: ["$clientEmail", ""] } } } }, want],
    },
  })
    .sort({ createdAt: -1 })
    .select("token")
    .lean()
    .exec()) as { token?: string } | null;
  return doc?.token ? buildShareUrl(doc.token) : null;
}

export async function deleteSharesForAgencyClientEmail(agencyId: string, clientEmail: string) {
  const want = normEmail(clientEmail);
  if (!process.env.MONGODB_URI) {
    for (const [k, v] of memoryShares) {
      if (v.agencyId === agencyId && normEmail(v.clientEmail) === want) memoryShares.delete(k);
    }
    return;
  }
  await connectDb();
  await SharedLinkModel.deleteMany({
    agencyId,
    $expr: {
      $eq: [{ $toLower: { $trim: { input: { $ifNull: ["$clientEmail", ""] } } } }, want],
    },
  }).exec();
}

export type AgencyClientEmailRow = {
  email: string;
  shareCount: number;
  lastShared: Date;
  clientName: string;
};

/** Distinct client emails this agency has created share links for. */
export async function listClientEmailsForAgency(agencyId: string): Promise<AgencyClientEmailRow[]> {
  if (process.env.MONGODB_URI) {
    await connectDb();
    const rows = (await SharedLinkModel.aggregate([
      { $match: { agencyId } },
      { $sort: { clientEmail: 1, createdAt: -1 } },
      {
        $group: {
          _id: "$clientEmail",
          shareCount: { $sum: 1 },
          lastShared: { $first: "$createdAt" },
          clientName: { $first: "$clientName" },
        },
      },
      { $sort: { _id: 1 } },
    ]).exec()) as Array<{
      _id: string;
      shareCount: number;
      lastShared: Date;
      clientName?: string;
    }>;
    return rows.map((row) => ({
      email: row._id,
      shareCount: row.shareCount,
      lastShared: row.lastShared,
      clientName: typeof row.clientName === "string" ? row.clientName : "",
    }));
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
