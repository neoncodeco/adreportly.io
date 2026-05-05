export type BillingPlanId = "free" | "starter" | "pro" | "enterprise";

export type BillingPlan = {
  id: BillingPlanId;
  name: "Free" | "Starter" | "Pro" | "Enterprise";
  priceLabel: string;
  amount: number;
  currency: "USD";
  interval: "month" | null;
  isPaid: boolean;
  description: string;
  features: string[];
  cta: string;
  highlight: boolean;
};

export const BILLING_PLANS: BillingPlan[] = [
  {
    id: "free",
    name: "Free",
    priceLabel: "$0",
    amount: 0,
    currency: "USD",
    interval: null,
    isPaid: false,
    description: "Perfect for solo agencies getting started.",
    features: ["1 ad account", "Up to 5 campaigns", "7 days data retention", "Basic dashboard"],
    cta: "Start Free",
    highlight: false,
  },
  {
    id: "starter",
    name: "Starter",
    priceLabel: "$19",
    amount: 19,
    currency: "USD",
    interval: "month",
    isPaid: true,
    description: "For freelancers running a few clients.",
    features: [
      "2 ad accounts",
      "Up to 15 campaigns",
      "30 days data retention",
      "Share links",
      "Email support",
    ],
    cta: "Start Starter",
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    priceLabel: "$50",
    amount: 50,
    currency: "USD",
    interval: "month",
    isPaid: true,
    description: "Everything growing agencies need.",
    features: [
      "5 ad accounts",
      "Up to 50 campaigns",
      "90 days data retention",
      "Unlimited share links",
      "PDF & CSV reports",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    highlight: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceLabel: "Custom",
    amount: 0,
    currency: "USD",
    interval: "month",
    isPaid: true,
    description: "For large agencies & networks.",
    features: [
      "Unlimited everything",
      "API access",
      "Custom integrations",
      "White-label options",
      "Dedicated success manager",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

export function getBillingPlanById(planId: string | null | undefined): BillingPlan | null {
  if (!planId) return null;
  return BILLING_PLANS.find((plan) => plan.id === planId) ?? null;
}
