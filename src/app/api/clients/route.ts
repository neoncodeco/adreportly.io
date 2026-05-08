import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { metaAccessContext } from "@/lib/agency-from-request";
import { resolvePlanForUsage } from "@/lib/billing/usage";
import { getOrSetCache, USER_CACHE_HEADERS } from "@/lib/server-cache";
import { listClientEmailsForAgency } from "@/lib/share-service";

export async function GET(request: NextRequest) {
  const { agencyId, isAuthenticated } = await metaAccessContext(request);
  if (!isAuthenticated) {
    return NextResponse.json({ success: false, error: "Sign in required." }, { status: 401 });
  }
  if (!agencyId) {
    return NextResponse.json({ success: true, clients: [] });
  }

  try {
    const session = await auth();
    const plan = await resolvePlanForUsage({ userId: session?.user?.id ?? null, agencyId });
    const payload = await getOrSetCache(`user:clients:${agencyId}`, 15_000, async () => {
      const rows = await listClientEmailsForAgency(agencyId);
      const maxClients = plan.limits.clients;
      const limitedRows = maxClients === null ? rows : rows.slice(0, maxClients);
      const clients = limitedRows.map((r) => {
        const local = r.email.split("@")[0] ?? r.email;
        const parts = local.replace(/[._]/g, " ").split(" ").filter(Boolean);
        const initials =
          parts.length >= 2
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : local.slice(0, 2).toUpperCase();
        return {
          id: r.email,
          initials,
          name: local,
          organization: "Shared link recipient",
          email: r.email,
          accounts: r.shareCount,
          status: "active" as const,
          lastShared: r.lastShared.toISOString(),
        };
      });
      return { success: true, clients };
    });
    return NextResponse.json(payload, { headers: USER_CACHE_HEADERS });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
