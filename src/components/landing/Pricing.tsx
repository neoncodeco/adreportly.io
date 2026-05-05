"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { BILLING_PLANS } from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

export function Pricing() {
  const { user } = useAuth();
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
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:items-center">
          {BILLING_PLANS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: i * 0.12 }}
              className={cn(
                "relative rounded p-8 hover-lift",
                p.highlight
                  ? "border-2 border-brand bg-ink text-ink-foreground shadow-brutal lg:scale-[1.04] lg:-my-2"
                  : "card-brutal bg-card",
              )}
            >
              {p.highlight && (
                <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-foreground shadow-glow">
                  <Sparkles className="h-3 w-3" />
                  Most popular
                </span>
              )}

              <h3
                className={cn(
                  "text-sm font-semibold uppercase tracking-wider",
                  p.highlight ? "text-brand" : "text-muted-foreground",
                )}
              >
                {p.name}
              </h3>

              <div className="mt-4 flex items-baseline gap-1">
                <span
                  className={cn(
                    "font-display text-5xl font-bold",
                    p.highlight ? "text-ink-foreground" : "text-foreground",
                  )}
                >
                  {p.priceLabel}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    p.highlight ? "text-ink-foreground/70" : "text-muted-foreground",
                  )}
                >
                  {p.interval ? `/${p.interval}` : ""}
                </span>
              </div>

              <p
                className={cn(
                  "mt-3 text-sm",
                  p.highlight ? "text-ink-foreground/80" : "text-muted-foreground",
                )}
              >
                {p.description}
              </p>

              <div
                className={cn("my-6 h-px", p.highlight ? "bg-ink-foreground/15" : "bg-border")}
              />

              <ul className="space-y-3">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className={cn(
                      "flex items-start gap-2.5 text-sm",
                      p.highlight ? "text-ink-foreground/90" : "text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                        p.highlight ? "bg-brand text-brand-foreground" : "bg-accent text-ink",
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
                  p.highlight
                    ? "!bg-brand !text-brand-foreground hover:!bg-brand"
                    : "!bg-brand !text-brand-foreground hover:!bg-brand",
                )}
              >
                <Link href={p.isPaid ? `/checkout?plan=${p.id}` : user ? "/dashboard" : "/signup"}>
                  {p.isPaid && user ? `Choose ${p.name}` : p.cta}
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
