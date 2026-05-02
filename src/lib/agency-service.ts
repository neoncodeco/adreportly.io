import { randomUUID } from "node:crypto";
import { connectDb } from "@/lib/db";
import { encryptSecret, decryptSecret } from "@/lib/encryption";
import { AgencyModel } from "@/models/agency";

type AgencyRow = {
  agencyId: string;
  encryptedToken: string;
  fbUserId: string;
  name?: string;
  email?: string;
};

const memoryAgenciesById = new Map<string, AgencyRow>();
const memoryByFb = new Map<string, string>();

export async function upsertAgencyFromFacebook(params: {
  accessToken: string;
  fbUserId: string;
  name?: string;
  email?: string;
}): Promise<string> {
  const encryptedToken = encryptSecret(params.accessToken);

  let agencyId: string | undefined;

  if (process.env.MONGODB_URI) {
    await connectDb();
    const existing = (await AgencyModel.findOne({ fbUserId: params.fbUserId }).lean().exec()) as {
      agencyId?: string;
    } | null;
    agencyId = existing?.agencyId ?? randomUUID();
    await AgencyModel.findOneAndUpdate(
      { fbUserId: params.fbUserId },
      {
        $set: {
          agencyId,
          encryptedToken,
          fbUserId: params.fbUserId,
          name: params.name,
          email: params.email,
        },
      },
      { upsert: true, new: true },
    );
  } else {
    agencyId = memoryByFb.get(params.fbUserId) ?? randomUUID();
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
