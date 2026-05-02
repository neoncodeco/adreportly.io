"use client";

import { useEffect, useState } from "react";
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
import { mockSpendTrend } from "@/lib/mock-data";
import { Zap } from "lucide-react";

type ApiPayload = {
  success: boolean;
  campaignId?: string;
  demo?: boolean;
  insights?: { data: unknown[] };
};

export default function SharedCampaignPage() {
  const routeParams = useParams();
  const tokenParam = typeof routeParams?.token === "string" ? routeParams.token : "";
  const [title, setTitle] = useState("Shared campaign");
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
        if (!cancelled && data.success && data.campaignId) {
          setTitle(`Campaign ${data.campaignId}`);
        }
      } catch {
        /* keep defaults */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tokenParam]);

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
                Read-only · token {tokenParam ? `${tokenParam.slice(0, 8)}…` : "—"}
              </p>
            </div>
          </div>
          <div className="rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground shadow-soft">
            {loading ? "Loading…" : "Live metrics"}
          </div>
        </motion.div>

        <div className="rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-6">
          <h2 className="text-base font-bold sm:text-lg">Performance snapshot</h2>
          <p className="text-xs text-muted-foreground">
            Last 30 days (demo layout when Meta token is unavailable)
          </p>
          <div className="mt-5 h-56 w-full sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockSpendTrend} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
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
          </div>
        </div>
      </div>
    </div>
  );
}
