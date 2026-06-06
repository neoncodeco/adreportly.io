import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { metaAccessContext } from "@/lib/agency-from-request";
import { getDecryptedTokenForAgency } from "@/lib/agency-service";
import { USER_CACHE_HEADERS } from "@/lib/server-cache";
import { getCachedDashboardOverviewPayload } from "@/lib/dashboard-overview-cache";
import { fetchAdsForCampaign, fetchCampaignById } from "@/services/facebook";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const STATUS_FILTERS = new Set(["all", "active", "paused", "completed", "other"]);
const SORT_KEYS = new Set(["spend", "results", "costPerResult", "roas", "name", "ctr", "cpc"]);

type CampaignRow = {
  name?: string;
  id?: string;
  code?: string;
  status?: string;
  spend?: number;
  results?: number;
  costPerResult?: number | null;
  roas?: number;
  ctr?: number;
  cpc?: number;
  previewUrl?: string | null;
};

function asCampaignList(payload: Record<string, unknown>): unknown[] {
  const campaigns = payload.campaigns;
  const recent = payload.recentCampaigns;
  if (Array.isArray(campaigns) && campaigns.length > 0) return campaigns;
  if (Array.isArray(recent)) return recent;
  return [];
}

const CAMPAIGN_PREVIEW_TTL_MS = 10 * 60 * 1000;
const campaignPreviewCache = new Map<string, { url: string | null; expiresAt: number }>();

async function getCampaignPreviewUrl(
  accessToken: string,
  campaignId: string,
): Promise<string | null> {
  const cached = campaignPreviewCache.get(campaignId);
  if (cached && cached.expiresAt > Date.now()) return cached.url;

  try {
    const campaign = await fetchCampaignById(accessToken, campaignId);
    const accountId = campaign.account_id;
    if (!accountId) {
      campaignPreviewCache.set(campaignId, {
        url: null,
        expiresAt: Date.now() + CAMPAIGN_PREVIEW_TTL_MS,
      });
      return null;
    }
    const ads = await fetchAdsForCampaign(accessToken, accountId, campaignId, "last_30d");
    const url =
      ads.find((a) => a.creative?.thumbnail_url || a.creative?.image_url)?.creative
        ?.thumbnail_url ??
      ads.find((a) => a.creative?.thumbnail_url || a.creative?.image_url)?.creative?.image_url ??
      null;
    campaignPreviewCache.set(campaignId, {
      url,
      expiresAt: Date.now() + CAMPAIGN_PREVIEW_TTL_MS,
    });
    return url;
  } catch {
    campaignPreviewCache.set(campaignId, {
      url: null,
      expiresAt: Date.now() + CAMPAIGN_PREVIEW_TTL_MS,
    });
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { agencyId, isAuthenticated } = await metaAccessContext(req);

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
  const datePreset = url.searchParams.get("datePreset") ?? "last_30d";

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
    const payload = (await getCachedDashboardOverviewPayload(agencyId, datePreset)) as Record<
      string,
      unknown
    >;
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
      const costA = ra.costPerResult ?? Number.MAX_SAFE_INTEGER;
      const costB = rb.costPerResult ?? Number.MAX_SAFE_INTEGER;
      const nameA = ra.name ?? "";
      const nameB = rb.name ?? "";
      switch (sortKey) {
        case "results":
          return resB - resA;
        case "costPerResult":
          return costA - costB;
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
    const campaigns = sorted.slice(start, start + limit) as CampaignRow[];

    const access = await getDecryptedTokenForAgency(agencyId);
    if (access && campaigns.length > 0) {
      const previews = await Promise.all(
        campaigns.map(async (c) => {
          const id = typeof c.id === "string" ? c.id : "";
          if (!id) return null;
          return await getCampaignPreviewUrl(access, id);
        }),
      );
      for (let i = 0; i < campaigns.length; i++) {
        campaigns[i] = { ...campaigns[i], previewUrl: previews[i] ?? null };
      }
    }

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
