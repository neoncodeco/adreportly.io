import { NextRequest, NextResponse } from "next/server";
import { agencyClientExists, findSingleAgencyClientByEmail } from "@/lib/agency-client-service";
import { metaAccessContext } from "@/lib/agency-from-request";
import { invalidateCacheByPrefix } from "@/lib/server-cache";
import { normalizeDollarRateBdt, positiveFiniteNumber } from "@/lib/share-financial";
import { buildShareUrl, newShareToken, persistShareLink } from "@/lib/share-service";

export async function POST(request: NextRequest) {
  const { agencyId, isAuthenticated } = await metaAccessContext(request);
  if (!isAuthenticated) {
    return NextResponse.json({ success: false, error: "Sign in required." }, { status: 401 });
  }
  if (!agencyId) {
    return NextResponse.json(
      {
        success: false,
        error: "Connect Facebook under Meta Connect first to create share links.",
      },
      { status: 400 },
    );
  }

  let body: {
    campaignId?: string;
    clientEmail?: string;
    clientName?: string;
    totalDeposit?: number | null;
    dollarRateBdt?: number | null;
    expiryDays?: number;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const campaignId = body.campaignId;
  const clientEmail = body.clientEmail;
  const clientName = typeof body.clientName === "string" ? body.clientName.trim() : "";
  const totalDeposit = positiveFiniteNumber(body.totalDeposit);
  const dollarRateBdt = normalizeDollarRateBdt(body.dollarRateBdt);
  const expiryDays = body.expiryDays ?? 30;
  if (!campaignId || !clientEmail) {
    return NextResponse.json(
      { success: false, error: "campaignId and clientEmail are required" },
      { status: 400 },
    );
  }

  const shareToken = newShareToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiryDays * 86400000);

  const emailNorm = clientEmail.trim().toLowerCase();
  const roster = await agencyClientExists(agencyId, emailNorm);
  if (!roster) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Add this client under Dashboard → Clients (name and email) before creating a share link.",
      },
      { status: 400 },
    );
  }
  const rosterClient = await findSingleAgencyClientByEmail(agencyId, emailNorm);

  await persistShareLink({
    shareToken,
    campaignId,
    agencyId,
    clientId: rosterClient?.id ?? null,
    clientEmail: clientEmail.trim(),
    clientName,
    totalDeposit,
    dollarRateBdt,
    expiresAt,
    createdAt: now,
  });
  invalidateCacheByPrefix(`user:clients:${agencyId}`);

  return NextResponse.json({
    success: true,
    shareUrl: buildShareUrl(shareToken),
    token: shareToken,
    shareToken,
    expiresAt: expiresAt.toISOString(),
  });
}
