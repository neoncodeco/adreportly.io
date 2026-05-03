"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
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
import { Zap } from "lucide-react";

type InsightRow = {
  date_start?: string;
  spend?: string;
  clicks?: string;
  impressions?: string;
  reach?: string;
};

type ApiPayload = {
  success: boolean;
  error?: string;
  campaign?: { id: string; name: string; objective: string; status: string };
  insights?: InsightRow[];
  clientEmail?: string;
  demo?: boolean;
};

function insightsToChart(rows: InsightRow[]) {
  if (!rows?.length) return [];
  return rows
    .filter((r) => r.date_start)
    .map((r) => {
      const ds = r.date_start as string;
      return {
        label: new Date(`${ds}T12:00:00Z`).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        spend: Math.round(parseFloat(r.spend ?? "0") || 0),
        results: Math.round(parseFloat(r.clicks ?? "0") || 0),
      };
    });
}

/** Single aggregate row (no date_start): mirror one point for chart readability */
function aggregateToChart(rows: InsightRow[]) {
  if (rows.length !== 1 || rows[0]?.date_start) return null;
  const r = rows[0];
  return [
    {
      label: "Period",
      spend: Math.round(parseFloat(r.spend ?? "0") || 0),
      results: Math.round(parseFloat(r.clicks ?? "0") || 0),
    },
  ];
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
  const chartData = useMemo(() => {
    const rows = payload?.insights ?? [];
    const daily = insightsToChart(rows);
    if (daily.length) return daily;
    const agg = aggregateToChart(rows);
    return agg ?? [];
  }, [payload?.insights]);

  const errorMsg = payload?.success === false ? payload.error : null;

  return (
    <div className="min-h-screen bg-gradient-soft px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
              <Zap className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Client view
              </p>
              <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {payload?.campaign?.objective
                  ? `Objective: ${payload.campaign.objective} · Status: ${payload.campaign.status}`
                  : `Read-only · token ${tokenParam ? `${tokenParam.slice(0, 8)}…` : "—"}`}
              </p>
              {payload?.clientEmail ? (
                <p className="text-xs text-muted-foreground">Shared with {payload.clientEmail}</p>
              ) : null}
            </div>
          </div>
          <div className="rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground shadow-soft">
            {loading ? "Loading…" : payload?.demo ? "Demo (no Meta token)" : "Live metrics"}
          </div>
        </motion.div>

        {errorMsg ? (
          <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
            {errorMsg}
          </div>
        ) : null}

        <div className="rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-6">
          <h2 className="text-base font-bold sm:text-lg">Performance snapshot</h2>
          <p className="text-xs text-muted-foreground">
            {chartData.length
              ? "Last 30 days (daily when available)"
              : "No insight rows for this range"}
          </p>
          <div className="mt-5 h-56 w-full sm:h-72">
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
                No chart data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="shareSpendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="shareResultsFill" x1="0" y1="0" x2="0" y2="1">
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
                    fill="url(#shareSpendFill)"
                  />
                  <Area
                    type="monotone"
                    dataKey="results"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    fill="url(#shareResultsFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
