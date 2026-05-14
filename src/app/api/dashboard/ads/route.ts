import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { metaAccessContext } from "@/lib/agency-from-request";
import { getDecryptedTokenForAgency, getDisabledAdAccountIdSet } from "@/lib/agency-service";
import { resolvePlanForUsage } from "@/lib/billing/usage";
import {
  buildDashboardAdRowsFromFacebook,
  type DashboardAdBreakdownRow,
} from "@/lib/facebook/dashboard-breakdown";
import { getOrSetCache, USER_CACHE_HEADERS } from "@/lib/server-cache";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const STATUS_FILTERS = new Set(["all", "active", "paused", "completed", "other"]);
const SORT_KEYS = new Set(["spend", "results", "costPerResult", "roas", "name", "ctr", "cpc"]);

function parseListParams(req: NextRequest) {
  const pageRaw = parseInt(req.nextUrl.searchParams.get("page") ?? "1", 10);
  const limitRaw = parseInt(req.nextUrl.searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10);
  const statusRaw = (req.nextUrl.searchParams.get("status") ?? "all").toLowerCase();
  const sortRaw = (req.nextUrl.searchParams.get("sort") ?? "spend").toLowerCase();
  return {
    page: Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1,
    limit: Math.min(
      MAX_LIMIT,
      Math.max(1, Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : DEFAULT_LIMIT),
    ),
    q: (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase(),
    statusFilter: STATUS_FILTERS.has(statusRaw) ? statusRaw : "all",
    sortKey: SORT_KEYS.has(sortRaw) ? sortRaw : "spend",
    datePreset: req.nextUrl.searchParams.get("datePreset") ?? "last_30d",
  };
}

function matchesSearch(row: DashboardAdBreakdownRow, q: string) {
  if (!q) return true;
  return [
    row.name,
    row.id,
    row.code,
    row.adsetName,
    row.adsetId ?? "",
    row.campaignName,
    row.campaignId ?? "",
    row.accountName,
  ].some((value) => value.toLowerCase().includes(q));
}

function sortRows(rows: DashboardAdBreakdownRow[], sortKey: string) {
  return [...rows].sort((a, b) => {
    switch (sortKey) {
      case "results":
        return b.results - a.results;
      case "costPerResult":
        return (
          (a.costPerResult ?? Number.MAX_SAFE_INTEGER) -
          (b.costPerResult ?? Number.MAX_SAFE_INTEGER)
        );
      case "roas":
        return b.roas - a.roas;
      case "name":
        return a.name.localeCompare(b.name);
      case "ctr":
        return b.ctr - a.ctr;
      case "cpc":
        return a.cpc - b.cpc;
      case "spend":
      default:
        return b.spend - a.spend;
    }
  });
}

export async function GET(req: NextRequest) {
  const { agencyId, isAuthenticated } = await metaAccessContext(req);
  const session = await auth();

  if (!isAuthenticated) {
    return NextResponse.json({ success: false, error: "Sign in required." }, { status: 401 });
  }

  const { page, limit, q, statusFilter, sortKey, datePreset } = parseListParams(req);

  if (!agencyId) {
    return NextResponse.json(
      {
        success: true as const,
        connected: false,
        currencySymbol: "৳",
        ads: [],
        pagination: { page: 1, limit, total: 0, totalPages: 1 },
        summary: { activeCount: 0 },
      },
      { headers: USER_CACHE_HEADERS },
    );
  }

  try {
    const payload = await getOrSetCache(
      `user:dashboard-ads:v2:${agencyId}:${datePreset}`,
      20_000,
      async () => {
        const token = await getDecryptedTokenForAgency(agencyId);
        if (!token) {
          return {
            success: true as const,
            connected: false,
            currencySymbol: "৳",
            ads: [] as DashboardAdBreakdownRow[],
          };
        }
        const plan = await resolvePlanForUsage({ userId: session?.user?.id ?? null, agencyId });
        const disabledAdAccountIds = await getDisabledAdAccountIdSet(agencyId);
        return buildDashboardAdRowsFromFacebook(
          token,
          { adAccounts: plan.limits.adAccounts },
          { disabledAdAccountIds, datePreset },
        );
      },
    );

    const filtered = payload.ads.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      return matchesSearch(row, q);
    });
    const sorted = sortRows(filtered, sortKey);
    const activeCount = sorted.filter((row) => row.status === "active").length;
    const total = sorted.length;
    const totalPages = total === 0 ? 1 : Math.ceil(total / limit);
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * limit;

    return NextResponse.json(
      {
        ...payload,
        ads: sorted.slice(start, start + limit),
        pagination: { page: safePage, limit, total, totalPages },
        summary: { activeCount },
      },
      { headers: USER_CACHE_HEADERS },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Facebook API error";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
