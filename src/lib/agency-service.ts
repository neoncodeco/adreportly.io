import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { connectDb } from "@/lib/db";
import { encryptSecret, decryptSecret } from "@/lib/encryption";
import { AgencyModel } from "@/models/agency";
import { UserModel } from "@/models/user";
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
/** In-memory link app user id → Meta agency id when MongoDB is off. */
const memoryAppUserToAgency = new Map<string, string>();
/** When MongoDB is off: disabled ad account ids (`act_*`) per agency */
const memoryDisabledAdAccountIds = new Map<string, string[]>();

export async function getAgencyIdForAppUser(appUserId: string): Promise<string | null> {
  const mem = memoryAppUserToAgency.get(appUserId);
  if (mem) return mem;
  if (!process.env.MONGODB_URI) return null;
  await connectDb();
  if (!mongoose.Types.ObjectId.isValid(appUserId)) return null;
  const doc = (await UserModel.findById(appUserId).select("agencyId").lean().exec()) as {
    agencyId?: string | null;
  } | null;
  const aid = doc?.agencyId;
  return typeof aid === "string" && aid.length > 0 ? aid : null;
}

export async function upsertAgencyFromFacebook(params: {
  accessToken: string;
  fbUserId: string;
  name?: string;
  email?: string;
  /** Logged-in app user to bind this Meta agency to (Mongo `User._id` string). */
  appUserId?: string;
}): Promise<string> {
  const encryptedToken = encryptSecret(params.accessToken);

  let agencyId: string | undefined;

  if (process.env.MONGODB_URI) {
    await connectDb();
    const existing = (await AgencyModel.findOne({ fbUserId: params.fbUserId }).lean().exec()) as {
      agencyId?: string;
    } | null;
    agencyId = existing?.agencyId ?? randomUUID();
    const setDoc: Record<string, unknown> = {
      agencyId,
      encryptedToken,
      fbUserId: params.fbUserId,
      name: params.name,
      email: params.email,
    };
    if (params.appUserId) setDoc.appUserId = params.appUserId;
    await AgencyModel.findOneAndUpdate(
      { fbUserId: params.fbUserId },
      { $set: setDoc },
      { upsert: true, new: true },
    );
    if (params.appUserId && mongoose.Types.ObjectId.isValid(params.appUserId)) {
      await UserModel.findByIdAndUpdate(params.appUserId, { $set: { agencyId } }).exec();
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
  if (!row && process.env.MONGODB_URI) {
    await connectDb();
    const doc = (await AgencyModel.findOne({ agencyId }).lean().exec()) as AgencyRow | null;
    if (doc) {
      row = {
        agencyId: doc.agencyId,
        encryptedToken: doc.encryptedToken,
        fbUserId: doc.fbUserId,
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
  if (!process.env.MONGODB_URI) {
    const raw = memoryDisabledAdAccountIds.get(agencyId) ?? [];
    return new Set(raw.map((id) => normalizeActId(id)));
  }
  await connectDb();
  const doc = (await AgencyModel.findOne({ agencyId })
    .select("disabledAdAccountIds")
    .lean()
    .exec()) as { disabledAdAccountIds?: string[] } | null;
  const ids = doc?.disabledAdAccountIds ?? [];
  return new Set(ids.map((id) => normalizeActId(id)));
}

/** Clear in-memory Meta link (dev / no Mongo). */
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
  if (!process.env.MONGODB_URI) {
    const cur = new Set(
      (memoryDisabledAdAccountIds.get(agencyId) ?? []).map((id) => normalizeActId(id)),
    );
    if (enabled) cur.delete(norm);
    else cur.add(norm);
    memoryDisabledAdAccountIds.set(agencyId, [...cur]);
    return;
  }
  await connectDb();
  if (enabled) {
    await AgencyModel.updateOne({ agencyId }, { $pull: { disabledAdAccountIds: norm } }).exec();
  } else {
    await AgencyModel.updateOne({ agencyId }, { $addToSet: { disabledAdAccountIds: norm } }).exec();
  }
}
