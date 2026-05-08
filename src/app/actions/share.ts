"use server";

import { cookies } from "next/headers";
import { auth } from "@/auth";
import { getAgencyIdForAppUser } from "@/lib/agency-service";
import { resolvePlanForUsage } from "@/lib/billing/usage";
import { verifyAgencyJwt, COOKIE_NAME } from "@/lib/jwt";
import {
  buildShareUrl,
  listClientEmailsForAgency,
  newShareToken,
  persistShareLink,
} from "@/lib/share-service";

export type CreateShareResult =
  | { ok: true; shareUrl: string; shareToken: string }
  | { ok: false; error: string };

export async function createShareLinkAction(input: {
  campaignId: string;
  clientEmail: string;
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

  const plan = await resolvePlanForUsage({ userId, agencyId });
  const maxClients = plan.limits.clients;
  if (maxClients !== null) {
    const rows = await listClientEmailsForAgency(agencyId);
    const email = input.clientEmail.trim().toLowerCase();
    const hasEmail = rows.some((r) => r.email.trim().toLowerCase() === email);
    if (!hasEmail && rows.length >= maxClients) {
      return {
        ok: false,
        error: `Client limit reached for ${plan.name} plan (max ${maxClients}). Upgrade to continue.`,
      };
    }
  }

  const shareToken = newShareToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + input.expiryDays * 86400000);

  await persistShareLink({
    shareToken,
    campaignId: input.campaignId,
    agencyId,
    clientEmail: input.clientEmail,
    expiresAt,
    createdAt: now,
  });

  return { ok: true, shareUrl: buildShareUrl(shareToken), shareToken };
}
