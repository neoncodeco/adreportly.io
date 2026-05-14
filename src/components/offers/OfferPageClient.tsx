"use client";

import { useMemo, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Link from "next/link";
import { Hind_Siliguri } from "next/font/google";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgePercent,
  Check,
  ChartColumn,
  CircleAlert,
  Lock,
  MonitorDot,
  Share2,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
  Workflow,
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
} from "@/lib/billing/offer-config";
import { cn } from "@/lib/utils";

type OfferPageClientProps = {
  couponCode: string | null;
  isSignedIn: boolean;
  hasAccountClaim: boolean;
  currentPlanId: BillingPlanId | null;
};

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const t = {
  specialOffer: "Special offer",
  heroAfterBrand: "দিয়ে আপনার Meta Ads Client Management এখন আরও সহজ",
  heroBody:
    "এক জায়গা থেকেই Meta ad account connect করুন, campaign track করুন, client manage করুন, আর live report share করুন, কোনো জটিল setup ছাড়াই।",
  heroHighlights: [
    "Live Meta Data Sync",
    "Client Reporting Dashboard",
    "Shareable Report Links",
    "Agency-Friendly Workflow",
  ],
  trustedBy: "Trusted By Modern Media Buyers & Agencies",
  trustedByBody:
    "Freelancer, media buyer এবং growing agency দের daily workflow সহজ করার জন্য AdReportly একটি নির্ভরযোগ্য সমাধান।",
  offerOff: "100% Off",
  offerText: "Coupon code ব্যবহার করে আমাদের standard package-এ 100% discount নিন",
  offerSubtext:
    "এই offer শুধু Standard package-এর জন্য। একটি account থেকে একবার এবং একটি device থেকে একবার claim করা যাবে।",
  standardPrice: "Standard Package Price",
  standardPackage: "Standard package",
  regular: "Regular",
  offerActive: "Offer active with 100% coupon",
  whatItDoes: "এটা আসলে কী কাজ করে?",
  whatItDoesLead:
    "প্রতিদিন campaign performance দেখা, client update দেওয়া আর report বানানোর কাজগুলো AdReportly এক জায়গায় এনে দেয়, যাতে media buyer বা agency team কম ঝামেলায় আরও organized ভাবে কাজ করতে পারে।",
  whatItDoesItems: [
    "Meta ad account connect করতে পারবেন",
    "সব campaign এক জায়গা থেকে monitor করতে পারবেন",
    "client আলাদা করে manage করতে পারবেন",
    "live performance report share করতে পারবেন",
    "clean agency workflow maintain করতে পারবেন",
  ],
  howItWorks: "কিভাবে কাজ করে",
  howTitle: "চারটি সহজ ধাপে পুরো workflow শুরু করুন",
  steps: [
    {
      title: "আপনার Meta Account Connect করুন",
      desc: "নিজের Meta account securely connect করুন।",
    },
    {
      title: "Campaign & Ad Account Sync করুন",
      desc: "Live campaign data automatically dashboard-এ দেখতে পাবেন।",
    },
    {
      title: "Client Add করুন",
      desc: "প্রতিটি client আলাদা করে manage করুন।",
    },
    {
      title: "Report Share করুন",
      desc: "Client কে সহজেই live report বা share link পাঠান।",
    },
  ],
  whyAgencies: "কেন Agencies AdReportly ব্যবহার করছে?",
  whyAgenciesBody:
    "দৈনন্দিন reporting process কম ঝামেলায়, বেশি পরিষ্কারভাবে এবং client-ready ভাবে চালাতে এই workflow সবচেয়ে বেশি কাজে আসে।",
  whyAgenciesItems: [
    {
      title: "সবকিছু এক জায়গায়",
      desc: "Campaign, client, report, সব organized থাকে।",
    },
    {
      title: "Manual reporting কমে যায়",
      desc: "বারবার screenshot বা spreadsheet manage করতে হয় না।",
    },
    {
      title: "Client এর কাছে Professional লাগে",
      desc: "Clean dashboard ও shareable report client trust বাড়ায়।",
    },
    {
      title: "Lightweight & Simple",
      desc: "জটিল analytics tool ছাড়াই কাজ করা যায়।",
    },
    {
      title: "Meta-Focused Workflow",
      desc: "বিশেষভাবে Meta advertisers দের জন্য তৈরি।",
    },
  ],
  mustNeedFor: "Must Need for",
  audienceItems: [
    "Media Buyers",
    "Freelancers",
    "Marketing Agencies",
    "Ecommerce Advertisers",
    "Client Reporting Teams",
  ],
  packages: "Packages",
  packagesTitle: "আপনার কাজের ধরন অনুযায়ী সঠিক package বেছে নিন",
  packagesBody:
    "কোন package-এ কী সুবিধা আছে, কতটুকু scale করা যাবে, আর এই offer-এর জন্য কোন plan প্রযোজ্য - সবকিছু এক নজরে দেখে সহজেই সিদ্ধান্ত নিতে পারবেন।",
  offerActiveBadge: "Offer Active",
  unavailable: "Unavailable",
  couponCode: "Coupon code",
  lockedPlanText: "এই offer page থেকে এই plan activate করা যাবে না।",
  continueCheckout: "Continue to checkout",
  signInToClaim: "Sign in to claim",
  unavailableHere: "Unavailable here",
  disabledSuffix: "disabled",
  noCoupon: "এই মুহূর্তে admin-এর active 100% coupon পাওয়া যাচ্ছে না।",
  alreadyClaimed: "এই account থেকে ইতোমধ্যে Standard offer claim করা হয়েছে।",
  standardActive: "এই account-এ Standard package already active আছে।",
  claimErrorNoCoupon: "এই মুহূর্তে কোনো active 100% offer coupon পাওয়া যাচ্ছে না।",
  offerRules: "Offer rules",
  rule1: "1. এই coupon code ব্যবহার করে শুধু Standard package activate করা যাবে।",
  rule2: "2. একটি account থেকে একবার এবং একটি device থেকে একবার offer নেওয়া যাবে।",
  rule3: "3. Offer claim করার পর plan আপনার billing page-এ active দেখা যাবে।",
  faq: "Frequently Asked Questions",
  faqItems: [
    {
      q: "এটা কি live Meta data sync করে?",
      a: "হ্যাঁ, Meta account connect করার পর live campaign data sync হয়।",
    },
    {
      q: "Client কি আলাদা report দেখতে পারবে?",
      a: "হ্যাঁ, shareable reporting workflow রয়েছে।",
    },
    {
      q: "এটা কি agency use এর জন্য?",
      a: "হ্যাঁ, বিশেষভাবে agency ও media buyer দের workflow মাথায় রেখে তৈরি।",
    },
    {
      q: "Setup করতে coding লাগে?",
      a: "না, documentation follow করলেই সহজে setup করা যায়।",
    },
    {
      q: "এটা কি multiple client manage করতে সাহায্য করে?",
      a: "হ্যাঁ, client management system built-in আছে।",
    },
  ],
  ctaEyebrow: "Reporting workflow upgrade",
  ctaTitle: "এখনও spreadsheet আর screenshot দিয়ে client manage করছেন?",
  ctaBody:
    "AdReportly ব্যবহার করে আপনার Meta reporting workflow আরও professional ও organized করুন।",
  ctaPrimary: "Standard offer নিন",
  secureActivation: "Secure activation",
  secureActivationText: "Offer claim successful হলে plan সঙ্গে সঙ্গে account-এ apply হবে।",
  createAccount: "Create account to claim",
  openBilling: "Open billing page",
  signIn: "Sign in",
  adminNote:
    "Offer coupon code admin panel থেকে control করা হবে। coupon inactive বা expired হলে claim button automatically block হবে।",
  plans: {
    free: {
      name: "Free",
      description: "শুরু করার জন্য উপযোগী।",
      features: ["Ad account: 1", "Campaigns: 10", "Clients (share link): 5"],
    },
    starter: {
      name: "Standard",
      description: "বর্ধমান agency-র জন্য উপযোগী।",
      features: ["Ad accounts: 5", "Campaigns: 50", "Clients (share link): 50"],
    },
    pro: {
      name: "Pro",
      description: "বড় scale-এর team-এর জন্য।",
      features: ["Ad accounts: 15", "Campaigns: 150", "Clients (share link): 150"],
    },
    enterprise: {
      name: "Custom",
      description: "Custom workflow এবং pricing।",
      features: [
        "Custom ad account limit",
        "Custom campaign limit",
        "Custom client/share workflow",
        "Dedicated support",
      ],
    },
  },
} as const;

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
      setClaimError(t.claimErrorNoCoupon);
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
    <main className={cn(hindSiliguri.className, "min-h-screen overflow-x-hidden bg-background")}>
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

        <div className="relative mx-auto max-w-[1440px] px-4 pt-20 pb-14 sm:px-6 lg:px-8 lg:pt-24 lg:pb-16">
          <div className="grid items-center gap-8 lg:grid-cols-[1.25fr_0.95fr] lg:gap-12">
            <div className="max-w-5xl">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mx-auto flex w-fit items-center gap-2 rounded-full border-2 border-ink bg-card px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-foreground shadow-[4px_5px_0_0_var(--ink)] lg:mx-0"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#5f7f00]" />
                {t.specialOffer}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08 }}
                className="mt-5 max-w-5xl text-center font-display text-4xl font-extrabold leading-[1.03] text-ink sm:text-5xl lg:text-left lg:text-[4.15rem]"
              >
                <motion.span
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.14 }}
                  className="relative mb-2 inline-block px-1 sm:mb-3 lg:mb-0 lg:mr-3"
                >
                  <span className="relative z-10 text-brand-foreground">AdReportly</span>
                  <motion.span
                    aria-hidden
                    initial={{ scaleX: 0.75, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 0.55, delay: 0.18, ease: "easeOut" }}
                    className="absolute inset-x-0 bottom-1 -z-0 h-[78%] -skew-x-6 bg-brand"
                  />
                </motion.span>
                <span>{t.heroAfterBrand}</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.16 }}
                className="mt-4 max-w-4xl text-center text-base font-medium leading-7 text-muted-foreground sm:text-lg lg:text-left"
              >
                {t.heroBody}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.2 }}
                className="mt-5 flex flex-wrap justify-center gap-2.5 lg:justify-start"
              >
                {t.heroHighlights.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-full border border-border bg-white/75 px-3 py-1.5 text-sm font-bold text-foreground shadow-soft backdrop-blur"
                  >
                    <Check className="h-4 w-4 shrink-0 text-[#5f7f00]" />
                    {item}
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.24 }}
                className="mt-5 rounded border border-brand/50 bg-white/60 p-3.5 text-center shadow-soft backdrop-blur lg:max-w-3xl lg:text-left"
              >
                <p className="text-sm font-bold uppercase tracking-wider text-[#5f7f00]">
                  {t.trustedBy}
                </p>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{t.trustedByBody}</p>
              </motion.div>
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
                className="relative w-full max-w-[560px] overflow-hidden rounded border-2 border-brand bg-card/95 shadow-[8px_8px_0_0_var(--brand)] backdrop-blur"
              >
                <div
                  aria-hidden
                  className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand/30 blur-3xl"
                />
                <div
                  aria-hidden
                  className="absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-cyan-200/35 blur-3xl"
                />
                <div className="relative grid gap-5 p-6 sm:p-7 lg:grid-cols-[1fr_180px] lg:gap-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-brand-foreground shadow-soft">
                        <BadgePercent className="h-3.5 w-3.5" />
                        {t.offerOff}
                      </span>
                      {couponCode ? (
                        <motion.span
                          animate={{ scale: [1, 1.04, 1] }}
                          transition={{
                            duration: 1.7,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                          }}
                          className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-foreground"
                        >
                          <Ticket className="h-3.5 w-3.5" />
                          {couponCode}
                        </motion.span>
                      ) : null}
                    </div>

                    <p className="mt-6 text-2xl font-extrabold leading-9 text-foreground">
                      {t.offerText}
                    </p>
                    <p className="mt-3 max-w-sm text-sm font-medium leading-7 text-muted-foreground">
                      {t.offerSubtext}
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
                      className="relative h-[180px] w-[140px] sm:h-[200px] sm:w-[155px] lg:h-[230px] lg:w-[180px]"
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
                        src="https://lottie.host/e0a6f69f-2801-4f28-8498-7d3ac2cdd3e3/WXA4bKagb6.lottie"
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
                  className="relative border-t border-border/70 bg-white/80 px-6 py-5 text-foreground backdrop-blur sm:px-7"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t.standardPrice}
                  </p>
                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{t.standardPackage}</p>
                      <p className="mt-1 font-display text-5xl font-extrabold">৳0</p>
                    </div>
                    <p className="text-right text-xs leading-5 text-muted-foreground">
                      {t.regular} {`৳${standardPricing.totalDue.toLocaleString()}/mo`}
                      <br />
                      {t.offerActive}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_48%,#ecfdf5_100%)] py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="rounded border-2 border-orange-300 bg-white p-6 shadow-[8px_8px_0_0_#fed7aa] sm:p-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-orange-700">
                <MonitorDot className="h-3.5 w-3.5" />
                {t.whatItDoes}
              </span>
              <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
                Campaign, client, report{" "}
                <span className="bg-emerald-200 px-1.5 text-ink">এক জায়গায় clean</span>
              </h2>
              <p className="mt-5 text-base leading-8 text-muted-foreground">{t.whatItDoesLead}</p>

              <div className="mt-8 rounded border border-orange-200 bg-orange-50/80 p-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    ["5x", "Faster reports"],
                    ["Live", "Meta sync"],
                    ["1 link", "Client view"],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded bg-white px-3 py-4 shadow-soft">
                      <p className="font-display text-2xl font-extrabold text-orange-600">
                        {value}
                      </p>
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {t.whatItDoesItems.map((item, index) => {
                const icons = [MonitorDot, ChartColumn, Users, Share2, Workflow];
                const Icon = icons[index] ?? Check;
                const styles = [
                  "border-emerald-200 bg-emerald-50 text-emerald-700",
                  "border-orange-200 bg-orange-50 text-orange-700",
                  "border-violet-200 bg-violet-50 text-violet-700",
                  "border-rose-200 bg-rose-50 text-rose-700",
                  "border-cyan-200 bg-cyan-50 text-cyan-700",
                ];

                return (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: 22 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.45, delay: index * 0.08 }}
                    className="group flex items-center gap-4 rounded border border-slate-200 bg-white p-4 shadow-soft transition hover:-translate-y-1 hover:shadow-elevated sm:p-5"
                  >
                    <span
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded border",
                        styles[index],
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-extrabold leading-6 text-foreground">{item}</p>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${58 + index * 8}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.7, delay: 0.12 + index * 0.06 }}
                          className="h-full rounded-full bg-gradient-to-r from-orange-400 via-emerald-400 to-cyan-400"
                        />
                      </div>
                    </div>
                    <span className="hidden text-xs font-extrabold text-muted-foreground sm:block">
                      0{index + 1}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-white py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="relative grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-brand/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-ink">
                <Workflow className="h-3.5 w-3.5" />
                {t.howItWorks}
              </span>
              <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
                {t.howTitle}
              </h2>
            </div>
          </div>

          <div className="relative mt-12">
            <div
              aria-hidden
              className="absolute left-6 top-8 bottom-8 hidden w-px bg-border md:block xl:left-0 xl:right-0 xl:top-8 xl:bottom-auto xl:mx-auto xl:h-px xl:w-[78%]"
            />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {t.steps.map((step, index) => {
                const accents = [
                  "bg-brand/20 text-[#5f7f00] border-brand",
                  "bg-cyan-50 text-cyan-700 border-cyan-300",
                  "bg-orange-50 text-orange-700 border-orange-300",
                  "bg-rose-50 text-rose-700 border-rose-300",
                ];
                const bars = ["bg-brand", "bg-cyan-400", "bg-orange-400", "bg-rose-400"];
                const checks = [
                  "text-[#5f7f00]",
                  "text-cyan-500",
                  "text-orange-500",
                  "text-rose-500",
                ];

                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative overflow-hidden rounded card-brutal bg-card p-6 transition hover:-translate-y-1"
                  >
                    <div className={cn("absolute inset-x-0 top-0 h-1.5", bars[index])} />
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded border-2 text-sm font-extrabold",
                        accents[index],
                      )}
                    >
                      0{index + 1}
                    </div>
                    <h3 className="mt-6 text-xl font-bold leading-7 text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{step.desc}</p>
                    <div className="mt-6 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className={cn("h-full w-2/3 rounded-full", bars[index])} />
                      </div>
                      <Check className={cn("h-4 w-4", checks[index])} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <div className="rounded border border-slate-200 bg-white p-6 shadow-soft sm:p-8 lg:sticky lg:top-24">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                <Users className="h-3.5 w-3.5" />
                {t.whyAgencies}
              </span>
              <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
                Agencies আর media buyer দের জন্য কেন এটা এত কাজে আসে
              </h2>
              <p className="mt-5 text-sm leading-7 text-muted-foreground">{t.whyAgenciesBody}</p>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="rounded border border-slate-200 bg-slate-50 p-4">
                  <p className="font-display text-3xl font-extrabold text-ink">50+</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Client reports
                  </p>
                </div>
                <div className="rounded border border-slate-200 bg-slate-50 p-4">
                  <p className="font-display text-3xl font-extrabold text-ink">Live</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Campaign view
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {t.whyAgenciesItems.map((item, index) => {
                const accents = [
                  "bg-brand text-ink",
                  "bg-slate-900 text-white",
                  "bg-emerald-100 text-emerald-800",
                  "bg-sky-100 text-sky-800",
                  "bg-orange-100 text-orange-800",
                ];

                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: 22 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.45, delay: index * 0.07 }}
                    className="group rounded border border-slate-200 bg-white p-4 shadow-soft transition hover:-translate-y-1 hover:shadow-elevated sm:p-5"
                  >
                    <div className="flex gap-4">
                      <span
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded text-sm font-extrabold",
                          accents[index],
                        )}
                      >
                        0{index + 1}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold leading-7 text-foreground">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm leading-7 text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="packages" className="relative py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-45"
        />
        <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink">
              {t.packages}
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-5xl">
              {t.packagesTitle}
            </h2>
            <p className="mt-4 text-muted-foreground">{t.packagesBody}</p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch">
            {BILLING_PLANS.map((plan, index) => {
              const selectedPrice = getBillingCyclePrice(plan, STANDARD_OFFER_BILLING_CYCLE);
              const isOfferPlan = plan.id === STANDARD_OFFER_PLAN_ID;
              const isClaimDisabled = !couponCode || hasAccountClaim;
              const isLockedPlan = !isOfferPlan;
              const localizedPlan = t.plans[plan.id];

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
                      {t.offerActiveBadge}
                    </span>
                  ) : (
                    <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 shadow-sm">
                      <Lock className="h-3 w-3" />
                      {t.unavailable}
                    </span>
                  )}

                  <h3
                    className={cn(
                      "text-sm font-semibold uppercase tracking-wider",
                      isOfferPlan ? "text-brand" : "text-slate-500",
                    )}
                  >
                    {localizedPlan.name}
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
                          {t.couponCode}:{" "}
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
                    {isLockedPlan ? t.lockedPlanText : localizedPlan.description}
                  </p>

                  <div
                    className={cn(
                      "my-6 h-px",
                      isOfferPlan ? "bg-ink-foreground/15" : "bg-slate-300/80",
                    )}
                  />

                  <ul className="space-y-3">
                    {localizedPlan.features.map((feature) => (
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
                            {t.continueCheckout}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        ) : (
                          t.signInToClaim
                        )}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        disabled
                        className="h-auto w-full rounded border border-slate-300 bg-white py-3 font-semibold text-slate-500 shadow-none opacity-100"
                      >
                        {plan.id === "enterprise"
                          ? t.unavailableHere
                          : `${localizedPlan.name} ${t.disabledSuffix}`}
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
                {t.noCoupon}
              </div>
            ) : null}

            {hasAccountClaim ? (
              <div className="rounded card-brutal bg-card px-4 py-3 text-sm text-muted-foreground">
                {t.alreadyClaimed}
              </div>
            ) : null}

            {currentPlanId === "starter" ? (
              <div className="rounded card-brutal bg-card px-4 py-3 text-sm text-muted-foreground">
                {t.standardActive}
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

      <section className="relative overflow-hidden border-y border-border/60 bg-gradient-mesh py-20">
        <div aria-hidden className="absolute inset-0 bg-white/70" />
        <div
          aria-hidden
          className="absolute -left-20 top-12 h-72 w-72 rounded-full bg-brand/25 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -right-20 bottom-8 h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl"
        />

        <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="rounded border border-border bg-white/85 p-6 shadow-soft backdrop-blur sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-brand/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-ink">
                  <Sparkles className="h-3.5 w-3.5 text-[#5f7f00]" />
                  {t.mustNeedFor}
                </span>
                <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
                  যাদের daily Meta reporting আর{" "}
                  <span className="bg-brand px-1.5 text-ink">client management</span> আরও সহজ হওয়া
                  দরকার
                </h2>
                <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground">
                  Freelancer থেকে agency team, যারা Meta campaign, client update এবং report share
                  নিয়মিত করে, তাদের workflow দ্রুত করতে AdReportly তৈরি।
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {t.audienceItems.map((item, index) => {
                  const icons = [Users, MonitorDot, Workflow, ChartColumn, Share2];
                  const Icon = icons[index] ?? Check;
                  const styles = [
                    "bg-brand/20 text-[#5f7f00] border-brand",
                    "bg-cyan-50 text-cyan-700 border-cyan-200",
                    "bg-orange-50 text-orange-700 border-orange-200",
                    "bg-rose-50 text-rose-700 border-rose-200",
                    "bg-emerald-50 text-emerald-700 border-emerald-200",
                  ];

                  return (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.42, delay: index * 0.06 }}
                      className="group flex items-center gap-3 rounded border border-border bg-card p-3 shadow-soft transition hover:-translate-y-1 hover:shadow-elevated"
                    >
                      <span
                        className={cn(
                          "flex h-12 w-12 shrink-0 items-center justify-center rounded border",
                          styles[index],
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-foreground">{item}</p>
                        <p className="mt-1 text-xs font-medium text-muted-foreground">
                          Reporting workflow ready
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-border/60 bg-sky-50/60 py-20">
        <div
          aria-hidden
          className="absolute left-0 top-0 h-56 w-56 rounded-full bg-sky-200/60 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-rose-100/80 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-[1440px] gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-700 shadow-soft">
              <CircleAlert className="h-3.5 w-3.5" />
              {t.faq}
            </span>
            <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
              Offer page দেখার আগে যেগুলো জানা দরকার
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">
              Standard offer claim করার আগে setup, client report এবং agency workflow নিয়ে common
              প্রশ্নগুলোর দ্রুত উত্তর।
            </p>

            <div className="mt-8 rounded border border-sky-200 bg-white/80 p-5 shadow-soft backdrop-blur">
              <p className="text-sm font-bold text-foreground">Quick note</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Coupon active থাকলে checkout button কাজ করবে। account থেকে একবার claim করা যাবে।
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {t.faqItems.map((item, index) => (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className="group rounded border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-elevated sm:p-6"
              >
                <div className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-sky-100 text-sm font-extrabold text-sky-700 transition group-hover:bg-sky-600 group-hover:text-white">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-lg font-bold leading-7 text-foreground">{item.q}</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="rounded card-brutal bg-ink px-6 py-8 text-ink-foreground sm:px-8 sm:py-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-wider text-brand">
                  {t.ctaEyebrow}
                </p>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  {t.ctaTitle}
                </h2>
                <p className="mt-4 text-sm leading-7 text-ink-foreground/75">{t.ctaBody}</p>
              </div>

              <Button
                type="button"
                disabled={!canClaim}
                onClick={() => void handleClaim()}
                className="h-auto rounded bg-brand px-6 py-3 font-semibold text-brand-foreground btn-brutal hover:bg-brand"
              >
                {isSignedIn ? t.ctaPrimary : t.signInToClaim}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 py-16">
        <div className="mx-auto grid max-w-[1440px] gap-6 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight">{t.offerRules}</h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-muted-foreground">
              <p>{t.rule1}</p>
              <p>{t.rule2}</p>
              <p>{t.rule3}</p>
            </div>
          </div>

          <div className="rounded card-brutal bg-card p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded bg-brand text-brand-foreground">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">{t.secureActivation}</p>
                <p className="text-xs text-muted-foreground">{t.secureActivationText}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {!isSignedIn ? (
                <Button
                  asChild
                  className="h-auto w-full rounded bg-brand py-3 font-semibold text-brand-foreground btn-brutal hover:bg-brand"
                >
                  <Link href={`/signup?next=${nextAuthPath}`}>
                    {t.createAccount}
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
                  {isSignedIn ? t.openBilling : t.signIn}
                </Link>
              </Button>
            </div>

            <div className="mt-5 rounded-2xl bg-muted/50 p-4 text-xs leading-6 text-muted-foreground">
              <CircleAlert className="mr-1 inline h-3.5 w-3.5 text-brand" />
              {t.adminNote}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
