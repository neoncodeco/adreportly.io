import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { requireMongo } from "@/lib/db";
import { PaymentTransactionModel } from "@/models/payment-transaction";
import { SubscriptionModel } from "@/models/subscription";

export async function POST() {
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

  const pendingPayment = await PaymentTransactionModel.findOne({
    userId: session.user.id,
    status: "pending",
  })
    .sort({ createdAt: -1 })
    .exec();

  if (pendingPayment) {
    pendingPayment.status = "canceled";
    await pendingPayment.save();
  }

  const pendingSub = await SubscriptionModel.findOne({
    userId: session.user.id,
    status: "pending",
  })
    .sort({ createdAt: -1 })
    .exec();

  if (pendingSub) {
    pendingSub.status = "canceled";
    pendingSub.canceledAt = new Date();
    await pendingSub.save();
  }

  return NextResponse.json({
    ok: true,
    paymentUpdated: Boolean(pendingPayment),
    subscriptionUpdated: Boolean(pendingSub),
  });
}
