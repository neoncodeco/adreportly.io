import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { buildShareUrl, newShareToken, persistShareLink } from "@/lib/share-service";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
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
    agencyId: session.user.id,
    clientEmail,
    expiresAt,
    createdAt: now,
  });

  return NextResponse.json({
    success: true,
    shareUrl: buildShareUrl(shareToken),
    shareToken,
  });
}
