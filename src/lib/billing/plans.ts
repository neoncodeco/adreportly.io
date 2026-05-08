export type BillingPlanId = "free" | "starter" | "pro" | "enterprise";
export type BillingCycle = "monthly" | "yearly";

export type PlanLimits = {
  adAccounts: number | null;
  campaigns: number | null;
  clients: number | null;
};

export type BillingPlan = {
  id: BillingPlanId;
  name: "Free" | "Standard" | "Pro" | "Custom";
  priceLabel: string;
  amount: number;
  currency: "BDT";
  interval: "month" | null;
  isPaid: boolean;
  description: string;
  features: string[];
  cta: string;
  highlight: boolean;
  limits: PlanLimits;
  billingCycles?: Partial<
    Record<
      BillingCycle,
      {
        amount: number;
        priceLabel: string;
        compareAtLabel?: string;
      }
    >
  >;
  pricingInfo?: {
    regular?: string;
    discount?: string;
    yearly?: string;
  };
};

export const BILLING_PLANS: BillingPlan[] = [
  {
    id: "free",
    name: "Free",
    priceLabel: "৳0",
    amount: 0,
    currency: "BDT",
    interval: null,
    isPaid: false,
    description: "Best for getting started.",
    features: ["Ad account: 1", "Campaigns: 10", "Clients (share link): 5"],
    cta: "Start Free",
    highlight: false,
    limits: { adAccounts: 1, campaigns: 10, clients: 5 },
  },
  {
    id: "starter",
    name: "Standard",
    priceLabel: "৳499",
    amount: 499,
    currency: "BDT",
    interval: "month",
    isPaid: true,
    description: "For growing agencies.",
    features: ["Ad accounts: 5", "Campaigns: 50", "Clients (share link): 50"],
    cta: "Start Standard",
    highlight: false,
    limits: { adAccounts: 5, campaigns: 50, clients: 50 },
    billingCycles: {
      monthly: { amount: 499, priceLabel: "৳499/mo", compareAtLabel: "৳799/mo" },
      yearly: { amount: 399, priceLabel: "৳399/mo", compareAtLabel: "৳499/mo" },
    },
    pricingInfo: {
      regular: "৳799/mo",
      discount: "৳499/mo",
      yearly: "৳399/mo",
    },
  },
  {
    id: "pro",
    name: "Pro",
    priceLabel: "৳899",
    amount: 899,
    currency: "BDT",
    interval: "month",
    isPaid: true,
    description: "For high-scale teams.",
    features: ["Ad accounts: 15", "Campaigns: 150", "Clients (share link): 150"],
    cta: "Start Pro",
    highlight: true,
    limits: { adAccounts: 15, campaigns: 150, clients: 150 },
    billingCycles: {
      monthly: { amount: 899, priceLabel: "৳899/mo", compareAtLabel: "৳1799/mo" },
      yearly: { amount: 789, priceLabel: "৳789/mo", compareAtLabel: "৳899/mo" },
    },
    pricingInfo: {
      regular: "৳1799/mo",
      discount: "৳899/mo",
      yearly: "৳789/mo",
    },
  },
  {
    id: "enterprise",
    name: "Custom",
    priceLabel: "Custom/mo",
    amount: 0,
    currency: "BDT",
    interval: null,
    isPaid: false,
    description: "Custom workflow and pricing.",
    features: [
      "Custom ad account limit",
      "Custom campaign limit",
      "Custom client/share workflow",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    highlight: false,
    limits: { adAccounts: null, campaigns: null, clients: null },
  },
];

export function getBillingPlanById(planId: string | null | undefined): BillingPlan | null {
  if (!planId) return null;
  return BILLING_PLANS.find((plan) => plan.id === planId) ?? null;
}

export function getBillingCyclePrice(
  plan: BillingPlan,
  cycle: BillingCycle,
): { amount: number; priceLabel: string; compareAtLabel?: string } {
  const priced = plan.billingCycles?.[cycle];
  if (priced) return priced;
  return {
    amount: plan.amount,
    priceLabel: `${plan.priceLabel}${plan.interval ? `/${plan.interval}` : ""}`,
  };
}
