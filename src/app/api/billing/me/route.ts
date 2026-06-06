import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { BILLING_PLANS, getBillingCyclePrice, getCheckoutPricing } from "@/lib/billing/plans";
import {
  getScheduledBillingChange,
  normalizeBillingCycle,
  syncUserScheduledBillingChangeIfDue,
} from "@/lib/billing/subscription-state";
import { prisma, requireDb } from "@/lib/db";
import { getOrSetCache, USER_CACHE_HEADERS } from "@/lib/server-cache";

export async function GET() {
  const authUser = await getServerUser();
  if (!authUser?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    await requireDb();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const payload = await getOrSetCache(`user:billing-me:${authUser.id}`, 10_000, async () => {
    const [sub, payments, user] = await Promise.all([
      prisma.subscription.findFirst({
        where: { userId: authUser.id },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.paymentTransaction.findMany({
        where: { userId: authUser.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      syncUserScheduledBillingChangeIfDue(authUser.id),
    ]);

    const billingCycle =
      normalizeBillingCycle(user?.billingCycle) ?? normalizeBillingCycle(sub?.billingCycle);

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
        normalizeBillingCycle(sub?.billingCycle) &&
        normalizeBillingCycle(user?.billingCycle) !== normalizeBillingCycle(sub?.billingCycle),
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
            id: sub.id,
            status: sub.status,
            planId: sub.planId,
            billingCycle:
              sub.billingCycle === "yearly" || sub.billingCycle === "monthly"
                ? sub.billingCycle
                : null,
            amount: sub.amount,
            currency: sub.currency,
            nextBillingAt: sub.nextBillingAt,
            periodEndAt: sub.periodEndAt ?? null,
            canceledAt: sub.canceledAt,
            updatedAt: sub.updatedAt,
          }
        : null,
      payments: payments.map((p) => ({
        id: p.id,
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
