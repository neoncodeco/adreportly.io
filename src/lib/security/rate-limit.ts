type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

export function checkRateLimit(params: { key: string; limit: number; windowMs: number }): {
  allowed: boolean;
  retryAfterSec: number;
} {
  const now = Date.now();
  const existing = store.get(params.key);
  if (!existing || existing.resetAt <= now) {
    store.set(params.key, { count: 1, resetAt: now + params.windowMs });
    return { allowed: true, retryAfterSec: Math.ceil(params.windowMs / 1000) };
  }
  if (existing.count >= params.limit) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  existing.count += 1;
  return {
    allowed: true,
    retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}

export function getClientIp(request: Request) {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const vercel = request.headers.get("x-vercel-forwarded-for");
  if (vercel) return vercel.split(",")[0]?.trim() || "unknown";
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}
