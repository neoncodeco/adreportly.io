"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const POLL_MS = 3500;
const MAX_ATTEMPTS = 28;

export function CheckoutSuccessView() {
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const invoiceId = searchParams.get("invoice_id");
  const gatewayPending =
    searchParams.get("status")?.toLowerCase() === "pending" ||
    searchParams.get("payment_status")?.toLowerCase() === "pending";
  const [syncState, setSyncState] = useState<"idle" | "syncing" | "done" | "error">("idle");
  const [syncDetail, setSyncDetail] = useState<string | null>(null);

  useEffect(() => {
    if (!invoiceId || authLoading || !user?.id) return;

    let cancelled = false;
    let attempt = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const schedule = (fn: () => void, ms: number) => {
      timer = setTimeout(fn, ms);
    };

    const verifyOnce = async (): Promise<void> => {
      if (cancelled) return;
      attempt += 1;
      setSyncState("syncing");
      try {
        const res = await fetch("/api/billing/verify-invoice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ invoice_id: invoiceId }),
        });
        const json = (await res.json().catch(() => ({}))) as {
          error?: string;
          synced?: boolean;
          idempotent?: boolean;
          status?: string | null;
        };
        if (cancelled) return;

        if (res.status === 403) {
          setSyncState("error");
          setSyncDetail(json.error || "Account mismatch.");
          return;
        }

        if (!res.ok) {
          if (attempt < MAX_ATTEMPTS) {
            setSyncDetail(json.error || `Gateway error (${res.status}), retrying…`);
            schedule(() => void verifyOnce(), POLL_MS);
          } else {
            setSyncState("error");
            setSyncDetail(json.error || "Could not reach payment gateway after several tries.");
          }
          return;
        }

        if (json.synced === true || json.idempotent === true) {
          setSyncState("done");
          setSyncDetail(null);
          return;
        }

        if (json.synced === false) {
          const st = json.status != null ? String(json.status) : "PENDING";
          if (attempt < MAX_ATTEMPTS) {
            setSyncDetail(
              gatewayPending || st.toUpperCase() === "PENDING"
                ? `Status: ${st}. If you pay manually, approve in UddoktaPay — we will recheck automatically.`
                : `Status: ${st}. Rechecking…`,
            );
            schedule(() => void verifyOnce(), POLL_MS);
          } else {
            setSyncState("done");
            setSyncDetail(
              `Still ${st} after waiting. Open Billing later or contact support if you already paid.`,
            );
          }
          return;
        }

        setSyncState("done");
        setSyncDetail(null);
      } catch {
        if (cancelled) return;
        if (attempt < MAX_ATTEMPTS) {
          setSyncDetail("Network error, retrying…");
          schedule(() => void verifyOnce(), POLL_MS);
        } else {
          setSyncState("error");
          setSyncDetail("Network error while confirming payment.");
        }
      }
    };

    void verifyOnce();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [authLoading, gatewayPending, invoiceId, user?.id]);

  const showSyncBanner = Boolean(invoiceId && user?.id);

  return (
    <div className="mx-auto max-w-2xl py-14">
      <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
        <h1 className="mt-4 text-2xl font-bold">Payment successful</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {invoiceId
            ? "We are confirming your payment with the gateway. Your plan will update when the payment is completed."
            : "Your subscription is being activated. Billing information will appear in your dashboard shortly."}
        </p>
        {showSyncBanner && (
          <div className="mt-4 text-sm">
            {syncState === "syncing" && (
              <p className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Syncing billing…
              </p>
            )}
            {syncState === "done" && syncDetail && (
              <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-amber-900 dark:text-amber-200">
                {syncDetail}
              </p>
            )}
            {syncState === "done" && !syncDetail && (
              <p className="text-emerald-700 dark:text-emerald-400">
                Billing updated. You are all set.
              </p>
            )}
            {syncState === "error" && syncDetail && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-destructive">
                {syncDetail}
              </p>
            )}
          </div>
        )}
        {!authLoading && !user && (
          <p className="mt-4 text-sm text-muted-foreground">
            <Link
              href="/login?next=/dashboard/billing"
              className="font-medium text-primary underline"
            >
              Sign in
            </Link>{" "}
            to refresh your plan on the billing page.
          </p>
        )}
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
