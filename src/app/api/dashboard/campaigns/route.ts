import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { metaAccessContext } from "@/lib/agency-from-request";
import { USER_CACHE_HEADERS } from "@/lib/server-cache";
import { getCachedDashboardOverviewPayload } from "@/lib/dashboard-overview-cache";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const STATUS_FILTERS = new Set(["all", "active", "paused", "completed", "other"]);
const SORT_KEYS = new Set(["spend", "results", "roas", "name", "ctr", "cpc"]);

type CampaignRow = {
  name?: string;
  id?: string;
  code?: string;
  status?: string;
  spend?: number;
  results?: number;
  roas?: number;
  ctr?: number;
  cpc?: number;
};

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
  const statusRaw = (url.searchParams.get("status") ?? "all").toLowerCase();
  const statusFilter = STATUS_FILTERS.has(statusRaw) ? statusRaw : "all";
  const sortRaw = (url.searchParams.get("sort") ?? "spend").toLowerCase();
  const sortKey = SORT_KEYS.has(sortRaw) ? sortRaw : "spend";

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
    const filtered = fullList.filter((row) => {
      const r = row as CampaignRow;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      const name = (r.name ?? "").toLowerCase();
      const id = String(r.id ?? "").toLowerCase();
      const code = (r.code ?? "").toLowerCase();
      return name.includes(q) || id.includes(q) || code.includes(q);
    });

    const sorted = [...filtered].sort((a, b) => {
      const ra = a as CampaignRow;
      const rb = b as CampaignRow;
      const sa = ra.spend ?? 0;
      const sb = rb.spend ?? 0;
      const resA = ra.results ?? 0;
      const resB = rb.results ?? 0;
      const roasA = ra.roas ?? 0;
      const roasB = rb.roas ?? 0;
      const ctrA = ra.ctr ?? 0;
      const ctrB = rb.ctr ?? 0;
      const cpcA = ra.cpc ?? 0;
      const cpcB = rb.cpc ?? 0;
      const nameA = ra.name ?? "";
      const nameB = rb.name ?? "";
      switch (sortKey) {
        case "results":
          return resB - resA;
        case "roas":
          return roasB - roasA;
        case "name":
          return nameA.localeCompare(nameB);
        case "ctr":
          return ctrB - ctrA;
        case "cpc":
          return cpcA - cpcB;
        case "spend":
        default:
          return sb - sa;
      }
    });

    const activeCount = sorted.filter((row) => {
      const r = row as CampaignRow;
      return r.status === "active";
    }).length;

    const total = sorted.length;
    const totalPages = total === 0 ? 1 : Math.ceil(total / limit);
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * limit;
    const campaigns = sorted.slice(start, start + limit);

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
