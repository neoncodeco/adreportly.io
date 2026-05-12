import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getBillingPlanById } from "@/lib/billing/plans";
import {
  getBillingChangeKind,
  getPlanCycleForStorage,
  getScheduledBillingChange,
  normalizeBillingCycle,
  syncUserScheduledBillingChangeIfDue,
} from "@/lib/billing/subscription-state";
import { requireMongo } from "@/lib/db";
import { invalidateCacheKey } from "@/lib/server-cache";
import { SubscriptionModel } from "@/models/subscription";
import { UserModel } from "@/models/user";

const bodySchema = z.object({
  planId: z.enum(["free", "starter", "pro"]),
  billingCycle: z.enum(["monthly", "yearly"]).optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    await requireMongo();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const [user, activeSub] = await Promise.all([
    syncUserScheduledBillingChangeIfDue(session.user.id),
    SubscriptionModel.findOne({
      userId: session.user.id,
      status: { $in: ["active", "past_due", "incomplete"] },
    })
      .sort({ updatedAt: -1 })
      .lean()
      .exec(),
  ]);

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const targetPlan = getBillingPlanById(parsed.data.planId);
  if (!targetPlan || targetPlan.id === "enterprise") {
    return NextResponse.json({ error: "Choose a self-serve plan." }, { status: 400 });
  }

  const currentPlanId = user.billingPlanId ?? activeSub?.planId ?? "free";
  const currentCycle =
    normalizeBillingCycle(user.billingCycle) ??
    normalizeBillingCycle((activeSub as { billingCycle?: string | null } | null)?.billingCycle);
  const targetCycle = getPlanCycleForStorage(targetPlan.id, parsed.data.billingCycle);
  const changeKind = getBillingChangeKind({
    currentPlanId,
    currentCycle,
    targetPlanId: targetPlan.id,
    targetCycle,
  });

  if (changeKind === "upgrade") {
    return NextResponse.json(
      { error: "Upgrades are applied instantly. Use checkout for this plan change." },
      { status: 409 },
    );
  }

  const scheduled = getScheduledBillingChange(user);
  if (changeKind === "same") {
    if (!scheduled) {
      return NextResponse.json({ ok: true, action: "none" });
    }

    await UserModel.updateOne(
      { _id: session.user.id },
      {
        $unset: {
          billingScheduledPlanId: 1,
          billingScheduledCycle: 1,
          billingScheduledChangeAt: 1,
        },
      },
    ).exec();

    invalidateCacheKey(`user:billing-me:${session.user.id}`);
    return NextResponse.json({ ok: true, action: "cleared" });
  }

  const effectiveAt =
    user.billingCurrentPeriodEnd ??
    activeSub?.nextBillingAt ??
    (activeSub as { periodEndAt?: Date | null } | null)?.periodEndAt ??
    null;

  if (!effectiveAt) {
    return NextResponse.json(
      { error: "No active billing period was found for this account." },
      { status: 409 },
    );
  }

  await UserModel.updateOne(
    { _id: session.user.id },
    {
      $set: {
        billingScheduledPlanId: targetPlan.id,
        billingScheduledCycle: targetCycle,
        billingScheduledChangeAt: effectiveAt,
      },
    },
  ).exec();

  invalidateCacheKey(`user:billing-me:${session.user.id}`);

  return NextResponse.json({
    ok: true,
    action: scheduled ? "updated" : "scheduled",
    scheduledChange: {
      planId: targetPlan.id,
      planName: targetPlan.name,
      billingCycle: targetCycle,
      effectiveAt,
    },
  });
}
