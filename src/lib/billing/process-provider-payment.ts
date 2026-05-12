import mongoose from "mongoose";
import type { BillingCycle, BillingPlanId } from "@/lib/billing/plans";
import { getBillingPlanById } from "@/lib/billing/plans";
import { getPlanCycleForStorage } from "@/lib/billing/subscription-state";
import { normalizeProviderStatus } from "@/lib/billing/uddoktapay";
import { sendPaymentPaidInvoiceEmail } from "@/lib/email/mailer";
import { invalidateCacheKey } from "@/lib/server-cache";
import { CouponModel } from "@/models/coupon";
import { PaymentTransactionModel } from "@/models/payment-transaction";
import { SubscriptionModel } from "@/models/subscription";
import { UserModel } from "@/models/user";

export function flattenProviderPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const data = payload.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return { ...payload, ...(data as Record<string, unknown>) };
  }
  return payload;
}

export function extractBillingEventId(payload: Record<string, unknown>): string | null {
  const flat = flattenProviderPayload(payload);
  const candidates = [
    flat.invoice_id,
    flat.event_id,
    flat.id,
    flat.payment_id,
    flat.transaction_id,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.length > 0) return c;
  }
  return null;
}

function parseDate(value: unknown): Date | null {
  if (!value || typeof value !== "string") return null;
  const d = new Date(value);
  return Number.isNaN(d.valueOf()) ? null : d;
}

function parseAmount(value: unknown): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string") {
    const n = parseFloat(value.replace(/,/g, ""));
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

function addSubscriptionPeriod(start: Date, cycle: BillingCycle): Date {
  const d = new Date(start.getTime());
  if (cycle === "yearly") {
    d.setFullYear(d.getFullYear() + 1);
  } else {
    d.setMonth(d.getMonth() + 1);
  }
  return d;
}

function resolveSubscriptionPeriodEnd(
  start: Date,
  cycle: BillingCycle,
  providerPeriodEnd: Date | null,
): Date {
  const computedPeriodEnd = addSubscriptionPeriod(start, cycle);
  if (!providerPeriodEnd) return computedPeriodEnd;

  const elapsedDays = (providerPeriodEnd.getTime() - start.getTime()) / 86_400_000;
  const isReasonableWindow =
    cycle === "yearly"
      ? elapsedDays >= 330 && elapsedDays <= 400
      : elapsedDays >= 20 && elapsedDays <= 45;

  return isReasonableWindow ? providerPeriodEnd : computedPeriodEnd;
}

function resolveSubscriptionBillingCycle(sub: {
  billingCycle?: string;
  metadata?: Record<string, unknown>;
}): BillingCycle {
  const fromDoc = sub.billingCycle;
  if (fromDoc === "yearly" || fromDoc === "monthly") return fromDoc;
  const m = sub.metadata?.billingCycle;
  if (m === "yearly" || m === "monthly") return m;
  return "monthly";
}

export function coerceMetadata(
  payload: Record<string, unknown>,
): Record<string, unknown> | undefined {
  const m = payload.metadata;
  if (m && typeof m === "object" && !Array.isArray(m)) {
    return m as Record<string, unknown>;
  }
  if (typeof m === "string") {
    try {
      const p = JSON.parse(m) as unknown;
      if (p && typeof p === "object" && !Array.isArray(p)) {
        return p as Record<string, unknown>;
      }
    } catch {
      /* ignore */
    }
  }
  return undefined;
}

function userIdFromMetadata(meta: Record<string, unknown> | undefined): string | null {
  if (!meta) return null;
  const u = meta.userId ?? meta.user_id;
  return typeof u === "string" && u.length > 0 ? u : null;
}

/**
 * Resolves app user id from gateway metadata or payer email (webhook / verify often omit metadata after manual approve).
 */
export async function resolveBillingUserId(flat: Record<string, unknown>): Promise<string | null> {
  const meta = coerceMetadata(flat);
  const fromMeta = userIdFromMetadata(meta);
  if (fromMeta) return fromMeta;
  const email = flat.email;
  if (typeof email !== "string" || !email.trim()) return null;
  const row = await UserModel.findOne({ email: email.trim().toLowerCase() })
    .select("_id")
    .lean()
    .exec();
  return row?._id?.toString() ?? null;
}

function resolvePlanId(
  flat: Record<string, unknown>,
  meta: Record<string, unknown> | undefined,
): BillingPlanId | null {
  const fromMeta = meta?.planId ?? meta?.plan_id;
  const s = typeof fromMeta === "string" ? fromMeta.trim().toLowerCase() : "";
  if (s === "free" || s === "starter" || s === "pro" || s === "enterprise") {
    return s;
  }
  const code = flat.plan_code;
  if (typeof code === "string") {
    const c = code.trim().toLowerCase();
    if (c === "free" || c === "starter" || c === "pro" || c === "enterprise") {
      return c;
    }
  }
  return null;
}

