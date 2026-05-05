"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type BillingSummary = {
  currentPlan: { id: string; name: string; priceLabel: string; interval: string | null };
  currentStatus: string;
  renewalAt: string | null;
  payments: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    planId: string;
    paidAt: string | null;
    createdAt: string | null;
    providerPaymentId: string;
  }>;
};

export function UserBillingPage() {
  const [data, setData] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/billing/me", { credentials: "include" });
      const json = (await res.json()) as BillingSummary & { error?: string };
      if (!res.ok) {
        setErr(json.error || "Could not load billing data.");
        setData(null);
        return;
      }
      setData(json);
    } catch {
      setErr("Network error.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Billing</h1>
          <p className="text-sm text-muted-foreground">
            Manage your subscription and payment history.
          </p>
        </div>
        <Button variant="outline" className="rounded-full" onClick={() => void load()}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-border bg-card p-14 text-center text-muted-foreground">
          <Loader2 className="mx-auto h-7 w-7 animate-spin" />
        </div>
      ) : null}

      {err ? (
        <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-sm font-medium text-destructive">
          {err}
        </div>
      ) : null}

      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Current plan
              </p>
              <p className="mt-2 text-lg font-bold">{data.currentPlan.name}</p>
              <p className="text-sm text-muted-foreground">
                {data.currentPlan.priceLabel}
                {data.currentPlan.interval ? `/${data.currentPlan.interval}` : ""}
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </p>
              <p className="mt-2 text-lg font-bold capitalize">
                {data.currentStatus.replace(/_/g, " ")}
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Next renewal
              </p>
              <p className="mt-2 text-lg font-bold">
                {data.renewalAt ? new Date(data.renewalAt).toLocaleDateString() : "Not scheduled"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-soft">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold">Recent payments</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Payment ID</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        No payments yet.
                      </td>
                    </tr>
                  ) : (
                    data.payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-border/70 last:border-0">
                        <td className="px-4 py-3 font-mono text-xs">{payment.providerPaymentId}</td>
                        <td className="px-4 py-3 capitalize">{payment.planId}</td>
                        <td className="px-4 py-3">
                          {payment.currency} {payment.amount}
                        </td>
                        <td className="px-4 py-3 capitalize">
                          {payment.status.replace(/_/g, " ")}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {payment.paidAt
                            ? new Date(payment.paidAt).toLocaleDateString()
                            : payment.createdAt
                              ? new Date(payment.createdAt).toLocaleDateString()
                              : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </motion.div>
  );
}
