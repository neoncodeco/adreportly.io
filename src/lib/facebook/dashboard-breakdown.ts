import {
  fetchAdAccounts,
  fetchAdLevelInsights,
  fetchAdSetLevelInsights,
  fetchAdSetStatuses,
  fetchAdStatuses,
  fetchCampaignStatuses,
  normalizeActId,
  type CampaignAdInsightRow,
  type FacebookAdSetStatusRow,
  type FacebookAdStatusRow,
} from "@/services/facebook";
import {
  costPerResultFromInsight,
  countResultsFromInsight,
  creativePreviewUrlFromAd,
  minorToMajor,
} from "@/lib/facebook/client-report-normalize";

const PURCHASE_ACTION_TYPES = new Set([
  "omni_purchase",
  "offsite_conversion.fb_pixel_purchase",
  "purchase",
  "onsite_conversion.purchase",
]);

type PlanLimits = {
  adAccounts: number | null;
};

type BuildOptions = {
  disabledAdAccountIds?: Set<string>;
  datePreset?: string;
};

export type DashboardMetaStatus = "active" | "paused" | "completed" | "other";

export type DashboardAdSetBreakdownRow = {
  id: string;
  code: string;
  name: string;
  campaignId: string | null;
  campaignName: string;
  accountName: string;
  status: DashboardMetaStatus;
  budget: number | null;
  budgetType: "daily" | "lifetime" | null;
  spend: number;
  results: number;
  costPerResult: number | null;
  roas: number;
  ctr: number;
  cpc: number;
  impressions: number;
  clicks: number;
};

export type DashboardAdBreakdownRow = {
  id: string;
  code: string;
  name: string;
  adsetId: string | null;
  adsetName: string;
  campaignId: string | null;
  campaignName: string;
  accountName: string;
  previewUrl: string | null;
  status: DashboardMetaStatus;
  spend: number;
  results: number;
  costPerResult: number | null;
  roas: number;
  ctr: number;
  cpc: number;
  impressions: number;
  clicks: number;
};

function num(value: string | undefined): number {
  return parseFloat(value ?? "0") || 0;
}

function int(value: string | undefined): number {
  return parseInt(value ?? "0", 10) || 0;
}

function currencySymbolFor(code: string | undefined): string {
  if (!code) return "৳";
  const c = code.toUpperCase();
  if (c === "USD") return "$";
  if (c === "EUR") return "€";
  if (c === "BDT") return "৳";
  return `${c} `;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
  const compact = (parts[0] ?? name).replace(/[^a-zA-Z0-9]/g, "");
  return compact.slice(0, 2).toUpperCase() || "?";
}

function mapMetaStatus(status: string | undefined): DashboardMetaStatus {
  const u = (status ?? "").toUpperCase();
  if (u === "ACTIVE") return "active";
  if (u === "PAUSED" || u === "ADSET_PAUSED" || u === "CAMPAIGN_PAUSED") return "paused";
  if (u === "ARCHIVED" || u === "DELETED") return "completed";
  return "other";
}

function firstStatus(...statuses: Array<string | null | undefined>): string | undefined {
  return statuses.find(
    (status): status is string => typeof status === "string" && status.trim().length > 0,
  );
}

function purchaseValueFromInsight(row: CampaignAdInsightRow | undefined): number {
  if (!row?.action_values?.length) return 0;
  return row.action_values.reduce((sum, action) => {
    if (!PURCHASE_ACTION_TYPES.has(action.action_type)) return sum;
    return sum + (parseFloat(action.value) || 0);
  }, 0);
}

function roasFromInsight(row: CampaignAdInsightRow | undefined, spend: number): number {
  const explicit = row?.purchase_roas?.[0]?.value;
  if (explicit != null) {
    const parsed = parseFloat(explicit);
    if (Number.isFinite(parsed)) return parsed;
  }
  const value = purchaseValueFromInsight(row);
  return spend > 0 && value > 0 ? value / spend : 0;
}

function budgetFromAdSet(status: FacebookAdSetStatusRow): {
  budget: number | null;
  budgetType: "daily" | "lifetime" | null;
} {
  if (status.daily_budget && status.daily_budget !== "0") {
    return { budget: minorToMajor(status.daily_budget), budgetType: "daily" };
  }
  if (status.lifetime_budget && status.lifetime_budget !== "0") {
    return { budget: minorToMajor(status.lifetime_budget), budgetType: "lifetime" };
  }
  return { budget: null, budgetType: null };
}

