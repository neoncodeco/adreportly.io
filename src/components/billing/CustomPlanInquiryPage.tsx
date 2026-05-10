"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Building2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function CustomPlanInquiryPage() {
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [expectedAdAccounts, setExpectedAdAccounts] = useState("");
  const [expectedCampaigns, setExpectedCampaigns] = useState("");
  const [expectedClients, setExpectedClients] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    setTicketNumber(null);
    try {
      const res = await fetch("/api/billing/custom-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          company: company.trim() || undefined,
          phone: phone.trim() || undefined,
          expectedAdAccounts: expectedAdAccounts.trim() || undefined,
          expectedCampaigns: expectedCampaigns.trim() || undefined,
          expectedClients: expectedClients.trim() || undefined,
          message: message.trim(),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        ticketNumber?: string;
      };
      if (!res.ok) {
        setError(json.error ?? "Could not submit request.");
        return;
      }
      setTicketNumber(json.ticketNumber ?? "submitted");
      setMessage("");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-2xl space-y-8"
    >
      <div>
        <Link
          href="/dashboard/billing"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to billing
        </Link>
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Custom plan request</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Tell us about your volume and workflow. We&apos;ll reply with tailored limits and
              pricing—same flow as enterprise SaaS: one ticket per request, tracked under Support.
            </p>
          </div>
        </div>
      </div>

      {ticketNumber ? (
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-sm">
          <p className="font-semibold text-emerald-800 dark:text-emerald-300">
            Request received{ticketNumber !== "submitted" ? ` · Ticket #${ticketNumber}` : ""}
          </p>
          <p className="mt-2 text-muted-foreground">
            Our team will follow up by email. You can track the conversation under{" "}
            <Link href="/dashboard/support" className="font-medium text-primary underline">
              Support
            </Link>
            .
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="cust-msg">What do you need? *</Label>
            <textarea
              id="cust-msg"
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Number of brands, reporting cadence, SSO, SLA, BDT vs USD billing…"
              className={cn(
                "flex min-h-[120px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm",
                "ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            />
            <p className="text-[11px] text-muted-foreground">Minimum 20 characters.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cust-co">Company (optional)</Label>
            <Input
              id="cust-co"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cust-ph">Phone (optional)</Label>
            <Input
              id="cust-ph"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cust-ac">Approx. ad accounts</Label>
            <Input
              id="cust-ac"
              inputMode="numeric"
              placeholder="e.g. 25"
              value={expectedAdAccounts}
              onChange={(e) => setExpectedAdAccounts(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cust-camp">Approx. campaigns</Label>
            <Input
              id="cust-camp"
              inputMode="numeric"
              placeholder="e.g. 200"
              value={expectedCampaigns}
              onChange={(e) => setExpectedCampaigns(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="cust-cli">Approx. client share seats</Label>
            <Input
              id="cust-cli"
              inputMode="numeric"
              placeholder="e.g. 80"
              value={expectedClients}
              onChange={(e) => setExpectedClients(e.target.value)}
              className="rounded-xl"
            />
          </div>
        </div>

        <Button
          type="button"
          className="mt-6 w-full rounded-full sm:w-auto"
          disabled={loading || message.trim().length < 20}
          onClick={() => void submit()}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          {loading ? "Sending…" : "Submit request"}
        </Button>
      </div>
    </motion.div>
  );
}
