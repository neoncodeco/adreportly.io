"use server";

import { cookies } from "next/headers";
import { auth } from "@/auth";
import { getAgencyIdForAppUser } from "@/lib/agency-service";
import { createAgencyClient } from "@/lib/agency-client-service";
import { verifyAgencyJwt, COOKIE_NAME } from "@/lib/jwt";
import { normalizeDollarRateBdt, positiveFiniteNumber } from "@/lib/share-financial";
import { buildShareUrl, newShareToken, persistShareLink } from "@/lib/share-service";

export type CreateShareResult =
  | { ok: true; shareUrl: string; shareToken: string }
  | { ok: false; error: string };

export async function createShareLinkAction(input: {
  campaignId: string;
  clientEmail: string;
  clientName?: string;
  totalDeposit?: number | null;
  dollarRateBdt?: number | null;
  expiryDays: number;
}): Promise<CreateShareResult> {
  let agencyId: string | null = null;
  let userId: string | null = null;

  // 1. Try ar_agency cookie (set after Facebook OAuth — user may not have email/password session)
  const cookieStore = await cookies();
  const agencyCookie = cookieStore.get(COOKIE_NAME)?.value;
  if (agencyCookie) {
    const payload = await verifyAgencyJwt(agencyCookie);
    if (payload?.agencyId) agencyId = payload.agencyId;
  }

  // 2. Fallback to next-auth session
  if (!agencyId) {
    const session = await auth();
    if (!session?.user?.id) {
      return { ok: false, error: "Sign in required." };
    }
    userId = session.user.id;
    agencyId = await getAgencyIdForAppUser(session.user.id);
  }

  if (!agencyId) {
    return { ok: false, error: "Connect Meta (Facebook) first to link this account." };
  }

  // Create a roster row for this share link (allows same email for multiple clients/campaigns).
  const createdClient = await createAgencyClient(agencyId, {
    name: (input.clientName ?? "").trim() || input.clientEmail.trim(),
    email: input.clientEmail.trim(),
  });
  if (!createdClient.ok) return { ok: false, error: createdClient.error };

  const shareToken = newShareToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + input.expiryDays * 86400000);
  const totalDeposit = positiveFiniteNumber(input.totalDeposit);
  const dollarRateBdt = normalizeDollarRateBdt(input.dollarRateBdt);

  await persistShareLink({
    shareToken,
    campaignId: input.campaignId,
    agencyId,
    clientId: createdClient.client.id,
    clientEmail: input.clientEmail.trim(),
    clientName: (input.clientName ?? "").trim(),
    totalDeposit,
    dollarRateBdt,
    expiresAt,
    createdAt: now,
  });

  return { ok: true, shareUrl: buildShareUrl(shareToken), shareToken };
}
