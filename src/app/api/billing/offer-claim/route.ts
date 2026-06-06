import { createHash } from "crypto";
import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerUser } from "@/lib/auth/session";
import {
  STANDARD_OFFER_BILLING_CYCLE,
  STANDARD_OFFER_PATH,
  STANDARD_OFFER_PLAN_ID,
  STANDARD_OFFER_SLUG,
} from "@/lib/billing/offer-config";
import { getOfferCouponByCode } from "@/lib/billing/offer-server";
import {
  getBillingPlanById,
  getCheckoutChargeAmount,
  type BillingCycle,
} from "@/lib/billing/plans";
import { getPlanCycleForStorage } from "@/lib/billing/subscription-state";
import { prisma, requireDb } from "@/lib/db";
import { isPrismaUniqueViolation } from "@/lib/prisma-errors";
import { invalidateCacheKey } from "@/lib/server-cache";

const bodySchema = z.object({
  couponCode: z.string().min(4).max(40),
  deviceId: z.string().min(16).max(200),
  offerSlug: z.string().min(1).max(80).default(STANDARD_OFFER_SLUG),
});

function addBillingPeriod(start: Date, cycle: BillingCycle): Date {
  const result = new Date(start.getTime());
  if (cycle === "yearly") {
    result.setFullYear(result.getFullYear() + 1);
  } else {
    result.setMonth(result.getMonth() + 1);
  }
  return result;
}

