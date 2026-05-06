import crypto from "crypto";
import {
  assertBillingEnvForCheckout,
  assertBillingEnvForWebhook,
  getBillingEnv,
} from "@/lib/billing/env";
import type { BillingPlan } from "@/lib/billing/plans";

type BillingDetails = {
  company?: string | null;
  phone?: string | null;
  addressLine?: string | null;
  city?: string | null;
  country?: string | null;
};

type CreateSessionInput = {
  plan: BillingPlan;
  userId: string;
  userEmail: string;
  userName?: string | null;
  agencyId?: string | null;
  existingSubscriptionId?: string | null;
  billingDetails?: BillingDetails | null;
};

type UddoktaPayCreateSessionResponse = {
  checkout_url?: string;
  payment_url?: string;
  session_id?: string;
  reference?: string;
  customer_id?: string;
  subscription_id?: string;
  [key: string]: unknown;
};

export function normalizeProviderStatus(rawStatus: unknown): {
  subscriptionStatus: "pending" | "active" | "past_due" | "canceled" | "expired" | "incomplete";
  paymentStatus: "pending" | "paid" | "failed" | "refunded" | "canceled";
} {
  const status = String(rawStatus || "")
    .trim()
    .toLowerCase();
  if (["success", "paid", "completed", "active"].includes(status)) {
    return { subscriptionStatus: "active", paymentStatus: "paid" };
  }
  if (["failed", "declined", "unpaid"].includes(status)) {
    return { subscriptionStatus: "past_due", paymentStatus: "failed" };
  }
  if (["refunded"].includes(status)) {
    return { subscriptionStatus: "active", paymentStatus: "refunded" };
  }
  if (["cancelled", "canceled", "cancel"].includes(status)) {
    return { subscriptionStatus: "canceled", paymentStatus: "canceled" };
  }
  if (["expired"].includes(status)) {
    return { subscriptionStatus: "expired", paymentStatus: "failed" };
  }
  return { subscriptionStatus: "pending", paymentStatus: "pending" };
}

export async function createUddoktaPayCheckoutSession(
  input: CreateSessionInput,
): Promise<UddoktaPayCreateSessionResponse> {
  const env = assertBillingEnvForCheckout();
  const successUrl = `${env.publicSiteUrl}/checkout/success`;
  const cancelUrl = `${env.publicSiteUrl}/checkout/cancel`;

  const payload = {
    merchant_id: env.merchantId,
    amount: input.plan.amount,
    currency: input.plan.currency,
    frequency: input.plan.interval ?? "month",
    plan_code: input.plan.id,
    customer: {
      id: input.userId,
      email: input.userEmail,
      name: input.userName || input.userEmail,
      ...(input.billingDetails?.phone ? { phone: input.billingDetails.phone } : {}),
      ...(input.billingDetails?.company ? { company: input.billingDetails.company } : {}),
      ...(input.billingDetails?.country ? { country: input.billingDetails.country } : {}),
    },
    metadata: {
      userId: input.userId,
      planId: input.plan.id,
      agencyId: input.agencyId ?? null,
      existingSubscriptionId: input.existingSubscriptionId ?? null,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  };

  const res = await fetch(`${env.apiBaseUrl}/api/checkout/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.apiKey,
      "x-api-secret": env.apiSecret,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const json = (await res.json().catch(() => ({}))) as UddoktaPayCreateSessionResponse & {
    message?: string;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(json.error || json.message || "Could not create UddoktaPay checkout session.");
  }
  return json;
}

export function verifyUddoktaPayWebhook(
  rawBody: string,
  providedSignature: string | null,
): boolean {
  if (!providedSignature) return false;
  const env = assertBillingEnvForWebhook();
  const digest = crypto.createHmac("sha256", env.webhookSecret).update(rawBody).digest("hex");
  const provided = providedSignature.trim();
  if (digest.length !== provided.length) return false;
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(provided));
}

export function resolveCheckoutUrl(payload: UddoktaPayCreateSessionResponse): string | null {
  const candidate = payload.checkout_url || payload.payment_url;
  if (!candidate || typeof candidate !== "string") return null;
  return candidate;
}

export function getUddoktaPayDebugConfig() {
  const env = getBillingEnv();
  return {
    configured: Boolean(env.apiBaseUrl && env.merchantId && env.apiKey && env.apiSecret),
    baseUrl: env.apiBaseUrl || null,
  };
}
