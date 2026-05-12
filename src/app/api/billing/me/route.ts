import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { BILLING_PLANS, getBillingCyclePrice, getCheckoutPricing } from "@/lib/billing/plans";
import {
  getScheduledBillingChange,
  normalizeBillingCycle,
  syncUserScheduledBillingChangeIfDue,
} from "@/lib/billing/subscription-state";
import { requireMongo } from "@/lib/db";
import { getOrSetCache, USER_CACHE_HEADERS } from "@/lib/server-cache";
import { PaymentTransactionModel } from "@/models/payment-transaction";
import { SubscriptionModel } from "@/models/subscription";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    await requireMongo();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const payload = await getOrSetCache(`user:billing-me:${session.user.id}`, 10_000, async () => {
    const [sub, payments, user] = await Promise.all([
      SubscriptionModel.findOne({ userId: session.user.id }).sort({ updatedAt: -1 }).lean().exec(),
      PaymentTransactionModel.find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean()
        .exec(),
      syncUserScheduledBillingChangeIfDue(session.user.id),
    ]);

    const billingCycle =
      normalizeBillingCycle(user?.billingCycle) ??
      normalizeBillingCycle((sub as { billingCycle?: string | null } | null)?.billingCycle);

    const currentPlanId = user?.billingPlanId || sub?.planId || "free";
    const currentPlan = BILLING_PLANS.find((p) => p.id === currentPlanId) ?? BILLING_PLANS[0];
    const currentPlanSummary =
      currentPlan.isPaid && billingCycle
        ? billingCycle === "yearly"
          ? {
              id: currentPlan.id,
              name: currentPlan.name,
              priceLabel: `৳${getCheckoutPricing(currentPlan, "yearly").totalDue.toLocaleString()}`,
              interval: "year",
            }
          : {
              id: currentPlan.id,
              name: currentPlan.name,
              priceLabel: `৳${getBillingCyclePrice(currentPlan, "monthly").amount.toLocaleString()}`,
              interval: "month",
            }
        : {
            id: currentPlan.id,
            name: currentPlan.name,
            priceLabel: currentPlan.priceLabel,
            interval: currentPlan.interval,
          };

    const scheduledChange = getScheduledBillingChange(user);
    const hasMismatchWithSubscription =
      Boolean(user?.billingPlanId && sub?.planId && user.billingPlanId !== sub.planId) ||
      Boolean(
        normalizeBillingCycle(user?.billingCycle) &&
        normalizeBillingCycle((sub as { billingCycle?: string | null } | null)?.billingCycle) &&
        normalizeBillingCycle(user?.billingCycle) !==
          normalizeBillingCycle((sub as { billingCycle?: string | null } | null)?.billingCycle),
      );
    const renewalAt =
      user?.billingCurrentPeriodEnd ||
      (hasMismatchWithSubscription || user?.billingPlanId === "free"
        ? null
        : sub?.nextBillingAt || null);

    return {
      currentPlan: currentPlanSummary,
      currentStatus: user?.billingStatus || sub?.status || "inactive",
      billingCycle,
      renewalAt,
      scheduledChange: scheduledChange
        ? {
            planId: scheduledChange.planId,
            planName:
              BILLING_PLANS.find((p) => p.id === scheduledChange.planId)?.name ??
              scheduledChange.planId,
            billingCycle: scheduledChange.billingCycle,
            effectiveAt: scheduledChange.effectiveAt,
          }
        : null,
      subscription: sub
        ? {
            id: sub._id.toString(),
            status: sub.status,
            planId: sub.planId,
            billingCycle:
              (sub as { billingCycle?: string }).billingCycle === "yearly" ||
              (sub as { billingCycle?: string }).billingCycle === "monthly"
                ? (sub as { billingCycle: "monthly" | "yearly" }).billingCycle
                : null,
            amount: sub.amount,
            currency: sub.currency,
            nextBillingAt: sub.nextBillingAt,
            periodEndAt: (sub as { periodEndAt?: Date | null }).periodEndAt ?? null,
            canceledAt: sub.canceledAt,
            updatedAt: sub.updatedAt,
          }
        : null,
      payments: payments.map((p) => ({
        id: p._id.toString(),
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        planId: p.planId,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
        providerPaymentId: p.providerPaymentId,
      })),
    };
  });

  return NextResponse.json(payload, { headers: USER_CACHE_HEADERS });
}
