import { Suspense } from "react";
import { CheckoutPage } from "@/components/billing/CheckoutPage";

export default function CheckoutRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl py-10 text-sm text-muted-foreground">
          Loading checkout...
        </div>
      }
    >
      <CheckoutPage />
    </Suspense>
  );
}
