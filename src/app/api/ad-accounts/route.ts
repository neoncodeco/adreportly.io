import { NextRequest, NextResponse } from "next/server";
import { metaAccessContext } from "@/lib/agency-from-request";
import { getDecryptedTokenForAgency } from "@/lib/agency-service";
import { getOrSetCache, USER_CACHE_HEADERS } from "@/lib/server-cache";
import { fetchAdAccounts } from "@/services/facebook";

export async function GET(request: NextRequest) {
  const { agencyId, isAuthenticated } = await metaAccessContext(request);
  if (!isAuthenticated) {
    return NextResponse.json({ success: false, error: "Sign in required." }, { status: 401 });
  }
  if (!agencyId) {
    return NextResponse.json({ success: true, adAccounts: [] as unknown[] });
  }

  try {
    const payload = await getOrSetCache(`user:ad-accounts:${agencyId}`, 20_000, async () => {
      const token = await getDecryptedTokenForAgency(agencyId);
      if (!token) {
        return { success: true, adAccounts: [] as unknown[] };
      }
      const data = await fetchAdAccounts(token);
      return { success: true, adAccounts: data.data ?? [] };
    });
    return NextResponse.json(payload, { headers: USER_CACHE_HEADERS });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Facebook API error";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
