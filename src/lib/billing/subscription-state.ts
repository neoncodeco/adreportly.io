import type { UpdateQuery } from "mongoose";
import type { BillingCycle, BillingPlanId } from "@/lib/billing/plans";
import { invalidateCacheKey } from "@/lib/server-cache";
import { UserModel, type IUser } from "@/models/user";

const PLAN_RANK: Record<BillingPlanId, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  enterprise: 3,
};

const CYCLE_RANK: Record<BillingCycle, number> = {
  monthly: 0,
  yearly: 1,
};

type UserBillingLean = Pick<
  IUser,
  | "_id"
  | "billingPlanId"
  | "billingStatus"
  | "billingCycle"
  | "billingCurrentPeriodEnd"
  | "billingScheduledPlanId"
  | "billingScheduledCycle"
  | "billingScheduledChangeAt"
>;

export type BillingChangeKind = "same" | "upgrade" | "downgrade";

export type ScheduledBillingChange = {
  planId: BillingPlanId;
  billingCycle: BillingCycle | null;
  effectiveAt: Date;
};

export function normalizeBillingCycle(value: unknown): BillingCycle | null {
  return value === "monthly" || value === "yearly" ? value : null;
}

export function getPlanCycleForStorage(
  planId: BillingPlanId,
  cycle: BillingCycle | null | undefined,
): BillingCycle | null {
  if (planId === "free") return null;
  return cycle === "yearly" ? "yearly" : "monthly";
}

export function getBillingChangeKind(params: {
  currentPlanId: BillingPlanId;
  currentCycle: BillingCycle | null | undefined;
  targetPlanId: BillingPlanId;
  targetCycle: BillingCycle | null | undefined;
}): BillingChangeKind {
  const currentPlanRank = PLAN_RANK[params.currentPlanId];
  const targetPlanRank = PLAN_RANK[params.targetPlanId];

  if (targetPlanRank > currentPlanRank) return "upgrade";
  if (targetPlanRank < currentPlanRank) return "downgrade";

  const currentCycle = getPlanCycleForStorage(params.currentPlanId, params.currentCycle);
  const targetCycle = getPlanCycleForStorage(params.targetPlanId, params.targetCycle);

  if (currentCycle === targetCycle) return "same";
  if (!currentCycle && targetCycle) return "upgrade";
  if (currentCycle && !targetCycle) return "downgrade";
  if (!currentCycle || !targetCycle) return "same";

  return CYCLE_RANK[targetCycle] > CYCLE_RANK[currentCycle] ? "upgrade" : "downgrade";
}

export function getScheduledBillingChange(
  user: UserBillingLean | null | undefined,
): ScheduledBillingChange | null {
  if (!user?.billingScheduledPlanId || !user.billingScheduledChangeAt) {
    return null;
  }

  return {
    planId: user.billingScheduledPlanId,
    billingCycle: getPlanCycleForStorage(user.billingScheduledPlanId, user.billingScheduledCycle),
    effectiveAt: user.billingScheduledChangeAt,
  };
}

function buildAppliedBillingUpdate(
  change: ScheduledBillingChange,
): UpdateQuery<IUser> & { $unset: Record<string, 1> } {
  const nextCycle = getPlanCycleForStorage(change.planId, change.billingCycle);
  return {
    $set: {
      billingPlanId: change.planId,
      billingStatus: change.planId === "free" ? "inactive" : "active",
      billingCurrentPeriodEnd: null,
      ...(nextCycle ? { billingCycle: nextCycle } : {}),
    },
    $unset: {
      billingScheduledPlanId: 1 as const,
      billingScheduledCycle: 1 as const,
      billingScheduledChangeAt: 1 as const,
      ...(nextCycle ? {} : { billingCycle: 1 as const }),
    },
  };
}

export async function syncUserScheduledBillingChangeIfDue(
  userId: string,
): Promise<UserBillingLean | null> {
  let user = await UserModel.findById(userId)
    .select(
      [
        "billingPlanId",
        "billingStatus",
        "billingCycle",
        "billingCurrentPeriodEnd",
        "billingScheduledPlanId",
        "billingScheduledCycle",
        "billingScheduledChangeAt",
      ].join(" "),
    )
    .lean<UserBillingLean | null>()
    .exec();

  if (!user) return null;

  const scheduled = getScheduledBillingChange(user);
  if (!scheduled || scheduled.effectiveAt.getTime() > Date.now()) {
    return user;
  }

  await UserModel.updateOne(
    {
      _id: userId,
      billingScheduledChangeAt: { $lte: new Date() },
    },
    buildAppliedBillingUpdate(scheduled),
  ).exec();

  invalidateCacheKey(`user:billing-me:${userId}`);

  user = await UserModel.findById(userId)
    .select(
      [
        "billingPlanId",
        "billingStatus",
        "billingCycle",
        "billingCurrentPeriodEnd",
        "billingScheduledPlanId",
        "billingScheduledCycle",
        "billingScheduledChangeAt",
      ].join(" "),
    )
    .lean<UserBillingLean | null>()
    .exec();

  return user;
}
