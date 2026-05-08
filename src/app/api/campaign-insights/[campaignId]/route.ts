import { NextRequest, NextResponse } from "next/server";
import { metaAccessContext } from "@/lib/agency-from-request";
import {
  getCampaignInsightsSnapshot,
  isFresh,
  syncCampaignInsightsSnapshot,
} from "@/lib/facebook/campaign-insights-snapshot";

export async function GET(request: NextRequest, ctx: { params: Promise<{ campaignId: string }> }) {
  const { agencyId, isAuthenticated } = await metaAccessContext(request);
  if (!isAuthenticated) {
    return NextResponse.json({ success: false, error: "Sign in required." }, { status: 401 });
  }

  const { campaignId } = await ctx.params;
  if (!campaignId) {
    return NextResponse.json({ success: false, error: "campaignId required" }, { status: 400 });
  }

  if (!agencyId) {
    return NextResponse.json({ success: true, insights: [] as unknown[] });
  }

  const url = request.nextUrl;
  const datePreset = url.searchParams.get("date_preset") ?? "last_30d";
  const timeIncrement = url.searchParams.get("time_increment") ?? "";

  try {
    const normalizedCampaignId = decodeURIComponent(campaignId);
    const snapshot = await getCampaignInsightsSnapshot({
      agencyId,
      campaignId: normalizedCampaignId,
      datePreset,
      timeIncrement,
    });

    if (snapshot?.payload && isFresh(snapshot.fetchedAt)) {
      return NextResponse.json({ success: true, insights: snapshot.payload });
    }

    if (snapshot?.payload) {
      void syncCampaignInsightsSnapshot({
        agencyId,
        campaignId: normalizedCampaignId,
        datePreset,
        timeIncrement,
      }).catch(() => undefined);
      return NextResponse.json({ success: true, insights: snapshot.payload });
    }

    const payload = await syncCampaignInsightsSnapshot({
      agencyId,
      campaignId: normalizedCampaignId,
      datePreset,
      timeIncrement,
    });
    return NextResponse.json({ success: true, insights: payload });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Facebook API error";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
