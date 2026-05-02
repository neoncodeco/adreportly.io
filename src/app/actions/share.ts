"use server";

import { auth } from "@/auth";
import { buildShareUrl, newShareToken, persistShareLink } from "@/lib/share-service";

export type CreateShareResult =
  | { ok: true; shareUrl: string; shareToken: string }
  | { ok: false; error: string };

export async function createShareLinkAction(input: {
  campaignId: string;
  clientEmail: string;
  expiryDays: number;
}): Promise<CreateShareResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  const agencyId = session.user.id;
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
