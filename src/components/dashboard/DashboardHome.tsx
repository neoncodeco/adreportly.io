"use client";

import Link from "next/link";
import { useMemo } from "react";
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
  ChevronDown,
  ArrowUpRight,
  Activity,
  Target,
  DollarSign,
  MousePointerClick,
  Sparkles,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DASHBOARD_OVERVIEW_STALE_MS,
  dashboardQk,
  fetchDashboardOverview,
} from "@/lib/dashboard-queries";

const statMeta = [
  { key: "overview" as const, label: "Live overview · 30d", icon: Sparkles, highlight: true },
  { key: "total" as const, label: "Total Spend", icon: DollarSign, highlight: false },
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

export function DashboardHome() {
  const { data, isPending, isError, error, refetch, isRefetching } = useQuery({
    queryKey: dashboardQk.overview(),
    queryFn: fetchDashboardOverview,
    staleTime: DASHBOARD_OVERVIEW_STALE_MS,
  });

  const sym = data?.currencySymbol ?? "৳";
  const spendTrend = data?.spendTrend ?? [];
  const topCampaigns = data?.topCampaigns ?? [];
  const recentCampaigns = data?.recentCampaigns ?? [];
  const kpis = data?.kpis;
  const maxTopSpend = topCampaigns[0]?.spend ?? 0;

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
      return { ...s, ...accentByKey[s.key], value, delta, up };
    });
  }, [kpis, sym]);

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
      className="space-y-5 sm:space-y-6"
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

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {stats.map((s) => (
          <div
            key={s.key}
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant sm:p-5",
              s.highlight && "col-span-2 lg:col-span-1",
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
              <div className="text-xl font-bold leading-tight sm:text-2xl">{s.value}</div>
              <div className="mt-0.5 truncate text-xs text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 sm:gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-6 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold sm:text-lg">Ad Spend Trend</h3>
              <p className="text-xs text-muted-foreground">Daily spend vs. clicks (last 30 days)</p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Last 30 Days <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-5 h-56 w-full sm:h-72">
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
                    interval={4}
                    tickLine={false}
                    axisLine={false}
                    stroke="var(--muted-foreground)"
                    fontSize={10}
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

        <div className="rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold sm:text-lg">Top Campaigns</h3>
              <p className="text-xs text-muted-foreground">By spend · 30 days</p>
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

      <div className="rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold sm:text-lg">Recent Campaigns</h3>
            <p className="text-xs text-muted-foreground">Highest spend · last 30 days</p>
          </div>
          <Link
            href="/dashboard/campaigns"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="space-y-3 lg:hidden">
          {recentCampaigns.slice(0, 3).length === 0 ? (
            <p className="text-sm text-muted-foreground">No campaigns to show.</p>
          ) : (
            recentCampaigns.slice(0, 3).map((c) => (
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
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                      c.status === "active" && "bg-success/15 text-success",
                      c.status === "paused" && "bg-amber-500/15 text-amber-700 dark:text-amber-400",
                      (c.status === "completed" || c.status === "other") &&
                        "bg-muted text-muted-foreground",
                    )}
                  >
                    {c.status}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border/60 pt-3 text-center">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Spend
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
                  <th className="pb-3 pr-4 text-right">Spend</th>
                  <th className="pb-3 pr-4 text-right">Results</th>
                  <th className="pb-3 text-right">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {recentCampaigns.slice(0, 3).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No campaigns to show.
                    </td>
                  </tr>
                ) : (
                  recentCampaigns.slice(0, 3).map((c, i) => (
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
                      <td className="py-4 pr-4 text-right font-medium tabular-nums">
                        {sym}
                        {c.spend.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 pr-4 text-right tabular-nums">{c.results}</td>
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
