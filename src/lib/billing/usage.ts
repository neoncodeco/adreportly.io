import { hasDatabase, prisma } from "@/lib/db";
import { syncUserScheduledBillingChangeIfDue } from "@/lib/billing/subscription-state";
import { BILLING_PLANS, type BillingPlanId } from "@/lib/billing/plans";

const FREE_PLAN = BILLING_PLANS.find((p) => p.id === "free") ?? BILLING_PLANS[0];

function normalizePlanId(value: unknown): BillingPlanId {
  if (value === "starter" || value === "pro" || value === "enterprise" || value === "free") {
    return value;
  }
  return "free";
}

export async function resolvePlanIdForUsage(params: {
  userId?: string | null;
  agencyId?: string | null;
}): Promise<BillingPlanId> {
  if (!hasDatabase()) return "free";

  if (params.userId) {
    const user = await syncUserScheduledBillingChangeIfDue(params.userId);
    if (user?.billingPlanId) return normalizePlanId(user.billingPlanId);
  }

  if (params.agencyId) {
    const agency = await prisma.agency.findUnique({
      where: { agencyId: params.agencyId },
      select: { appUserId: true },
    });
    if (agency?.appUserId) {
      const owner = await syncUserScheduledBillingChangeIfDue(agency.appUserId);
      if (owner?.billingPlanId) return normalizePlanId(owner.billingPlanId);
    }
  }

  return "free";
}

export async function resolvePlanForUsage(params: {
  userId?: string | null;
  agencyId?: string | null;
}) {
  const planId = await resolvePlanIdForUsage(params);
  return BILLING_PLANS.find((p) => p.id === planId) ?? FREE_PLAN;
}