function extractRawStatus(flat: Record<string, unknown>): unknown {
  return (
    flat.payment_status ??
    flat.status ??
    (flat as { paymentStatus?: unknown }).paymentStatus ??
    (flat as { payment_status?: unknown }).payment_status
  );
}

async function findSubscriptionForPayment(
  userId: string,
  reference: string | null,
  providerSubscriptionId: string | null,
  planHint: BillingPlanId | null,
) {
  if (reference) {
    const s = await SubscriptionModel.findOne({ providerReference: reference, userId })
      .sort({ createdAt: -1 })
      .exec();
    if (s) return s;
  }
  if (providerSubscriptionId) {
    const s = await SubscriptionModel.findOne({ providerSubscriptionId })
      .sort({ createdAt: -1 })
      .exec();
    if (s) return s;
  }
  if (planHint) {
    const s = await SubscriptionModel.findOne({ userId, planId: planHint, status: "pending" })
      .sort({ createdAt: -1 })
      .exec();
    if (s) return s;
  }
  return SubscriptionModel.findOne({ userId, status: "pending" }).sort({ createdAt: -1 }).exec();
}

/**
 * Applies UddoktaPay / Paymently webhook or verify-payment API payload to MongoDB.
 * Resolves the pending checkout row by subscription (not only by invoice id).
 */
