import { NextResponse } from "next/server";
import { normalizeProviderStatus, verifyUddoktaPayWebhook } from "@/lib/billing/uddoktapay";
import { requireMongo } from "@/lib/db";
import { BillingEventLogModel } from "@/models/billing-event-log";
import { PaymentTransactionModel } from "@/models/payment-transaction";
import { SubscriptionModel } from "@/models/subscription";
import { UserModel } from "@/models/user";

type WebhookPayload = {
  event_id?: string;
  id?: string;
  event?: string;
  status?: string;
  payment_status?: string;
  amount?: number;
  currency?: string;
  paid_at?: string;
  customer_id?: string;
  transaction_id?: string;
  payment_id?: string;
  reference?: string;
  plan_code?: string;
  subscription_id?: string;
  metadata?: {
    userId?: string;
    planId?: "free" | "starter" | "pro" | "enterprise";
    billingCycle?: "monthly" | "yearly";
    agencyId?: string | null;
    existingSubscriptionId?: string | null;
  };
  period_end?: string;
  next_billing_at?: string;
  canceled_at?: string;
  [k: string]: unknown;
};

function parseDate(value: unknown): Date | null {
  if (!value || typeof value !== "string") return null;
  const d = new Date(value);
  return Number.isNaN(d.valueOf()) ? null : d;
}

export async function POST(request: Request) {
  const raw = await request.text();
  const signature =
    request.headers.get("x-uddoktapay-signature") || request.headers.get("rt-uddoktapay-api-key");
  if (!verifyUddoktaPayWebhook(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(raw) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const eventId = payload.event_id || payload.id || payload.transaction_id || payload.payment_id;
  if (!eventId) {
    return NextResponse.json({ error: "Missing event identifier" }, { status: 400 });
  }

  try {
    await requireMongo();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const existing = await BillingEventLogModel.findOne({ eventId }).lean().exec();
  if (existing?.status === "processed") {
    return NextResponse.json({ ok: true, idempotent: true });
  }

  await BillingEventLogModel.updateOne(
    { eventId },
    {
      $setOnInsert: {
        provider: "uddoktapay",
        eventId,
        eventType: payload.event || "unknown",
        payload,
      },
      $set: { status: "received", error: null },
    },
    { upsert: true },
  );

  try {
    const userId = payload.metadata?.userId;
    const planId = payload.metadata?.planId || payload.plan_code || "starter";
    if (!userId) {
      throw new Error("Webhook payload missing metadata.userId");
    }

    const normalized = normalizeProviderStatus(payload.payment_status || payload.status);
    const providerSubscriptionId = payload.subscription_id || null;
    const providerPaymentId = payload.payment_id || payload.transaction_id || eventId;

    const subUpdate: {
      $set: Record<string, unknown>;
      $unset?: Record<string, 1>;
    } = {
      $set: {
        userId,
        agencyId: payload.metadata?.agencyId ?? null,
        planId,
        status: normalized.subscriptionStatus,
        amount: typeof payload.amount === "number" ? payload.amount : 0,
        currency: payload.currency || "USD",
        providerReference: payload.reference || null,
        nextBillingAt: parseDate(payload.next_billing_at) || parseDate(payload.period_end),
        periodEndAt: parseDate(payload.period_end),
        canceledAt: parseDate(payload.canceled_at),
        metadata: payload,
      },
    };
    if (providerSubscriptionId) {
      subUpdate.$set.providerSubscriptionId = providerSubscriptionId;
    } else {
      subUpdate.$unset = { providerSubscriptionId: 1 };
    }

    const sub = await SubscriptionModel.findOneAndUpdate(
      {
        $or: [
          ...(providerSubscriptionId ? [{ providerSubscriptionId }] : []),
          ...(payload.reference ? [{ providerReference: payload.reference }] : []),
          { userId, planId },
        ],
      },
      subUpdate,
      { upsert: true, new: true },
    );

    await PaymentTransactionModel.updateOne(
      { providerPaymentId },
      {
        $set: {
          userId,
          subscriptionId: sub._id.toString(),
          planId,
          providerPaymentId,
          providerSubscriptionId,
          providerReference: payload.reference || null,
          amount: typeof payload.amount === "number" ? payload.amount : 0,
          currency: payload.currency || "USD",
          status: normalized.paymentStatus,
          paidAt: parseDate(payload.paid_at),
          raw: payload,
        },
      },
      { upsert: true },
    );

    await UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          billingPlanId: planId,
          billingStatus: normalized.subscriptionStatus,
          billingCurrentPeriodEnd: parseDate(payload.period_end),
        },
      },
    );

    await BillingEventLogModel.updateOne(
      { eventId },
      { $set: { status: "processed", processedAt: new Date(), error: null } },
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Webhook processing failed";
    await BillingEventLogModel.updateOne(
      { eventId },
      { $set: { status: "failed", error: message } },
    );
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
