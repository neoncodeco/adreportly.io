type BillingEnv = {
  publicSiteUrl: string;
  apiBaseUrl: string;
  merchantId: string;
  apiKey: string;
  apiSecret: string;
  webhookSecret: string;
};

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getBillingEnv(): BillingEnv {
  const publicSiteUrl = normalizeBaseUrl(
    process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "http://localhost:3000",
  );
  const apiBaseUrl = normalizeBaseUrl(process.env.UDDOKTAPAY_BASE_URL || "");
  const merchantId = process.env.UDDOKTAPAY_MERCHANT_ID || "";
  const apiKey = process.env.UDDOKTAPAY_API_KEY || "";
  const apiSecret = process.env.UDDOKTAPAY_API_SECRET || "";
  const webhookSecret = process.env.UDDOKTAPAY_WEBHOOK_SECRET || "";

  return {
    publicSiteUrl,
    apiBaseUrl,
    merchantId,
    apiKey,
    apiSecret,
    webhookSecret,
  };
}

export function assertBillingEnvForCheckout() {
  const env = getBillingEnv();
  if (!env.apiBaseUrl || !env.apiKey) {
    throw new Error("UddoktaPay is not configured. Set UDDOKTAPAY_* values in .env.");
  }
  return env;
}

export function assertBillingEnvForWebhook() {
  const env = getBillingEnv();
  if (!env.apiKey && !env.webhookSecret) {
    throw new Error("UDDOKTAPAY_API_KEY or UDDOKTAPAY_WEBHOOK_SECRET is not configured.");
  }
  return env;
}
