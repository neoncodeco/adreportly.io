import type { CampaignAdInsightRow, CampaignAdRow } from "@/services/facebook";

const PURCHASE_ACTIONS = new Set([
  "omni_purchase",
  "offsite_conversion.fb_pixel_purchase",
  "purchase",
  "onsite_conversion.purchase",
]);

function num(s: string | undefined): number {
  return parseFloat(s ?? "0") || 0;
}

function int(s: string | undefined): number {
  return parseInt(s ?? "0", 10) || 0;
}

/** Meta stores balance, spend_cap, amount_spent, adset budgets in minor units for many currencies. */
export function minorToMajor(value: string | undefined): number {
  const n = parseFloat(value ?? "0") || 0;
  return n / 100;
}

export function countResultsFromInsight(row: CampaignAdInsightRow | undefined): number {
  if (!row) return 0;
  const purchases = (row.actions ?? []).reduce((sum, a) => {
    if (!PURCHASE_ACTIONS.has(a.action_type)) return sum;
    return sum + (parseInt(a.value, 10) || 0);
  }, 0);
  if (purchases > 0) return purchases;
  return int(row.inline_link_clicks);
}

export function purchaseValueFromInsight(row: CampaignAdInsightRow | undefined): number {
  if (!row?.action_values?.length) return 0;
  return (row.action_values ?? []).reduce((sum, a) => {
    if (!PURCHASE_ACTIONS.has(a.action_type)) return sum;
    return sum + (parseFloat(a.value) || 0);
  }, 0);
}

export function roasFromInsight(row: CampaignAdInsightRow | undefined): number | null {
  const pr = row?.purchase_roas?.[0]?.value;
  if (pr != null) {
    const v = parseFloat(pr);
    if (!Number.isNaN(v)) return v;
  }
  const spend = num(row?.spend);
  const val = purchaseValueFromInsight(row);
  if (spend > 0 && val > 0) return val / spend;
  return null;
}

export function costPerResultFromInsight(row: CampaignAdInsightRow | undefined): number | null {
  const cpa = row?.cost_per_action_type ?? [];
  const best =
    cpa.find((x) => PURCHASE_ACTIONS.has(x.action_type)) ??
    cpa.find((x) => x.action_type === "link_click");
  if (best?.value) {
    const v = parseFloat(best.value);
    if (!Number.isNaN(v) && v > 0) return v;
  }
  const spend = num(row?.spend);
  const res = countResultsFromInsight(row);
  if (spend > 0 && res > 0) return spend / res;
  return null;
}

export type AdPerformanceNormalized = {
  id: string;
  name: string;
  status: string;
  dailyBudget: number | null;
  endDate: string | null;
  spend: number;
  impressions: number;
  reach: number;
  ctr: number;
  resultRate: number | null;
  results: number;
  costPerResult: number | null;
  resultValue: number;
  roas: number | null;
  spendPct: number;
};

export function normalizeAdPerformanceRows(ads: CampaignAdRow[]): AdPerformanceNormalized[] {
  const parsed = ads.map((ad) => {
    const ins = ad.insights?.data?.[0];
    const spend = num(ins?.spend);
    const impressions = int(ins?.impressions);
    const reach = int(ins?.reach);
    const ctr = num(ins?.ctr);
    const results = countResultsFromInsight(ins);
    const resultRate = impressions > 0 ? (results / impressions) * 100 : null;
    const costPerResult = costPerResultFromInsight(ins);
    const resultValue = purchaseValueFromInsight(ins);
    const roas = roasFromInsight(ins);
    const dailyBudgetRaw = ad.adset?.daily_budget;
    const dailyBudget =
      dailyBudgetRaw != null && dailyBudgetRaw !== "0" ? minorToMajor(dailyBudgetRaw) : null;
    const endRaw = ad.adset?.end_time;
    let endDate: string | null = null;
    if (endRaw) {
      const d = new Date(endRaw);
      endDate = Number.isNaN(d.getTime())
        ? endRaw
        : d.toLocaleDateString("en-US", { dateStyle: "medium" });
    }
    return {
      id: ad.id,
      name: ad.name ?? ad.id,
      status: ad.effective_status ?? ad.status ?? "—",
      dailyBudget,
      endDate,
      spend,
      impressions,
      reach,
      ctr,
      resultRate,
      results,
      costPerResult,
      resultValue,
      roas,
    };
  });
  const totalSpend = parsed.reduce((s, r) => s + r.spend, 0);
  return parsed.map((r) => ({
    ...r,
    spendPct: totalSpend > 0 ? (r.spend / totalSpend) * 100 : 0,
  }));
}

export type FinancialSummaryPayload = {
  currency: string;
  totalDeposit: number | null;
  totalSpend: number;
  remainingBalance: number | null;
  noBalance: boolean;
  impressions: number;
  reach: number;
  results: number;
  costPerResult: number | null;
};
