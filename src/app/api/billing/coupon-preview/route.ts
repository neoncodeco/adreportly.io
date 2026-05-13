import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
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
import { requireMongo } from "@/lib/db";
import { CouponModel } from "@/models/coupon";

const bodySchema = z.object({
  planId: z.enum(["starter", "pro", "enterprise"]),
  billingCycle: z.enum(["monthly", "yearly"]).default("monthly"),
  couponCode: z.string().min(1).max(40),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Sign in required." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid input", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const plan = getBillingPlanById(parsed.data.planId);
  if (!plan || !plan.isPaid) {
    return NextResponse.json({ success: false, error: "Invalid plan." }, { status: 400 });
  }

  const code = normalizeCouponCode(parsed.data.couponCode);
  if (code.length < 4) {
    return NextResponse.json(
      { success: false, error: "Enter a valid coupon code." },
      { status: 400 },
    );
  }

  try {
    await requireMongo();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable";
    return NextResponse.json({ success: false, error: msg }, { status: 503 });
  }

  const doc = await CouponModel.findOne({ code }).lean().exec();
  if (!doc) {
    return NextResponse.json({ success: false, error: "Invalid coupon code." }, { status: 404 });
  }

  const now = new Date();
  const block = couponBlockReason(
    {
      active: Boolean(doc.active),
      expiresAt: doc.expiresAt ?? null,
      maxRedemptions: doc.maxRedemptions ?? null,
      redemptionCount: doc.redemptionCount ?? 0,
    },
    now,
  );
  if (block) {
    return NextResponse.json({ success: false, error: block }, { status: 400 });
  }

  const chargeAmount = getCheckoutChargeAmount(plan, parsed.data.billingCycle);
  const pricing = getCheckoutPricing(plan, parsed.data.billingCycle);
  const { finalAmount, discountAmount } = computeDiscountedCharge(chargeAmount, doc.percentOff, {
    allowZeroTotal: canUseZeroChargeCheckout(plan.id, doc.percentOff),
  });

  return NextResponse.json({
    success: true,
    coupon: {
      code: doc.code,
      percentOff: doc.percentOff,
      couponId: doc._id.toString(),
    },
    originalChargeAmount: chargeAmount,
    discountedChargeAmount: finalAmount,
    discountAmount,
    checkoutPricing: pricing,
  });
}
