import crypto from "crypto";
import {
  assertBillingEnvForCheckout,
  assertBillingEnvForWebhook,
  getBillingEnv,
} from "@/lib/billing/env";
import type { BillingCycle, BillingPlan } from "@/lib/billing/plans";

/**
 * UddoktaPay docs use `{origin}/api/checkout-v2` and `{origin}/api/verify-payment`.
 * Many installs set `UDDOKTAPAY_BASE_URL` to `https://pay.example.com/api` — in that case
 * paths must NOT get a second `/api` prefix.
 */
export function uddoktaPayApiUrl(
  envBaseUrl: string,
  segment: "checkout-v2" | "verify-payment",
): string {
  const base = envBaseUrl.replace(/\/+$/, "");
  if (/\/api$/i.test(base)) {
    return `${base}/${segment}`;
  }
  return `${base}/api/${segment}`;
}

type BillingDetails = {
  company?: string | null;
  phone?: string | null;
  addressLine?: string | null;
  city?: string | null;
  country?: string | null;
};

export type CheckoutCouponMetadata = {
  couponMongoId: string;
  couponCode: string;
  couponPercentOff: number;
  originalChargeAmount: number;
  discountAmount: number;
  finalChargeAmount: number;
};

type CreateSessionInput = {
  plan: BillingPlan;
  billingCycle: BillingCycle;
  amount: number;
  userId: string;
  userEmail: string;
  userName?: string | null;
  agencyId?: string | null;
  existingSubscriptionId?: string | null;
  billingDetails?: BillingDetails | null;
  coupon?: CheckoutCouponMetadata | null;
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
  if (
    ["success", "paid", "completed", "complete", "active", "approve", "approved"].includes(status)
  ) {
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
    amount: String(input.amount),
    metadata: {
      userId: input.userId,
      planId: input.plan.id,
      billingCycle: input.billingCycle,
      agencyId: input.agencyId ?? null,
      existingSubscriptionId: input.existingSubscriptionId ?? null,
      ...(input.coupon
        ? {
            couponMongoId: input.coupon.couponMongoId,
            couponCode: input.coupon.couponCode,
            couponPercentOff: input.coupon.couponPercentOff,
            originalChargeAmount: input.coupon.originalChargeAmount,
            couponDiscountAmount: input.coupon.discountAmount,
            finalChargeAmount: input.coupon.finalChargeAmount,
          }
        : {}),
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

  const endpoint = uddoktaPayApiUrl(env.apiBaseUrl, "checkout-v2");
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

/** Header used by UddoktaPay / Paymently IPN (API key or signature). */
export function getBillingWebhookCredential(request: Request): string | null {
  return (
    request.headers.get("rt-uddoktapay-api-key") ||
    request.headers.get("x-uddoktapay-signature") ||
    null
  );
}

export function verifyUddoktaPayWebhook(
  rawBody: string,
  providedSignature: string | null,
): boolean {
  if (!providedSignature) return false;
  const env = assertBillingEnvForWebhook();
  const provided = providedSignature.trim();

  // UddoktaPay / Paymently docs: webhook sends the same value as RT-UDDOKTAPAY-API-KEY (API key).
  if (env.apiKey && env.apiKey.length === provided.length) {
    try {
      if (crypto.timingSafeEqual(Buffer.from(env.apiKey), Buffer.from(provided))) {
        return true;
      }
    } catch {
      /* length mismatch should not happen after check */
    }
  }

  // Optional HMAC secret if the gateway is configured to sign bodies.
  if (env.webhookSecret) {
    const digest = crypto.createHmac("sha256", env.webhookSecret).update(rawBody).digest("hex");
    if (digest.length === provided.length) {
      try {
        return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(provided));
      } catch {
        return false;
      }
    }
  }

  return false;
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

/**
 * Confirms payment after redirect (return_type GET appends invoice_id to success URL).
 * @see https://uddoktapay.readme.io/reference/verify-payment-api-guideline
 */
export async function verifyUddoktaPayInvoice(invoiceId: string): Promise<Record<string, unknown>> {
  const env = assertBillingEnvForCheckout();
  const verifyUrl = uddoktaPayApiUrl(env.apiBaseUrl, "verify-payment");
  const res = await fetch(verifyUrl, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "RT-UDDOKTAPAY-API-KEY": env.apiKey,
    },
    body: JSON.stringify({ invoice_id: invoiceId }),
    cache: "no-store",
  });
  const raw = await res.text();
  let parsed: Record<string, unknown> = {};
  try {
    parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    parsed = {};
  }
  if (!res.ok) {
    const msg =
      typeof parsed.message === "string"
        ? parsed.message
        : raw || "Could not verify payment with gateway.";
    throw new Error(msg);
  }
  const bodyStatus = String(parsed.status ?? "")
    .trim()
    .toUpperCase();
  if (bodyStatus === "ERROR") {
    const msg =
      typeof parsed.message === "string"
        ? parsed.message
        : "Gateway returned an error for this invoice.";
    throw new Error(msg);
  }
  return parsed;
}

export function getUddoktaPayDebugConfig() {
  const env = getBillingEnv();
  return {
    configured: Boolean(env.apiBaseUrl && env.apiKey),
    baseUrl: env.apiBaseUrl || null,
  };
}
