import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { metaAccessContext } from "@/lib/agency-from-request";
import { resolvePlanForUsage } from "@/lib/billing/usage";
import {
  getAdAccountsSnapshot,
  isAdAccountsSnapshotFresh,
  syncAdAccountsSnapshot,
} from "@/lib/facebook/ad-accounts-snapshot";
import { getOrSetCache, USER_CACHE_HEADERS } from "@/lib/server-cache";

export async function GET(request: NextRequest) {
  const { agencyId, isAuthenticated } = await metaAccessContext(request);
  if (!isAuthenticated) {
    return NextResponse.json({ success: false, error: "Sign in required." }, { status: 401 });
  }
  if (!agencyId) {
    return NextResponse.json({ success: true, adAccounts: [] as unknown[] });
  }

  try {
    const session = await auth();
    const plan = await resolvePlanForUsage({ userId: session?.user?.id ?? null, agencyId });
    const payload = await getOrSetCache(`user:ad-accounts:${agencyId}`, 20_000, async () => {
      const snapshot = await getAdAccountsSnapshot(agencyId);
      if (snapshot?.payload && isAdAccountsSnapshotFresh(snapshot.fetchedAt)) {
        return { success: true, adAccounts: snapshot.payload as unknown[] };
      }
      if (snapshot?.payload) {
        void syncAdAccountsSnapshot(agencyId, plan.limits.adAccounts).catch(() => undefined);
        return { success: true, adAccounts: snapshot.payload as unknown[] };
      }
      const adAccounts = await syncAdAccountsSnapshot(agencyId, plan.limits.adAccounts);
      return { success: true, adAccounts };
    });
    return NextResponse.json(payload, { headers: USER_CACHE_HEADERS });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Facebook API error";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
