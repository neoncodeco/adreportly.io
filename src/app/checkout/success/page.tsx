import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-2xl py-14">
      <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
        <h1 className="mt-4 text-2xl font-bold">Payment successful</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your subscription is being activated. Billing information will appear in your dashboard
          shortly.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild className="rounded-full bg-gradient-primary text-primary-foreground">
            <Link href="/dashboard/billing">Go to billing</Link>
          </Button>
          <Button variant="outline" asChild className="rounded-full">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
