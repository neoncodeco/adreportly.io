/** Uppercase alphanumeric + hyphen, no spaces. */
export function normalizeCouponCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9-]/g, "");
}

/**
 * Percent-off for one-time checkout totals. Ensures at least ৳1 remains when the
 * base charge is positive (gateway-friendly).
 */
export function computeDiscountedCharge(
  chargeAmount: number,
  percentOff: number,
): { finalAmount: number; discountAmount: number } {
  const amount = Math.max(0, Math.floor(chargeAmount));
  const pct = Math.min(100, Math.max(0, Math.round(percentOff)));
  if (amount <= 0) {
    return { finalAmount: 0, discountAmount: 0 };
  }
  const rawDiscount = Math.round((amount * pct) / 100);
  const discountAmount = Math.min(amount - 1, rawDiscount);
  const finalAmount = Math.max(1, amount - discountAmount);
  return { finalAmount, discountAmount: amount - finalAmount };
}

export type CouponDocLike = {
  active: boolean;
  expiresAt: Date | null;
  maxRedemptions: number | null;
  redemptionCount: number;
};

export function couponBlockReason(doc: CouponDocLike, now: Date): string | null {
  if (!doc.active) return "This coupon is inactive.";
  if (doc.expiresAt && doc.expiresAt.getTime() <= now.getTime()) {
    return "This coupon has expired.";
  }
  if (doc.maxRedemptions != null && doc.redemptionCount >= doc.maxRedemptions) {
    return "This coupon has reached its usage limit.";
  }
  return null;
}