function addInsightMetrics(
  target: {
    spend: number;
    results: number;
    costPerResult: number | null;
    roas: number;
    ctr: number;
    cpc: number;
    impressions: number;
    clicks: number;
  },
  row: CampaignAdInsightRow,
) {
  const spend = num(row.spend);
  const clicks = int(row.clicks);
  const impressions = int(row.impressions);
  target.spend += spend;
  target.results += countResultsFromInsight(row);
  target.impressions += impressions;
  target.clicks += clicks;
  target.ctr = target.impressions > 0 ? (target.clicks / target.impressions) * 100 : 0;
  target.cpc = target.clicks > 0 ? target.spend / target.clicks : 0;
  target.costPerResult =
    target.results > 0 && target.spend > 0
      ? target.spend / target.results
      : (costPerResultFromInsight(row) ?? target.costPerResult);
  const roas = roasFromInsight(row, spend);
  target.roas = target.spend > 0 ? Math.max(target.roas, roas) : 0;
}

export async function buildDashboardAdSetRowsFromFacebook(
  token: string,
  limits: PlanLimits,
  options?: BuildOptions,
) {
  const acc = await fetchAdAccounts(token);
  let adAccounts = acc.data ?? [];
  if (limits.adAccounts !== null) adAccounts = adAccounts.slice(0, limits.adAccounts);

  const disabled = options?.disabledAdAccountIds ?? new Set<string>();
  if (disabled.size > 0) {
    adAccounts = adAccounts.filter((account) => !disabled.has(normalizeActId(account.id)));
  }

  const primaryCurrency = adAccounts[0]?.currency ?? "BDT";
  const currencySymbol = currencySymbolFor(primaryCurrency);
  const datePreset = options?.datePreset ?? "last_30d";
  const adsetsById = new Map<string, DashboardAdSetBreakdownRow>();

  for (const account of adAccounts) {
    const [insightsResult, statusesResult, campaignStatusesResult] = await Promise.allSettled([
      fetchAdSetLevelInsights(token, account.id, datePreset),
      fetchAdSetStatuses(token, account.id),
      fetchCampaignStatuses(token, account.id),
    ]);
    const insights = insightsResult.status === "fulfilled" ? insightsResult.value : [];
    const statuses = statusesResult.status === "fulfilled" ? statusesResult.value : [];
    const campaignStatusById =
      campaignStatusesResult.status === "fulfilled"
        ? campaignStatusesResult.value
        : new Map<string, string>();
    if (insights.length === 0 && statuses.length === 0) continue;

    const statusById = new Map(statuses.map((status) => [status.id, status]));

    for (const row of insights) {
      const id = row.adset_id ?? "";
      if (!id) continue;
      const meta = statusById.get(id);
      const name = row.adset_name ?? meta?.name ?? id;
      const existing = adsetsById.get(id);
      const budget = meta ? budgetFromAdSet(meta) : { budget: null, budgetType: null };
      const campaignId = row.campaign_id ?? meta?.campaign_id ?? meta?.campaign?.id ?? null;
      const campaignStatus = campaignId ? campaignStatusById.get(campaignId) : undefined;
      const base: DashboardAdSetBreakdownRow = existing ?? {
        id,
        code: initialsFromName(name),
        name,
        campaignId,
        campaignName: row.campaign_name ?? meta?.campaign?.name ?? "Campaign",
        accountName: account.name,
        status: mapMetaStatus(firstStatus(meta?.effective_status, meta?.status, campaignStatus)),
        budget: budget.budget,
        budgetType: budget.budgetType,
        spend: 0,
        results: 0,
        costPerResult: null,
        roas: 0,
        ctr: 0,
        cpc: 0,
        impressions: 0,
        clicks: 0,
      };
      addInsightMetrics(base, row);
      adsetsById.set(id, base);
    }

    for (const status of statuses) {
      if (adsetsById.has(status.id)) continue;
      const budget = budgetFromAdSet(status);
      const campaignId = status.campaign_id ?? status.campaign?.id ?? null;
      const campaignStatus = campaignId ? campaignStatusById.get(campaignId) : undefined;
      adsetsById.set(status.id, {
        id: status.id,
        code: initialsFromName(status.name ?? status.id),
        name: status.name ?? status.id,
        campaignId,
        campaignName: status.campaign?.name ?? "Campaign",
        accountName: account.name,
        status: mapMetaStatus(firstStatus(status.effective_status, status.status, campaignStatus)),
        budget: budget.budget,
        budgetType: budget.budgetType,
        spend: 0,
        results: 0,
        costPerResult: null,
        roas: 0,
        ctr: 0,
        cpc: 0,
        impressions: 0,
        clicks: 0,
      });
    }
  }

  return {
    success: true as const,
    connected: true,
    currency: primaryCurrency,
    currencySymbol,
    adsets: [...adsetsById.values()].sort((a, b) => b.spend - a.spend),
  };
}

