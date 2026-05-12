import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import {
  createUddoktaPayCheckoutSession,
  resolveCheckoutUrl,
  type CheckoutCouponMetadata,
} from "@/lib/billing/uddoktapay";
import {
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
  normalizeBillingCycle,
  syncUserScheduledBillingChangeIfDue,
} from "@/lib/billing/subscription-state";
import { requireMongo } from "@/lib/db";
import { CouponModel } from "@/models/coupon";
import { PaymentTransactionModel } from "@/models/payment-transaction";
import { SubscriptionModel } from "@/models/subscription";
import { UserModel } from "@/models/user";

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
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
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
    await requireMongo();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const [existingSubscription, userRow, userBillingState] = await Promise.all([
    SubscriptionModel.findOne({
      userId: session.user.id,
      status: { $in: ["pending", "active", "past_due", "incomplete"] },
    })
      .sort({ updatedAt: -1 })
      .lean()
      .exec(),
    UserModel.findById(session.user.id).select("agencyId fullName").lean().exec(),
    syncUserScheduledBillingChangeIfDue(session.user.id),
  ]);

  const currentPlanId = userBillingState?.billingPlanId ?? existingSubscription?.planId ?? "free";
  const currentCycle =
    normalizeBillingCycle(userBillingState?.billingCycle) ??
    normalizeBillingCycle(
      (existingSubscription as { billingCycle?: string | null } | null)?.billingCycle,
    );
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

  if (normalizedCoupon.length >= 4) {
    const couponDoc = await CouponModel.findOne({ code: normalizedCoupon }).exec();
    if (!couponDoc) {
      return NextResponse.json({ error: "Invalid coupon code." }, { status: 400 });
    }
    const block = couponBlockReason(couponDoc, new Date());
    if (block) {
      return NextResponse.json({ error: block }, { status: 400 });
    }
    const { finalAmount, discountAmount } = computeDiscountedCharge(
      baseChargeAmount,
      couponDoc.percentOff,
    );
    chargeAmount = finalAmount;
    couponPayload = {
      couponMongoId: couponDoc._id.toString(),
      couponCode: couponDoc.code,
      couponPercentOff: couponDoc.percentOff,
      originalChargeAmount: baseChargeAmount,
      discountAmount,
      finalChargeAmount: finalAmount,
    };
  }

  const billingInfo = parsed.data.billing;
  const resolvedName = billingInfo?.fullName ?? userRow?.fullName ?? session.user.name ?? null;
  const resolvedEmail = billingInfo?.email ?? session.user.email;

  let checkout: Awaited<ReturnType<typeof createUddoktaPayCheckoutSession>>;
  try {
    checkout = await createUddoktaPayCheckoutSession({
      plan,
      billingCycle: parsed.data.billingCycle,
      amount: chargeAmount,
      userId: session.user.id,
      userEmail: resolvedEmail,
      userName: resolvedName,
      agencyId: userRow?.agencyId ?? null,
      existingSubscriptionId: existingSubscription?._id?.toString() ?? null,
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

  const sub = await SubscriptionModel.create({
    userId: session.user.id,
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
    },
  });

  const providerPaymentId =
    (typeof checkout.reference === "string" && checkout.reference) ||
    `checkout_${sub._id.toString()}`;

  await PaymentTransactionModel.updateOne(
    { providerPaymentId },
    {
      $setOnInsert: {
        userId: session.user.id,
        subscriptionId: sub._id.toString(),
        planId: plan.id,
        providerPaymentId,
        providerReference: typeof checkout.reference === "string" ? checkout.reference : null,
        amount: chargeAmount,
        currency: plan.currency,
        status: "pending",
        raw: {
          source: "checkout_create",
          checkout,
        },
      },
    },
    { upsert: true },
  );

  return NextResponse.json({
    checkout_url: checkoutUrl,
    subscriptionId: sub._id.toString(),
  });
}
