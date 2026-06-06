import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { metaAccessContext } from "@/lib/agency-from-request";
import { USER_CACHE_HEADERS } from "@/lib/server-cache";
import {
  emptyOverviewPayloadDisconnected,
  getCachedDashboardOverviewPayload,
} from "@/lib/dashboard-overview-cache";

export async function GET(request: NextRequest) {
  const { agencyId, isAuthenticated } = await metaAccessContext(request);

  if (!isAuthenticated) {
    return NextResponse.json({ success: false, error: "Sign in required." }, { status: 401 });
  }

  if (!agencyId) {
    return NextResponse.json(emptyOverviewPayloadDisconnected(), { headers: USER_CACHE_HEADERS });
  }

  try {
    const datePreset = request.nextUrl.searchParams.get("datePreset") ?? "last_30d";
    const payload = await getCachedDashboardOverviewPayload(agencyId, datePreset);

    return NextResponse.json(payload, { headers: USER_CACHE_HEADERS });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Facebook API error";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