function previewUrlFromAd(status: FacebookAdStatusRow): string | null {
  return creativePreviewUrlFromAd({
    id: status.id,
    name: status.name,
    status: status.status,
    effective_status: status.effective_status,
    creative: status.creative,
  });
}

export async function buildDashboardAdRowsFromFacebook(
  token: string,
  limits: PlanLimits,
  options?: BuildOptions,
) {
  const acc = await fetchAdAccounts(token);
  let adAccounts = acc.data ?? [];
  if (limits.adAccounts !== null) adAccounts = adAccounts.slice(0, limits.adAccounts);

  const disabled = options?.disabledAdAccountIds ?? new Set<string>();
  if (disabled.size > 0) {
    adAccounts = adAccounts.filter((account) => !disabled.has(normalizeActId(account.id)));
  }

  const primaryCurrency = adAccounts[0]?.currency ?? "BDT";
  const currencySymbol = currencySymbolFor(primaryCurrency);
  const datePreset = options?.datePreset ?? "last_30d";
  const adsById = new Map<string, DashboardAdBreakdownRow>();

  for (const account of adAccounts) {
    const [insightsResult, statusesResult, campaignStatusesResult] = await Promise.allSettled([
      fetchAdLevelInsights(token, account.id, datePreset),
      fetchAdStatuses(token, account.id),
      fetchCampaignStatuses(token, account.id),
    ]);
    const insights = insightsResult.status === "fulfilled" ? insightsResult.value : [];
    const statuses = statusesResult.status === "fulfilled" ? statusesResult.value : [];
    const campaignStatusById =
      campaignStatusesResult.status === "fulfilled"
        ? campaignStatusesResult.value
        : new Map<string, string>();
    if (insights.length === 0 && statuses.length === 0) continue;

    const statusById = new Map(statuses.map((status) => [status.id, status]));

    for (const row of insights) {
      const id = row.ad_id ?? "";
      if (!id) continue;
      const meta = statusById.get(id);
      const name = row.ad_name ?? meta?.name ?? id;
      const existing = adsById.get(id);
      const campaignId = row.campaign_id ?? meta?.campaign?.id ?? null;
      const campaignStatus = campaignId ? campaignStatusById.get(campaignId) : undefined;
      const base: DashboardAdBreakdownRow = existing ?? {
        id,
        code: initialsFromName(name),
        name,
        adsetId: row.adset_id ?? meta?.adset?.id ?? null,
        adsetName: row.adset_name ?? meta?.adset?.name ?? "Ad set",
        campaignId,
        campaignName: row.campaign_name ?? meta?.campaign?.name ?? "Campaign",
        accountName: account.name,
        previewUrl: meta ? previewUrlFromAd(meta) : null,
        status: mapMetaStatus(firstStatus(meta?.effective_status, meta?.status, campaignStatus)),
        spend: 0,
        results: 0,
        costPerResult: null,
        roas: 0,
        ctr: 0,
        cpc: 0,
        impressions: 0,
        clicks: 0,
      };
      addInsightMetrics(base, row);
      adsById.set(id, base);
    }

    for (const status of statuses) {
      if (adsById.has(status.id)) continue;
      const campaignId = status.campaign?.id ?? null;
      const campaignStatus = campaignId ? campaignStatusById.get(campaignId) : undefined;
      adsById.set(status.id, {
        id: status.id,
        code: initialsFromName(status.name ?? status.id),
        name: status.name ?? status.id,
        adsetId: status.adset?.id ?? null,
        adsetName: status.adset?.name ?? "Ad set",
        campaignId,
        campaignName: status.campaign?.name ?? "Campaign",
        accountName: account.name,
        previewUrl: previewUrlFromAd(status),
        status: mapMetaStatus(firstStatus(status.effective_status, status.status, campaignStatus)),
        spend: 0,
        results: 0,
        costPerResult: null,
        roas: 0,
        ctr: 0,
        cpc: 0,
        impressions: 0,
        clicks: 0,
      });
    }
  }

  return {
    success: true as const,
    connected: true,
    currency: primaryCurrency,
    currencySymbol,
    ads: [...adsById.values()].sort((a, b) => b.spend - a.spend),
  };
}
