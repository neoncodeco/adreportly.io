"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Share2, MoreHorizontal, Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CampaignRow = {
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
};

type OverviewJson = {
  success?: boolean;
  error?: string;
  connected?: boolean;
  currencySymbol?: string;
  campaigns?: CampaignRow[];
  recentCampaigns?: CampaignRow[];
};

const statusStyle: Record<string, string> = {
  active: "bg-success/15 text-success",
  paused: "bg-warning/15 text-warning-foreground",
  completed: "bg-muted text-muted-foreground",
  other: "bg-muted text-muted-foreground",
};

export function CampaignsPage() {
  const [rows, setRows] = useState<CampaignRow[]>([]);
  const [sym, setSym] = useState("৳");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/dashboard/overview", { credentials: "include" });
      const data = (await res.json()) as OverviewJson;
      if (!res.ok || data.success === false) {
        setErr(typeof data.error === "string" ? data.error : "Could not load campaigns");
        setRows([]);
        return;
      }
      setSym(data.currencySymbol ?? "৳");
      setRows(data.campaigns?.length ? data.campaigns : (data.recentCampaigns ?? []));
    } catch {
      setErr("Network error");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((c) => c.name.toLowerCase().includes(s) || c.id.includes(s));
  }, [rows, q]);

  const activeCount = filtered.filter((c) => c.status === "active").length;

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-label="Loading" />
      </div>
    );
  }

  if (err) {
    return (
      <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {err}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Campaigns</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Facebook campaigns (last 30 days) from your connected Meta accounts
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> {activeCount} Active
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold">
            Total: {filtered.length}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search campaigns…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 rounded-full border-border bg-card pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full"
          type="button"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No campaigns in the last 30 days.{" "}
          <Link
            href="/dashboard/meta-connect"
            className="font-semibold text-primary hover:underline"
          >
            Connect Meta
          </Link>{" "}
          or check spend in Ads Manager.
        </p>
      ) : null}

      <div className="space-y-3 lg:hidden">
        {filtered.map((c) => (
          <div key={c.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-sm font-bold text-primary-foreground shadow-glow">
                {c.code}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold">{c.name}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="-mr-2 h-7 w-7 shrink-0 rounded-full"
                    type="button"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                      statusStyle[c.status] ?? statusStyle.other,
                    )}
                  >
                    {c.status}
                  </span>
                  <span className="text-xs text-muted-foreground">· {c.accounts} ad accounts</span>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-background/50 p-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Spend
                </div>
                <div className="text-sm font-bold tabular-nums">
                  {sym}
                  {c.spend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Results
                </div>
                <div className="text-sm font-bold tabular-nums">{c.results}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  CTR · CPC
                </div>
                <div className="text-sm font-bold tabular-nums">
                  {c.ctr.toFixed(2)}% · {sym}
                  {c.cpc.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  ROAS
                </div>
                <div className="text-sm font-bold tabular-nums text-success">
                  {c.roas > 0 ? `${c.roas.toFixed(2)}×` : "—"}
                </div>
              </div>
            </div>

            <Button variant="outline" size="sm" className="mt-3 w-full rounded-full" asChild>
              <Link href={`/dashboard/reports`}>
                <Share2 className="mr-2 h-3.5 w-3.5" /> Share
              </Link>
            </Button>
          </div>
        ))}
      </div>

      <div className="hidden rounded-3xl border border-border bg-card p-6 shadow-soft lg:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 pr-4">Campaign</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4 text-right">Spend</th>
                <th className="pb-3 pr-4 text-right">Results</th>
                <th className="pb-3 pr-4 text-right">CTR</th>
                <th className="pb-3 pr-4 text-right">CPC</th>
                <th className="pb-3 pr-4 text-right">ROAS</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-border/60">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                        {c.code}
                      </span>
                      <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {c.accounts} ad accounts
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                        statusStyle[c.status] ?? statusStyle.other,
                      )}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-right font-medium tabular-nums">
                    {sym}
                    {c.spend.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 pr-4 text-right tabular-nums">{c.results}</td>
                  <td className="py-4 pr-4 text-right tabular-nums">{c.ctr.toFixed(2)}%</td>
                  <td className="py-4 pr-4 text-right tabular-nums">
                    {sym}
                    {c.cpc.toFixed(2)}
                  </td>
                  <td className="py-4 pr-4 text-right font-semibold tabular-nums">
                    {c.roas > 0 ? `${c.roas.toFixed(2)}×` : "—"}
                  </td>
                  <td className="py-4 text-right">
                    <Button variant="outline" size="sm" className="rounded-full" asChild>
                      <Link href="/dashboard/reports">
                        <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
