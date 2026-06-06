import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerUser } from "@/lib/auth/session";
import { OfferPageClient } from "@/components/offers/OfferPageClient";
import { STANDARD_OFFER_SLUG } from "@/lib/billing/offer-config";
import { getLatestStandardOfferCouponSafe } from "@/lib/billing/offer-server";
import { prisma, requireDb } from "@/lib/db";

export const metadata: Metadata = {
  title: "Standard Offer",
  description:
    "বাংলায় AdReportly offer page - website কীভাবে কাজ করে, package list, আর Standard package-এর 100% coupon offer.",
};

export default async function OfferSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== STANDARD_OFFER_SLUG) {
    notFound();
  }

  const [authUser, offerCoupon] = await Promise.all([
    getServerUser(),
    getLatestStandardOfferCouponSafe(),
  ]);

  let hasAccountClaim = false;
  let currentPlanId: "free" | "starter" | "pro" | "enterprise" | null = null;

  if (authUser?.id) {
    try {
      await requireDb();
      const [claimRow, userRow] = await Promise.all([
        prisma.offerRedemption.findUnique({
          where: { userId: authUser.id },
          select: { id: true },
        }),
        prisma.user.findUnique({
          where: { id: authUser.id },
          select: { billingPlanId: true },
        }),
      ]);
      hasAccountClaim = Boolean(claimRow);
      currentPlanId =
        userRow?.billingPlanId === "free" ||
        userRow?.billingPlanId === "starter" ||
        userRow?.billingPlanId === "pro" ||
        userRow?.billingPlanId === "enterprise"
          ? userRow.billingPlanId
          : null;
    } catch {
      hasAccountClaim = false;
      currentPlanId = null;
    }
  }

  return (
    <OfferPageClient
      couponCode={offerCoupon?.code ?? null}
      isSignedIn={Boolean(authUser?.id)}
      hasAccountClaim={hasAccountClaim}
      currentPlanId={currentPlanId}
    />
  );
}
