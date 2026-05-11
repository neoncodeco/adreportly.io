"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Share2,
  MoreHorizontal,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import {
  DASHBOARD_CAMPAIGNS_PAGE_SIZE,
  DASHBOARD_OVERVIEW_STALE_MS,
  dashboardQk,
  fetchDashboardCampaignsPage,
  type DashboardCampaignRow,
  type DashboardCampaignsSort,
  type DashboardCampaignsStatusFilter,
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
  const [statusFilter, setStatusFilter] = useState<DashboardCampaignsStatusFilter>("all");
  const [sortBy, setSortBy] = useState<DashboardCampaignsSort>("spend");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [deferredQ, statusFilter, sortBy]);

  const { data, isPending, isError, error, isFetching, isPlaceholderData } = useQuery({
    queryKey: dashboardQk.campaignsPage(
      page,
      DASHBOARD_CAMPAIGNS_PAGE_SIZE,
      deferredQ,
      statusFilter,
      sortBy,
    ),
    queryFn: () =>
      fetchDashboardCampaignsPage({
        page,
        limit: DASHBOARD_CAMPAIGNS_PAGE_SIZE,
        q: deferredQ,
        status: statusFilter,
        sort: sortBy,
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

      <div className="rounded-3xl border border-border bg-card p-3 shadow-soft sm:p-5">
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
                <div className="text-sm font-bold">Filters</div>
                <div className="truncate text-[11px] text-muted-foreground">
                  {total} match{total === 1 ? "" : "es"}
                  {statusFilter !== "all" ? ` · ${statusFilter}` : ""}
                  {q.trim() ? " · search" : ""} · tap to {mobileFiltersOpen ? "hide" : "edit"}
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
                  <Label htmlFor="camp-search-m" className="text-xs">
                    Search
                  </Label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="camp-search-m"
                      placeholder="Name, ID, or code…"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      className="h-11 rounded-xl pl-9"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="camp-status-m" className="text-xs">
                      Status
                    </Label>
                    <Select
                      value={statusFilter}
                      onValueChange={(v) => setStatusFilter(v as DashboardCampaignsStatusFilter)}
                    >
                      <SelectTrigger id="camp-status-m" className="h-11 rounded-xl">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="camp-sort-m" className="text-xs">
                      Sort
                    </Label>
                    <Select
                      value={sortBy}
                      onValueChange={(v) => setSortBy(v as DashboardCampaignsSort)}
                    >
                      <SelectTrigger id="camp-sort-m" className="h-11 rounded-xl">
                        <SelectValue placeholder="Sort" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spend">Spend (high → low)</SelectItem>
                        <SelectItem value="results">Results (high → low)</SelectItem>
                        <SelectItem value="roas">ROAS (high → low)</SelectItem>
                        <SelectItem value="ctr">CTR (high → low)</SelectItem>
                        <SelectItem value="cpc">CPC (low → high)</SelectItem>
                        <SelectItem value="name">Name (A–Z)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="hidden sm:block">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Filter className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold sm:text-base">Filter campaigns</h2>
              <p className="text-[11px] text-muted-foreground sm:text-xs">
                Search, status, and sort apply to the full list (last 30 days).
              </p>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-4">
            <div className="space-y-1.5 lg:col-span-2">
              <Label htmlFor="camp-search" className="text-xs">
                Search
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="camp-search"
                  placeholder="Name, ID, or code…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="h-10 rounded-xl pl-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="camp-status" className="text-xs">
                Status
              </Label>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as DashboardCampaignsStatusFilter)}
              >
                <SelectTrigger id="camp-status" className="h-10 rounded-xl">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="camp-sort" className="text-xs">
                Sort by
              </Label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as DashboardCampaignsSort)}>
                <SelectTrigger id="camp-sort" className="h-10 rounded-xl">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spend">Spend (high → low)</SelectItem>
                  <SelectItem value="results">Results (high → low)</SelectItem>
                  <SelectItem value="roas">ROAS (high → low)</SelectItem>
                  <SelectItem value="ctr">CTR (high → low)</SelectItem>
                  <SelectItem value="cpc">CPC (low → high)</SelectItem>
                  <SelectItem value="name">Name (A–Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
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
              <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-primary text-sm font-bold text-primary-foreground shadow-glow">
                {c.previewUrl ? (
                  <img
                    src={c.previewUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  c.code
                )}
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
                      <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                        {c.previewUrl ? (
                          <img
                            src={c.previewUrl}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          c.code
                        )}
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
