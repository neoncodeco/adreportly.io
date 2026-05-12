"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ADMIN_PAGE_SIZE,
  ADMIN_STALE_MS,
  adminQk,
  fetchAdminBilling,
  type AdminBillingRow as Row,
} from "@/lib/admin-queries";

export function AdminBillingPage() {
  const [q, setQ] = useState("");
  const deferredQ = useDeferredValue(q);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [deferredQ, status]);

  const { data, isPending, isError, error, isFetching, isPlaceholderData } = useQuery({
    queryKey: adminQk.billing(page, ADMIN_PAGE_SIZE, deferredQ, status),
    queryFn: () => fetchAdminBilling(page, ADMIN_PAGE_SIZE, deferredQ, status),
    staleTime: ADMIN_STALE_MS,
    placeholderData: keepPreviousData,
  });

  const rows = data?.subscriptions ?? [];
  const total = data?.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const canPrev = page > 1;
  const canNext = page < lastPage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Billing Management</h1>
          <p className="text-sm text-muted-foreground">
            {total.toLocaleString()} subscription{total === 1 ? "" : "s"} tracked.
          </p>
        </div>
        <div className="flex w-full gap-2 md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="User/subscription/ref"
              className="h-10 rounded-full pl-9"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 rounded-full border border-border bg-card px-4 text-sm"
          >
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="past_due">Past Due</option>
            <option value="canceled">Canceled</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {isError ? (
        <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-sm font-medium text-destructive">
          {error instanceof Error ? error.message : "Could not load billing records."}
        </div>
      ) : null}

      <div
        className={`overflow-hidden rounded-2xl border border-border bg-card shadow-soft ${
          isFetching && isPlaceholderData ? "opacity-80" : ""
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Provider subscription</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Next billing</th>
              </tr>
            </thead>
            <tbody>
              {isPending && rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-7 w-7 animate-spin" />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    No subscriptions found.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border/70 last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-mono text-xs">{row.userId}</td>
                    <td className="px-4 py-3 capitalize">{row.planId}</td>
                    <td className="px-4 py-3">
                      {row.currency} {row.amount}
                    </td>
                    <td className="px-4 py-3 capitalize">{row.status.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {row.providerSubscriptionId || "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{row.providerReference || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.nextBillingAt ? new Date(row.nextBillingAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Showing {(total === 0 ? 0 : (page - 1) * ADMIN_PAGE_SIZE + 1).toLocaleString()}-
          {Math.min(page * ADMIN_PAGE_SIZE, total).toLocaleString()} of {total.toLocaleString()}
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={!canPrev || isFetching}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page} / {lastPage}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={!canNext || isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
