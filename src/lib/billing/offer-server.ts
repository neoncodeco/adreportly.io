import { couponBlockReason, normalizeCouponCode } from "@/lib/billing/coupon-discount";
import { prisma, requireDb } from "@/lib/db";

export type PublicOfferCoupon = {
  id: string;
  code: string;
  percentOff: number;
  expiresAt: string | null;
  maxRedemptions: number | null;
  redemptionCount: number;
};

function toPublicOfferCoupon(doc: {
  id: string;
  code: string;
  percentOff: number;
  expiresAt?: Date | null;
  maxRedemptions?: number | null;
  redemptionCount?: number | null;
}): PublicOfferCoupon {
  return {
    id: doc.id,
    code: doc.code,
    percentOff: doc.percentOff,
    expiresAt: doc.expiresAt ? doc.expiresAt.toISOString() : null,
    maxRedemptions: doc.maxRedemptions ?? null,
    redemptionCount: doc.redemptionCount ?? 0,
  };
}

function isEligibleCoupon(doc: {
  active?: boolean;
  expiresAt?: Date | null;
  maxRedemptions?: number | null;
  redemptionCount?: number | null;
  percentOff?: number;
}) {
  return (
    doc.percentOff === 100 &&
    !couponBlockReason(
      {
        active: Boolean(doc.active),
        expiresAt: doc.expiresAt ?? null,
        maxRedemptions: doc.maxRedemptions ?? null,
        redemptionCount: doc.redemptionCount ?? 0,
      },
      new Date(),
    )
  );
}

export async function getLatestStandardOfferCoupon(): Promise<PublicOfferCoupon | null> {
  await requireDb();

  const rows = await prisma.coupon.findMany({
    where: { active: true, percentOff: 100 },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    take: 12,
  });

  const activeCoupon = rows.find((row) => isEligibleCoupon(row));
  return activeCoupon ? toPublicOfferCoupon(activeCoupon) : null;
}

export async function getLatestStandardOfferCouponSafe(): Promise<PublicOfferCoupon | null> {
  try {
    return await getLatestStandardOfferCoupon();
  } catch {
    return null;
  }
}

export async function getOfferCouponByCode(rawCode: string) {
  await requireDb();

  const code = normalizeCouponCode(rawCode);
  if (code.length < 4) return null;

  const doc = await prisma.coupon.findUnique({ where: { code } });
  if (!doc || !isEligibleCoupon(doc)) {
    return null;
  }

  return doc;
}
