"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  RefreshCcw,
  Check,
  Sparkles,
  Zap,
  ArrowRight,
  BadgeCheck,
  Crown,
  Download,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BILLING_PLANS,
  getBillingCyclePrice,
  getCheckoutPricing,
  type BillingCycle,
} from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

type BillingSummary = {
  currentPlan: { id: string; name: string; priceLabel: string; interval: string | null };
  currentStatus: string;
  billingCycle: "monthly" | "yearly" | null;
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

function statusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "active") return "bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30";
  if (s === "pending") return "bg-amber-500/15 text-amber-700 ring-1 ring-amber-500/30";
  if (s === "past_due" || s === "past due")
    return "bg-rose-500/15 text-rose-700 ring-1 ring-rose-500/30";
  if (s === "canceled" || s === "expired")
    return "bg-muted text-muted-foreground ring-1 ring-border";
  return "bg-muted text-muted-foreground ring-1 ring-border";
}

/** Payment row statuses (paid / pending / …). */
function paymentStatusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "paid")
    return "bg-emerald-500/20 text-emerald-800 ring-1 ring-emerald-600/40 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/40";
  if (s === "pending") return "bg-amber-500/15 text-amber-700 ring-1 ring-amber-500/30";
  if (s === "failed") return "bg-rose-500/15 text-rose-700 ring-1 ring-rose-500/30";
  if (s === "refunded" || s === "canceled")
    return "bg-muted text-muted-foreground ring-1 ring-border";
  return "bg-muted text-muted-foreground ring-1 ring-border";
}

