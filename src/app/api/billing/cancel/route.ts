import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { prisma, requireDb } from "@/lib/db";

export async function POST() {
  const authUser = await getServerUser();
  if (!authUser?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    await requireDb();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const pendingPayment = await prisma.paymentTransaction.findFirst({
    where: { userId: authUser.id, status: "pending" },
    orderBy: { createdAt: "desc" },
  });

  if (pendingPayment) {
    await prisma.paymentTransaction.update({
      where: { id: pendingPayment.id },
      data: { status: "canceled" },
    });
  }

  const pendingSub = await prisma.subscription.findFirst({
    where: { userId: authUser.id, status: "pending" },
    orderBy: { createdAt: "desc" },
  });

  if (pendingSub) {
    await prisma.subscription.update({
      where: { id: pendingSub.id },
      data: { status: "canceled", canceledAt: new Date() },
    });
  }

  return NextResponse.json({
    ok: true,
    paymentUpdated: Boolean(pendingPayment),
    subscriptionUpdated: Boolean(pendingSub),
  });
}
