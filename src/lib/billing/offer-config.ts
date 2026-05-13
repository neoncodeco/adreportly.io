import type { BillingCycle, BillingPlanId } from "@/lib/billing/plans";

export const STANDARD_OFFER_SLUG = "standard";
export const STANDARD_OFFER_PATH = `/offer/${STANDARD_OFFER_SLUG}`;
export const STANDARD_OFFER_PLAN_ID: BillingPlanId = "starter";
export const STANDARD_OFFER_BILLING_CYCLE: BillingCycle = "monthly";
export const STANDARD_OFFER_PROMO_TEXT =
  "Use coupon code and get 100% discount on our standard package";
