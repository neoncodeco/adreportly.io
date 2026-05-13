import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
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
import { requireMongo } from "@/lib/db";
import { invalidateCacheKey } from "@/lib/server-cache";
import { CouponModel } from "@/models/coupon";
import { OfferRedemptionModel } from "@/models/offer-redemption";
import { PaymentTransactionModel } from "@/models/payment-transaction";
import { SubscriptionModel } from "@/models/subscription";
import { UserModel } from "@/models/user";

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
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
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
    await requireMongo();
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

  const user = await UserModel.findById(session.user.id).select("billingPlanId").lean().exec();

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
    OfferRedemptionModel.findOne({ userId: session.user.id }).select("_id").lean().exec(),
    OfferRedemptionModel.findOne({ deviceHash }).select("_id").lean().exec(),
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
    const claim = await OfferRedemptionModel.create({
      userId: session.user.id,
      deviceHash,
      couponId: coupon._id.toString(),
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
      },
      claimedAt: now,
    });
    claimId = claim._id.toString();

    await SubscriptionModel.updateMany(
      {
        userId: session.user.id,
        status: { $in: ["pending", "active", "past_due", "incomplete"] },
      },
      {
        $set: {
          status: "canceled",
          canceledAt: now,
        },
      },
    ).exec();

    const subscription = await SubscriptionModel.create({
      userId: session.user.id,
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
        couponMongoId: coupon._id.toString(),
        couponCode: coupon.code,
        couponPercentOff: coupon.percentOff,
        couponRedeemed: true,
        originalChargeAmount,
        couponDiscountAmount: originalChargeAmount,
        deviceHash,
        autoDowngradePlanId: "free",
      },
    });

    const payment = await PaymentTransactionModel.create({
      userId: session.user.id,
      subscriptionId: subscription._id.toString(),
      planId: plan.id,
      provider: "offer_claim",
      providerPaymentId: `offer_${subscription._id.toString()}`,
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
      },
    });

    await Promise.all([
      UserModel.updateOne(
        { _id: session.user.id },
        {
          $set: {
            billingPlanId: plan.id,
            billingStatus: "active",
            billingCycle: getPlanCycleForStorage(plan.id, billingCycle),
            billingCurrentPeriodEnd: periodEnd,
            billingScheduledPlanId: "free",
            billingScheduledCycle: null,
            billingScheduledChangeAt: periodEnd,
          },
        },
      ).exec(),
      CouponModel.updateOne({ _id: coupon._id }, { $inc: { redemptionCount: 1 } }).exec(),
      OfferRedemptionModel.updateOne(
        { _id: claim._id },
        {
          $set: {
            subscriptionId: subscription._id.toString(),
            transactionId: payment._id.toString(),
            metadata: {
              source: "offer_claim",
              status: "completed",
              originalChargeAmount,
              grantedAt: now.toISOString(),
            },
          },
        },
      ).exec(),
    ]);

    invalidateCacheKey(`user:billing-me:${session.user.id}`);

    return NextResponse.json({
      success: true,
      redirectTo: "/dashboard/billing",
      planName: plan.name,
      couponCode: coupon.code,
      validUntil: periodEnd.toISOString(),
    });
  } catch (e) {
    const maybeMongo = e as { code?: number; keyPattern?: Record<string, number> };
    if (claimId) {
      await OfferRedemptionModel.deleteOne({ _id: claimId, subscriptionId: null }).catch(
        () => null,
      );
    }
    if (maybeMongo?.code === 11000) {
      if (maybeMongo.keyPattern?.userId) {
        return NextResponse.json(
          { error: "This account has already used the Standard offer once." },
          { status: 409 },
        );
      }
      if (maybeMongo.keyPattern?.deviceHash) {
        return NextResponse.json(
          { error: "This device has already used the Standard offer once." },
          { status: 409 },
        );
      }
    }

    const msg = e instanceof Error ? e.message : "Could not activate offer right now.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
