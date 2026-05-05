import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { createUddoktaPayCheckoutSession, resolveCheckoutUrl } from "@/lib/billing/uddoktapay";
import { getBillingPlanById } from "@/lib/billing/plans";
import { requireMongo } from "@/lib/db";
import { SubscriptionModel } from "@/models/subscription";
import { UserModel } from "@/models/user";

const bodySchema = z.object({
  planId: z.enum(["starter", "pro", "enterprise"]),
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

  try {
    await requireMongo();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const [existingSubscription, userRow] = await Promise.all([
    SubscriptionModel.findOne({
      userId: session.user.id,
      status: { $in: ["pending", "active", "past_due", "incomplete"] },
    })
      .sort({ updatedAt: -1 })
      .lean()
      .exec(),
    UserModel.findById(session.user.id).select("agencyId fullName").lean().exec(),
  ]);

  const checkout = await createUddoktaPayCheckoutSession({
    plan,
    userId: session.user.id,
    userEmail: session.user.email,
    userName: userRow?.fullName ?? session.user.name ?? null,
    agencyId: userRow?.agencyId ?? null,
    existingSubscriptionId: existingSubscription?._id?.toString() ?? null,
  });

  const checkoutUrl = resolveCheckoutUrl(checkout);
  if (!checkoutUrl) {
    return NextResponse.json(
      { error: "Provider response did not include checkout URL." },
      { status: 502 },
    );
  }

  const sub = await SubscriptionModel.create({
    userId: session.user.id,
    agencyId: userRow?.agencyId ?? null,
    planId: plan.id,
    status: "pending",
    amount: plan.amount,
    currency: plan.currency,
    providerReference: typeof checkout.reference === "string" ? checkout.reference : null,
    providerCustomerId: typeof checkout.customer_id === "string" ? checkout.customer_id : null,
    providerSubscriptionId:
      typeof checkout.subscription_id === "string" ? checkout.subscription_id : null,
    metadata: checkout,
  });

  return NextResponse.json({
    checkout_url: checkoutUrl,
    subscriptionId: sub._id.toString(),
  });
}
