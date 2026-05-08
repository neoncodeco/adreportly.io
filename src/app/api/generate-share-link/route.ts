import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { metaAccessContext } from "@/lib/agency-from-request";
import { resolvePlanForUsage } from "@/lib/billing/usage";
import { invalidateCacheByPrefix } from "@/lib/server-cache";
import {
  buildShareUrl,
  listClientEmailsForAgency,
  newShareToken,
  persistShareLink,
} from "@/lib/share-service";

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

  const session = await auth();
  const plan = await resolvePlanForUsage({ userId: session?.user?.id ?? null, agencyId });
  const maxClients = plan.limits.clients;
  if (maxClients !== null) {
    const rows = await listClientEmailsForAgency(agencyId);
    const email = clientEmail.trim().toLowerCase();
    const hasEmail = rows.some((r) => r.email.trim().toLowerCase() === email);
    if (!hasEmail && rows.length >= maxClients) {
      return NextResponse.json(
        {
          success: false,
          error: `Client limit reached for ${plan.name} plan (max ${maxClients}). Upgrade to continue.`,
        },
        { status: 403 },
      );
    }
  }

  await persistShareLink({
    shareToken,
    campaignId,
    agencyId,
    clientEmail,
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