function hashDeviceId(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function POST(request: Request) {
  const authUser = await getServerUser();
  if (!authUser?.id || !authUser.email) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  if (parsed.data.offerSlug !== STANDARD_OFFER_SLUG) {
    return NextResponse.json({ error: "Offer not found." }, { status: 404 });
  }

  try {
    await requireDb();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable.";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const plan = getBillingPlanById(STANDARD_OFFER_PLAN_ID);
  if (!plan || !plan.isPaid) {
    return NextResponse.json({ error: "Offer plan is unavailable." }, { status: 500 });
  }

  const coupon = await getOfferCouponByCode(parsed.data.couponCode);
  if (!coupon) {
    return NextResponse.json(
      { error: "This offer coupon is invalid or no longer active." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { billingPlanId: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  if (user.billingPlanId === "starter") {
    return NextResponse.json(
      { error: "This account already has access to the Standard package." },
      { status: 409 },
    );
  }

  if (user.billingPlanId === "pro" || user.billingPlanId === "enterprise") {
    return NextResponse.json(
      { error: "This offer is available only for Standard package activation." },
      { status: 409 },
    );
  }

  const deviceHash = hashDeviceId(parsed.data.deviceId.trim());

  const [existingUserClaim, existingDeviceClaim] = await Promise.all([
    prisma.offerRedemption.findUnique({
      where: { userId: authUser.id },
      select: { id: true },
    }),
    prisma.offerRedemption.findUnique({
      where: { deviceHash },
      select: { id: true },
    }),
  ]);

  if (existingUserClaim) {
    return NextResponse.json(
      { error: "This account has already used the Standard offer once." },
      { status: 409 },
    );
  }

  if (existingDeviceClaim) {
    return NextResponse.json(
      { error: "This device has already used the Standard offer once." },
      { status: 409 },
    );
  }

  const now = new Date();
  const billingCycle = STANDARD_OFFER_BILLING_CYCLE;
  const periodEnd = addBillingPeriod(now, billingCycle);
  const originalChargeAmount = getCheckoutChargeAmount(plan, billingCycle);

  let claimId: string | null = null;

  try {
    const claim = await prisma.offerRedemption.create({
      data: {
        userId: authUser.id,
        deviceHash,
        couponId: coupon.id,
        couponCode: coupon.code,
        offerSlug: STANDARD_OFFER_SLUG,
        planId: plan.id,
        billingCycle,
        subscriptionId: null,
        transactionId: null,
        metadata: {
          source: "offer_claim",
          status: "initiated",
          returnPath: STANDARD_OFFER_PATH,
        } as Prisma.InputJsonValue,
        claimedAt: now,
      },
    });
    claimId = claim.id;

    await prisma.subscription.updateMany({
      where: {
        userId: authUser.id,
        status: { in: ["pending", "active", "past_due", "incomplete"] },
      },
      data: {
        status: "canceled",
        canceledAt: now,
      },
    });

    const subscription = await prisma.subscription.create({
      data: {
        userId: authUser.id,
        agencyId: null,
        planId: plan.id,
        billingCycle,
        status: "active",
        amount: 0,
        currency: plan.currency,
        provider: "offer_claim",
        providerCustomerId: null,
        providerSubscriptionId: null,
        providerReference: `offer:${STANDARD_OFFER_SLUG}:${claimId}`,
        periodStartAt: now,
        periodEndAt: periodEnd,
        nextBillingAt: periodEnd,
        canceledAt: null,
        metadata: {
          source: "offer_claim",
          offerSlug: STANDARD_OFFER_SLUG,
          couponMongoId: coupon.id,
          couponCode: coupon.code,
          couponPercentOff: coupon.percentOff,
          couponRedeemed: true,
          originalChargeAmount,
          couponDiscountAmount: originalChargeAmount,
          deviceHash,
          autoDowngradePlanId: "free",
        } as Prisma.InputJsonValue,
      },
    });

    const payment = await prisma.paymentTransaction.create({
      data: {
        userId: authUser.id,
        subscriptionId: subscription.id,
        planId: plan.id,
        provider: "offer_claim",
        providerPaymentId: `offer_${subscription.id}`,
        providerSubscriptionId: null,
        providerReference: subscription.providerReference,
        amount: 0,
        currency: plan.currency,
        status: "paid",
        paidAt: now,
        raw: {
          source: "offer_claim",
          offerSlug: STANDARD_OFFER_SLUG,
          couponCode: coupon.code,
          originalChargeAmount,
        } as Prisma.InputJsonValue,
      },
    });

    await Promise.all([
      prisma.user.update({
        where: { id: authUser.id },
        data: {
          billingPlanId: plan.id,
          billingStatus: "active",
          billingCycle: getPlanCycleForStorage(plan.id, billingCycle),
          billingCurrentPeriodEnd: periodEnd,
          billingScheduledPlanId: "free",
          billingScheduledCycle: null,
          billingScheduledChangeAt: periodEnd,
        },
      }),
      prisma.coupon.update({
        where: { id: coupon.id },
        data: { redemptionCount: { increment: 1 } },
      }),
      prisma.offerRedemption.update({
        where: { id: claim.id },
        data: {
          subscriptionId: subscription.id,
          transactionId: payment.id,
          metadata: {
            source: "offer_claim",
            status: "completed",
            originalChargeAmount,
            grantedAt: now.toISOString(),
          } as Prisma.InputJsonValue,
        },
      }),
    ]);

    invalidateCacheKey(`user:billing-me:${authUser.id}`);

    return NextResponse.json({
      success: true,
      redirectTo: "/dashboard/billing",
      planName: plan.name,
      couponCode: coupon.code,
      validUntil: periodEnd.toISOString(),
    });
  } catch (e) {
    if (claimId) {
      await prisma.offerRedemption
        .deleteMany({ where: { id: claimId, subscriptionId: null } })
        .catch(() => null);
    }
    if (isPrismaUniqueViolation(e, "userId")) {
      return NextResponse.json(
        { error: "This account has already used the Standard offer once." },
        { status: 409 },
      );
    }
    if (isPrismaUniqueViolation(e, "deviceHash")) {
      return NextResponse.json(
        { error: "This device has already used the Standard offer once." },
        { status: 409 },
      );
    }

    const msg = e instanceof Error ? e.message : "Could not activate offer right now.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
