"use client";

import { useMemo, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgePercent,
  Check,
  CircleAlert,
  Lock,
  ShieldCheck,
  Sparkles,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BILLING_PLANS,
  getBillingCyclePrice,
  getCheckoutPricing,
  type BillingPlanId,
} from "@/lib/billing/plans";
import {
  STANDARD_OFFER_BILLING_CYCLE,
  STANDARD_OFFER_PATH,
  STANDARD_OFFER_PLAN_ID,
  STANDARD_OFFER_PROMO_TEXT,
} from "@/lib/billing/offer-config";
import { cn } from "@/lib/utils";

type OfferPageClientProps = {
  couponCode: string | null;
  isSignedIn: boolean;
  hasAccountClaim: boolean;
  currentPlanId: BillingPlanId | null;
};

const banglaSteps = [
  {
    title: "অ্যাকাউন্ট খুলুন",
    desc: "একটি অ্যাকাউন্ট খুলে খুব দ্রুত আপনার agency workspace ready করুন।",
  },
  {
    title: "Facebook ad account connect করুন",
    desc: "আপনার ad account connect করার পর live data dashboard-এ sync হবে।",
  },
  {
    title: "Report ও insight দেখুন",
    desc: "Campaign performance, ROI, shareable report আর client view এক জায়গা থেকেই handle করতে পারবেন।",
  },
];

