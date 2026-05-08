import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { metaAccessContext } from "@/lib/agency-from-request";
import { resolvePlanForUsage } from "@/lib/billing/usage";
import { getDecryptedTokenForAgency } from "@/lib/agency-service";
import { getOrSetCache, USER_CACHE_HEADERS } from "@/lib/server-cache";
import {
  fetchAdAccounts,
  fetchAdAccountDailyInsights,
  fetchAdAccountAggregateInsights,
  fetchCampaignLevelInsights,
  fetchCampaignStatuses,
} from "@/services/facebook";

const PURCHASE_ACTION_TYPES = new Set([
  "omni_purchase",
  "offsite_conversion.fb_pixel_purchase",
  "purchase",
  "onsite_conversion.purchase",
]);

function conversionsFromActions(actions?: Array<{ action_type: string; value: string }>) {
  if (!actions?.length) return 0;
  let n = 0;
  for (const a of actions) {
    if (PURCHASE_ACTION_TYPES.has(a.action_type)) {
      n += parseInt(a.value, 10) || 0;
    }
  }
  return n;
}

function purchaseValueFromActionValues(
  actionValues?: Array<{ action_type: string; value: string }>,
) {
  if (!actionValues?.length) return 0;
  let v = 0;
  for (const a of actionValues) {
    if (PURCHASE_ACTION_TYPES.has(a.action_type)) {
      v += parseFloat(a.value) || 0;
    }
  }
  return v;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
  }
  const one = (parts[0] ?? name).replace(/[^a-zA-Z0-9]/g, "");
  return one.slice(0, 2).toUpperCase() || "?";
}

function mapCampaignStatus(s: string): "active" | "paused" | "completed" | "other" {
  const u = s.toUpperCase();
  if (u === "ACTIVE") return "active";
  if (u === "PAUSED" || u === "ADSET_PAUSED" || u === "CAMPAIGN_PAUSED") return "paused";
  if (u === "ARCHIVED" || u === "DELETED") return "completed";
  return "other";
}

function mergeDailySeries(
  seriesList: Array<Array<{ date_start: string; spend?: string; clicks?: string }>>,
) {
  const map = new Map<string, { spend: number; clicks: number }>();
  for (const series of seriesList) {
    for (const r of series) {
      const key = r.date_start;
      const row = map.get(key) ?? { spend: 0, clicks: 0 };
      row.spend += parseFloat(r.spend ?? "0") || 0;
      row.clicks += parseInt(r.clicks ?? "0", 10) || 0;
      map.set(key, row);
    }
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date_start, v]) => ({
      date: date_start,
      label: new Date(date_start + "T12:00:00Z").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      spend: Math.round(v.spend),
      results: Math.round(v.clicks),
    }));
}

function currencySymbolFor(code: string | undefined): string {
  if (!code) return "৳";
  const c = code.toUpperCase();
  if (c === "USD") return "$";
  if (c === "EUR") return "€";
  if (c === "BDT") return "৳";
  return `${c} `;
}

const TOP_COLORS = ["primary", "dark", "muted"] as const;

