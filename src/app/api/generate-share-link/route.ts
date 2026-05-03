import { NextRequest, NextResponse } from "next/server";
import { metaAccessContext } from "@/lib/agency-from-request";
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

  let body: { campaignId?: string; clientEmail?: string; expiryDays?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const campaignId = body.campaignId;
  const clientEmail = body.clientEmail;
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

  await persistShareLink({
    shareToken,
    campaignId,
    agencyId,
    clientEmail,
    expiresAt,
    createdAt: now,
  });

  return NextResponse.json({
    success: true,
    shareUrl: buildShareUrl(shareToken),
    token: shareToken,
    shareToken,
    expiresAt: expiresAt.toISOString(),
  });
}
