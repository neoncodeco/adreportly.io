"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import {
  ADMIN_STALE_MS,
  fetchAdminOverview,
  type AdminMonthlyTrend as MonthlyTrend,
  type AdminOverviewTotals as Totals,
  type AdminPackageStat as PackageStat,
} from "@/lib/admin-queries";
import {
  Users,
  Shield,
  Building2,
  Link2,
  Share2,
  Loader2,
  DollarSign,
  ShoppingCart,
  Wallet,
  CheckCircle2,
  XCircle,
  Ban,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const cards = [
  {
    key: "totalIncome" as const,
    label: "Total income (paid)",
    icon: DollarSign,
    accent: "from-emerald-500/20 to-green-500/10",
    iconBg: "bg-emerald-500/15 text-emerald-600",
  },
  {
    key: "totalPackageSales" as const,
    label: "Total package sales",
    icon: ShoppingCart,
    accent: "from-sky-500/20 to-indigo-500/10",
    iconBg: "bg-sky-500/15 text-sky-600",
  },
  {
    key: "avgOrderValue" as const,
    label: "Avg order value",
    icon: Wallet,
    accent: "from-indigo-500/20 to-violet-500/10",
    iconBg: "bg-indigo-500/15 text-indigo-600",
  },
  {
    key: "totalPaidTransactions" as const,
    label: "Paid transactions",
    icon: CheckCircle2,
    accent: "from-emerald-500/20 to-lime-500/10",
    iconBg: "bg-emerald-500/15 text-emerald-600",
  },
  {
    key: "totalFailedTransactions" as const,
    label: "Failed transactions",
    icon: XCircle,
    accent: "from-rose-500/20 to-red-500/10",
    iconBg: "bg-rose-500/15 text-rose-600",
  },
  {
    key: "totalCanceledTransactions" as const,
    label: "Canceled transactions",
    icon: Ban,
    accent: "from-orange-500/20 to-amber-500/10",
    iconBg: "bg-orange-500/15 text-orange-600",
  },
  {
    key: "totalRefundedTransactions" as const,
    label: "Refunded transactions",
    icon: RotateCcw,
    accent: "from-cyan-500/20 to-sky-500/10",
    iconBg: "bg-cyan-500/15 text-cyan-600",
  },
  {
    key: "totalUsers" as const,
    label: "Registered users",
    icon: Users,
    accent: "from-violet-500/20 to-fuchsia-500/10",
    iconBg: "bg-violet-500/15 text-violet-500",
  },
  {
    key: "adminUsers" as const,
    label: "Admin accounts",
    icon: Shield,
    accent: "from-amber-500/20 to-orange-500/10",
    iconBg: "bg-amber-500/15 text-amber-500",
  },
  {
    key: "usersWithAgency" as const,
    label: "Meta linked users",
    icon: Link2,
    accent: "from-emerald-500/20 to-teal-500/10",
    iconBg: "bg-emerald-500/15 text-emerald-500",
  },
  {
    key: "totalAgencies" as const,
    label: "Agency records",
    icon: Building2,
    accent: "from-sky-500/20 to-blue-500/10",
    iconBg: "bg-sky-500/15 text-sky-500",
  },
  {
    key: "totalShareLinks" as const,
    label: "Share links",
    icon: Share2,
    accent: "from-primary/25 to-primary/5",
    iconBg: "bg-primary/15 text-primary",
  },
];

export function AdminOverview() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "overview", fromDate, toDate],
    queryFn: () => fetchAdminOverview(fromDate, toDate),
    staleTime: ADMIN_STALE_MS,
  });

  const totals = data?.totals ?? null;
  const packageStats = data?.packageStats ?? [];
  const monthlyTrend = data?.monthlyTrend ?? [];

  const values = useMemo(() => {
    const t = totals;
    return Object.fromEntries(cards.map((c) => [c.key, t?.[c.key] ?? 0])) as Record<
      (typeof cards)[number]["key"],
      number
    >;
  }, [totals]);
  const currency = "BDT";
  const fmtMoney = (n: number) =>
    `${currency} ${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  const totalAttempts =
    values.totalPaidTransactions +
    values.totalFailedTransactions +
    values.totalCanceledTransactions +
    values.totalRefundedTransactions;
  const paidRate = totalAttempts > 0 ? (values.totalPaidTransactions / totalAttempts) * 100 : 0;
  const failureRate =
    totalAttempts > 0
      ? ((values.totalFailedTransactions + values.totalCanceledTransactions) / totalAttempts) * 100
      : 0;

  if (isPending && !totals) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center rounded-3xl border border-border bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-label="Loading" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <p className="text-sm font-medium text-destructive">
          {error instanceof Error ? error.message : "Could not load overview"}
        </p>
        <button
          type="button"
          className="mt-4 text-sm font-semibold text-primary underline"
          onClick={() => void refetch()}
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
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div>
          <h1 className="text-base font-bold sm:text-lg">Overview Analytics</h1>
          <p className="text-xs text-muted-foreground">
            Track income, package sales, and quality signals
          </p>
        </div>
        <div className="flex flex-wrap items-end justify-end gap-3">
          <div className="space-y-1">
            <label htmlFor="overview-from" className="text-xs font-semibold text-muted-foreground">
              From
            </label>
            <input
              id="overview-from"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="overview-to" className="text-xs font-semibold text-muted-foreground">
              To
            </label>
            <input
              id="overview-to"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => void refetch()}
            className="h-10 rounded-full bg-gradient-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            {isFetching ? "Loading..." : "Apply"}
          </button>
          <button
            type="button"
            onClick={() => {
              setFromDate("");
              setToDate("");
            }}
            className="h-10 rounded-full border border-border px-4 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {cards.map((c) => (
          <div
            key={c.key}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant sm:p-5"
          >
            <div
              className={cn(
                "pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-60 blur-2xl",
                c.accent,
              )}
            />
            <div className="relative flex items-start justify-between">
              <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", c.iconBg)}>
                <c.icon className="h-4 w-4" />
              </span>
            </div>
            <div className="relative mt-3 sm:mt-4">
              <div className="text-xl font-bold leading-tight sm:text-2xl">
                {c.key === "totalIncome" || c.key === "avgOrderValue"
                  ? fmtMoney(values[c.key])
                  : values[c.key].toLocaleString()}
              </div>
              <div className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                {c.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-5">
          <div className="mb-3">
            <h3 className="text-base font-bold">Monthly Income Trend</h3>
            <p className="text-xs text-muted-foreground">
              Paid package income and sales by month (selected range)
            </p>
          </div>
          <div className="h-64">
            {monthlyTrend.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
                No paid transaction trend yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(value: number, key: string) =>
                      key === "income"
                        ? [`${currency} ${value.toLocaleString()}`, "Income"]
                        : [value.toLocaleString(), "Sales"]
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="var(--chart-1)"
                    strokeWidth={2.4}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="var(--chart-2)"
                    strokeWidth={2.2}
                    dot={{ r: 2.5 }}
                    activeDot={{ r: 4.5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-5">
          <div className="mb-3">
            <h3 className="text-base font-bold">Package Sales & Income</h3>
            <p className="text-xs text-muted-foreground">Package-wise performance (paid only)</p>
          </div>
          <div className="h-64">
            {packageStats.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
                No package sales yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={packageStats} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="planName"
                    tickLine={false}
                    axisLine={false}
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(value: number, key: string) =>
                      key === "income"
                        ? [`${currency} ${value.toLocaleString()}`, "Income"]
                        : [value.toLocaleString(), "Sales"]
                    }
                  />
                  <Bar dataKey="sales" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="income" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-5 xl:col-span-3">
          <h3 className="text-base font-bold">Quick Health</h3>
          <p className="mt-1 text-xs text-muted-foreground">Payment quality indicators</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-border/70 bg-background/40 p-3">
              <p className="text-xs text-muted-foreground">Success rate</p>
              <p className="mt-1 text-xl font-bold">{paidRate.toFixed(1)}%</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/40 p-3">
              <p className="text-xs text-muted-foreground">Failure + cancel rate</p>
              <p className="mt-1 text-xl font-bold">{failureRate.toFixed(1)}%</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/40 p-3">
              <p className="text-xs text-muted-foreground">Total payment attempts</p>
              <p className="mt-1 text-xl font-bold">{totalAttempts.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-5 xl:col-span-3">
          <h3 className="text-base font-bold">Package Performance Breakdown</h3>
          <p className="mt-1 text-xs text-muted-foreground">Income share and sales by package</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="pb-2">Package</th>
                  <th className="pb-2 text-right">Sales</th>
                  <th className="pb-2 text-right">Income</th>
                  <th className="pb-2 text-right">Share</th>
                </tr>
              </thead>
              <tbody>
                {packageStats.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-muted-foreground">
                      No package performance data.
                    </td>
                  </tr>
                ) : (
                  packageStats.map((row) => {
                    const share =
                      values.totalIncome > 0 ? (row.income / values.totalIncome) * 100 : 0;
                    return (
                      <tr key={row.planId} className="border-t border-border/60">
                        <td className="py-3 font-medium">{row.planName}</td>
                        <td className="py-3 text-right tabular-nums">
                          {row.sales.toLocaleString()}
                        </td>
                        <td className="py-3 text-right tabular-nums">{fmtMoney(row.income)}</td>
                        <td className="py-3 text-right tabular-nums">{share.toFixed(1)}%</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
