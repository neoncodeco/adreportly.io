"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Row = {
  id: string;
  userId: string;
  planId: string;
  status: string;
  amount: number;
  currency: string;
  providerSubscriptionId: string | null;
  providerReference: string | null;
  nextBillingAt: string | null;
  updatedAt: string | null;
};

export function AdminBillingPage() {
  const pageSize = 20;
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const params = new URLSearchParams({
        limit: String(pageSize),
        skip: String((page - 1) * pageSize),
      });
      if (q.trim()) params.set("q", q.trim());
      if (status.trim()) params.set("status", status.trim());
      const res = await fetch(`/api/admin/billing?${params.toString()}`, {
        credentials: "include",
      });
      const json = (await res.json()) as {
        success?: boolean;
        error?: string;
        total?: number;
        subscriptions?: Row[];
      };
      if (!res.ok || json.success === false) {
        setErr(json.error || "Could not load billing records.");
        setRows([]);
        setTotal(0);
        return;
      }
      setRows(json.subscriptions ?? []);
      setTotal(json.total ?? 0);
    } catch {
      setErr("Network error.");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [q, status, page]);

  useEffect(() => {
    setPage(1);
  }, [q, status]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 250);
    return () => clearTimeout(t);
  }, [load]);

  const lastPage = Math.max(1, Math.ceil(total / pageSize));
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

      {err ? (
        <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-sm font-medium text-destructive">
          {err}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
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
              {loading && rows.length === 0 ? (
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
          Showing {(total === 0 ? 0 : (page - 1) * pageSize + 1).toLocaleString()}-
          {Math.min(page * pageSize, total).toLocaleString()} of {total.toLocaleString()}
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={!canPrev || loading}
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
            disabled={!canNext || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
