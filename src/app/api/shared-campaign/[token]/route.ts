import { NextResponse } from "next/server";
import { getShareByToken } from "@/lib/share-service";
import { getDecryptedTokenForAgency } from "@/lib/agency-service";
import { fetchCampaignInsights } from "@/services/facebook";

export async function GET(_request: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const share = await getShareByToken(token);
  if (!share || share.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ success: false, error: "Invalid or expired link" }, { status: 404 });
  }

  const access = await getDecryptedTokenForAgency(share.agencyId);
  if (!access) {
    return NextResponse.json({
      success: true,
      campaignId: share.campaignId,
      insights: { data: [] as unknown[] },
      demo: true as const,
    });
  }

  try {
    const insights = await fetchCampaignInsights(access, share.campaignId);
    return NextResponse.json({
      success: true,
      campaignId: share.campaignId,
      insights,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upstream error";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