export function OfferPageClient({
  couponCode,
  isSignedIn,
  hasAccountClaim,
  currentPlanId,
}: OfferPageClientProps) {
  const router = useRouter();
  const [claimError, setClaimError] = useState<string | null>(null);

  const standardPricing = useMemo(() => {
    const plan = BILLING_PLANS.find((row) => row.id === STANDARD_OFFER_PLAN_ID)!;
    return getCheckoutPricing(plan, STANDARD_OFFER_BILLING_CYCLE);
  }, []);

  const canClaim =
    Boolean(couponCode) &&
    !hasAccountClaim &&
    currentPlanId !== "starter" &&
    currentPlanId !== "pro" &&
    currentPlanId !== "enterprise";

  const nextAuthPath = encodeURIComponent(STANDARD_OFFER_PATH);

  const handleClaim = async () => {
    if (!couponCode) {
      setClaimError("এই মুহূর্তে কোনো active 100% offer coupon পাওয়া যাচ্ছে না।");
      return;
    }

    if (!isSignedIn) {
      router.push(`/login?next=${nextAuthPath}`);
      return;
    }
    setClaimError(null);
    router.push(
      `/checkout?plan=${STANDARD_OFFER_PLAN_ID}&cycle=${STANDARD_OFFER_BILLING_CYCLE}&coupon=${encodeURIComponent(couponCode)}&offer=standard`,
    );
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <section className="relative overflow-hidden bg-gradient-hero">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-brand/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 top-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl"
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-35" />

        <div className="relative mx-auto max-w-[1440px] px-4 pt-24 pb-20 sm:px-6 lg:px-8 lg:pt-32 lg:pb-24">
          <div className="grid items-end gap-10 lg:grid-cols-[1.35fr_0.9fr] lg:gap-12">
            <div className="max-w-5xl">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full card-brutal bg-card/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-foreground"
              >
                <Sparkles className="h-3.5 w-3.5 text-brand" />
                Special offer
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08 }}
                className="mt-6 max-w-5xl font-display text-4xl font-bold leading-[1.05] text-ink sm:text-5xl lg:text-[4.5rem]"
              >
                <motion.span
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.14 }}
                  className="relative mr-3 inline-block"
                >
                  <span className="relative z-10 text-brand-foreground">AdReportly</span>
                  <motion.span
                    aria-hidden
                    initial={{ scaleX: 0.75, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 0.55, delay: 0.18, ease: "easeOut" }}
                    className="absolute inset-0 -z-0 -skew-x-6 bg-brand"
                  />
                </motion.span>
                <span>আপনার agency reporting workflow আরও দ্রুত, গোছানো ও কার্যকর করে।</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.16 }}
                className="mt-6 max-w-4xl text-base leading-8 text-muted-foreground sm:text-lg"
              >
                Facebook Ads data, insight, secure share link এবং client-ready report এক জায়গায়
                পেয়ে আপনার daily reporting আরও সহজ হবে। এখান থেকে package, coupon code এবং offer
                eligibility দেখে নিতে পারবেন।
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.22 }}
              className="relative z-10 flex items-center justify-center self-center lg:self-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                whileHover={{ y: -6 }}
                className="relative w-full max-w-[560px] overflow-hidden rounded card-brutal bg-card/95 backdrop-blur"
              >
                <div className="grid gap-4 p-6 sm:p-7 lg:grid-cols-[1fr_168px] lg:gap-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-foreground">
                        <BadgePercent className="h-3.5 w-3.5" />
                        100% Off
                      </span>
                      {couponCode ? (
                        <motion.span
                          animate={{ scale: [1, 1.04, 1] }}
                          transition={{
                            duration: 1.7,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                          }}
                          className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink-foreground"
                        >
                          <Ticket className="h-3.5 w-3.5" />
                          {couponCode}
                        </motion.span>
                      ) : null}
                    </div>

                    <p className="mt-5 text-xl font-semibold leading-9 text-foreground">
                      {STANDARD_OFFER_PROMO_TEXT}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      এই offer শুধু Standard package-এর জন্য। একটি account থেকে একবার এবং একটি
                      device থেকে একবার claim করা যাবে।
                    </p>
                  </div>

                  <div className="flex items-end justify-center lg:justify-end">
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{
                        duration: 4.6,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                      className="relative h-[170px] w-[130px] sm:h-[190px] sm:w-[145px] lg:h-[220px] lg:w-[168px]"
                    >
                      <div
                        aria-hidden
                        className="absolute inset-x-4 bottom-4 h-10 rounded-full bg-brand/15 blur-2xl"
                      />
                      <div
                        aria-hidden
                        className="absolute inset-x-3 top-8 h-16 rounded-full bg-primary/10 blur-2xl"
                      />
                      <DotLottieReact
                        src="https://lottie.host/6ec6c75d-bef4-498e-9d41-689167c0a02b/t5allZvG2K.lottie"
                        loop
                        autoplay
                        className="relative z-10 h-full w-full object-contain drop-shadow-[0_16px_28px_rgba(17,24,39,0.12)]"
                      />
                    </motion.div>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.34 }}
                  className="border-t border-border/70 bg-card px-6 py-5 text-foreground sm:px-7"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Standard Package Price
                  </p>
                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Standard package</p>
                      <p className="mt-1 text-4xl font-bold">৳0</p>
                    </div>
                    <p className="text-right text-xs leading-5 text-muted-foreground">
                      Regular {`৳${standardPricing.totalDue.toLocaleString()}/mo`}
                      <br />
                      Offer active with 100% coupon
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink">
              কিভাবে কাজ করে
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-5xl">
              খুব ছোট তিনটি ধাপে পুরো workflow
            </h2>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {banglaSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded card-brutal bg-card p-7"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded bg-brand text-sm font-bold text-brand-foreground">
                  0{index + 1}
                </div>
                <h3 className="mt-5 text-xl font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-45"
        />
        <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink">
              Packages
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-5xl">
              আপনার কাজের ধরন অনুযায়ী সঠিক package বেছে নিন
            </h2>
            <p className="mt-4 text-muted-foreground">
              কোন package-এ কী সুবিধা আছে, কতটুকু scale করা যাবে, আর এই offer-এর জন্য কোন plan
              প্রযোজ্য - সবকিছু এক নজরে দেখে সহজেই সিদ্ধান্ত নিতে পারবেন।
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch">
            {BILLING_PLANS.map((plan, index) => {
              const selectedPrice = getBillingCyclePrice(plan, STANDARD_OFFER_BILLING_CYCLE);
              const isOfferPlan = plan.id === STANDARD_OFFER_PLAN_ID;
              const isClaimDisabled = !couponCode || hasAccountClaim;
              const isLockedPlan = !isOfferPlan;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className={cn(
                    "relative flex h-full flex-col rounded p-8",
                    isOfferPlan
                      ? "border-2 border-brand bg-ink text-ink-foreground shadow-brutal"
                      : "border border-slate-300/80 bg-slate-100/90 shadow-soft",
                  )}
                >
                  {isOfferPlan ? (
                    <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-foreground shadow-glow">
                      <Sparkles className="h-3 w-3" />
                      Offer Active
                    </span>
                  ) : (
                    <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 shadow-sm">
                      <Lock className="h-3 w-3" />
                      Unavailable
                    </span>
                  )}

                  <h3
                    className={cn(
                      "text-sm font-semibold uppercase tracking-wider",
                      isOfferPlan ? "text-brand" : "text-slate-500",
                    )}
                  >
                    {plan.name}
                  </h3>

                  <div className="mt-4">
                    <div className="flex items-end gap-2">
                      <span className="font-display text-5xl font-bold">
                        {isOfferPlan && couponCode
                          ? "৳0"
                          : selectedPrice.priceLabel.replace("/mo", "")}
                      </span>
                      <span
                        className={cn(
                          "pb-1 text-sm",
                          isOfferPlan ? "text-ink-foreground/70" : "text-slate-400",
                        )}
                      >
                        {plan.interval ? `/${plan.interval}` : ""}
                      </span>
                    </div>

                    {isOfferPlan ? (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm text-ink-foreground/75 line-through">
                          {selectedPrice.priceLabel}
                        </p>
                        <p className="text-xs leading-6 text-ink-foreground/75">
                          Coupon code:{" "}
                          <span className="font-bold text-brand">{couponCode ?? "N/A"}</span>
                        </p>
                      </div>
                    ) : plan.isPaid && selectedPrice.compareAtLabel ? (
                      <p className="mt-3 text-sm text-slate-400 line-through">
                        {selectedPrice.compareAtLabel}
                      </p>
                    ) : null}
                  </div>

                  <p
                    className={cn(
                      "mt-4 text-sm",
                      isOfferPlan ? "text-ink-foreground/80" : "text-slate-500",
                    )}
                  >
                    {isLockedPlan
                      ? "এই offer page থেকে এই plan activate করা যাবে না।"
                      : plan.description}
                  </p>

                  <div
                    className={cn(
                      "my-6 h-px",
                      isOfferPlan ? "bg-ink-foreground/15" : "bg-slate-300/80",
                    )}
                  />

                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className={cn(
                          "flex items-start gap-2.5 text-sm",
                          isOfferPlan ? "text-ink-foreground/90" : "text-slate-600",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                            isOfferPlan
                              ? "bg-brand text-brand-foreground"
                              : "bg-white text-slate-400 ring-1 ring-slate-300",
                          )}
                        >
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    {isOfferPlan ? (
                      <Button
                        type="button"
                        disabled={!canClaim || isClaimDisabled}
                        onClick={() => void handleClaim()}
                        className="h-auto w-full rounded bg-brand py-3 font-semibold text-brand-foreground btn-brutal hover:bg-brand"
                      >
                        {isSignedIn ? (
                          <>
                            Continue to checkout
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        ) : (
                          "Sign in to claim"
                        )}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        disabled
                        className="h-auto w-full rounded border border-slate-300 bg-white py-3 font-semibold text-slate-500 shadow-none opacity-100"
                      >
                        {plan.id === "enterprise" ? "Unavailable here" : `${plan.name} disabled`}
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mx-auto mt-8 max-w-3xl space-y-3">
            {!couponCode ? (
              <div className="rounded card-brutal bg-card px-4 py-3 text-sm text-muted-foreground">
                এই মুহূর্তে admin-এর active 100% coupon পাওয়া যাচ্ছে না।
              </div>
            ) : null}

            {hasAccountClaim ? (
              <div className="rounded card-brutal bg-card px-4 py-3 text-sm text-muted-foreground">
                এই account থেকে ইতোমধ্যে Standard offer claim করা হয়েছে।
              </div>
            ) : null}

            {currentPlanId === "starter" ? (
              <div className="rounded card-brutal bg-card px-4 py-3 text-sm text-muted-foreground">
                এই account-এ Standard package already active আছে।
              </div>
            ) : null}

            {claimError ? (
              <div className="rounded border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {claimError}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 py-16">
        <div className="mx-auto grid max-w-[1440px] gap-6 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight">Offer rules</h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-muted-foreground">
              <p>
                1. এই coupon code ব্যবহার করে শুধু{" "}
                <strong className="text-foreground">Standard</strong> package activate করা যাবে।
              </p>
              <p>2. একটি account থেকে একবার এবং একটি device থেকে একবার offer নেওয়া যাবে।</p>
              <p>3. Offer claim করার পর plan আপনার billing page-এ active দেখা যাবে।</p>
            </div>
          </div>

          <div className="rounded card-brutal bg-card p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded bg-brand text-brand-foreground">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">Secure activation</p>
                <p className="text-xs text-muted-foreground">
                  Offer claim successful হলে plan সঙ্গে সঙ্গে account-এ apply হবে।
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {!isSignedIn ? (
                <Button
                  asChild
                  className="h-auto w-full rounded bg-brand py-3 font-semibold text-brand-foreground btn-brutal hover:bg-brand"
                >
                  <Link href={`/signup?next=${nextAuthPath}`}>
                    Create account to claim
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : null}

              <Button
                asChild
                variant="outline"
                className="h-auto w-full rounded py-3 font-semibold"
              >
                <Link href={isSignedIn ? "/dashboard/billing" : `/login?next=${nextAuthPath}`}>
                  <Lock className="mr-2 h-4 w-4" />
                  {isSignedIn ? "Open billing page" : "Sign in"}
                </Link>
              </Button>
            </div>

            <div className="mt-5 rounded-2xl bg-muted/50 p-4 text-xs leading-6 text-muted-foreground">
              <CircleAlert className="mr-1 inline h-3.5 w-3.5 text-brand" />
              Offer coupon code admin panel থেকে control করা হবে। coupon inactive বা expired হলে
              claim button automatically block হবে।
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
