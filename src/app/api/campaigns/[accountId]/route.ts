import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { metaAccessContext } from "@/lib/agency-from-request";
import { resolvePlanForUsage } from "@/lib/billing/usage";
import { getDecryptedTokenForAgency } from "@/lib/agency-service";
import { fetchCampaignsForAdAccount } from "@/services/facebook";

export async function GET(request: NextRequest, ctx: { params: Promise<{ accountId: string }> }) {
  const { agencyId, isAuthenticated } = await metaAccessContext(request);
  if (!isAuthenticated) {
    return NextResponse.json({ success: false, error: "Sign in required." }, { status: 401 });
  }
  if (!agencyId) {
    return NextResponse.json({ success: true, campaigns: [] as unknown[] });
  }

  const { accountId } = await ctx.params;
  if (!accountId) {
    return NextResponse.json({ success: false, error: "accountId required" }, { status: 400 });
  }

  const token = await getDecryptedTokenForAgency(agencyId);
  if (!token) {
    return NextResponse.json({ success: true, campaigns: [] as unknown[] });
  }

  try {
    const session = await auth();
    const plan = await resolvePlanForUsage({ userId: session?.user?.id ?? null, agencyId });
    const rows = await fetchCampaignsForAdAccount(token, decodeURIComponent(accountId));
    const maxCampaigns = plan.limits.campaigns;
    const visibleRows = maxCampaigns === null ? rows : rows.slice(0, maxCampaigns);
    return NextResponse.json({
      success: true,
      campaigns: visibleRows.map((c) => ({
        id: c.id,
        name: c.name ?? "",
        objective: c.objective ?? "",
        status: c.effective_status ?? c.status ?? "",
      })),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Facebook API error";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
