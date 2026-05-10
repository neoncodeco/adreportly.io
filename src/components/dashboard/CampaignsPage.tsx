"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Share2,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DASHBOARD_CAMPAIGNS_PAGE_SIZE,
  DASHBOARD_OVERVIEW_STALE_MS,
  dashboardQk,
  fetchDashboardCampaignsPage,
  type DashboardCampaignRow,
} from "@/lib/dashboard-queries";

const statusStyle: Record<string, string> = {
  active: "bg-success/15 text-success",
  paused: "bg-warning/15 text-warning-foreground",
  completed: "bg-muted text-muted-foreground",
  other: "bg-muted text-muted-foreground",
};

export function CampaignsPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const deferredQ = useDeferredValue(q);

  useEffect(() => {
    setPage(1);
  }, [deferredQ]);

  const { data, isPending, isError, error, isFetching, isPlaceholderData } = useQuery({
    queryKey: dashboardQk.campaignsPage(page, DASHBOARD_CAMPAIGNS_PAGE_SIZE, deferredQ),
    queryFn: () =>
      fetchDashboardCampaignsPage({
        page,
        limit: DASHBOARD_CAMPAIGNS_PAGE_SIZE,
        q: deferredQ,
      }),
    staleTime: DASHBOARD_OVERVIEW_STALE_MS,
    placeholderData: keepPreviousData,
  });

  const rows: DashboardCampaignRow[] = data?.campaigns ?? [];
  const sym = data?.currencySymbol ?? "৳";
  const pagination = data?.pagination;
  const activeCount = data?.summary.activeCount ?? 0;
  const total = pagination?.total ?? 0;

  if (isPending && !isPlaceholderData) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-label="Loading" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {error instanceof Error ? error.message : "Could not load campaigns"}
      </div>
    );
  }

  if (!pagination) {
    return null;
  }

  const from = total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const to = Math.min(pagination.page * pagination.limit, total);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn("space-y-5", isFetching && isPlaceholderData && "opacity-80")}
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
          to load live campaign data.
        </div>
      )}

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
            Total: {total}
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

      {total === 0 ? (
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
        {rows.map((c) => (
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
              {rows.map((c) => (
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

      {total > 0 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card px-4 py-3 sm:px-5">
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {from}–{to}
            </span>{" "}
            of <span className="font-medium text-foreground">{total}</span>
            {isFetching ? (
              <Loader2
                className="ml-2 inline h-3.5 w-3.5 animate-spin align-middle text-muted-foreground"
                aria-hidden
              />
            ) : null}
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={pagination.page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[7rem] text-center text-xs font-semibold tabular-nums text-foreground">
              Page {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={pagination.page >= pagination.totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}
