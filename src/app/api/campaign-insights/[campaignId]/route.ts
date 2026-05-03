import { NextRequest, NextResponse } from "next/server";
import { metaAccessContext } from "@/lib/agency-from-request";
import { getDecryptedTokenForAgency } from "@/lib/agency-service";
import { fetchCampaignInsights } from "@/services/facebook";

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

  const token = await getDecryptedTokenForAgency(agencyId);
  if (!token) {
    return NextResponse.json({ success: true, insights: [] as unknown[] });
  }

  const url = request.nextUrl;
  const datePreset = url.searchParams.get("date_preset") ?? "last_30d";
  const timeIncrement = url.searchParams.get("time_increment") ?? undefined;

  try {
    const insights = await fetchCampaignInsights(token, decodeURIComponent(campaignId), {
      datePreset,
      timeIncrement: timeIncrement ?? undefined,
    });
    return NextResponse.json({ success: true, insights: insights.data ?? [] });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Facebook API error";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
