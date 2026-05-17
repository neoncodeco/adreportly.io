import type { CampaignAdInsightRow, CampaignAdRow } from "@/services/facebook";

const PURCHASE_ACTIONS = new Set([
  "omni_purchase",
  "offsite_conversion.fb_pixel_purchase",
  "purchase",
  "onsite_conversion.purchase",
]);

const MESSAGE_ACTIONS = new Set([
  "messaging_conversation_started_7d",
  "onsite_conversion.messaging_conversation_started_7d",
  "onsite_conversion.messaging_first_reply",
  "onsite_conversion.messaging_conversation_replied_7d",
]);

const LEAD_ACTIONS = new Set([
  "lead",
  "leadgen_grouped",
  "onsite_conversion.lead",
  "onsite_conversion.lead_grouped",
  "onsite_conversion.leadgen_grouped",
  "offsite_conversion.fb_pixel_lead",
  "complete_registration",
  "offsite_conversion.fb_pixel_complete_registration",
  "contact_total",
  "onsite_conversion.contact",
]);

const RESULT_ACTION_PRIORITY = [PURCHASE_ACTIONS, MESSAGE_ACTIONS, LEAD_ACTIONS];

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
  for (const actionTypes of RESULT_ACTION_PRIORITY) {
    const total = (row.actions ?? []).reduce((sum, a) => {
      if (!actionTypes.has(a.action_type)) return sum;
      return sum + (parseInt(a.value, 10) || 0);
    }, 0);
    if (total > 0) return total;
  }
  return int(row.inline_link_clicks) || int(row.clicks);
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
    RESULT_ACTION_PRIORITY.flatMap((types) => cpa.filter((x) => types.has(x.action_type))).find(
      Boolean,
    ) ?? cpa.find((x) => x.action_type === "link_click");
  if (best?.value) {
    const v = parseFloat(best.value);
    if (!Number.isNaN(v) && v > 0) return v;
  }
  const spend = num(row?.spend);
  const res = countResultsFromInsight(row);
  if (spend > 0 && res > 0) return spend / res;
  return null;
}

export function creativePreviewUrlFromAd(ad: CampaignAdRow): string | null {
  const spec = ad.creative?.object_story_spec;
  return (
    ad.creative?.image_url ??
    spec?.link_data?.child_attachments?.find((item) => item.picture)?.picture ??
    spec?.link_data?.picture ??
    ad.creative?.thumbnail_url ??
    null
  );
}

export type AdPerformanceNormalized = {
  id: string;
  name: string;
  status: string;
  previewUrl: string | null;
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
      previewUrl: creativePreviewUrlFromAd(ad),
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
  dollarRateBdt: number | null;
  totalSpend: number;
  remainingBalance: number | null;
  noBalance: boolean;
  impressions: number;
  reach: number;
  results: number;
  costPerResult: number | null;
};
