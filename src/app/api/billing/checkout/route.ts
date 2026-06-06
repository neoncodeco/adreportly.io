import { createHash } from "crypto";
import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerUser } from "@/lib/auth/session";
import {
  createUddoktaPayCheckoutSession,
  resolveCheckoutUrl,
  type CheckoutCouponMetadata,
} from "@/lib/billing/uddoktapay";
import {
  canUseZeroChargeCheckout,
  computeDiscountedCharge,
  couponBlockReason,
  normalizeCouponCode,
} from "@/lib/billing/coupon-discount";
import {
  getBillingPlanById,
  getCheckoutChargeAmount,
  getCheckoutPricing,
} from "@/lib/billing/plans";
import {
  getBillingChangeKind,
  getPlanCycleForStorage,
  normalizeBillingCycle,
  syncUserScheduledBillingChangeIfDue,
} from "@/lib/billing/subscription-state";
import { prisma, requireDb } from "@/lib/db";
import { isPrismaUniqueViolation } from "@/lib/prisma-errors";
import { invalidateCacheKey } from "@/lib/server-cache";

const billingSchema = z
  .object({
    fullName: z.string().min(2).max(100),
    email: z.string().email(),
    company: z.string().max(120).nullish(),
    phone: z.string().max(30).nullish(),
    addressLine: z.string().max(200).nullish(),
    city: z.string().max(80).nullish(),
    country: z.string().max(80).nullish(),
  })
  .optional();

const bodySchema = z.object({
  planId: z.enum(["starter", "pro", "enterprise"]),
  billingCycle: z.enum(["monthly", "yearly"]).default("monthly"),
  billing: billingSchema,
  couponCode: z.string().max(40).optional(),
  deviceId: z.string().min(16).max(200).optional(),
});

