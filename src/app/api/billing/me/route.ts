import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { BILLING_PLANS } from "@/lib/billing/plans";
import { requireMongo } from "@/lib/db";
import { getOrSetCache, USER_CACHE_HEADERS } from "@/lib/server-cache";
import { PaymentTransactionModel } from "@/models/payment-transaction";
import { SubscriptionModel } from "@/models/subscription";
import { UserModel } from "@/models/user";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    await requireMongo();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const payload = await getOrSetCache(`user:billing-me:${session.user.id}`, 10_000, async () => {
    const [sub, payments, user] = await Promise.all([
      SubscriptionModel.findOne({ userId: session.user.id }).sort({ updatedAt: -1 }).lean().exec(),
      PaymentTransactionModel.find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean()
        .exec(),
      UserModel.findById(session.user.id)
        .select("billingPlanId billingStatus billingCurrentPeriodEnd")
        .lean()
        .exec(),
    ]);

    return {
      currentPlan:
        BILLING_PLANS.find((p) => p.id === (user?.billingPlanId || sub?.planId || "free")) ??
        BILLING_PLANS[0],
      currentStatus: user?.billingStatus || sub?.status || "inactive",
      renewalAt: user?.billingCurrentPeriodEnd || sub?.nextBillingAt || null,
      subscription: sub
        ? {
            id: sub._id.toString(),
            status: sub.status,
            planId: sub.planId,
            amount: sub.amount,
            currency: sub.currency,
            nextBillingAt: sub.nextBillingAt,
            canceledAt: sub.canceledAt,
            updatedAt: sub.updatedAt,
          }
        : null,
      payments: payments.map((p) => ({
        id: p._id.toString(),
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        planId: p.planId,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
        providerPaymentId: p.providerPaymentId,
      })),
    };
  });

  return NextResponse.json(payload, { headers: USER_CACHE_HEADERS });
}
