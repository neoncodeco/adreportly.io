"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
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
} from "lucide-react";

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

type ApiPayload = {
  success: boolean;
  error?: string;
  campaign?: { id: string; name: string; objective: string; status: string };
  insights?: InsightRow[];
  clientEmail?: string;
  demo?: boolean;
};

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
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-soft"
    >
      <div
        className={`absolute -right-6 -top-6 h-20 w-20 rounded-full ${color} opacity-10 blur-2xl`}
      />
      <div className="flex items-start justify-between">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${color} bg-opacity-15`}
        >
          {icon}
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground/40" />
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="mt-0.5 text-xs font-medium text-muted-foreground">{label}</div>
        {sub ? <div className="mt-1 text-[11px] text-muted-foreground/70">{sub}</div> : null}
      </div>
    </motion.div>
  );
}

export default function SharedCampaignPage() {
  const routeParams = useParams();
  const tokenParam = typeof routeParams?.token === "string" ? routeParams.token : "";
  const [payload, setPayload] = useState<ApiPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tokenParam) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/shared-campaign/${tokenParam}`, { cache: "no-store" });
        const data = (await res.json()) as ApiPayload;
        if (!cancelled) setPayload(data);
      } catch {
        if (!cancelled) setPayload({ success: false, error: "Network error" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tokenParam]);

  const title = payload?.campaign?.name ?? "Shared campaign";

  const { chartData, kpis, tableRows } = useMemo(() => {
    const rows = payload?.insights ?? [];
    const daily = insightsToChart(rows);
    const chart = daily.length ? daily : (aggregateToChart(rows) ?? []);

    const totalSpend = rows.reduce((s, r) => s + num(r.spend), 0);
    const totalImpressions = rows.reduce((s, r) => s + int(r.impressions), 0);
    const totalReach = rows.reduce((s, r) => s + int(r.reach), 0);
    const totalClicks = rows.reduce((s, r) => s + int(r.clicks), 0);
    const totalConversions = rows.reduce((s, r) => s + conversionsFromActions(r.actions), 0);
    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
    const avgFreq = totalReach > 0 ? totalImpressions / totalReach : 0;

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
  }, [payload?.insights]);

  const errorMsg = payload?.success === false ? payload.error : null;

  return (
    <div className="min-h-screen bg-gradient-soft px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
              <Zap className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Client Report
              </p>
              <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
              {payload?.campaign?.objective ? (
                <p className="text-xs text-muted-foreground">
                  Objective: {payload.campaign.objective}
                </p>
              ) : null}
              {payload?.clientEmail ? (
                <p className="text-xs text-muted-foreground">Shared with {payload.clientEmail}</p>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {payload?.campaign?.status ? (
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(payload.campaign.status)}`}
              >
                {payload.campaign.status}
              </span>
            ) : null}
            <div className="rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground shadow-soft">
              {loading ? "Loading…" : payload?.demo ? "Demo" : "Live metrics"}
            </div>
          </div>
        </motion.div>

        {errorMsg ? (
          <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
            {errorMsg}
          </div>
        ) : null}

        {/* ── KPI Cards ── */}
        {!loading && !errorMsg && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiCard
              delay={0.05}
              icon={<DollarSign className="h-4 w-4 text-violet-600" />}
              label="Total Spend"
              value={fmtMoney(kpis.totalSpend)}
              color="bg-violet-500"
            />
            <KpiCard
              delay={0.1}
              icon={<Eye className="h-4 w-4 text-blue-600" />}
              label="Impressions"
              value={fmtCount(kpis.totalImpressions)}
              color="bg-blue-500"
            />
            <KpiCard
              delay={0.15}
              icon={<Users className="h-4 w-4 text-cyan-600" />}
              label="Reach"
              value={fmtCount(kpis.totalReach)}
              sub={`Freq ${kpis.avgFreq.toFixed(2)}×`}
              color="bg-cyan-500"
            />
            <KpiCard
              delay={0.2}
              icon={<MousePointerClick className="h-4 w-4 text-emerald-600" />}
              label="Clicks"
              value={fmtCount(kpis.totalClicks)}
              color="bg-emerald-500"
            />
            <KpiCard
              delay={0.25}
              icon={<TrendingUp className="h-4 w-4 text-orange-600" />}
              label="CTR"
              value={`${kpis.avgCtr.toFixed(2)}%`}
              sub="Click-through rate"
              color="bg-orange-500"
            />
            <KpiCard
              delay={0.3}
              icon={<Activity className="h-4 w-4 text-rose-600" />}
              label="Avg CPC"
              value={fmtMoney(kpis.avgCpc)}
              sub="Cost per click"
              color="bg-rose-500"
            />
            <KpiCard
              delay={0.35}
              icon={<Target className="h-4 w-4 text-amber-600" />}
              label="Conversions"
              value={fmtCount(kpis.totalConversions)}
              sub="Purchase events"
              color="bg-amber-500"
            />
            <KpiCard
              delay={0.4}
              icon={<BarChart2 className="h-4 w-4 text-indigo-600" />}
              label="Frequency"
              value={kpis.avgFreq.toFixed(2)}
              sub="Avg impressions / person"
              color="bg-indigo-500"
            />
          </div>
        )}

        {/* ── Spend Chart ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold sm:text-lg">Spend Over Time</h2>
              <p className="text-xs text-muted-foreground">Daily spend · last 30 days</p>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10">
              <DollarSign className="h-4 w-4 text-violet-600" />
            </span>
          </div>
          <div className="h-52 w-full sm:h-64">
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
                No chart data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
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
        <div className="grid gap-4 sm:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold sm:text-base">Daily Clicks</h2>
                <p className="text-xs text-muted-foreground">Clicks per day</p>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10">
                <MousePointerClick className="h-4 w-4 text-emerald-600" />
              </span>
            </div>
            <div className="h-44">
              {chartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No data
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
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
            className="rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold sm:text-base">Impressions & Reach</h2>
                <p className="text-xs text-muted-foreground">Thousands · per day</p>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10">
                <Eye className="h-4 w-4 text-blue-600" />
              </span>
            </div>
            <div className="h-44">
              {chartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No data
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
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

        {/* ── Daily Breakdown Table ── */}
        {tableRows.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="rounded-3xl border border-border bg-card shadow-soft"
          >
            <div className="border-b border-border px-5 py-4 sm:px-6">
              <h2 className="text-base font-bold sm:text-lg">Daily Breakdown</h2>
              <p className="text-xs text-muted-foreground">Per-day performance metrics</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Date
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Spend
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Impressions
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Reach
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Clicks
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      CTR
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      CPC
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Conv.
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tableRows.map((row) => (
                    <tr key={row.date} className="transition hover:bg-muted/30">
                      <td className="px-5 py-3 font-medium text-foreground">{row.date}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {fmtMoney(row.spend)}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {fmtCount(row.impressions)}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {fmtCount(row.reach)}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {fmtCount(row.clicks)}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {row.ctr.toFixed(2)}%
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {fmtMoney(row.cpc)}
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-foreground">
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