export async function applyUddoktaPayPayloadToSubscriptions(
  payload: Record<string, unknown>,
): Promise<void> {
  const flat = flattenProviderPayload(payload);
  const meta = coerceMetadata(flat);
  const userId = await resolveBillingUserId(flat);
  if (!userId) {
    throw new Error(
      "Could not match payment to a user (need metadata.userId or payer email in payload).",
    );
  }

  const planHint = resolvePlanId(flat, meta);
  const normalized = normalizeProviderStatus(extractRawStatus(flat));
  const providerSubscriptionId =
    typeof flat.subscription_id === "string" ? flat.subscription_id : null;
  const reference = typeof flat.reference === "string" ? flat.reference : null;
  const agencyIdFromMeta =
    typeof meta?.agencyId === "string"
      ? meta.agencyId
      : typeof meta?.agency_id === "string"
        ? meta.agency_id
        : null;

  const sub = await findSubscriptionForPayment(userId, reference, providerSubscriptionId, planHint);

  if (!sub) {
    throw new Error("No pending subscription matched this payment. Start checkout again.");
  }

  const planId: BillingPlanId = planHint ?? sub.planId;
  const cycle = resolveSubscriptionBillingCycle(sub);

  const paidAtForPeriod =
    parseDate(flat.paid_at) ||
    parseDate(flat.date) ||
    (normalized.paymentStatus === "paid" || normalized.subscriptionStatus === "active"
      ? new Date()
      : null);

  const providerPeriodEnd =
    parseDate(flat.period_end) || parseDate(flat.next_billing_at) || parseDate(flat.nextBillingAt);

  const periodAnchor =
    paidAtForPeriod ?? (normalized.subscriptionStatus === "active" ? new Date() : null);
  const computedPeriodEnd =
    normalized.subscriptionStatus === "active" && periodAnchor
      ? resolveSubscriptionPeriodEnd(periodAnchor, cycle, providerPeriodEnd)
      : providerPeriodEnd;

  const priorMeta =
    sub.metadata && typeof sub.metadata === "object" && !Array.isArray(sub.metadata)
      ? { ...(sub.metadata as Record<string, unknown>) }
      : {};
  const mergedMetadata = {
    ...priorMeta,
    lastProviderEvent: flat,
  };

  const resolvedAmount = parseAmount(flat.amount) || sub.amount || 0;

  const subUpdate: {
    $set: Record<string, unknown>;
    $unset?: Record<string, 1>;
  } = {
    $set: {
      userId,
      agencyId: agencyIdFromMeta ?? sub.agencyId ?? null,
      planId,
      billingCycle: cycle,
      status: normalized.subscriptionStatus,
      amount: resolvedAmount,
      currency: typeof flat.currency === "string" ? flat.currency : sub.currency || "BDT",
      providerReference: reference ?? sub.providerReference,
      canceledAt: parseDate(flat.canceled_at),
      metadata: mergedMetadata,
    },
  };

  if (normalized.subscriptionStatus === "active" && periodAnchor && computedPeriodEnd) {
    subUpdate.$set.periodStartAt = periodAnchor;
    subUpdate.$set.periodEndAt = computedPeriodEnd;
    subUpdate.$set.nextBillingAt = computedPeriodEnd;
  } else if (providerPeriodEnd) {
    subUpdate.$set.nextBillingAt = providerPeriodEnd;
    subUpdate.$set.periodEndAt = providerPeriodEnd;
  }

  if (providerSubscriptionId) {
    subUpdate.$set.providerSubscriptionId = providerSubscriptionId;
  } else {
    subUpdate.$unset = { providerSubscriptionId: 1 };
  }

  await SubscriptionModel.updateOne({ _id: sub._id }, subUpdate).exec();

  const refreshed = await SubscriptionModel.findById(sub._id).exec();
  if (!refreshed) {
    throw new Error("Subscription disappeared after update.");
  }

  if (normalized.subscriptionStatus === "active") {
    await SubscriptionModel.updateMany(
      {
        userId,
        _id: { $ne: refreshed._id },
        status: { $in: ["pending", "active", "past_due", "incomplete"] },
      },
      {
        $set: {
          status: "canceled",
          canceledAt: paidAtForPeriod ?? new Date(),
        },
      },
    ).exec();
  }

  const invoiceId = typeof flat.invoice_id === "string" ? flat.invoice_id : null;
  const providerPaymentIdFromPayload =
    invoiceId ||
    (typeof flat.payment_id === "string" ? flat.payment_id : null) ||
    (typeof flat.transaction_id === "string" ? flat.transaction_id : null) ||
    extractBillingEventId(flat);

  if (!providerPaymentIdFromPayload) {
    throw new Error("Payment payload missing invoice_id / transaction_id");
  }

  const pendingTx = await PaymentTransactionModel.findOne({
    subscriptionId: refreshed._id.toString(),
    userId,
    status: "pending",
  })
    .sort({ createdAt: -1 })
    .exec();

  const paidAt =
    parseDate(flat.paid_at) ||
    parseDate(flat.date) ||
    (normalized.paymentStatus === "paid" ? new Date() : null);

  const txFilter = pendingTx
    ? { _id: pendingTx._id }
    : { providerPaymentId: providerPaymentIdFromPayload };

  const resolvedProviderPaymentId = pendingTx?.providerPaymentId ?? providerPaymentIdFromPayload;

  const existingTx = await PaymentTransactionModel.findOne(txFilter)
    .select("_id status")
    .lean()
    .exec();
  const wasPaid = existingTx?.status === "paid";

  await PaymentTransactionModel.updateOne(
    txFilter,
    {
      $set: {
        userId,
        subscriptionId: refreshed._id.toString(),
        planId,
        providerPaymentId: resolvedProviderPaymentId,
        providerSubscriptionId,
        providerReference: reference,
        amount: resolvedAmount,
        currency: typeof flat.currency === "string" ? flat.currency : refreshed.currency || "BDT",
        status: normalized.paymentStatus,
        paidAt,
        raw: flat,
      },
    },
    { upsert: !pendingTx },
  );

  const txRow = await PaymentTransactionModel.findOne({
    userId,
    providerPaymentId: resolvedProviderPaymentId,
  })
    .select("_id")
    .lean()
    .exec();
  const invoiceMongoId = txRow?._id?.toString() ?? null;

  if (normalized.paymentStatus === "paid" && !wasPaid) {
    const couponId =
      typeof priorMeta.couponMongoId === "string" ? priorMeta.couponMongoId.trim() : "";
    const alreadyRedeemed = priorMeta.couponRedeemed === true;
    if (couponId && !alreadyRedeemed && mongoose.isValidObjectId(couponId)) {
      const marked = await SubscriptionModel.updateOne(
        { _id: sub._id, "metadata.couponRedeemed": { $ne: true } },
        { $set: { "metadata.couponRedeemed": true } },
      ).exec();
      if (marked.modifiedCount > 0) {
        await CouponModel.updateOne({ _id: couponId }, { $inc: { redemptionCount: 1 } }).exec();
      }
    }

    const u = await UserModel.findById(userId).select("email fullName").lean().exec();
    if (u?.email) {
      const planMeta = getBillingPlanById(planId);
      void sendPaymentPaidInvoiceEmail({
        to: u.email,
        customerName: u.fullName?.trim() || "Customer",
        planLabel: planMeta?.name ?? planId,
        amount: resolvedAmount,
        currency: typeof flat.currency === "string" ? flat.currency : refreshed.currency || "BDT",
        providerPaymentId: resolvedProviderPaymentId,
        paidAt,
        invoiceMongoId,
      });
    }
  }

  const userPeriodEnd =
    normalized.subscriptionStatus === "active" && computedPeriodEnd ? computedPeriodEnd : null;

  await UserModel.updateOne(
    { _id: userId },
    {
      $set: {
        billingPlanId: planId,
        billingStatus: normalized.subscriptionStatus,
        billingCycle: getPlanCycleForStorage(planId, cycle),
        ...(userPeriodEnd ? { billingCurrentPeriodEnd: userPeriodEnd } : {}),
      },
      $unset: {
        billingScheduledPlanId: 1,
        billingScheduledCycle: 1,
        billingScheduledChangeAt: 1,
      },
    },
  );

  invalidateCacheKey(`user:billing-me:${userId}`);
}