export function UserBillingPage() {
  const [data, setData] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

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

  const currentPlanId = data?.currentPlan?.id ?? "free";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── Page header ── */}
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
          {/* ── Current plan summary cards ── */}
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
              <div className="mt-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                    statusBadge(data.currentStatus),
                  )}
                >
                  {data.currentStatus.replace(/_/g, " ")}
                </span>
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {data.billingCycle === "yearly" ? "Annual renewal" : "Next renewal"}
              </p>
              <p className="mt-2 text-lg font-bold">
                {data.renewalAt
                  ? new Date(data.renewalAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "Not scheduled"}
              </p>
              {data.billingCycle ? (
                <p className="mt-1 text-[11px] text-muted-foreground capitalize">
                  {data.billingCycle} billing
                </p>
              ) : null}
            </div>
          </div>

          {/* ── Pricing plans ── */}
          <div>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold">Upgrade Your Plan</h2>
                <p className="text-xs text-muted-foreground">
                  Choose the plan that fits your agency best
                </p>
              </div>
            </div>
            <div className="mb-4 inline-flex rounded-full border border-border bg-card p-1">
              {(["monthly", "yearly"] as BillingCycle[]).map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setBillingCycle(cycle)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition",
                    billingCycle === cycle
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {cycle}
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {BILLING_PLANS.map((plan, i) => {
                const isCurrent = plan.id === currentPlanId;
                const isHighlight = plan.highlight;
                const selectedPrice = getBillingCyclePrice(plan, billingCycle);
                const yearlyTotal =
                  plan.isPaid && billingCycle === "yearly"
                    ? getCheckoutPricing(plan, "yearly")
                    : null;

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.07 }}
                    className={cn(
                      "relative flex flex-col overflow-hidden rounded-3xl border shadow-soft transition-all duration-200",
                      isCurrent
                        ? "border-emerald-500/50 bg-gradient-to-b from-emerald-500/10 via-card to-card ring-2 ring-emerald-500/30"
                        : isHighlight
                          ? "border-violet-400/30 bg-gradient-to-b from-violet-500/8 via-card to-card"
                          : "border-border bg-card hover:border-primary/20 hover:shadow-md",
                    )}
                  >
                    {/* Top badges */}
                    <div className="flex h-7 items-center px-5 pt-5">
                      {!isCurrent && isHighlight && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-violet-700">
                          <Sparkles className="h-3 w-3" />
                          Most Popular
                        </span>
                      )}
                      {!isCurrent && plan.id === "enterprise" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-700">
                          <Crown className="h-3 w-3" />
                          Custom
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-5 pt-3">
                      {/* Name */}
                      <p
                        className={cn(
                          "text-xs font-bold uppercase tracking-widest",
                          isCurrent
                            ? "text-emerald-700"
                            : isHighlight
                              ? "text-violet-600"
                              : "text-muted-foreground",
                        )}
                      >
                        {plan.name}
                      </p>

                      {/* Price */}
                      <div className="mt-2 space-y-1">
                        <span className="text-3xl font-extrabold tracking-tight text-foreground">
                          {yearlyTotal
                            ? `৳${yearlyTotal.totalDue.toLocaleString()}/yr`
                            : selectedPrice.priceLabel}
                        </span>
                        {plan.isPaid && selectedPrice.compareAtLabel ? (
                          <span className="text-sm text-muted-foreground line-through">
                            {selectedPrice.compareAtLabel}
                          </span>
                        ) : null}
                        {yearlyTotal ? (
                          <p className="text-[11px] text-muted-foreground">
                            {yearlyTotal.unitPriceLabel} × {yearlyTotal.monthsCharged} months, one
                            payment today
                          </p>
                        ) : null}
                        {plan.isPaid && plan.pricingInfo ? (
                          <div className="text-[11px] text-muted-foreground">
                            {billingCycle === "monthly"
                              ? `Regular: ${plan.pricingInfo.regular ?? "—"}  |  Discount: ${plan.pricingInfo.discount ?? selectedPrice.priceLabel}`
                              : `Regular: ${plan.pricingInfo.regular ?? "—"}  |  Per month on annual: ${plan.pricingInfo.yearly ?? selectedPrice.priceLabel}`}
                          </div>
                        ) : null}
                      </div>

                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                        {plan.description}
                      </p>

                      <div className="my-4 h-px bg-border" />

                      {/* Features */}
                      <ul className="flex-1 space-y-2">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                            <span
                              className={cn(
                                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                                isCurrent
                                  ? "bg-emerald-500/15 text-emerald-700"
                                  : isHighlight
                                    ? "bg-violet-500/15 text-violet-600"
                                    : "bg-emerald-500/15 text-emerald-700",
                              )}
                            >
                              <Check className="h-2.5 w-2.5" strokeWidth={3} />
                            </span>
                            {f}
                          </li>
                        ))}
                      </ul>

                      {/* CTA button */}
                      <div className="mt-5">
                        {isCurrent ? (
                          <div className="flex h-10 w-full items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/15 text-sm font-semibold text-emerald-700">
                            <BadgeCheck className="mr-1.5 h-4 w-4" />
                            Active Plan
                          </div>
                        ) : plan.id === "enterprise" ? (
                          <Button
                            asChild
                            variant="outline"
                            className="h-10 w-full rounded-full border-amber-400/50 text-amber-700 hover:bg-amber-50"
                          >
                            <Link href="/dashboard/billing/custom">
                              Request custom quote
                              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        ) : plan.isPaid ? (
                          <Button
                            asChild
                            className={cn(
                              "h-10 w-full rounded-full font-semibold",
                              isHighlight
                                ? "bg-violet-600 text-white shadow-md hover:bg-violet-700"
                                : "bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90",
                            )}
                          >
                            <Link href={`/checkout?plan=${plan.id}&cycle=${billingCycle}`}>
                              Upgrade to {plan.name}
                              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        ) : (
                          <Button
                            asChild
                            variant="outline"
                            className="h-10 w-full rounded-full text-muted-foreground"
                          >
                            <Link href="/dashboard">Stay on Free</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ── Recent payments ── */}
          <div className="rounded-3xl border border-border bg-card shadow-soft">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-base font-bold">Recent Payments</h2>
              <p className="text-xs text-muted-foreground">Your payment history</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3">Payment ID</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.payments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                        No payments yet.
                      </td>
                    </tr>
                  ) : (
                    data.payments.map((payment) => (
                      <tr key={payment.id} className="transition hover:bg-muted/20">
                        <td className="px-5 py-3 font-mono text-xs text-foreground/80">
                          {payment.providerPaymentId}
                        </td>
                        <td className="px-4 py-3 font-medium capitalize">{payment.planId}</td>
                        <td className="px-4 py-3 font-semibold">
                          {payment.currency} {payment.amount}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                                paymentStatusBadge(payment.status),
                              )}
                            >
                              {payment.status.replace(/_/g, " ")}
                            </span>
                            {payment.status.toLowerCase() === "paid" ? (
                              <a
                                href={`/api/billing/invoice/${payment.id}`}
                                className="inline-flex items-center gap-1 rounded-full border border-emerald-600/35 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-500/20 dark:text-emerald-300"
                              >
                                <Download className="h-3.5 w-3.5 shrink-0" />
                                Invoice
                              </a>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {payment.paidAt
                            ? new Date(payment.paidAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : payment.createdAt
                              ? new Date(payment.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
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
