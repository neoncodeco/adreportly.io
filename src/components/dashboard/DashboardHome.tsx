"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Activity,
  Target,
  DollarSign,
  MousePointerClick,
  Sparkles,
  Loader2,
  Filter,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { deliveryDotClass, deliveryLabel, deliveryPillClass } from "@/lib/meta-delivery";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DASHBOARD_OVERVIEW_STALE_MS,
  REPORT_DATE_PRESET_OPTIONS,
  dashboardQk,
  fetchDashboardOverview,
  type DashboardOverview,
  type ReportDatePreset,
} from "@/lib/dashboard-queries";

type CampaignRow = NonNullable<DashboardOverview["campaigns"]>[number];
type StatusFilter = "all" | CampaignRow["status"];
type SortKey = "spend" | "results" | "costPerResult" | "roas" | "name";

const DASHBOARD_CAMPAIGN_LIST_LIMIT = 5;

const statMeta = [
  { key: "overview" as const, label: "Live overview", icon: Sparkles, highlight: true },
  { key: "total" as const, label: "Amount spent", icon: DollarSign, highlight: false },
  { key: "conversions" as const, label: "Conversions", icon: Target, highlight: false },
  { key: "roas" as const, label: "Avg ROAS", icon: Activity, highlight: false },
  { key: "cpc" as const, label: "Avg CPC", icon: MousePointerClick, highlight: false },
];

const accentByKey = {
  overview: {
    accent: "from-primary/25 to-primary/5",
    iconBg: "bg-primary/15 text-primary",
  },
  total: {
    accent: "from-violet-500/20 to-fuchsia-500/10",
    iconBg: "bg-violet-500/15 text-violet-500",
  },
  conversions: {
    accent: "from-emerald-500/20 to-teal-500/10",
    iconBg: "bg-emerald-500/15 text-emerald-500",
  },
  roas: {
    accent: "from-amber-500/20 to-orange-500/10",
    iconBg: "bg-amber-500/15 text-amber-500",
  },
  cpc: {
    accent: "from-sky-500/20 to-blue-500/10",
    iconBg: "bg-sky-500/15 text-sky-500",
  },
} as const;

function costPerResult(row: CampaignRow) {
  return row.costPerResult ?? (row.results > 0 ? row.spend / row.results : null);
}

