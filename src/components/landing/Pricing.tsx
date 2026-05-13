"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import {
  BILLING_PLANS,
  getBillingCyclePrice,
  getCheckoutPricing,
  type BillingCycle,
} from "@/lib/billing/plans";
import { STANDARD_OFFER_PLAN_ID } from "@/lib/billing/offer-config";
import { cn } from "@/lib/utils";

export function Pricing({
  offer,
}: {
  offer?: {
    code: string;
    href: string;
  } | null;
}) {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  return (
    <section id="pricing" className="relative py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-50"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink">
            <Sparkles className="h-3 w-3" />
            Pricing
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-muted-foreground">Start free. Upgrade when your agency grows.</p>
          <div className="mt-6 inline-flex rounded-full border border-border bg-card p-1 shadow-soft">
            {(["monthly", "yearly"] as BillingCycle[]).map((cycle) => (
              <button
                key={cycle}
                type="button"
                onClick={() => setBillingCycle(cycle)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition",
                  billingCycle === cycle
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {cycle}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:items-center">
          {BILLING_PLANS.map((plan, i) => {
            const selectedPrice = getBillingCyclePrice(plan, billingCycle);
            const yearlyP =
              plan.isPaid && billingCycle === "yearly" ? getCheckoutPricing(plan, "yearly") : null;
            const isOfferPlan = plan.id === STANDARD_OFFER_PLAN_ID && Boolean(offer);
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, delay: i * 0.12 }}
                className={cn(
                  "relative rounded p-8 hover-lift",
                  plan.highlight
                    ? "border-2 border-brand bg-ink text-ink-foreground shadow-brutal lg:scale-[1.04] lg:-my-2"
                    : "card-brutal bg-card",
                )}
              >
                {isOfferPlan ? (
                  <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-foreground">
                    <Sparkles className="h-3 w-3" />
                    {offer?.code}
                  </span>
                ) : null}
                {plan.highlight && (
                  <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-foreground shadow-glow">
                    <Sparkles className="h-3 w-3" />
                    Most popular
                  </span>
                )}

                <h3
                  className={cn(
                    "text-sm font-semibold uppercase tracking-wider",
                    plan.highlight ? "text-brand" : "text-muted-foreground",
                  )}
                >
                  {plan.name}
                </h3>

                <div className="mt-4 space-y-1">
                  <span
                    className={cn(
                      "block font-display font-bold",
                      plan.id === "enterprise" ? "text-4xl sm:text-[2.6rem]" : "text-5xl",
                      plan.highlight ? "text-ink-foreground" : "text-foreground",
                    )}
                  >
                    {yearlyP
                      ? `৳${yearlyP.totalDue.toLocaleString()}/yr`
                      : selectedPrice.priceLabel}
                  </span>
                  {yearlyP ? (
                    <span
                      className={cn(
                        "block text-sm font-medium",
                        plan.highlight ? "text-ink-foreground/85" : "text-muted-foreground",
                      )}
                    >
                      {yearlyP.unitPriceLabel} × {yearlyP.monthsCharged} months · pay once
                    </span>
                  ) : null}
                  {plan.isPaid && selectedPrice.compareAtLabel ? (
                    <span
                      className={cn(
                        "text-sm line-through",
                        plan.highlight ? "text-ink-foreground/60" : "text-muted-foreground",
                      )}
                    >
                      {selectedPrice.compareAtLabel}
                    </span>
                  ) : null}
                  {plan.isPaid && plan.pricingInfo ? (
                    <div
                      className={cn(
                        "pt-1 text-[11px]",
                        plan.highlight ? "text-ink-foreground/75" : "text-muted-foreground",
                      )}
                    >
                      {billingCycle === "monthly"
                        ? `Regular: ${plan.pricingInfo.regular ?? "—"}  |  Discount: ${plan.pricingInfo.discount ?? selectedPrice.priceLabel}`
                        : `Regular: ${plan.pricingInfo.regular ?? "—"}  |  Yearly: ${plan.pricingInfo.yearly ?? selectedPrice.priceLabel}`}
                    </div>
                  ) : null}
                </div>

                <p
                  className={cn(
                    "mt-3 text-sm",
                    plan.highlight ? "text-ink-foreground/80" : "text-muted-foreground",
                  )}
                >
                  {plan.description}
                </p>

                <div
                  className={cn("my-6 h-px", plan.highlight ? "bg-ink-foreground/15" : "bg-border")}
                />

                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={cn(
                        "flex items-start gap-2.5 text-sm",
                        plan.highlight ? "text-ink-foreground/90" : "text-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                          plan.highlight ? "bg-brand text-brand-foreground" : "bg-accent text-ink",
                        )}
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={cn(
                    "mt-8 w-full rounded font-semibold btn-brutal h-auto py-3",
                    plan.highlight
                      ? "!bg-brand !text-brand-foreground hover:!bg-brand"
                      : "!bg-brand !text-brand-foreground hover:!bg-brand",
                  )}
                >
                  <Link
                    href={
                      isOfferPlan
                        ? (offer?.href ?? `/checkout?plan=${plan.id}&cycle=${billingCycle}`)
                        : plan.id === "enterprise"
                          ? user
                            ? "/dashboard/billing/custom"
                            : `/signup?next=${encodeURIComponent("/dashboard/billing/custom")}`
                          : plan.isPaid
                            ? `/checkout?plan=${plan.id}&cycle=${billingCycle}`
                            : user
                              ? "/dashboard"
                              : "/signup"
                    }
                  >
                    {isOfferPlan
                      ? "View Offer"
                      : plan.isPaid && user
                        ? `Choose ${plan.name}`
                        : plan.cta}
                  </Link>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
