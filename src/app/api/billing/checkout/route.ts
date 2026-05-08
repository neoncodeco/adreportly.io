import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { createUddoktaPayCheckoutSession, resolveCheckoutUrl } from "@/lib/billing/uddoktapay";
import { getBillingCyclePrice, getBillingPlanById } from "@/lib/billing/plans";
import { requireMongo } from "@/lib/db";
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
  const selectedPrice = getBillingCyclePrice(plan, parsed.data.billingCycle);

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

  const billingInfo = parsed.data.billing;
  const resolvedName = billingInfo?.fullName ?? userRow?.fullName ?? session.user.name ?? null;
  const resolvedEmail = billingInfo?.email ?? session.user.email;

  let checkout: Awaited<ReturnType<typeof createUddoktaPayCheckoutSession>>;
  try {
    checkout = await createUddoktaPayCheckoutSession({
      plan,
      billingCycle: parsed.data.billingCycle,
      amount: selectedPrice.amount,
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
    status: "pending",
    amount: selectedPrice.amount,
    currency: plan.currency,
    providerReference: typeof checkout.reference === "string" ? checkout.reference : null,
    providerCustomerId: typeof checkout.customer_id === "string" ? checkout.customer_id : null,
    ...(providerSubscriptionId ? { providerSubscriptionId } : {}),
    metadata: {
      ...checkout,
      billingCycle: parsed.data.billingCycle,
      billingInfo: billingInfo ?? null,
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
        amount: selectedPrice.amount,
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
