import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { metaAccessContext } from "@/lib/agency-from-request";
import { USER_CACHE_HEADERS } from "@/lib/server-cache";
import { getCachedDashboardOverviewPayload } from "@/lib/dashboard-overview-cache";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function asCampaignList(payload: Record<string, unknown>): unknown[] {
  const campaigns = payload.campaigns;
  const recent = payload.recentCampaigns;
  if (Array.isArray(campaigns) && campaigns.length > 0) return campaigns;
  if (Array.isArray(recent)) return recent;
  return [];
}

export async function GET(req: NextRequest) {
  const { agencyId, isAuthenticated } = await metaAccessContext(req);
  await auth();

  if (!isAuthenticated) {
    return NextResponse.json({ success: false, error: "Sign in required." }, { status: 401 });
  }

  const url = req.nextUrl;
  const pageRaw = parseInt(url.searchParams.get("page") ?? "1", 10);
  const limitRaw = parseInt(url.searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : DEFAULT_LIMIT),
  );
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();

  if (!agencyId) {
    return NextResponse.json(
      {
        success: true as const,
        currencySymbol: "৳",
        connected: false,
        campaigns: [],
        pagination: { page: 1, limit, total: 0, totalPages: 1 },
        summary: { activeCount: 0 },
      },
      { headers: USER_CACHE_HEADERS },
    );
  }

  try {
    const payload = (await getCachedDashboardOverviewPayload(agencyId)) as Record<string, unknown>;
    const fullList = asCampaignList(payload);
    const filtered = q
      ? fullList.filter((row) => {
          const r = row as { name?: string; id?: string };
          const name = (r.name ?? "").toLowerCase();
          const id = String(r.id ?? "");
          return name.includes(q) || id.toLowerCase().includes(q);
        })
      : fullList;

    const activeCount = filtered.filter((row) => {
      const r = row as { status?: string };
      return r.status === "active";
    }).length;

    const total = filtered.length;
    const totalPages = total === 0 ? 1 : Math.ceil(total / limit);
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * limit;
    const campaigns = filtered.slice(start, start + limit);

    return NextResponse.json(
      {
        success: true as const,
        currencySymbol: typeof payload.currencySymbol === "string" ? payload.currencySymbol : "৳",
        connected: payload.connected !== false,
        campaigns,
        pagination: {
          page: safePage,
          limit,
          total,
          totalPages,
        },
        summary: {
          activeCount,
        },
      },
      { headers: USER_CACHE_HEADERS },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Facebook API error";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
