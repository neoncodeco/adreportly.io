import { randomUUID } from "node:crypto";
import { connectDb } from "@/lib/db";
import { SharedLinkModel } from "@/models/shared-link";

export type ShareRecord = {
  shareToken: string;
  campaignId: string;
  agencyId: string;
  clientEmail: string;
  expiresAt: Date;
  createdAt: Date;
};

const memoryShares = new Map<string, ShareRecord>();

export async function persistShareLink(record: ShareRecord) {
  memoryShares.set(record.shareToken, record);
  if (!process.env.MONGODB_URI) return;
  await connectDb();
  await SharedLinkModel.create({
    token: record.shareToken,
    campaignId: record.campaignId,
    agencyId: record.agencyId,
    clientEmail: record.clientEmail,
    expiresAt: record.expiresAt,
    createdAt: record.createdAt,
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
    expiresAt: Date;
    createdAt: Date;
  } | null;
  if (!doc) return null;
  return {
    shareToken: doc.token,
    campaignId: doc.campaignId,
    agencyId: doc.agencyId,
    clientEmail: doc.clientEmail,
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
