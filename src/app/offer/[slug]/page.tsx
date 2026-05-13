import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { OfferPageClient } from "@/components/offers/OfferPageClient";
import { STANDARD_OFFER_SLUG } from "@/lib/billing/offer-config";
import { getLatestStandardOfferCouponSafe } from "@/lib/billing/offer-server";
import { requireMongo } from "@/lib/db";
import { OfferRedemptionModel } from "@/models/offer-redemption";
import { UserModel } from "@/models/user";

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

  const [session, offerCoupon] = await Promise.all([auth(), getLatestStandardOfferCouponSafe()]);

  let hasAccountClaim = false;
  let currentPlanId: "free" | "starter" | "pro" | "enterprise" | null = null;

  if (session?.user?.id) {
    try {
      await requireMongo();
      const [claimRow, userRow] = await Promise.all([
        OfferRedemptionModel.findOne({ userId: session.user.id }).select("_id").lean().exec(),
        UserModel.findById(session.user.id).select("billingPlanId").lean().exec(),
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
      isSignedIn={Boolean(session?.user?.id)}
      hasAccountClaim={hasAccountClaim}
      currentPlanId={currentPlanId}
    />
  );
}
