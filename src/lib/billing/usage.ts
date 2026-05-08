import { connectDb } from "@/lib/db";
import { BILLING_PLANS, type BillingPlanId } from "@/lib/billing/plans";
import { AgencyModel } from "@/models/agency";
import { UserModel } from "@/models/user";

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
  if (!process.env.MONGODB_URI) return "free";

  await connectDb();

  if (params.userId) {
    const user = await UserModel.findById(params.userId).select("billingPlanId").lean().exec();
    if (user?.billingPlanId) return normalizePlanId(user.billingPlanId);
  }

  if (params.agencyId) {
    const agency = (await AgencyModel.findOne({ agencyId: params.agencyId })
      .select("appUserId")
      .lean()
      .exec()) as { appUserId?: string | null } | null;
    if (agency?.appUserId) {
      const owner = await UserModel.findById(agency.appUserId)
        .select("billingPlanId")
        .lean()
        .exec();
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
