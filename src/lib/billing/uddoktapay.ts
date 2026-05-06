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
  const webhookUrl = `${env.publicSiteUrl}/api/billing/webhook`;

  const payload = {
    // Keep request shape aligned with UddoktaPay docs/examples.
    full_name: input.userName || input.userEmail,
    email: input.userEmail,
    amount: String(input.plan.amount),
    metadata: {
      userId: input.userId,
      planId: input.plan.id,
      agencyId: input.agencyId ?? null,
      existingSubscriptionId: input.existingSubscriptionId ?? null,
      ...(input.billingDetails?.phone ? { phone: input.billingDetails.phone } : {}),
      ...(input.billingDetails?.company ? { company: input.billingDetails.company } : {}),
      ...(input.billingDetails?.addressLine
        ? { addressLine: input.billingDetails.addressLine }
        : {}),
      ...(input.billingDetails?.city ? { city: input.billingDetails.city } : {}),
      ...(input.billingDetails?.country ? { country: input.billingDetails.country } : {}),
    },
    redirect_url: successUrl,
    return_type: "GET",
    cancel_url: cancelUrl,
    webhook_url: webhookUrl,
  };

  const endpoint = `${env.apiBaseUrl}/checkout-v2`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "RT-UDDOKTAPAY-API-KEY": env.apiKey,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const raw = await res.text();
  let parsed: unknown = {};
  try {
    parsed = raw ? JSON.parse(raw) : {};
  } catch {
    parsed = {};
  }
  const json = parsed as UddoktaPayCreateSessionResponse & {
    status?: boolean | string;
    message?: string;
    error?: string;
  };
  const providerRejected =
    json.status === false || String(json.status || "").toLowerCase() === "false";

  if (!res.ok || providerRejected) {
    const reason =
      json.error ||
      json.message ||
      (raw && raw.length > 0 ? raw : "") ||
      "Could not create UddoktaPay checkout session.";
    throw new Error(reason);
  }

  return json;
}

export function verifyUddoktaPayWebhook(
  rawBody: string,
  providedSignature: string | null,
): boolean {
  if (!providedSignature) return false;
  const env = assertBillingEnvForWebhook();
  const provided = providedSignature.trim();
  if (env.webhookSecret) {
    const digest = crypto.createHmac("sha256", env.webhookSecret).update(rawBody).digest("hex");
    if (digest.length !== provided.length) return false;
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(provided));
  }
  if (!env.apiKey) return false;
  return provided === env.apiKey;
}

export function resolveCheckoutUrl(payload: UddoktaPayCreateSessionResponse): string | null {
  const isValidUrl = (value: unknown): value is string =>
    typeof value === "string" && /^https?:\/\//i.test(value.trim());

  const directCandidates = [
    payload.checkout_url,
    payload.payment_url,
    (payload as { url?: unknown }).url,
    (payload as { checkoutUrl?: unknown }).checkoutUrl,
  ];
  for (const value of directCandidates) {
    if (isValidUrl(value)) return value;
  }

  const nestedData = (payload as { data?: Record<string, unknown> }).data;
  if (nestedData && typeof nestedData === "object") {
    const nestedCandidates = [
      nestedData.checkout_url,
      nestedData.payment_url,
      nestedData.url,
      nestedData.checkoutUrl,
      nestedData.paymentUrl,
    ];
    for (const value of nestedCandidates) {
      if (isValidUrl(value)) return value;
    }
  }

  const visited = new Set<unknown>();
  const scan = (value: unknown): string | null => {
    if (!value || typeof value !== "object") return null;
    if (visited.has(value)) return null;
    visited.add(value);

    if (Array.isArray(value)) {
      for (const item of value) {
        const found = scan(item);
        if (found) return found;
      }
      return null;
    }

    for (const [k, v] of Object.entries(value)) {
      if (isValidUrl(v) && /(checkout|payment|redirect|url)/i.test(k)) {
        return v;
      }
      const found = scan(v);
      if (found) return found;
    }
    return null;
  };

  const fallbackUrl = scan(payload);
  if (fallbackUrl) return fallbackUrl;

  return null;
}

export function getUddoktaPayDebugConfig() {
  const env = getBillingEnv();
  return {
    configured: Boolean(env.apiBaseUrl && env.apiKey),
    baseUrl: env.apiBaseUrl || null,
  };
}
