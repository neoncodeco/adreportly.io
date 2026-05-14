"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Image as ImageIcon,
  Loader2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { deliveryDotClass, deliveryLabel, deliveryPillClass } from "@/lib/meta-delivery";
import {
  DASHBOARD_META_PAGE_SIZE,
  DASHBOARD_OVERVIEW_STALE_MS,
  REPORT_DATE_PRESET_OPTIONS,
  dashboardQk,
  fetchDashboardAdSetsPage,
  fetchDashboardAdsPage,
  type DashboardAdRow,
  type DashboardAdSetRow,
  type DashboardAdsPageResponse,
  type DashboardAdSetsPageResponse,
  type DashboardMetaSort,
  type DashboardMetaStatusFilter,
  type ReportDatePreset,
} from "@/lib/dashboard-queries";

type MetaLevel = "adsets" | "ads";
type MetaRow = DashboardAdSetRow | DashboardAdRow;

const levelCopy = {
  adsets: {
    title: "Ad Sets",
    label: "ad sets",
    filterTitle: "Filter ad sets",
    empty: "No ad sets found for this date range.",
    subtitle: "Meta ad sets from your connected ad accounts",
    searchPlaceholder: "Name, ID, campaign, or ad account...",
  },
  ads: {
    title: "Ads",
    label: "ads",
    filterTitle: "Filter ads",
    empty: "No ads found for this date range.",
    subtitle: "Meta ads with creative previews when Meta returns them",
    searchPlaceholder: "Name, ID, ad set, campaign, or ad account...",
  },
} satisfies Record<MetaLevel, Record<string, string>>;

function isAdRow(row: MetaRow): row is DashboardAdRow {
  return "adsetName" in row;
}

