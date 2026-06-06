import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { metaAccessContext } from "@/lib/agency-from-request";
import { resolvePlanForUsage } from "@/lib/billing/usage";
import {
  getAccountCampaignsSnapshot,
  isAccountCampaignsSnapshotFresh,
  syncAccountCampaignsSnapshot,
} from "@/lib/facebook/account-campaigns-snapshot";

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

  try {
    const authUser = await getServerUser();
    const plan = await resolvePlanForUsage({ userId: authUser?.id ?? null, agencyId });
    const normalizedAccountId = decodeURIComponent(accountId);
    const snapshot = await getAccountCampaignsSnapshot(agencyId, normalizedAccountId);
    if (snapshot?.payload && isAccountCampaignsSnapshotFresh(snapshot.fetchedAt)) {
      return NextResponse.json({ success: true, campaigns: snapshot.payload as unknown[] });
    }
    if (snapshot?.payload) {
      void syncAccountCampaignsSnapshot({
        agencyId,
        accountId: normalizedAccountId,
        maxCampaigns: plan.limits.campaigns,
      }).catch(() => undefined);
      return NextResponse.json({ success: true, campaigns: snapshot.payload as unknown[] });
    }
    const campaigns = await syncAccountCampaignsSnapshot({
      agencyId,
      accountId: normalizedAccountId,
      maxCampaigns: plan.limits.campaigns,
    });
    return NextResponse.json({
      success: true,
      campaigns,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Facebook API error";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