export async function GET(req: NextRequest) {
  const { agencyId, isAuthenticated } = await metaAccessContext(req);
  const session = await auth();

  const emptyPayload = (connected: boolean, currency = "BDT", currencySymbol = "৳") =>
    NextResponse.json({
      success: true,
      connected,
      currency,
      currencySymbol,
      spendTrend: [] as Array<{ date: string; label: string; spend: number; results: number }>,
      topCampaigns: [] as Array<{
        id: string;
        code: string;
        name: string;
        spend: number;
        color: (typeof TOP_COLORS)[number];
      }>,
      recentCampaigns: [] as Array<{
        id: string;
        code: string;
        name: string;
        accounts: number;
        spend: number;
        results: number;
        roas: number;
        status: "active" | "paused" | "completed" | "other";
        ctr: number;
        cpc: number;
        impressions: number;
        clicks: number;
      }>,
      campaigns: [] as Array<{
        id: string;
        code: string;
        name: string;
        accounts: number;
        spend: number;
        results: number;
        roas: number;
        status: "active" | "paused" | "completed" | "other";
        ctr: number;
        cpc: number;
        impressions: number;
        clicks: number;
      }>,
      kpis: {
        totalSpend: 0,
        conversions: 0,
        avgRoas: "0×",
        avgCpc: `${currencySymbol}0.00`,
      },
    });

  if (!isAuthenticated) {
    return NextResponse.json({ success: false, error: "Sign in required." }, { status: 401 });
  }

  if (!agencyId) {
    return emptyPayload(false);
  }

  try {
    const plan = await resolvePlanForUsage({ userId: session?.user?.id ?? null, agencyId });
    const payload = await getOrSetCache(`user:dashboard-overview:${agencyId}`, 20_000, async () => {
      const token = await getDecryptedTokenForAgency(agencyId);
      if (!token) {
        return {
          success: true,
          connected: false,
          currency: "BDT",
          currencySymbol: "৳",
          spendTrend: [] as Array<{ date: string; label: string; spend: number; results: number }>,
          topCampaigns: [] as Array<{
            id: string;
            code: string;
            name: string;
            spend: number;
            color: (typeof TOP_COLORS)[number];
          }>,
          recentCampaigns: [] as Array<{
            id: string;
            code: string;
            name: string;
            accounts: number;
            spend: number;
            results: number;
            roas: number;
            status: "active" | "paused" | "completed" | "other";
            ctr: number;
            cpc: number;
            impressions: number;
            clicks: number;
          }>,
          campaigns: [] as Array<{
            id: string;
            code: string;
            name: string;
            accounts: number;
            spend: number;
            results: number;
            roas: number;
            status: "active" | "paused" | "completed" | "other";
            ctr: number;
            cpc: number;
            impressions: number;
            clicks: number;
          }>,
          kpis: {
            totalSpend: 0,
            conversions: 0,
            avgRoas: "0×",
            avgCpc: "৳0.00",
          },
        };
      }

      let adAccounts: Array<{
        id: string;
        name: string;
        currency: string;
        account_status: number;
      }> = [];
      const acc = await fetchAdAccounts(token);
      adAccounts = acc.data ?? [];
      if (plan.limits.adAccounts !== null) {
        adAccounts = adAccounts.slice(0, plan.limits.adAccounts);
      }

      const primaryCurrency = adAccounts[0]?.currency ?? "BDT";
      const currencySymbol = currencySymbolFor(primaryCurrency);

      if (adAccounts.length === 0) {
        return {
          success: true,
          connected: true,
          currency: primaryCurrency,
          currencySymbol,
          spendTrend: [],
          topCampaigns: [],
          recentCampaigns: [],
          campaigns: [],
          kpis: {
            totalSpend: 0,
            conversions: 0,
            avgRoas: "0×",
            avgCpc: `${currencySymbol}0.00`,
          },
        };
      }

      const dailyChunks: Array<Array<{ date_start: string; spend?: string; clicks?: string }>> = [];
      let totalSpend = 0;
      let totalConversions = 0;
      let totalPurchaseValue = 0;
      let totalClicks = 0;

      type CampAgg = {
        id: string;
        name: string;
        spend: number;
        clicks: number;
        impressions: number;
        conv: number;
        purchaseValue: number;
        effectiveStatus: string;
      };
      const campaignById = new Map<string, CampAgg>();

      for (const act of adAccounts) {
        try {
          const [daily, aggregate, campInsights, statusMap] = await Promise.all([
            fetchAdAccountDailyInsights(token, act.id),
            fetchAdAccountAggregateInsights(token, act.id),
            fetchCampaignLevelInsights(token, act.id),
            fetchCampaignStatuses(token, act.id),
          ]);

          if (daily.length) dailyChunks.push(daily);

          if (aggregate) {
            totalSpend += parseFloat(aggregate.spend ?? "0") || 0;
            totalConversions += conversionsFromActions(aggregate.actions);
            totalPurchaseValue += purchaseValueFromActionValues(aggregate.action_values);
            totalClicks += parseInt(aggregate.clicks ?? "0", 10) || 0;
          }

          for (const row of campInsights) {
            const cid = row.campaign_id ?? "";
            if (!cid) continue;
            const spend = parseFloat(row.spend ?? "0") || 0;
            const clicks = parseInt(row.clicks ?? "0", 10) || 0;
            const impressions = parseInt(row.impressions ?? "0", 10) || 0;
            const conv = conversionsFromActions(row.actions);
            const pval = purchaseValueFromActionValues(row.action_values);
            const eff = statusMap.get(cid) ?? "";
            const prev = campaignById.get(cid);
            if (prev) {
              prev.spend += spend;
              prev.clicks += clicks;
              prev.impressions += impressions;
              prev.conv += conv;
              prev.purchaseValue += pval;
              if (!prev.effectiveStatus && eff) prev.effectiveStatus = eff;
            } else {
              campaignById.set(cid, {
                id: cid,
                name: row.campaign_name ?? "Campaign",
                spend,
                clicks,
                impressions,
                conv,
                purchaseValue: pval,
                effectiveStatus: eff,
              });
            }
          }
        } catch {
          // Skip accounts that fail (permissions, rate limits) so others still render.
        }
      }

      const spendTrend = mergeDailySeries(dailyChunks);
      const sortedCampaigns = [...campaignById.values()].sort((a, b) => b.spend - a.spend);
      const adAccountCount = adAccounts.length;

      const topCampaigns = sortedCampaigns.slice(0, 5).map((c, i) => ({
        id: c.id,
        code: initialsFromName(c.name),
        name: c.name,
        spend: c.spend,
        color: TOP_COLORS[i % TOP_COLORS.length],
      }));

      const toCampaignRow = (c: CampAgg) => {
        const roas = c.spend > 0 && c.purchaseValue > 0 ? c.purchaseValue / c.spend : 0;
        const status = c.effectiveStatus
          ? mapCampaignStatus(c.effectiveStatus)
          : c.spend > 0
            ? ("active" as const)
            : ("paused" as const);
        const ctr = c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0;
        const cpc = c.clicks > 0 ? c.spend / c.clicks : 0;
        return {
          id: c.id,
          code: initialsFromName(c.name),
          name: c.name,
          accounts: adAccountCount,
          spend: c.spend,
          results: c.conv > 0 ? c.conv : c.clicks,
          roas,
          status,
          ctr,
          cpc,
          impressions: c.impressions,
          clicks: c.clicks,
        };
      };

      const cappedCampaigns =
        plan.limits.campaigns === null
          ? sortedCampaigns
          : sortedCampaigns.slice(0, plan.limits.campaigns);
      const recentCampaigns = cappedCampaigns.slice(0, 8).map(toCampaignRow);
      const campaigns = cappedCampaigns.map(toCampaignRow);

      const avgRoas =
        totalSpend > 0 && totalPurchaseValue > 0
          ? `${(totalPurchaseValue / totalSpend).toFixed(2)}×`
          : "—";
      const avgCpc =
        totalClicks > 0 && totalSpend > 0
          ? `${currencySymbol}${(totalSpend / totalClicks).toFixed(2)}`
          : "—";

      return {
        success: true,
        connected: true,
        currency: primaryCurrency,
        currencySymbol,
        spendTrend,
        topCampaigns,
        recentCampaigns,
        campaigns,
        kpis: {
          totalSpend,
          conversions: totalConversions,
          avgRoas,
          avgCpc,
        },
      };
    });

    return NextResponse.json(payload, { headers: USER_CACHE_HEADERS });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Facebook API error";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