function addBillingPeriod(start: Date, cycle: "monthly" | "yearly"): Date {
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
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const plan = getBillingPlanById(parsed.data.planId);
  if (!plan || !plan.isPaid) {
    return NextResponse.json({ error: "Invalid plan for checkout." }, { status: 400 });
  }
  const pricing = getCheckoutPricing(plan, parsed.data.billingCycle);
  const baseChargeAmount = getCheckoutChargeAmount(plan, parsed.data.billingCycle);

  try {
    await requireDb();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const [existingSubscription, userRow, userBillingState] = await Promise.all([
    prisma.subscription.findFirst({
      where: {
        userId: authUser.id,
        status: { in: ["pending", "active", "past_due", "incomplete"] },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.user.findUnique({
      where: { id: authUser.id },
      select: { agencyId: true, fullName: true },
    }),
    syncUserScheduledBillingChangeIfDue(authUser.id),
  ]);

  const currentPlanId = userBillingState?.billingPlanId ?? existingSubscription?.planId ?? "free";
  const currentCycle =
    normalizeBillingCycle(userBillingState?.billingCycle) ??
    normalizeBillingCycle(existingSubscription?.billingCycle);
  const changeKind = getBillingChangeKind({
    currentPlanId,
    currentCycle,
    targetPlanId: plan.id,
    targetCycle: parsed.data.billingCycle,
  });

  if (changeKind === "same") {
    return NextResponse.json(
      { error: "You are already on this plan and billing cycle." },
      { status: 409 },
    );
  }

  if (changeKind === "downgrade") {
    return NextResponse.json(
      {
        error:
          "Downgrades are scheduled for your next billing cycle. Use the billing page to schedule this change.",
      },
      { status: 409 },
    );
  }

  const rawCoupon = parsed.data.couponCode?.trim();
  const normalizedCoupon = rawCoupon ? normalizeCouponCode(rawCoupon) : "";
  let chargeAmount = baseChargeAmount;
  let couponPayload: CheckoutCouponMetadata | null = null;
  let zeroChargeCheckout = false;

  if (normalizedCoupon.length >= 4) {
    const couponDoc = await prisma.coupon.findUnique({ where: { code: normalizedCoupon } });
    if (!couponDoc) {
      return NextResponse.json({ error: "Invalid coupon code." }, { status: 400 });
    }
    const block = couponBlockReason(couponDoc, new Date());
    if (block) {
      return NextResponse.json({ error: block }, { status: 400 });
    }
    zeroChargeCheckout = canUseZeroChargeCheckout(plan.id, couponDoc.percentOff);
    const { finalAmount, discountAmount } = computeDiscountedCharge(
      baseChargeAmount,
      couponDoc.percentOff,
      {
        allowZeroTotal: zeroChargeCheckout,
      },
    );
    chargeAmount = finalAmount;
    couponPayload = {
      couponMongoId: couponDoc.id,
      couponCode: couponDoc.code,
      couponPercentOff: couponDoc.percentOff,
      originalChargeAmount: baseChargeAmount,
      discountAmount,
      finalChargeAmount: finalAmount,
    };
  }

  const billingInfo = parsed.data.billing;
  const resolvedName = billingInfo?.fullName ?? userRow?.fullName ?? null;
  const resolvedEmail = billingInfo?.email ?? authUser.email;

  if (chargeAmount === 0 && couponPayload && zeroChargeCheckout) {
    const rawDeviceId = parsed.data.deviceId?.trim();
    if (!rawDeviceId) {
      return NextResponse.json(
        { error: "Offer checkout requires a valid device session." },
        { status: 400 },
      );
    }

    const deviceHash = hashDeviceId(rawDeviceId);
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
    const periodEnd = addBillingPeriod(now, parsed.data.billingCycle);

    let claimId: string | null = null;

    try {
      const claim = await prisma.offerRedemption.create({
        data: {
          userId: authUser.id,
          deviceHash,
          couponId: couponPayload.couponMongoId,
          couponCode: couponPayload.couponCode,
          offerSlug: "standard",
          planId: plan.id,
          billingCycle: parsed.data.billingCycle,
          subscriptionId: null,
          transactionId: null,
          metadata: {
            source: "checkout_offer_claim",
            status: "initiated",
            billingInfo: billingInfo ?? null,
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

      const sub = await prisma.subscription.create({
        data: {
          userId: authUser.id,
          agencyId: userRow?.agencyId ?? null,
          planId: plan.id,
          billingCycle: parsed.data.billingCycle,
          status: "active",
          amount: 0,
          currency: plan.currency,
          provider: "offer_claim",
          providerCustomerId: null,
          providerSubscriptionId: null,
          providerReference: `offer:${couponPayload.couponCode}:${claimId}`,
          periodStartAt: now,
          periodEndAt: periodEnd,
          nextBillingAt: periodEnd,
          canceledAt: null,
          metadata: {
            source: "checkout_offer_claim",
            billingCycle: parsed.data.billingCycle,
            checkoutPricing: pricing,
            billingInfo: billingInfo ?? null,
            baseChargeAmount,
            couponMongoId: couponPayload.couponMongoId,
            couponCode: couponPayload.couponCode,
            couponPercentOff: couponPayload.couponPercentOff,
            originalChargeAmount: couponPayload.originalChargeAmount,
            couponDiscountAmount: couponPayload.discountAmount,
            couponRedeemed: true,
            deviceHash,
          } as Prisma.InputJsonValue,
        },
      });

      const payment = await prisma.paymentTransaction.create({
        data: {
          userId: authUser.id,
          subscriptionId: sub.id,
          planId: plan.id,
          provider: "offer_claim",
          providerPaymentId: `offer_${sub.id}`,
          providerSubscriptionId: null,
          providerReference: sub.providerReference,
          amount: 0,
          currency: plan.currency,
          status: "paid",
          paidAt: now,
          raw: {
            source: "checkout_offer_claim",
            billingInfo: billingInfo ?? null,
            couponCode: couponPayload.couponCode,
            originalChargeAmount: couponPayload.originalChargeAmount,
          } as Prisma.InputJsonValue,
        },
      });

      await Promise.all([
        prisma.user.update({
          where: { id: authUser.id },
          data: {
            billingPlanId: plan.id,
            billingStatus: "active",
            billingCycle: getPlanCycleForStorage(plan.id, parsed.data.billingCycle),
            billingCurrentPeriodEnd: periodEnd,
            billingScheduledPlanId: "free",
            billingScheduledCycle: null,
            billingScheduledChangeAt: periodEnd,
          },
        }),
        prisma.coupon.update({
          where: { id: couponPayload.couponMongoId },
          data: { redemptionCount: { increment: 1 } },
        }),
        prisma.offerRedemption.update({
          where: { id: claim.id },
          data: {
            subscriptionId: sub.id,
            transactionId: payment.id,
            metadata: {
              source: "checkout_offer_claim",
              status: "completed",
              grantedAt: now.toISOString(),
            } as Prisma.InputJsonValue,
          },
        }),
      ]);

      invalidateCacheKey(`user:billing-me:${authUser.id}`);

      return NextResponse.json({
        redirectTo: "/dashboard/billing",
        directActivation: true,
        subscriptionId: sub.id,
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
      const msg = e instanceof Error ? e.message : "Could not activate your offer.";
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }

  let checkout: Awaited<ReturnType<typeof createUddoktaPayCheckoutSession>>;
  try {
    checkout = await createUddoktaPayCheckoutSession({
      plan,
      billingCycle: parsed.data.billingCycle,
      amount: chargeAmount,
      userId: authUser.id,
      userEmail: resolvedEmail,
      userName: resolvedName,
      agencyId: userRow?.agencyId ?? null,
      existingSubscriptionId: existingSubscription?.id ?? null,
      billingDetails: billingInfo
        ? {
            company: billingInfo.company ?? null,
            phone: billingInfo.phone ?? null,
            addressLine: billingInfo.addressLine ?? null,
            city: billingInfo.city ?? null,
            country: billingInfo.country ?? null,
          }
        : null,
      coupon: couponPayload,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Checkout provider request failed.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const checkoutUrl = resolveCheckoutUrl(checkout);
  if (!checkoutUrl) {
    console.error("UddoktaPay checkout response missing URL", checkout);
    return NextResponse.json(
      {
        error: "Provider response did not include checkout URL.",
        providerResponseKeys: Object.keys(checkout ?? {}),
      },
      { status: 502 },
    );
  }

  const providerSubscriptionId =
    typeof checkout.subscription_id === "string" ? checkout.subscription_id : undefined;

  const sub = await prisma.subscription.create({
    data: {
      userId: authUser.id,
      agencyId: userRow?.agencyId ?? null,
      planId: plan.id,
      billingCycle: parsed.data.billingCycle,
      status: "pending",
      amount: chargeAmount,
      currency: plan.currency,
      providerReference: typeof checkout.reference === "string" ? checkout.reference : null,
      providerCustomerId: typeof checkout.customer_id === "string" ? checkout.customer_id : null,
      ...(providerSubscriptionId ? { providerSubscriptionId } : {}),
      metadata: {
        ...checkout,
        billingCycle: parsed.data.billingCycle,
        checkoutPricing: pricing,
        billingInfo: billingInfo ?? null,
        baseChargeAmount,
        ...(couponPayload
          ? {
              couponMongoId: couponPayload.couponMongoId,
              couponCode: couponPayload.couponCode,
              couponPercentOff: couponPayload.couponPercentOff,
              originalChargeAmount: couponPayload.originalChargeAmount,
              couponDiscountAmount: couponPayload.discountAmount,
              couponRedeemed: false,
            }
          : {}),
      } as Prisma.InputJsonValue,
    },
  });

  const providerPaymentId =
    (typeof checkout.reference === "string" && checkout.reference) || `checkout_${sub.id}`;

  await prisma.paymentTransaction.upsert({
    where: { providerPaymentId },
    create: {
      userId: authUser.id,
      subscriptionId: sub.id,
      planId: plan.id,
      providerPaymentId,
      providerReference: typeof checkout.reference === "string" ? checkout.reference : null,
      amount: chargeAmount,
      currency: plan.currency,
      status: "pending",
      raw: {
        source: "checkout_create",
        checkout,
      } as Prisma.InputJsonValue,
    },
    update: {},
  });

  return NextResponse.json({
    checkout_url: checkoutUrl,
    subscriptionId: sub.id,
  });
}
