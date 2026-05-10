import { Suspense } from "react";
import { CheckoutSuccessView } from "@/components/billing/CheckoutSuccessView";

function SuccessFallback() {
  return (
    <div className="mx-auto max-w-2xl py-14">
      <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<SuccessFallback />}>
      <CheckoutSuccessView />
    </Suspense>
  );
}
