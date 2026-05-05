import Link from "next/link";
import { CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-2xl py-14">
      <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
        <CircleX className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Checkout canceled</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No charge was made. You can return to pricing and choose any plan anytime.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild className="rounded-full bg-gradient-primary text-primary-foreground">
            <Link href="/#pricing">Back to pricing</Link>
          </Button>
          <Button variant="outline" asChild className="rounded-full">
            <Link href="/dashboard/billing">Billing dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
