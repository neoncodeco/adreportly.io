"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BILLING_PLANS, getBillingPlanById } from "@/lib/billing/plans";

export function CheckoutPage() {
  const params = useSearchParams();
  const router = useRouter();
  const planId = params.get("plan");
  const plan = useMemo(() => getBillingPlanById(planId) ?? BILLING_PLANS[1], [planId]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async () => {
    if (!plan.isPaid) {
      router.push("/signup");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planId: plan.id }),
      });
      const json = (await res.json()) as { error?: string; checkout_url?: string };
      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent(`/checkout?plan=${plan.id}`)}`);
        return;
      }
      if (!res.ok || !json.checkout_url) {
        setError(json.error || "Could not start checkout.");
        return;
      }
      window.location.assign(json.checkout_url);
    } catch {
      setError("Network issue while creating checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-10">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">Secure checkout</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Checkout: {plan.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You are subscribing to {plan.name} plan at {plan.priceLabel}
          {plan.interval ? `/${plan.interval}` : ""}.
        </p>

        <ul className="mt-5 space-y-2 text-sm text-foreground">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand" />
              {feature}
            </li>
          ))}
        </ul>

        {error ? (
          <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            disabled={loading}
            onClick={() => void startCheckout()}
            className="h-11 rounded-full bg-gradient-primary text-primary-foreground shadow-glow"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Continue to payment
          </Button>
          <Button variant="outline" className="h-11 rounded-full" onClick={() => router.push("/")}>
            Back to pricing
          </Button>
        </div>
      </div>
    </div>
  );
}
