"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Zap,
  CreditCard,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  ArrowRight,
  ChevronLeft,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BILLING_PLANS,
  getBillingPlanById,
  getCheckoutPricing,
  type BillingCycle,
} from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

type BillingDetails = {
  fullName: string;
  email: string;
  company: string;
  phone: string;
  addressLine: string;
  city: string;
  country: string;
};

const COUNTRIES = [
  "Bangladesh",
  "India",
  "Pakistan",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Singapore",
  "UAE",
  "Saudi Arabia",
  "Other",
];

function InvoiceRow({
  label,
  value,
  muted,
  bold,
}: {
  label: string;
  value: string;
  muted?: boolean;
  bold?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between text-sm text-foreground",
        muted && "text-foreground/80",
      )}
    >
      <span>{label}</span>
      <span className={cn("font-medium text-foreground", bold && "font-bold")}>{value}</span>
    </div>
  );
}

function FieldRow({
  icon,
  label,
  id,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/80"
      >
        {icon}
        {label}
      </Label>
      {children}
    </div>
  );
}

export function CheckoutPage() {
  const params = useSearchParams();
  const router = useRouter();
  const planId = params.get("plan");
  const cycleParam = params.get("cycle");
  const plan = useMemo(() => getBillingPlanById(planId) ?? BILLING_PLANS[1], [planId]);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    cycleParam === "yearly" ? "yearly" : "monthly",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billing, setBilling] = useState<BillingDetails>({
    fullName: "",
    email: "",
    company: "",
    phone: "",
    addressLine: "",
    city: "",
    country: "Bangladesh",
  });

  const [couponInput, setCouponInput] = useState("");
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    percentOff: number;
    originalChargeAmount: number;
    discountedChargeAmount: number;
    discountAmount: number;
  } | null>(null);

  const invoiceNumber = useMemo(() => {
    const d = new Date();
    return `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const set =
    (k: keyof BillingDetails) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setBilling((prev) => ({ ...prev, [k]: e.target.value }));

  const canSubmit = billing.fullName.trim().length > 1 && billing.email.trim().includes("@");
  const pricing = useMemo(() => getCheckoutPricing(plan, billingCycle), [plan, billingCycle]);
  const sym = "৳";

  const displayTotal =
    appliedCoupon?.discountedChargeAmount != null
      ? appliedCoupon.discountedChargeAmount
      : pricing.totalDue;

  const applyCoupon = async () => {
    const raw = couponInput.trim();
    if (raw.length < 4) {
      setCouponError("Enter a coupon code (at least 4 characters).");
      return;
    }
    if (!plan.isPaid) return;
    setCouponApplying(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/billing/coupon-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          planId: plan.id,
          billingCycle,
          couponCode: raw,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        coupon?: { code: string; percentOff: number };
        originalChargeAmount?: number;
        discountedChargeAmount?: number;
        discountAmount?: number;
      };
      if (!res.ok || json.success === false) {
        setAppliedCoupon(null);
        setCouponError(typeof json.error === "string" ? json.error : "Invalid coupon.");
        return;
      }
      if (
        json.coupon &&
        typeof json.originalChargeAmount === "number" &&
        typeof json.discountedChargeAmount === "number" &&
        typeof json.discountAmount === "number"
      ) {
        setCouponError(null);
        setAppliedCoupon({
          code: json.coupon.code,
          percentOff: json.coupon.percentOff,
          originalChargeAmount: json.originalChargeAmount,
          discountedChargeAmount: json.discountedChargeAmount,
          discountAmount: json.discountAmount,
        });
      }
    } catch {
      setAppliedCoupon(null);
      setCouponError("Could not validate coupon.");
    } finally {
      setCouponApplying(false);
    }
  };

  useEffect(() => {
    setAppliedCoupon(null);
    setCouponError(null);
  }, [plan.id, billingCycle]);

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
        body: JSON.stringify({
          planId: plan.id,
          billingCycle,
          billing: {
            fullName: billing.fullName.trim(),
            email: billing.email.trim(),
            company: billing.company.trim() || null,
            phone: billing.phone.trim() || null,
            addressLine: billing.addressLine.trim() || null,
            city: billing.city.trim() || null,
            country: billing.country || null,
          },
          ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
        }),
      });
      let json: { error?: string; checkout_url?: string } = {};
      try {
        json = (await res.json()) as { error?: string; checkout_url?: string };
      } catch {
        // Non-JSON response (e.g. provider/network upstream errors)
      }
      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent(`/checkout?plan=${plan.id}`)}`);
        return;
      }
      if (!res.ok || !json.checkout_url) {
        setError(json.error ?? "Could not start checkout.");
        return;
      }
      window.location.assign(json.checkout_url);
    } catch {
      setError("Could not reach checkout service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Back */}
        <button
          type="button"
          onClick={() => router.push("/#pricing")}
          className="mb-6 flex items-center gap-1.5 text-sm text-foreground/80 transition hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to pricing
        </button>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          {/* ── Left: Billing Details Form ── */}
          <div className="space-y-5">
            {/* Header */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                  <Zap className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Secure Checkout
                  </p>
                  <h1 className="text-xl font-bold sm:text-2xl">Subscribe to {plan.name}</h1>
                </div>
              </div>
            </div>

            {/* Billing Info */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold">
                <FileText className="h-4 w-4 text-emerald-700" />
                Billing Information
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <FieldRow icon={<User className="h-3 w-3" />} label="Full Name *" id="fullName">
                  <Input
                    id="fullName"
                    placeholder="John Smith"
                    value={billing.fullName}
                    onChange={set("fullName")}
                    className="h-11 rounded-xl text-foreground placeholder:text-foreground/50"
                    required
                  />
                </FieldRow>

                <FieldRow icon={<Mail className="h-3 w-3" />} label="Email Address *" id="email">
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={billing.email}
                    onChange={set("email")}
                    className="h-11 rounded-xl text-foreground placeholder:text-foreground/50"
                    required
                  />
                </FieldRow>

                <FieldRow
                  icon={<Building2 className="h-3 w-3" />}
                  label="Company / Agency"
                  id="company"
                >
                  <Input
                    id="company"
                    placeholder="Acme Agency Ltd."
                    value={billing.company}
                    onChange={set("company")}
                    className="h-11 rounded-xl text-foreground placeholder:text-foreground/50"
                  />
                </FieldRow>

                <FieldRow icon={<Phone className="h-3 w-3" />} label="Phone Number" id="phone">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+880 1700 000000"
                    value={billing.phone}
                    onChange={set("phone")}
                    className="h-11 rounded-xl text-foreground placeholder:text-foreground/50"
                  />
                </FieldRow>

                <FieldRow icon={<MapPin className="h-3 w-3" />} label="Address" id="addressLine">
                  <Input
                    id="addressLine"
                    placeholder="House 12, Road 5, Gulshan"
                    value={billing.addressLine}
                    onChange={set("addressLine")}
                    className="h-11 rounded-xl text-foreground placeholder:text-foreground/50"
                  />
                </FieldRow>

                <FieldRow icon={<MapPin className="h-3 w-3" />} label="City" id="city">
                  <Input
                    id="city"
                    placeholder="Dhaka"
                    value={billing.city}
                    onChange={set("city")}
                    className="h-11 rounded-xl text-foreground placeholder:text-foreground/50"
                  />
                </FieldRow>

                <div className="sm:col-span-2">
                  <FieldRow icon={<Globe className="h-3 w-3" />} label="Country" id="country">
                    <select
                      id="country"
                      value={billing.country}
                      onChange={set("country")}
                      className="h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </FieldRow>
                </div>
              </div>
            </div>

            {/* Coupon */}
            {plan.isPaid ? (
              <div className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
                <h2 className="mb-4 flex items-center gap-2 text-base font-bold">
                  <Tag className="h-4 w-4 text-emerald-700" />
                  Coupon code
                </h2>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Label htmlFor="coupon" className="text-xs font-semibold text-foreground/80">
                      Have a code?
                    </Label>
                    <Input
                      id="coupon"
                      placeholder="e.g. SAVE20"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value);
                        if (couponError) setCouponError(null);
                      }}
                      className="h-11 rounded-xl font-mono uppercase placeholder:normal-case"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-11 shrink-0 rounded-full px-5"
                      disabled={couponApplying}
                      onClick={() => void applyCoupon()}
                    >
                      {couponApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                    </Button>
                    {appliedCoupon ? (
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-11 shrink-0 rounded-full"
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponError(null);
                        }}
                      >
                        Clear
                      </Button>
                    ) : null}
                  </div>
                </div>
                {appliedCoupon ? (
                  <p className="mt-2 text-xs font-medium text-emerald-700">
                    Applied {appliedCoupon.code} (−{appliedCoupon.percentOff}%): −{sym}
                    {appliedCoupon.discountAmount.toLocaleString()} today.
                  </p>
                ) : null}
                {couponError ? (
                  <p className="mt-2 text-xs text-destructive">{couponError}</p>
                ) : null}
              </div>
            ) : null}

            {/* Payment method hint */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold">
                <CreditCard className="h-4 w-4 text-emerald-700" />
                Payment Method
              </h2>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">UddoktaPay Secure Gateway</p>
                  <p className="text-xs text-foreground/75">
                    You will be redirected to complete payment securely. Card, mobile banking &amp;
                    more accepted.
                  </p>
                </div>
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <Button
              disabled={loading || !canSubmit}
              onClick={() => void startCheckout()}
              className="h-12 w-full rounded-full bg-gradient-primary text-base font-semibold text-primary-foreground shadow-glow"
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Lock className="mr-2 h-4 w-4" />
              )}
              {loading
                ? "Redirecting to payment…"
                : `Pay ${sym}${displayTotal.toLocaleString()} securely`}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>

            <p className="text-center text-xs text-foreground/75">
              <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-emerald-500" />
              256-bit SSL encrypted · Cancel anytime · No hidden fees
            </p>
          </div>

          {/* ── Right: Invoice / Order Summary ── */}
          <div className="space-y-5">
            {/* Plan card */}
            <div
              className={cn(
                "relative overflow-hidden rounded-3xl border p-5 shadow-soft sm:p-6",
                plan.highlight
                  ? "border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card"
                  : "border-border bg-card",
              )}
            >
              {plan.highlight && (
                <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                  <Tag className="h-3 w-3" /> Most Popular
                </span>
              )}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground/70">
                    Selected Plan
                  </p>
                  <h3 className="mt-1 text-2xl font-bold">{plan.name}</h3>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">
                    {billingCycle === "yearly"
                      ? `${sym}${displayTotal.toLocaleString()}/yr`
                      : appliedCoupon && appliedCoupon.discountAmount > 0
                        ? `${sym}${displayTotal.toLocaleString()}/mo`
                        : pricing.unitPriceLabel}
                  </p>
                  {appliedCoupon && appliedCoupon.discountAmount > 0 ? (
                    <p className="text-xs text-muted-foreground line-through">
                      {billingCycle === "yearly"
                        ? `${sym}${pricing.totalDue.toLocaleString()}/yr`
                        : pricing.unitPriceLabel}
                    </p>
                  ) : pricing.compareAtLabel ? (
                    <p className="text-xs text-muted-foreground line-through">
                      {pricing.compareAtLabel}
                    </p>
                  ) : null}
                  {plan.billingCycles && billingCycle === "yearly" ? (
                    <p className="text-[11px] text-muted-foreground">
                      {pricing.unitPriceLabel} × {pricing.monthsCharged} months
                    </p>
                  ) : null}
                </div>
              </div>
              <p className="mt-2 text-sm text-foreground/80">{plan.description}</p>
              {plan.billingCycles ? (
                <div className="mt-3 inline-flex rounded-full border border-border bg-background p-1">
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
              ) : null}

              <div className="mt-4 space-y-2">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Invoice preview */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-bold">
                  <FileText className="h-4 w-4 text-emerald-700" />
                  Invoice Preview
                </h3>
                <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-mono font-semibold text-foreground/80">
                  {invoiceNumber}
                </span>
              </div>

              <div className="space-y-1.5 border-b border-border pb-4 text-xs text-foreground/80">
                <div className="flex justify-between">
                  <span>Date</span>
                  <span className="text-foreground">{today}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bill To</span>
                  <span className="max-w-[180px] truncate text-right text-foreground">
                    {billing.fullName || "—"}
                    {billing.company ? ` · ${billing.company}` : ""}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Email</span>
                  <span className="max-w-[180px] truncate text-right text-foreground">
                    {billing.email || "—"}
                  </span>
                </div>
                {billing.city || billing.country ? (
                  <div className="flex justify-between">
                    <span>Location</span>
                    <span className="text-foreground">
                      {[billing.city, billing.country].filter(Boolean).join(", ")}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 space-y-2">
                <InvoiceRow
                  label={`${plan.name} (${billingCycle})`}
                  value={
                    billingCycle === "yearly"
                      ? `${sym}${pricing.unitAmount.toLocaleString()} × ${pricing.monthsCharged} mo`
                      : pricing.unitPriceLabel
                  }
                  muted
                />
                <InvoiceRow
                  label="Discount"
                  value={
                    appliedCoupon && appliedCoupon.discountAmount > 0
                      ? `−${sym}${appliedCoupon.discountAmount.toLocaleString()} (${appliedCoupon.code})`
                      : "—"
                  }
                  muted
                />
                <InvoiceRow label="Tax" value="Incl." muted />
              </div>

              <div className="mt-4 rounded-2xl bg-muted/50 px-4 py-3">
                <InvoiceRow
                  label="Total due today"
                  value={`${sym}${displayTotal.toLocaleString()}`}
                  bold
                />
              </div>

              <p className="mt-3 text-xs text-foreground/75">
                Subscription renews automatically every{" "}
                {billingCycle === "yearly" ? "year" : (plan.interval ?? "month")}. You may cancel
                anytime from your billing settings.
              </p>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: <Lock className="h-4 w-4 text-emerald-500" />, label: "SSL Secure" },
                { icon: <ShieldCheck className="h-4 w-4 text-blue-500" />, label: "PCI Safe" },
                {
                  icon: <CheckCircle2 className="h-4 w-4 text-violet-500" />,
                  label: "Cancel Anytime",
                },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-3 text-center shadow-soft"
                >
                  {icon}
                  <span className="text-[11px] font-semibold text-foreground/75">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
