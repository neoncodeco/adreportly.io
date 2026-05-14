import { NextResponse } from "next/server";
import {
  creativePreviewUrlFromAd,
  countResultsFromInsight,
  costPerResultFromInsight,
  minorToMajor,
  normalizeAdPerformanceRows,
  type FinancialSummaryPayload,
} from "@/lib/facebook/client-report-normalize";
import { getShareByToken } from "@/lib/share-service";
import { getDecryptedTokenForAgency } from "@/lib/agency-service";
import {
  fetchAdAccountBilling,
  fetchAdsForCampaign,
  fetchCampaignById,
  fetchCampaignInsights,
  fetchPageProfilePicture,
  type CampaignAdInsightRow,
} from "@/services/facebook";

const ALLOWED_DATE_PRESETS = new Set([
  "today",
  "last_2d",
  "last_7d",
  "last_14d",
  "last_28d",
  "last_30d",
  "last_90d",
  "this_month",
  "lifetime",
]);

function insightNum(row: unknown, key: string): number {
  const v = (row as Record<string, unknown>)?.[key];
  return typeof v === "string" ? parseFloat(v) || 0 : 0;
}

function insightInt(row: unknown, key: string): number {
  const v = (row as Record<string, unknown>)?.[key];
  return typeof v === "string" ? parseInt(v, 10) || 0 : 0;
}

/** Period rollup for billing summary (do not sum daily reach — use one Meta row). */
function financialTotalsFromRollup(rollupRow: unknown | null, dailyFallback: unknown[]) {
  if (rollupRow && typeof rollupRow === "object") {
    const spend = insightNum(rollupRow, "spend");
    const impressions = insightInt(rollupRow, "impressions");
    const reach = insightInt(rollupRow, "reach");
    const results = countResultsFromInsight(rollupRow as CampaignAdInsightRow);
    let costPerResult = results > 0 && spend > 0 ? spend / results : null;
    if (costPerResult == null) {
      costPerResult = costPerResultFromInsight(rollupRow as CampaignAdInsightRow);
    }
    return { spend, impressions, reach, results, costPerResult };
  }
  let spend = 0;
  let impressions = 0;
  let results = 0;
  for (const row of dailyFallback) {
    spend += insightNum(row, "spend");
    impressions += insightInt(row, "impressions");
    results += countResultsFromInsight(row as CampaignAdInsightRow);
  }
  const reach =
    dailyFallback.length > 0 ? Math.max(...dailyFallback.map((r) => insightInt(r, "reach"))) : 0;
  const costPerResult = results > 0 && spend > 0 ? spend / results : null;
  return { spend, impressions, reach, results, costPerResult };
}

export async function GET(request: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const { searchParams } = new URL(request.url);
  const datePresetRaw = searchParams.get("datePreset") ?? "lifetime";
  const datePreset = ALLOWED_DATE_PRESETS.has(datePresetRaw) ? datePresetRaw : "lifetime";

  const share = await getShareByToken(token);
  if (!share || share.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ success: false, error: "Invalid or expired link" }, { status: 404 });
  }

  const access = await getDecryptedTokenForAgency(share.agencyId);
  if (!access) {
    return NextResponse.json({
      success: true,
      datePreset,
      campaign: {
        id: share.campaignId,
        name: "Campaign",
        objective: "",
        status: "",
      },
      pageLogoUrl: null,
      insights: [] as unknown[],
      financial: null,
      ads: [],
      clientEmail: share.clientEmail,
      clientName: share.clientName,
      demo: true as const,
    });
  }

  try {
    const campaign = await fetchCampaignById(access, share.campaignId);
    const isLifetime = datePreset === "lifetime";
    const since =
      (campaign.start_time ?? campaign.created_time ?? "").slice(0, 10) ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const until = new Date().toISOString().slice(0, 10);
    let insights = await fetchCampaignInsights(access, share.campaignId, {
      ...(isLifetime ? { timeRange: { since, until } } : { datePreset }),
      timeIncrement: "1",
    });
    if (!insights.data?.length) {
      insights = await fetchCampaignInsights(access, share.campaignId, {
        ...(isLifetime ? { timeRange: { since, until } } : { datePreset }),
      });
    }
    const insightRows = insights.data ?? [];

    const rollupRes = await fetchCampaignInsights(access, share.campaignId, {
      ...(isLifetime ? { timeRange: { since, until } } : { datePreset }),
    });
    const rollupRow = rollupRes.data?.[0] ?? null;
    const finTotals = financialTotalsFromRollup(rollupRow, insightRows);

    const accountId = campaign.account_id;
    let billing = null as Awaited<ReturnType<typeof fetchAdAccountBilling>>;
    if (accountId) {
      billing = await fetchAdAccountBilling(access, accountId);
    }

    const currency = billing?.currency ?? "USD";
    const spendCapMajor =
      billing?.spend_cap && parseFloat(billing.spend_cap) > 0
        ? minorToMajor(billing.spend_cap)
        : null;
    const balanceMajor = billing?.balance != null ? minorToMajor(billing.balance) : null;

    const financial: FinancialSummaryPayload = {
      currency,
      totalDeposit: spendCapMajor && spendCapMajor > 0 ? spendCapMajor : null,
      totalSpend: finTotals.spend,
      remainingBalance: balanceMajor,
      noBalance: balanceMajor !== null && balanceMajor <= 0,
      impressions: finTotals.impressions,
      reach: finTotals.reach,
      results: finTotals.results,
      costPerResult: finTotals.costPerResult,
    };

    let adsPayload: ReturnType<typeof normalizeAdPerformanceRows> = [];
    let campaignPreviewUrl: string | null = null;
    let pageLogoUrl: string | null = null;
    if (accountId) {
      const rawAds = await fetchAdsForCampaign(access, accountId, share.campaignId, datePreset);
      campaignPreviewUrl = rawAds.map(creativePreviewUrlFromAd).find(Boolean) ?? null;
      const pageId =
        rawAds.find((a) => a.creative?.object_story_spec?.page_id)?.creative?.object_story_spec
          ?.page_id ?? null;
      if (pageId) {
        pageLogoUrl = await fetchPageProfilePicture(access, pageId);
      }
      adsPayload = normalizeAdPerformanceRows(rawAds);
    }

    return NextResponse.json({
      success: true,
      datePreset,
      campaignPreviewUrl,
      pageLogoUrl,
      campaign: {
        id: campaign.id,
        name: campaign.name ?? share.campaignId,
        objective: campaign.objective ?? "",
        status: campaign.effective_status ?? campaign.status ?? "",
      },
      insights: insightRows,
      financial,
      ads: adsPayload,
      clientEmail: share.clientEmail,
      clientName: share.clientName,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upstream error";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
