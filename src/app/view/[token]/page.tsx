"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Zap,
  TrendingUp,
  Eye,
  MousePointerClick,
  DollarSign,
  Users,
  Target,
  BarChart2,
  Activity,
  ArrowUpRight,
  Filter,
  Wallet,
  PiggyBank,
  ChevronDown,
  LayoutGrid,
  User,
  Mail,
  Crosshair,
  RefreshCw,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type ActionRow = { action_type: string; value: string };

type InsightRow = {
  date_start?: string;
  date_stop?: string;
  spend?: string;
  clicks?: string;
  impressions?: string;
  reach?: string;
  cpc?: string;
  ctr?: string;
  frequency?: string;
  actions?: ActionRow[];
};

type FinancialPayload = {
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

type AdPerfRow = {
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

type ApiPayload = {
  success: boolean;
  error?: string;
  datePreset?: string;
  campaign?: { id: string; name: string; objective: string; status: string };
  campaignPreviewUrl?: string | null;
  insights?: InsightRow[];
  financial?: FinancialPayload | null;
  ads?: AdPerfRow[];
  clientEmail?: string;
  clientName?: string;
  demo?: boolean;
};

const DATE_PRESET_LABELS: Record<string, string> = {
  last_7d: "Last 7 days",
  last_14d: "Last 14 days",
  last_28d: "Last 28 days",
  last_30d: "Last 30 days",
  last_90d: "Last 90 days",
  this_month: "This month",
  lifetime: "Lifetime",
};

type BillingCardKey =
  | "deposit"
  | "spend"
  | "balance"
  | "noBalance"
  | "impressions"
  | "reach"
  | "results"
  | "costPerResult";

type EngagementCardKey = "clicks" | "ctr" | "cpc" | "conversions" | "frequency";

type CardVisibility = {
  billing: Record<BillingCardKey, boolean>;
  engagement: Record<EngagementCardKey, boolean>;
};

const DEFAULT_CARD_VISIBILITY: CardVisibility = {
  billing: {
    deposit: true,
    spend: true,
    balance: true,
    noBalance: true,
    impressions: true,
    reach: true,
    results: true,
    costPerResult: true,
  },
  engagement: {
    clicks: true,
    ctr: true,
    cpc: true,
    conversions: true,
    frequency: true,
  },
};

const BILLING_CARD_LABELS: Record<BillingCardKey, string> = {
  deposit: "Deposit / cap",
  spend: "Total spend",
  balance: "Remaining balance",
  noBalance: "No balance flag",
  impressions: "Impressions",
  reach: "Reach",
  results: "Results",
  costPerResult: "Cost / result",
};

const ENGAGEMENT_CARD_LABELS: Record<EngagementCardKey, string> = {
  clicks: "Clicks",
  ctr: "CTR",
  cpc: "Avg CPC",
  conversions: "Conversions",
  frequency: "Frequency",
};

/** Client-side cache + background refetch cadence for shared reports */
const SHARED_CAMPAIGN_CACHE_MS = 5 * 60 * 1000;

function cardVisibilityStorageKey(token: string) {
  return `adreportly-client-view-cards:${token}`;
}

function mergeCardVisibility(raw: unknown): CardVisibility {
  const next: CardVisibility = {
    billing: { ...DEFAULT_CARD_VISIBILITY.billing },
    engagement: { ...DEFAULT_CARD_VISIBILITY.engagement },
  };
  if (!raw || typeof raw !== "object") return next;
  const o = raw as Record<string, unknown>;
  if (o.billing && typeof o.billing === "object") {
    for (const k of Object.keys(DEFAULT_CARD_VISIBILITY.billing) as BillingCardKey[]) {
      if (typeof (o.billing as Record<string, unknown>)[k] === "boolean") {
        next.billing[k] = (o.billing as Record<string, boolean>)[k];
      }
    }
  }
  if (o.engagement && typeof o.engagement === "object") {
    for (const k of Object.keys(DEFAULT_CARD_VISIBILITY.engagement) as EngagementCardKey[]) {
      if (typeof (o.engagement as Record<string, unknown>)[k] === "boolean") {
        next.engagement[k] = (o.engagement as Record<string, boolean>)[k];
      }
    }
  }
  return next;
}

const PURCHASE_TYPES = new Set([
  "omni_purchase",
  "offsite_conversion.fb_pixel_purchase",
  "purchase",
  "onsite_conversion.purchase",
]);

function conversionsFromActions(actions?: ActionRow[]) {
  if (!actions?.length) return 0;
  return actions
    .filter((a) => PURCHASE_TYPES.has(a.action_type))
    .reduce((s, a) => s + (parseInt(a.value, 10) || 0), 0);
}

function num(v: string | undefined) {
  return parseFloat(v ?? "0") || 0;
}
function int(v: string | undefined) {
  return parseInt(v ?? "0", 10) || 0;
}

function fmtMoney(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(2);
}
function fmtCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function fmtMoneyCurrency(n: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.length === 3 ? currency : "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

function insightsToChart(rows: InsightRow[]) {
  if (!rows?.length) return [];
  return rows
    .filter((r) => r.date_start)
    .map((r) => ({
      label: new Date(`${r.date_start as string}T12:00:00Z`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      spend: Math.round(num(r.spend)),
      clicks: int(r.clicks),
      impressions: Math.round(int(r.impressions) / 1000),
      reach: Math.round(int(r.reach) / 1000),
    }));
}

function aggregateToChart(rows: InsightRow[]) {
  if (rows.length !== 1 || rows[0]?.date_start) return null;
  const r = rows[0];
  return [
    {
      label: "Period",
      spend: Math.round(num(r.spend)),
      clicks: int(r.clicks),
      impressions: Math.round(int(r.impressions) / 1000),
      reach: Math.round(int(r.reach) / 1000),
    },
  ];
}

function statusColor(status: string) {
  const s = status.toUpperCase();
  if (s === "ACTIVE") return "bg-emerald-500/15 text-emerald-600";
  if (s === "PAUSED") return "bg-amber-500/15 text-amber-600";
  return "bg-muted text-muted-foreground";
}

/** Meta objectives like OUTCOME_ENGAGEMENT → readable label */
function formatCampaignObjective(raw: string) {
  const t = raw
    .replace(/^OUTCOME_/i, "")
    .replace(/_/g, " ")
    .trim();
  if (!t) return raw;
  return t.replace(/\w+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

type KpiCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
  delay?: number;
};

function KpiCard({ icon, label, value, sub, color, delay = 0 }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="relative min-w-0 overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-soft sm:p-4"
    >
      <div
        className={`absolute -right-6 -top-6 h-20 w-20 rounded-full ${color} opacity-10 blur-2xl`}
      />
      <div className="flex items-start justify-between gap-2">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9 sm:rounded-xl ${color} bg-opacity-15`}
        >
          {icon}
        </div>
        <ArrowUpRight className="hidden h-4 w-4 shrink-0 text-muted-foreground/40 sm:block" />
      </div>
      <div className="mt-2 sm:mt-3">
        <div className="break-words text-lg font-bold leading-tight tracking-tight sm:text-2xl">
          {value}
        </div>
        <div className="mt-0.5 text-[10px] font-medium leading-snug text-muted-foreground sm:text-xs">
          {label}
        </div>
        {sub ? (
          <div className="mt-1 text-[10px] leading-snug text-muted-foreground/70 sm:text-[11px]">
            {sub}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

async function fetchSharedCampaign(token: string, preset: string, signal?: AbortSignal) {
  const qs = new URLSearchParams({ datePreset: preset });
  const res = await fetch(`/api/shared-campaign/${token}?${qs}`, {
    cache: "no-store",
    signal,
  });
  return (await res.json()) as ApiPayload;
}

export default function SharedCampaignPage() {
  const routeParams = useParams();
  const tokenParam = typeof routeParams?.token === "string" ? routeParams.token : "";
  const [datePreset, setDatePreset] = useState("last_30d");
  const [cardVisibility, setCardVisibility] = useState<CardVisibility>(DEFAULT_CARD_VISIBILITY);
  const [metricPickerOpen, setMetricPickerOpen] = useState(false);
  const cardPrefsHydrated = useRef(false);

  useLayoutEffect(() => {
    cardPrefsHydrated.current = false;
    if (!tokenParam) {
      cardPrefsHydrated.current = true;
      return;
    }
    try {
      const raw = localStorage.getItem(cardVisibilityStorageKey(tokenParam));
      if (raw) setCardVisibility(mergeCardVisibility(JSON.parse(raw) as unknown));
    } catch {
      /* ignore */
    }
    cardPrefsHydrated.current = true;
  }, [tokenParam]);

  useEffect(() => {
    if (!tokenParam || !cardPrefsHydrated.current) return;
    try {
      localStorage.setItem(cardVisibilityStorageKey(tokenParam), JSON.stringify(cardVisibility));
    } catch {
      /* ignore */
    }
  }, [cardVisibility, tokenParam]);

  const {
    data: payload,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["shared-campaign", tokenParam, datePreset],
    queryFn: async ({ signal }) => {
      try {
        return await fetchSharedCampaign(tokenParam, datePreset, signal);
      } catch {
        return { success: false, error: "Network error" } as ApiPayload;
      }
    },
    enabled: tokenParam.length > 0,
    staleTime: SHARED_CAMPAIGN_CACHE_MS,
    gcTime: 30 * 60 * 1000,
    refetchInterval: SHARED_CAMPAIGN_CACHE_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const loading = Boolean(tokenParam && isLoading);
  const isBackgroundRefresh = Boolean(tokenParam && isFetching && !isLoading);

  const title = payload?.campaign?.name ?? "Shared campaign";
  const rangeLabel =
    DATE_PRESET_LABELS[payload?.datePreset ?? datePreset] ?? DATE_PRESET_LABELS.last_30d;
  const fin = payload?.financial;
  const finCurrency = fin?.currency ?? "USD";
  const clientNameTrimmed = payload?.clientName?.trim() ?? "";
  const clientEmailRaw = payload?.clientEmail?.trim() ?? "";
  const clientDisplayPrimary = clientNameTrimmed || (clientEmailRaw ? clientEmailRaw : "");

  const { chartData, kpis, tableRows } = useMemo(() => {
    const rows = payload?.insights ?? [];
    const finSnap = payload?.financial;
    const daily = insightsToChart(rows);
    const chart = daily.length ? daily : (aggregateToChart(rows) ?? []);

    const totalSpend = rows.reduce((s, r) => s + num(r.spend), 0);
    const totalImpressions = rows.reduce((s, r) => s + int(r.impressions), 0);
    const totalReach = rows.reduce((s, r) => s + int(r.reach), 0);
    const totalClicks = rows.reduce((s, r) => s + int(r.clicks), 0);
    const totalConversions = rows.reduce((s, r) => s + conversionsFromActions(r.actions), 0);
    const impForRates = finSnap && finSnap.impressions > 0 ? finSnap.impressions : totalImpressions;
    const spendForCpc = finSnap ? finSnap.totalSpend : totalSpend;
    const reachForFreq = finSnap && finSnap.reach > 0 ? finSnap.reach : totalReach;
    const impForFreq = finSnap && finSnap.impressions > 0 ? finSnap.impressions : totalImpressions;
    const avgCtr = impForRates > 0 ? (totalClicks / impForRates) * 100 : 0;
    const avgCpc = totalClicks > 0 ? spendForCpc / totalClicks : 0;
    const avgFreq = reachForFreq > 0 ? impForFreq / reachForFreq : 0;

    const table = rows
      .filter((r) => r.date_start)
      .map((r) => ({
        date: r.date_start ?? "",
        spend: num(r.spend),
        impressions: int(r.impressions),
        reach: int(r.reach),
        clicks: int(r.clicks),
        ctr: num(r.ctr),
        cpc: num(r.cpc),
        conversions: conversionsFromActions(r.actions),
      }));

    return {
      chartData: chart,
      kpis: {
        totalSpend,
        totalImpressions,
        totalReach,
        totalClicks,
        totalConversions,
        avgCtr,
        avgCpc,
        avgFreq,
      },
      tableRows: table,
    };
  }, [payload?.insights, payload?.financial]);

  const errorMsg = isError
    ? error instanceof Error
      ? error.message
      : "Something went wrong"
    : payload?.success === false
      ? payload.error
      : null;

  const billingAnyVisible = useMemo(
    () => Object.values(cardVisibility.billing).some(Boolean),
    [cardVisibility],
  );
  const engagementAnyVisible = useMemo(
    () => Object.values(cardVisibility.engagement).some(Boolean),
    [cardVisibility],
  );

  const setBillingCard = (key: BillingCardKey, checked: boolean) => {
    setCardVisibility((prev) => ({
      ...prev,
      billing: { ...prev.billing, [key]: checked },
    }));
  };

  const setEngagementCard = (key: EngagementCardKey, checked: boolean) => {
    setCardVisibility((prev) => ({
      ...prev,
      engagement: { ...prev.engagement, [key]: checked },
    }));
  };

  const chartXInterval =
    chartData.length > 14 ? Math.max(0, Math.ceil(chartData.length / 5) - 1) : 4;

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-soft px-3 py-6 sm:px-5 sm:py-10 md:px-6">
      <div className="mx-auto min-w-0 max-w-5xl space-y-5 sm:space-y-6">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/95 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-violet-500/[0.07] dark:from-primary/[0.12] dark:to-violet-500/[0.1]"
            aria-hidden
          />
          <div className="relative flex flex-col items-center gap-4 p-4 text-center sm:items-start sm:gap-5 sm:p-6 sm:text-left lg:flex-row lg:items-start lg:justify-between lg:gap-8">
            <div className="flex min-w-0 flex-col items-center gap-3 sm:flex-row sm:items-start sm:gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow ring-4 ring-primary/15 sm:h-16 sm:w-16">
                {payload?.campaignPreviewUrl ? (
                  // Use <img> (not next/image) since preview is a remote FB CDN URL.
                  <img
                    src={payload.campaignPreviewUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Zap className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={2.25} />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-2.5 sm:space-y-3">
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-start sm:gap-2">
                  {clientDisplayPrimary ? (
                    <span
                      className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary shadow-sm"
                      title={clientNameTrimmed || clientEmailRaw}
                    >
                      <User className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                      <span className="truncate">
                        {clientNameTrimmed ? clientNameTrimmed : clientEmailRaw}
                      </span>
                    </span>
                  ) : null}
                </div>
                <h1 className="text-balance break-words text-lg font-bold leading-snug tracking-tight text-foreground sm:text-xl sm:leading-tight md:text-2xl lg:text-[1.65rem] lg:leading-snug">
                  {title}
                </h1>
                <div className="flex flex-col gap-2.5 text-sm">
                  {payload?.campaign?.objective ? (
                    <div className="flex flex-wrap items-center justify-center gap-2 text-muted-foreground sm:justify-start">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground/80">
                        <Crosshair className="h-3.5 w-3.5" aria-hidden />
                        Objective
                      </span>
                      <span className="rounded-lg bg-background/70 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm ring-1 ring-border/60">
                        {formatCampaignObjective(payload.campaign.objective)}
                      </span>
                    </div>
                  ) : null}
                  {clientNameTrimmed && clientEmailRaw ? (
                    <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground sm:justify-start">
                      <Mail className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                      <span className="break-all">{clientEmailRaw}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="flex w-full shrink-0 flex-row flex-wrap items-center justify-center gap-2 border-t border-border/50 pt-3 sm:w-auto sm:justify-start sm:border-t-0 sm:pt-0 lg:flex-col lg:items-stretch lg:justify-start lg:gap-2.5">
              {payload?.campaign?.status ? (
                <span
                  className={`inline-flex items-center justify-center rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide shadow-sm ring-1 ring-black/5 ${statusColor(payload.campaign.status)}`}
                >
                  {payload.campaign.status}
                </span>
              ) : null}
              <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-4 py-2 text-xs font-semibold text-muted-foreground shadow-sm backdrop-blur-sm">
                {loading ? null : isBackgroundRefresh ? (
                  <RefreshCw
                    className="h-3.5 w-3.5 shrink-0 animate-spin text-primary"
                    aria-hidden
                  />
                ) : !payload?.demo ? (
                  <span className="relative flex h-2 w-2" aria-hidden>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                ) : null}
                {loading
                  ? "Loading…"
                  : payload?.demo
                    ? "Demo preview"
                    : isBackgroundRefresh
                      ? "Updating…"
                      : "Live metrics"}
              </div>
            </div>
          </div>
        </motion.div>

        {errorMsg ? (
          <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
            {errorMsg}
          </div>
        ) : null}

        {/* ── Date range + metric card picker ── */}
        {!loading && !errorMsg ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-border bg-card/80 px-3 py-3 shadow-soft sm:px-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-2 text-xs text-muted-foreground sm:items-center sm:text-sm">
                <Filter className="mt-0.5 h-4 w-4 shrink-0 text-foreground/70 sm:mt-0" />
                <span className="min-w-0 leading-relaxed">
                  Charts, tables, and totals follow the date range ({rangeLabel}). Choose which
                  summary cards appear below.
                </span>
              </div>
              <div className="flex w-full flex-col gap-1.5 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
                <Label
                  htmlFor="report-range"
                  className="text-xs text-muted-foreground sm:whitespace-nowrap"
                >
                  Date range
                </Label>
                <Select value={datePreset} onValueChange={setDatePreset}>
                  <SelectTrigger
                    id="report-range"
                    className="h-11 w-full min-h-[44px] rounded-xl sm:h-10 sm:min-h-0 sm:w-[200px]"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      [
                        "last_7d",
                        "last_14d",
                        "last_28d",
                        "last_30d",
                        "last_90d",
                        "this_month",
                        "lifetime",
                      ] as const
                    ).map((v) => (
                      <SelectItem key={v} value={v}>
                        {DATE_PRESET_LABELS[v]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Collapsible open={metricPickerOpen} onOpenChange={setMetricPickerOpen}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="mt-3 flex min-h-[44px] w-full items-center justify-between gap-2 border-t border-border py-2 pt-3 text-left text-sm font-medium text-foreground transition-colors hover:text-foreground/85 sm:min-h-0 sm:py-0"
                >
                  <span className="flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4 shrink-0 text-muted-foreground" />
                    Customize metric cards
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                      metricPickerOpen && "rotate-180",
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-1">
                <p className="pt-1 text-xs text-muted-foreground">
                  Turn metrics on or off for this report. Your choices are saved in this browser for
                  this link.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 rounded-xl border border-border/80 bg-muted/20 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Billing &amp; results
                    </p>
                    <div className="grid gap-2">
                      {(Object.keys(BILLING_CARD_LABELS) as BillingCardKey[]).map((key) => (
                        <div key={key} className="flex items-center gap-2">
                          <Checkbox
                            id={`bill-${key}`}
                            checked={cardVisibility.billing[key]}
                            onCheckedChange={(c) => setBillingCard(key, c === true)}
                          />
                          <Label
                            htmlFor={`bill-${key}`}
                            className="cursor-pointer text-xs font-normal leading-tight text-foreground"
                          >
                            {BILLING_CARD_LABELS[key]}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 rounded-xl border border-border/80 bg-muted/20 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Engagement
                    </p>
                    <div className="grid gap-2">
                      {(Object.keys(ENGAGEMENT_CARD_LABELS) as EngagementCardKey[]).map((key) => (
                        <div key={key} className="flex items-center gap-2">
                          <Checkbox
                            id={`eng-${key}`}
                            checked={cardVisibility.engagement[key]}
                            onCheckedChange={(c) => setEngagementCard(key, c === true)}
                          />
                          <Label
                            htmlFor={`eng-${key}`}
                            className="cursor-pointer text-xs font-normal leading-tight text-foreground"
                          >
                            {ENGAGEMENT_CARD_LABELS[key]}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg text-xs"
                    onClick={() => setCardVisibility(DEFAULT_CARD_VISIBILITY)}
                  >
                    Reset to default
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-lg text-xs"
                    onClick={() => setMetricPickerOpen(false)}
                  >
                    Done
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </motion.div>
        ) : null}

        {/* ── Billing & results summary ── */}
        {!loading && !errorMsg && fin ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-3"
          >
            <div>
              <h2 className="text-base font-bold sm:text-lg">Billing &amp; results summary</h2>
              <p className="text-xs text-muted-foreground">
                Ad account cap/balance (when Meta returns it) plus campaign totals for{" "}
                <span className="font-medium text-foreground/80">{rangeLabel}</span>.
              </p>
            </div>
            {billingAnyVisible ? (
              <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
                {cardVisibility.billing.deposit ? (
                  <KpiCard
                    delay={0.02}
                    icon={<PiggyBank className="h-4 w-4 text-sky-600" />}
                    label={`Total deposit / cap (${finCurrency})`}
                    value={
                      fin.totalDeposit != null && fin.totalDeposit > 0
                        ? fmtMoneyCurrency(fin.totalDeposit, finCurrency)
                        : "—"
                    }
                    sub="Account spend cap when set"
                    color="bg-sky-500"
                  />
                ) : null}
                {cardVisibility.billing.spend ? (
                  <KpiCard
                    delay={0.04}
                    icon={<DollarSign className="h-4 w-4 text-violet-600" />}
                    label="Total spend"
                    value={fmtMoneyCurrency(fin.totalSpend, finCurrency)}
                    sub="Campaign · selected range"
                    color="bg-violet-500"
                  />
                ) : null}
                {cardVisibility.billing.balance ? (
                  <KpiCard
                    delay={0.06}
                    icon={<Wallet className="h-4 w-4 text-emerald-600" />}
                    label="Remaining balance"
                    value={
                      fin.remainingBalance != null
                        ? fmtMoneyCurrency(fin.remainingBalance, finCurrency)
                        : "—"
                    }
                    sub="Ad account wallet"
                    color="bg-emerald-500"
                  />
                ) : null}
                {cardVisibility.billing.noBalance ? (
                  <KpiCard
                    delay={0.08}
                    icon={<Activity className="h-4 w-4 text-amber-600" />}
                    label="No balance"
                    value={fin.noBalance ? "Yes" : "No"}
                    sub="Zero wallet balance"
                    color="bg-amber-500"
                  />
                ) : null}
                {cardVisibility.billing.impressions ? (
                  <KpiCard
                    delay={0.1}
                    icon={<Eye className="h-4 w-4 text-blue-600" />}
                    label="Impressions"
                    value={fmtCount(fin.impressions)}
                    sub="Campaign total"
                    color="bg-blue-500"
                  />
                ) : null}
                {cardVisibility.billing.reach ? (
                  <KpiCard
                    delay={0.12}
                    icon={<Users className="h-4 w-4 text-cyan-600" />}
                    label="Reach"
                    value={fmtCount(fin.reach)}
                    sub="Campaign total"
                    color="bg-cyan-500"
                  />
                ) : null}
                {cardVisibility.billing.results ? (
                  <KpiCard
                    delay={0.14}
                    icon={<Target className="h-4 w-4 text-rose-600" />}
                    label="Results"
                    value={fmtCount(fin.results)}
                    sub="Purchases or link clicks"
                    color="bg-rose-500"
                  />
                ) : null}
                {cardVisibility.billing.costPerResult ? (
                  <KpiCard
                    delay={0.16}
                    icon={<TrendingUp className="h-4 w-4 text-indigo-600" />}
                    label="Cost / result"
                    value={
                      fin.costPerResult != null
                        ? fmtMoneyCurrency(fin.costPerResult, finCurrency)
                        : "—"
                    }
                    sub="Avg. for campaign"
                    color="bg-indigo-500"
                  />
                ) : null}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/10 px-4 py-8 text-center text-sm text-muted-foreground">
                <p>All billing &amp; results cards are hidden.</p>
                <button
                  type="button"
                  className="mt-2 text-xs font-medium text-primary underline-offset-4 hover:underline"
                  onClick={() => setMetricPickerOpen(true)}
                >
                  Customize metric cards
                </button>
              </div>
            )}
          </motion.div>
        ) : null}

        {!loading && !errorMsg && payload?.demo ? (
          <p className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-3 text-center text-sm text-muted-foreground">
            Demo preview — connect Meta in the agency dashboard for billing fields, ad-level table,
            and live charts.
          </p>
        ) : null}

        {/* ── Engagement (no duplicate of billing totals) ── */}
        {!loading && !errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-3"
          >
            <div>
              <h2 className="text-base font-bold sm:text-lg">Engagement</h2>
              <p className="text-xs text-muted-foreground">
                Clicks, efficiency, and delivery — spend, impressions, and reach are in Billing
                &amp; results summary above.
              </p>
            </div>
            {engagementAnyVisible ? (
              <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                {cardVisibility.engagement.clicks ? (
                  <KpiCard
                    delay={0.05}
                    icon={<MousePointerClick className="h-4 w-4 text-emerald-600" />}
                    label="Clicks"
                    value={fmtCount(kpis.totalClicks)}
                    color="bg-emerald-500"
                  />
                ) : null}
                {cardVisibility.engagement.ctr ? (
                  <KpiCard
                    delay={0.1}
                    icon={<TrendingUp className="h-4 w-4 text-orange-600" />}
                    label="CTR"
                    value={`${kpis.avgCtr.toFixed(2)}%`}
                    sub="Click-through rate"
                    color="bg-orange-500"
                  />
                ) : null}
                {cardVisibility.engagement.cpc ? (
                  <KpiCard
                    delay={0.15}
                    icon={<Activity className="h-4 w-4 text-rose-600" />}
                    label="Avg CPC"
                    value={fmtMoney(kpis.avgCpc)}
                    sub="Cost per click"
                    color="bg-rose-500"
                  />
                ) : null}
                {cardVisibility.engagement.conversions ? (
                  <KpiCard
                    delay={0.2}
                    icon={<Target className="h-4 w-4 text-amber-600" />}
                    label="Conversions"
                    value={fmtCount(kpis.totalConversions)}
                    sub="Purchase events"
                    color="bg-amber-500"
                  />
                ) : null}
                {cardVisibility.engagement.frequency ? (
                  <KpiCard
                    delay={0.25}
                    icon={<BarChart2 className="h-4 w-4 text-indigo-600" />}
                    label="Frequency"
                    value={kpis.avgFreq.toFixed(2)}
                    sub="Avg impressions / person"
                    color="bg-indigo-500"
                  />
                ) : null}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/10 px-4 py-8 text-center text-sm text-muted-foreground">
                <p>All engagement cards are hidden.</p>
                <button
                  type="button"
                  className="mt-2 text-xs font-medium text-primary underline-offset-4 hover:underline"
                  onClick={() => setMetricPickerOpen(true)}
                >
                  Customize metric cards
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Spend Chart ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="min-w-0 rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-6"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold sm:text-lg">Spend Over Time</h2>
              <p className="text-xs text-muted-foreground">Daily spend · {rangeLabel}</p>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10">
              <DollarSign className="h-4 w-4 text-violet-600" />
            </span>
          </div>
          <div className="h-48 w-full min-w-0 sm:h-64">
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
                No chart data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 4, left: 0, bottom: 2 }}>
                  <defs>
                    <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    interval={chartXInterval}
                    tickLine={false}
                    axisLine={false}
                    stroke="var(--muted-foreground)"
                    fontSize={10}
                    tickMargin={6}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [`${fmtMoney(v)}`, "Spend"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="spend"
                    stroke="var(--chart-1)"
                    strokeWidth={2.5}
                    fill="url(#spendFill)"
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* ── Clicks + Impressions Charts (2 col) ── */}
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="min-w-0 rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold sm:text-base">Daily Clicks</h2>
                <p className="text-xs text-muted-foreground">Clicks per day</p>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10">
                <MousePointerClick className="h-4 w-4 text-emerald-600" />
              </span>
            </div>
            <div className="h-40 min-w-0 w-full sm:h-44">
              {chartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No data
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 2 }}>
                    <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="label"
                      interval={chartXInterval}
                      tickLine={false}
                      axisLine={false}
                      stroke="var(--muted-foreground)"
                      fontSize={10}
                      tickMargin={6}
                    />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                      formatter={(v: number) => [fmtCount(v), "Clicks"]}
                    />
                    <Bar
                      dataKey="clicks"
                      fill="var(--chart-2)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="min-w-0 rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold sm:text-base">Impressions & Reach</h2>
                <p className="text-xs text-muted-foreground">Thousands · per day</p>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10">
                <Eye className="h-4 w-4 text-blue-600" />
              </span>
            </div>
            <div className="h-40 min-w-0 w-full sm:h-44">
              {chartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No data
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 2 }}>
                    <defs>
                      <linearGradient id="impFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="reachFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="label"
                      interval={chartXInterval}
                      tickLine={false}
                      axisLine={false}
                      stroke="var(--muted-foreground)"
                      fontSize={10}
                      tickMargin={6}
                    />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                      formatter={(v: number, name: string) => [
                        `${fmtCount(v)}K`,
                        name === "impressions" ? "Impressions" : "Reach",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="impressions"
                      stroke="var(--chart-3)"
                      strokeWidth={2}
                      fill="url(#impFill)"
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="reach"
                      stroke="var(--chart-4)"
                      strokeWidth={2}
                      fill="url(#reachFill)"
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        </div>

        {/* ── Ad Performance (above daily breakdown) ── */}
        {!loading && !errorMsg && payload && payload.ads && payload.ads.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="rounded-3xl border border-border bg-card shadow-soft"
          >
            <div className="border-b border-border px-4 py-3 sm:px-6 sm:py-4">
              <h2 className="text-base font-bold sm:text-lg">Ad performance</h2>
              <p className="text-xs text-muted-foreground">
                {payload.ads.length} ad{payload.ads.length === 1 ? "" : "s"} in this campaign ·{" "}
                {rangeLabel}
              </p>
            </div>

            <div className="divide-y divide-border md:hidden">
              {payload.ads.map((row) => (
                <article key={row.id} className="px-4 py-4">
                  <header className="mb-3 flex items-start justify-between gap-2">
                    <h3 className="min-w-0 flex-1 text-sm font-semibold leading-snug text-foreground">
                      {row.name}
                    </h3>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusColor(row.status)}`}
                    >
                      {row.status}
                    </span>
                  </header>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-3 text-xs sm:grid-cols-3">
                    <div className="min-w-0">
                      <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        Spend
                      </dt>
                      <dd className="mt-0.5 font-semibold tabular-nums text-foreground">
                        {fmtMoneyCurrency(row.spend, finCurrency)}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        Impr.
                      </dt>
                      <dd className="mt-0.5 font-semibold tabular-nums text-foreground">
                        {fmtCount(row.impressions)}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        Reach
                      </dt>
                      <dd className="mt-0.5 font-semibold tabular-nums text-foreground">
                        {fmtCount(row.reach)}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        CTR
                      </dt>
                      <dd className="mt-0.5 font-semibold tabular-nums text-foreground">
                        {row.ctr.toFixed(2)}%
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        Results
                      </dt>
                      <dd className="mt-0.5 font-semibold tabular-nums text-foreground">
                        {row.results}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        Cost / result
                      </dt>
                      <dd className="mt-0.5 font-semibold tabular-nums text-foreground">
                        {row.costPerResult != null
                          ? fmtMoneyCurrency(row.costPerResult, finCurrency)
                          : "—"}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        Result value
                      </dt>
                      <dd className="mt-0.5 font-semibold tabular-nums text-foreground">
                        {row.resultValue > 0 ? fmtMoneyCurrency(row.resultValue, finCurrency) : "—"}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        ROAS
                      </dt>
                      <dd className="mt-0.5 font-semibold tabular-nums text-foreground">
                        {row.roas != null ? row.roas.toFixed(2) : "—"}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        Spend %
                      </dt>
                      <dd className="mt-0.5 font-semibold tabular-nums text-foreground">
                        {row.spendPct.toFixed(1)}%
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        Daily budget
                      </dt>
                      <dd className="mt-0.5 font-semibold tabular-nums text-foreground">
                        {row.dailyBudget != null
                          ? fmtMoneyCurrency(row.dailyBudget, finCurrency)
                          : "—"}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        End date
                      </dt>
                      <dd className="mt-0.5 font-semibold tabular-nums text-foreground">
                        {row.endDate ?? "—"}
                      </dd>
                    </div>
                    <div className="min-w-0 sm:col-span-3">
                      <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        Result rate
                      </dt>
                      <dd className="mt-0.5 font-semibold tabular-nums text-foreground">
                        {row.resultRate != null ? `${row.resultRate.toFixed(2)}%` : "—"}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>

            <div className="hidden md:block">
              <div className="overflow-x-auto scroll-smooth overscroll-x-contain [-webkit-overflow-scrolling:touch]">
                <table className="w-full min-w-[1100px] text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {[
                        "Ad name",
                        "Status",
                        "Daily budget",
                        "End date",
                        "Spend",
                        "Impressions",
                        "Reach",
                        "CTR",
                        "Result rate",
                        "Results",
                        "Cost / result",
                        "Result value",
                        "ROAS",
                        "Spend %",
                      ].map((h) => (
                        <th
                          key={h}
                          className="whitespace-nowrap px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground first:pl-5 last:pr-5 sm:px-4"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payload.ads.map((row) => (
                      <tr key={row.id} className="transition hover:bg-muted/30">
                        <td
                          className="max-w-[200px] truncate px-3 py-2.5 pl-5 text-xs font-medium sm:px-4"
                          title={row.name}
                        >
                          {row.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs sm:px-4">
                          {row.status}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs text-muted-foreground sm:px-4">
                          {row.dailyBudget != null
                            ? fmtMoneyCurrency(row.dailyBudget, finCurrency)
                            : "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs text-muted-foreground sm:px-4">
                          {row.endDate ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs sm:px-4">
                          {fmtMoneyCurrency(row.spend, finCurrency)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs sm:px-4">
                          {fmtCount(row.impressions)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs sm:px-4">
                          {fmtCount(row.reach)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs sm:px-4">
                          {row.ctr.toFixed(2)}%
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs sm:px-4">
                          {row.resultRate != null ? `${row.resultRate.toFixed(2)}%` : "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs sm:px-4">
                          {row.results}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs sm:px-4">
                          {row.costPerResult != null
                            ? fmtMoneyCurrency(row.costPerResult, finCurrency)
                            : "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs sm:px-4">
                          {row.resultValue > 0
                            ? fmtMoneyCurrency(row.resultValue, finCurrency)
                            : "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs sm:px-4">
                          {row.roas != null ? row.roas.toFixed(2) : "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 pr-5 text-xs sm:px-4">
                          {row.spendPct.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : !loading && !errorMsg && !payload?.demo ? (
          <div className="rounded-2xl border border-border bg-muted/15 px-4 py-6 text-center text-sm text-muted-foreground">
            No ads returned for this campaign in {rangeLabel}. Create ads in Ads Manager or widen
            the date range.
          </div>
        ) : null}

        {/* ── Daily Breakdown Table ── */}
        {tableRows.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="rounded-3xl border border-border bg-card shadow-soft"
          >
            <div className="border-b border-border px-4 py-3 sm:px-6 sm:py-4">
              <h2 className="text-base font-bold sm:text-lg">Daily Breakdown</h2>
              <p className="text-xs text-muted-foreground">
                Per-day metrics · {rangeLabel}
                <span className="mt-1 block md:hidden">Swipe sideways to see all columns.</span>
              </p>
            </div>
            <div className="overflow-x-auto scroll-smooth overscroll-x-contain [-webkit-overflow-scrolling:touch]">
              <table className="w-full min-w-[580px] text-xs sm:min-w-[640px] sm:text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="sticky left-0 z-10 bg-muted/95 px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm sm:px-5 sm:py-3 sm:text-xs">
                      Date
                    </th>
                    <th className="px-2 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:px-4 sm:py-3 sm:text-xs">
                      Spend
                    </th>
                    <th className="px-2 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:px-4 sm:py-3 sm:text-xs">
                      Impr.
                    </th>
                    <th className="px-2 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:px-4 sm:py-3 sm:text-xs">
                      Reach
                    </th>
                    <th className="px-2 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:px-4 sm:py-3 sm:text-xs">
                      Clicks
                    </th>
                    <th className="px-2 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:px-4 sm:py-3 sm:text-xs">
                      CTR
                    </th>
                    <th className="px-2 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:px-4 sm:py-3 sm:text-xs">
                      CPC
                    </th>
                    <th className="px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:px-5 sm:py-3 sm:text-xs">
                      Conv.
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tableRows.map((row) => (
                    <tr key={row.date} className="transition hover:bg-muted/30">
                      <td className="sticky left-0 z-10 bg-card px-3 py-2.5 text-xs font-medium text-foreground shadow-[1px_0_0_var(--border)] sm:px-5 sm:py-3 sm:text-sm">
                        {row.date}
                      </td>
                      <td className="px-2 py-2.5 text-right text-muted-foreground sm:px-4 sm:py-3">
                        {fmtMoney(row.spend)}
                      </td>
                      <td className="px-2 py-2.5 text-right text-muted-foreground sm:px-4 sm:py-3">
                        {fmtCount(row.impressions)}
                      </td>
                      <td className="px-2 py-2.5 text-right text-muted-foreground sm:px-4 sm:py-3">
                        {fmtCount(row.reach)}
                      </td>
                      <td className="px-2 py-2.5 text-right text-muted-foreground sm:px-4 sm:py-3">
                        {fmtCount(row.clicks)}
                      </td>
                      <td className="px-2 py-2.5 text-right text-muted-foreground sm:px-4 sm:py-3">
                        {row.ctr.toFixed(2)}%
                      </td>
                      <td className="px-2 py-2.5 text-right text-muted-foreground sm:px-4 sm:py-3">
                        {fmtMoney(row.cpc)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-xs font-medium text-foreground sm:px-5 sm:py-3 sm:text-sm">
                        {row.conversions > 0 ? row.conversions : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ── Footer ── */}
        <div className="pb-6 text-center text-xs text-muted-foreground">
          Powered by <span className="font-semibold text-foreground">AdReportly</span> · Data from
          Meta Ads API
        </div>
      </div>
    </div>
  );
}