function money(sym: string, value: number, digits = 2) {
  return `${sym}${value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

function compactMoney(sym: string, value: number | null) {
  if (value == null) return "No budget";
  return money(sym, value, value >= 100 ? 0 : 2);
}

function nullableMoney(sym: string, value: number | null) {
  return value != null ? money(sym, value) : "—";
}

function rowSubline(row: MetaRow) {
  if (isAdRow(row)) return `${row.adsetName} | ${row.campaignName}`;
  return `${row.campaignName} | ${row.accountName}`;
}

function EntityMark({ row, level }: { row: MetaRow; level: MetaLevel }) {
  if (isAdRow(row) && row.previewUrl) {
    return (
      <img
        src={row.previewUrl}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    );
  }

  if (level === "ads") {
    return <ImageIcon className="h-4 w-4" />;
  }

  return <span>{row.code}</span>;
}

function MetaLevelPage({ level }: { level: MetaLevel }) {
  const copy = levelCopy[level];
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const deferredQ = useDeferredValue(q);
  const [statusFilter, setStatusFilter] = useState<DashboardMetaStatusFilter>("all");
  const [sortBy, setSortBy] = useState<DashboardMetaSort>("spend");
  const [datePreset, setDatePreset] = useState<ReportDatePreset>("last_30d");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [deferredQ, statusFilter, sortBy, datePreset]);

  const { data, isPending, isError, error, isFetching, isPlaceholderData } = useQuery<
    DashboardAdSetsPageResponse | DashboardAdsPageResponse
  >({
    queryKey:
      level === "adsets"
        ? dashboardQk.adsetsPage(
            page,
            DASHBOARD_META_PAGE_SIZE,
            deferredQ,
            statusFilter,
            sortBy,
            datePreset,
          )
        : dashboardQk.adsPage(
            page,
            DASHBOARD_META_PAGE_SIZE,
            deferredQ,
            statusFilter,
            sortBy,
            datePreset,
          ),
    queryFn: () =>
      level === "adsets"
        ? fetchDashboardAdSetsPage({
            page,
            limit: DASHBOARD_META_PAGE_SIZE,
            q: deferredQ,
            status: statusFilter,
            sort: sortBy,
            datePreset,
          })
        : fetchDashboardAdsPage({
            page,
            limit: DASHBOARD_META_PAGE_SIZE,
            q: deferredQ,
            status: statusFilter,
            sort: sortBy,
            datePreset,
          }),
    staleTime: DASHBOARD_OVERVIEW_STALE_MS,
    placeholderData: keepPreviousData,
  });

  const adsetsData = level === "adsets" ? (data as DashboardAdSetsPageResponse | undefined) : null;
  const adsData = level === "ads" ? (data as DashboardAdsPageResponse | undefined) : null;
  const rows: MetaRow[] = adsetsData?.adsets ?? adsData?.ads ?? [];
  const sym = data?.currencySymbol ?? "৳";
  const pagination = data?.pagination;
  const activeCount = data?.summary.activeCount ?? 0;
  const total = pagination?.total ?? 0;
  const dateLabel =
    REPORT_DATE_PRESET_OPTIONS.find((option) => option.value === datePreset)?.label ??
    "Last 30 days";

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
        {error instanceof Error ? error.message : `Could not load ${copy.label}`}
      </div>
    );
  }

  if (!pagination) return null;

  const from = total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const to = Math.min(pagination.page * pagination.limit, total);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn("space-y-5", isFetching && isPlaceholderData && "opacity-80")}
    >
      {data?.connected === false ? (
        <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Connect Facebook under{" "}
          <Link
            href="/dashboard/meta-connect"
            className="font-semibold text-primary hover:underline"
          >
            Meta Connect
          </Link>{" "}
          to load live {copy.label}.
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">{copy.title}</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {copy.subtitle} · {dateLabel}
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
                  {statusFilter !== "all" ? ` | ${statusFilter}` : ""}
                  {q.trim() ? " | search" : ""} | tap to {mobileFiltersOpen ? "hide" : "edit"}
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
                  <Label htmlFor={`${level}-search-m`} className="text-xs">
                    Search
                  </Label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={`${level}-search-m`}
                      placeholder={copy.searchPlaceholder}
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      className="h-11 rounded-xl pl-9"
                    />
                  </div>
                </div>
                <FilterControls
                  level={level}
                  statusFilter={statusFilter}
                  sortBy={sortBy}
                  datePreset={datePreset}
                  setStatusFilter={setStatusFilter}
                  setSortBy={setSortBy}
                  setDatePreset={setDatePreset}
                  mobile
                />
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
              <h2 className="text-sm font-bold sm:text-base">{copy.filterTitle}</h2>
              <p className="text-[11px] text-muted-foreground sm:text-xs">
                Search, delivery, date range, and sort apply to the full list.
              </p>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-5">
            <div className="space-y-1.5 lg:col-span-2">
              <Label htmlFor={`${level}-search`} className="text-xs">
                Search
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id={`${level}-search`}
                  placeholder={copy.searchPlaceholder}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="h-10 rounded-xl pl-9"
                />
              </div>
            </div>
            <FilterControls
              level={level}
              statusFilter={statusFilter}
              sortBy={sortBy}
              datePreset={datePreset}
              setStatusFilter={setStatusFilter}
              setSortBy={setSortBy}
              setDatePreset={setDatePreset}
            />
          </div>
        </div>
      </div>

      {total === 0 ? (
        <p className="text-sm text-muted-foreground">
          {copy.empty}{" "}
          <Link
            href="/dashboard/meta-connect"
            className="font-semibold text-primary hover:underline"
          >
            Check Meta connection
          </Link>
          .
        </p>
      ) : null}

      <div className="space-y-3 lg:hidden">
        {rows.map((row) => (
          <div key={row.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-primary text-xs font-bold text-primary-foreground shadow-glow">
                <EntityMark row={row} level={level} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{row.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      deliveryPillClass(row.status),
                    )}
                  >
                    {deliveryLabel(row.status)}
                  </span>
                  <span className="max-w-full truncate text-xs text-muted-foreground">
                    {rowSubline(row)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-background/50 p-3">
              <Metric label="Amount spent" value={money(sym, row.spend, 0)} />
              <Metric label="Results" value={row.results.toLocaleString()} />
              <Metric label="CTR" value={`${row.ctr.toFixed(2)}%`} />
              <Metric label="Cost / result" value={nullableMoney(sym, row.costPerResult)} />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden rounded-3xl border border-border bg-card p-6 shadow-soft lg:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 pr-4">{level === "ads" ? "Ad" : "Ad Set"}</th>
                {level === "ads" ? <th className="pb-3 pr-4">Ad Set</th> : null}
                <th className="pb-3 pr-4">Campaign</th>
                <th className="pb-3 pr-4">Delivery</th>
                {level === "adsets" ? <th className="pb-3 pr-4 text-right">Budget</th> : null}
                <th className="pb-3 pr-4 text-right">Amount spent</th>
                <th className="pb-3 pr-4 text-right">Results</th>
                <th className="pb-3 pr-4 text-right">CTR</th>
                <th className="pb-3 text-right">Cost / result</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-border/60">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                        <EntityMark row={row} level={level} />
                      </span>
                      <div className="min-w-0">
                        <div className="max-w-[280px] truncate font-medium">{row.name}</div>
                        <div className="text-xs text-muted-foreground">{row.accountName}</div>
                      </div>
                    </div>
                  </td>
                  {isAdRow(row) ? (
                    <td className="py-4 pr-4">
                      <div className="max-w-[220px] truncate text-sm">{row.adsetName}</div>
                    </td>
                  ) : null}
                  <td className="py-4 pr-4">
                    <div className="max-w-[220px] truncate text-sm">{row.campaignName}</div>
                  </td>
                  <td className="py-4 pr-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        deliveryPillClass(row.status),
                      )}
                    >
                      <span
                        className={cn("h-1.5 w-1.5 rounded-full", deliveryDotClass(row.status))}
                      />
                      {deliveryLabel(row.status)}
                    </span>
                  </td>
                  {!isAdRow(row) ? (
                    <td className="py-4 pr-4 text-right tabular-nums">
                      <div className="font-medium">{compactMoney(sym, row.budget)}</div>
                      {row.budgetType ? (
                        <div className="text-[11px] capitalize text-muted-foreground">
                          {row.budgetType}
                        </div>
                      ) : null}
                    </td>
                  ) : null}
                  <td className="py-4 pr-4 text-right font-medium tabular-nums">
                    {money(sym, row.spend)}
                  </td>
                  <td className="py-4 pr-4 text-right tabular-nums">
                    {row.results.toLocaleString()}
                  </td>
                  <td className="py-4 pr-4 text-right tabular-nums">{row.ctr.toFixed(2)}%</td>
                  <td className="py-4 text-right tabular-nums">
                    {nullableMoney(sym, row.costPerResult)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {total > 0 ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {from}-{to}
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-bold tabular-nums">{value}</div>
    </div>
  );
}

function FilterControls({
  level,
  statusFilter,
  sortBy,
  datePreset,
  setStatusFilter,
  setSortBy,
  setDatePreset,
  mobile = false,
}: {
  level: MetaLevel;
  statusFilter: DashboardMetaStatusFilter;
  sortBy: DashboardMetaSort;
  datePreset: ReportDatePreset;
  setStatusFilter: (value: DashboardMetaStatusFilter) => void;
  setSortBy: (value: DashboardMetaSort) => void;
  setDatePreset: (value: ReportDatePreset) => void;
  mobile?: boolean;
}) {
  return (
    <div className={cn("grid gap-3", mobile ? "min-[420px]:grid-cols-3" : "contents")}>
      <div className="space-y-1.5">
        <Label htmlFor={`${level}-date${mobile ? "-m" : ""}`} className="text-xs">
          Date range
        </Label>
        <Select value={datePreset} onValueChange={(v) => setDatePreset(v as ReportDatePreset)}>
          <SelectTrigger id={`${level}-date${mobile ? "-m" : ""}`} className="h-10 rounded-xl">
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
        <Label htmlFor={`${level}-status${mobile ? "-m" : ""}`} className="text-xs">
          Delivery
        </Label>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as DashboardMetaStatusFilter)}
        >
          <SelectTrigger id={`${level}-status${mobile ? "-m" : ""}`} className="h-10 rounded-xl">
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
        <Label htmlFor={`${level}-sort${mobile ? "-m" : ""}`} className="text-xs">
          Sort by
        </Label>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as DashboardMetaSort)}>
          <SelectTrigger id={`${level}-sort${mobile ? "-m" : ""}`} className="h-10 rounded-xl">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="spend">Amount spent high to low</SelectItem>
            <SelectItem value="results">Results high to low</SelectItem>
            <SelectItem value="costPerResult">Cost / result low to high</SelectItem>
            <SelectItem value="roas">ROAS high to low</SelectItem>
            <SelectItem value="ctr">CTR high to low</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function AdSetsPage() {
  return <MetaLevelPage level="adsets" />;
}

export function AdsPage() {
  return <MetaLevelPage level="ads" />;
}