function money(sym: string, value: number, digits = 2) {
  return `${sym}${value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

export function DashboardHome() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortKey>("spend");
  const [datePreset, setDatePreset] = useState<ReportDatePreset>("last_30d");
  /** Collapsed by default on small screens to save vertical space */
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data, isPending, isError, error, refetch, isRefetching } = useQuery({
    queryKey: dashboardQk.overview(datePreset),
    queryFn: () => fetchDashboardOverview({ datePreset }),
    staleTime: DASHBOARD_OVERVIEW_STALE_MS,
  });

  const sym = data?.currencySymbol ?? "৳";
  const spendTrend = data?.spendTrend ?? [];
  const kpis = data?.kpis;
  const dateLabel =
    REPORT_DATE_PRESET_OPTIONS.find((option) => option.value === datePreset)?.label ??
    "Last 30 days";

  const baseCampaignRows = useMemo((): CampaignRow[] => {
    if (!data) return [];
    if (data.campaigns?.length) return data.campaigns;
    return (data.recentCampaigns ?? []) as CampaignRow[];
  }, [data]);

  const narrowedCampaigns = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return baseCampaignRows.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
      );
    });
  }, [baseCampaignRows, searchQuery, statusFilter]);

  const topCampaigns = useMemo(() => {
    const colors = ["primary", "dark", "muted"] as const;
    const sorted = [...narrowedCampaigns].sort((a, b) => b.spend - a.spend).slice(0, 5);
    return sorted.map((c, i) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      spend: c.spend,
      color: colors[i % colors.length] as (typeof colors)[number],
    }));
  }, [narrowedCampaigns]);

  const sortedTableCampaigns = useMemo(() => {
    const rows = [...narrowedCampaigns];
    rows.sort((a, b) => {
      if (sortBy === "spend") return b.spend - a.spend;
      if (sortBy === "results") return b.results - a.results;
      if (sortBy === "costPerResult") {
        return (
          (costPerResult(a) ?? Number.MAX_SAFE_INTEGER) -
          (costPerResult(b) ?? Number.MAX_SAFE_INTEGER)
        );
      }
      if (sortBy === "roas") return b.roas - a.roas;
      return a.name.localeCompare(b.name);
    });
    return rows;
  }, [narrowedCampaigns, sortBy]);

  const previewTableCampaigns = useMemo(
    () => sortedTableCampaigns.slice(0, DASHBOARD_CAMPAIGN_LIST_LIMIT),
    [sortedTableCampaigns],
  );

  const maxTopSpend = topCampaigns[0]?.spend ?? 0;
  const totalCampaignCount = baseCampaignRows.length;

  const stats = useMemo(() => {
    const total = kpis?.totalSpend ?? 0;
    const conv = kpis?.conversions ?? 0;
    return statMeta.map((s) => {
      let value = "—";
      const delta: string | null = null;
      const up = true;
      if (s.key === "overview" || s.key === "total") {
        value = `${sym}${Math.round(total).toLocaleString()}`;
      } else if (s.key === "conversions") {
        value = conv > 0 ? conv.toLocaleString() : "0";
      } else if (s.key === "roas") {
        value = kpis?.avgRoas ?? "—";
      } else if (s.key === "cpc") {
        value = kpis?.avgCpc ?? "—";
      }
      return {
        ...s,
        ...accentByKey[s.key],
        label: s.key === "overview" ? `Live overview · ${dateLabel}` : s.label,
        value,
        delta,
        up,
      };
    });
  }, [dateLabel, kpis, sym]);

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center rounded-3xl border border-border bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-label="Loading" />
      </div>
    );
  }

  if (isError || !data) {
    const message = error instanceof Error ? error.message : "Could not load dashboard";
    return (
      <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <p className="text-sm font-medium text-destructive">{message}</p>
        <button
          type="button"
          className="mt-4 text-sm font-semibold text-primary underline"
          onClick={() => void refetch()}
          disabled={isRefetching}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="min-w-0 space-y-4 sm:space-y-6"
    >
      {data?.connected === false && (
        <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Connect Facebook under{" "}
          <Link
            href="/dashboard/meta-connect"
            className="font-semibold text-primary hover:underline"
          >
            Meta Connect
          </Link>{" "}
          to load live ad account data.
        </div>
      )}

      {data?.connected !== false && totalCampaignCount > 0 ? (
        <div className="rounded-3xl border border-border bg-card p-3 shadow-soft sm:p-5">
          {/* Mobile: collapsible filters */}
          <div className="sm:hidden">
            <Collapsible open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <CollapsibleTrigger
                type="button"
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-muted/40 px-3 py-3 text-left transition hover:bg-muted/60"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Filter className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold">Campaign filters</div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {narrowedCampaigns.length} of {totalCampaignCount} match · tap to{" "}
                    {mobileFiltersOpen ? "hide" : "edit"}
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
                    mobileFiltersOpen && "rotate-180",
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                <div className="grid gap-4 border-t border-border pt-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="dash-campaign-search-m" className="text-xs">
                      Search
                    </Label>
                    <Input
                      id="dash-campaign-search-m"
                      placeholder="Name, ID, or code…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="grid gap-3 min-[420px]:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="dash-date-m" className="text-xs">
                        Date range
                      </Label>
                      <Select
                        value={datePreset}
                        onValueChange={(v) => setDatePreset(v as ReportDatePreset)}
                      >
                        <SelectTrigger id="dash-date-m" className="h-11 rounded-xl">
                          <SelectValue placeholder="Date range" />
                        </SelectTrigger>
                        <SelectContent>
                          {REPORT_DATE_PRESET_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="dash-status-m" className="text-xs">
                        Delivery
                      </Label>
                      <Select
                        value={statusFilter}
                        onValueChange={(v) => setStatusFilter(v as StatusFilter)}
                      >
                        <SelectTrigger id="dash-status-m" className="h-11 rounded-xl">
                          <SelectValue placeholder="Delivery" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="paused">Off</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="dash-sort-m" className="text-xs">
                        Sort
                      </Label>
                      <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
                        <SelectTrigger id="dash-sort-m" className="h-11 rounded-xl">
                          <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spend">Amount spent</SelectItem>
                          <SelectItem value="results">Results</SelectItem>
                          <SelectItem value="costPerResult">Cost / result</SelectItem>
                          <SelectItem value="roas">ROAS</SelectItem>
                          <SelectItem value="name">Name</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    KPIs and chart use all accounts ({dateLabel}). Lists use filters —{" "}
                    <Link
                      href="/dashboard/campaigns"
                      className="font-medium text-primary underline"
                    >
                      full list
                    </Link>
                    .
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Preview:{" "}
                    <span className="font-semibold text-foreground">
                      {Math.min(DASHBOARD_CAMPAIGN_LIST_LIMIT, sortedTableCampaigns.length)}
                    </span>{" "}
                    rows below.
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Tablet/desktop: always expanded */}
          <div className="hidden sm:block">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Filter className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold sm:text-base">Filter campaigns</h2>
                <p className="text-[11px] text-muted-foreground sm:text-xs">
                  Chart and KPI cards use all enabled accounts ({dateLabel}). The campaigns block
                  shows up to five rows from your filters — open{" "}
                  <Link
                    href="/dashboard/campaigns"
                    className="font-medium text-primary hover:underline"
                  >
                    Campaigns
                  </Link>{" "}
                  for the full list.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="dash-campaign-search" className="text-xs">
                  Search
                </Label>
                <Input
                  id="dash-campaign-search"
                  placeholder="Name, ID, or short code…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dash-date" className="text-xs">
                  Date range
                </Label>
                <Select
                  value={datePreset}
                  onValueChange={(v) => setDatePreset(v as ReportDatePreset)}
                >
                  <SelectTrigger id="dash-date" className="h-10 rounded-xl">
                    <SelectValue placeholder="Date range" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_DATE_PRESET_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dash-status" className="text-xs">
                  Delivery
                </Label>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as StatusFilter)}
                >
                  <SelectTrigger id="dash-status" className="h-10 rounded-xl">
                    <SelectValue placeholder="Delivery" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Off</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dash-sort" className="text-xs">
                  Sort list by
                </Label>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
                  <SelectTrigger id="dash-sort" className="h-10 rounded-xl">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spend">Amount spent (high → low)</SelectItem>
                    <SelectItem value="results">Results (high → low)</SelectItem>
                    <SelectItem value="costPerResult">Cost / result (low → high)</SelectItem>
                    <SelectItem value="roas">ROAS (high → low)</SelectItem>
                    <SelectItem value="name">Name (A–Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">{narrowedCampaigns.length}</span> of{" "}
              <span className="font-semibold text-foreground">{totalCampaignCount}</span> campaigns
              match
              {narrowedCampaigns.length !== totalCampaignCount ? " filters" : ""}. Dashboard
              preview:{" "}
              <span className="font-semibold text-foreground">
                {Math.min(DASHBOARD_CAMPAIGN_LIST_LIMIT, sortedTableCampaigns.length)}
              </span>{" "}
              shown below.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4 lg:grid-cols-5">
        {stats.map((s) => (
          <div
            key={s.key}
            className={cn(
              "group relative min-w-0 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant sm:p-5",
              s.highlight && "min-[420px]:col-span-2 lg:col-span-1",
            )}
          >
            <div
              className={cn(
                "pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-60 blur-2xl",
                s.accent,
              )}
            />
            <div className="relative flex items-start justify-between">
              <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", s.iconBg)}>
                <s.icon className="h-4 w-4" />
              </span>
              {s.delta ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-xs",
                    s.up ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
                  )}
                >
                  {s.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {s.delta}
                </span>
              ) : null}
            </div>
            <div className="relative mt-3 sm:mt-4">
              <div className="break-words text-lg font-bold leading-tight min-[420px]:text-xl sm:text-2xl">
                {s.value}
              </div>
              <div className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground sm:text-xs">
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="min-w-0 rounded-3xl border border-border bg-card p-3 shadow-soft sm:p-6 lg:col-span-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-bold sm:text-lg">Amount Spent Trend</h3>
              <p className="text-xs text-muted-foreground">Daily spend vs. clicks ({dateLabel})</p>
            </div>
            <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[10px] font-medium text-muted-foreground sm:px-3 sm:py-1.5 sm:text-xs">
              {dateLabel} <span className="hidden opacity-80 sm:inline">(account total)</span>
            </span>
          </div>

          <div className="mt-4 h-52 w-full min-w-0 sm:mt-5 sm:h-72">
            {spendTrend.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
                No spend series yet for this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spendTrend} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="resultsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    interval="preserveStartEnd"
                    minTickGap={28}
                    tickLine={false}
                    axisLine={false}
                    stroke="var(--muted-foreground)"
                    fontSize={9}
                    tick={{ fill: "var(--muted-foreground)" }}
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
                  />
                  <Area
                    type="monotone"
                    dataKey="spend"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fill="url(#spendFill)"
                  />
                  <Area
                    type="monotone"
                    dataKey="results"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    fill="url(#resultsFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="min-w-0 rounded-3xl border border-border bg-card p-3 shadow-soft sm:p-6">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-base font-bold sm:text-lg">Top Campaigns</h3>
              <p className="text-xs text-muted-foreground">By spend · filtered · top 5</p>
            </div>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {topCampaigns.length}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {topCampaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No campaign spend in the last 30 days.
              </p>
            ) : (
              topCampaigns.map((c, i) => {
                const pct = maxTopSpend > 0 ? (c.spend / maxTopSpend) * 100 : 0;
                const colorMap = {
                  primary: "bg-gradient-primary",
                  dark: "bg-foreground",
                  muted: "bg-gradient-to-r from-amber-500 to-orange-500",
                } as const;
                return (
                  <div
                    key={c.id}
                    className="rounded-2xl border border-border/60 bg-background/40 p-3 transition hover:border-border hover:bg-background"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-primary-foreground",
                          colorMap[c.color],
                        )}
                      >
                        {c.code}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold">{c.name}</p>
                          <span className="shrink-0 text-xs font-bold tabular-nums">
                            {sym}
                            {c.spend >= 1000
                              ? `${(c.spend / 1000).toFixed(1)}K`
                              : c.spend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn("h-full rounded-full", colorMap[c.color])}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-muted-foreground">
                            #{i + 1}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="min-w-0 rounded-3xl border border-border bg-card p-3 shadow-soft sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-base font-bold sm:text-lg">Campaigns</h3>
            <p className="text-xs text-muted-foreground">
              Recent {DASHBOARD_CAMPAIGN_LIST_LIMIT} · filtered · last 30 day metrics
            </p>
          </div>
          <Link
            href="/dashboard/campaigns"
            className="inline-flex w-fit shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="space-y-3 lg:hidden">
          {sortedTableCampaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {totalCampaignCount === 0
                ? "No campaigns to show."
                : "No campaigns match your filters."}
            </p>
          ) : (
            previewTableCampaigns.map((c) => (
              <div key={c.id} className="rounded-2xl border border-border/60 bg-background/40 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                    {c.code}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.accounts} ad account{c.accounts === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      deliveryPillClass(c.status),
                    )}
                  >
                    {deliveryLabel(c.status)}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/60 pt-3 text-center sm:grid-cols-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Amount spent
                    </div>
                    <div className="mt-0.5 text-sm font-bold tabular-nums">
                      {sym}
                      {c.spend >= 1000
                        ? `${(c.spend / 1000).toFixed(1)}K`
                        : c.spend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                  <div className="border-x border-border/60">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Results
                    </div>
                    <div className="mt-0.5 text-sm font-bold tabular-nums">{c.results}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Cost / result
                    </div>
                    <div className="mt-0.5 text-sm font-bold tabular-nums">
                      {costPerResult(c) != null ? money(sym, costPerResult(c) as number) : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      ROAS
                    </div>
                    <div className="mt-0.5 text-sm font-bold tabular-nums text-success">
                      {c.roas > 0 ? `${c.roas.toFixed(2)}×` : "—"}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden lg:block">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 pr-4">No</th>
                  <th className="pb-3 pr-4">Campaign Name</th>
                  <th className="pb-3 pr-4">Delivery</th>
                  <th className="pb-3 pr-4 text-right">Amount spent</th>
                  <th className="pb-3 pr-4 text-right">Results</th>
                  <th className="pb-3 pr-4 text-right">Cost / result</th>
                  <th className="pb-3 text-right">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {sortedTableCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      {totalCampaignCount === 0
                        ? "No campaigns to show."
                        : "No campaigns match your filters."}
                    </td>
                  </tr>
                ) : (
                  previewTableCampaigns.map((c, i) => (
                    <tr key={c.id} className="border-t border-border/60">
                      <td className="py-4 pr-4 text-muted-foreground">{i + 1}</td>
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                            {c.code}
                          </span>
                          <div>
                            <div className="font-medium">{c.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {c.accounts} ad account{c.accounts === 1 ? "" : "s"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                            deliveryPillClass(c.status),
                          )}
                        >
                          <span
                            className={cn("h-1.5 w-1.5 rounded-full", deliveryDotClass(c.status))}
                          />
                          {deliveryLabel(c.status)}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-right font-medium tabular-nums">
                        {money(sym, c.spend)}
                      </td>
                      <td className="py-4 pr-4 text-right tabular-nums">{c.results}</td>
                      <td className="py-4 pr-4 text-right tabular-nums">
                        {costPerResult(c) != null ? money(sym, costPerResult(c) as number) : "—"}
                      </td>
                      <td className="py-4 text-right font-semibold tabular-nums">
                        {c.roas > 0 ? `${c.roas.toFixed(2)}×` : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
