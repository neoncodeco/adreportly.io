import { NextResponse } from "next/server";
import { getShareByToken } from "@/lib/share-service";
import { getDecryptedTokenForAgency } from "@/lib/agency-service";
import { fetchCampaignById, fetchCampaignInsights } from "@/services/facebook";

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
      campaign: {
        id: share.campaignId,
        name: "Campaign",
        objective: "",
        status: "",
      },
      insights: [] as unknown[],
      clientEmail: share.clientEmail,
      demo: true as const,
    });
  }

  try {
    const campaign = await fetchCampaignById(access, share.campaignId);
    let insights = await fetchCampaignInsights(access, share.campaignId, {
      datePreset: "last_30d",
      timeIncrement: "1",
    });
    if (!insights.data?.length) {
      insights = await fetchCampaignInsights(access, share.campaignId, {
        datePreset: "last_30d",
      });
    }
    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name ?? share.campaignId,
        objective: campaign.objective ?? "",
        status: campaign.effective_status ?? campaign.status ?? "",
      },
      insights: insights.data ?? [],
      clientEmail: share.clientEmail,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upstream error";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
