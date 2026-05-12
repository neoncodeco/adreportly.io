import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { renderInvoiceHtml } from "@/lib/billing/invoice-html";
import { getBillingPlanById } from "@/lib/billing/plans";
import { requireMongo } from "@/lib/db";
import { PaymentTransactionModel } from "@/models/payment-transaction";
import { UserModel } from "@/models/user";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid invoice id." }, { status: 404 });
  }

  try {
    await requireMongo();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const tx = await PaymentTransactionModel.findById(id).lean().exec();
  if (!tx || tx.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (tx.status !== "paid") {
    return NextResponse.json(
      { error: "Invoice is only available for completed payments." },
      { status: 400 },
    );
  }

  const user = await UserModel.findById(session.user.id).select("email fullName").lean().exec();
  const plan = getBillingPlanById(tx.planId);
  const issuedAt = tx.paidAt ?? tx.updatedAt ?? new Date();

  const html = renderInvoiceHtml({
    invoiceNo: tx.providerPaymentId,
    customerName: user?.fullName?.trim() || "Customer",
    customerEmail: user?.email || session.user.email || "",
    planLabel: plan?.name ?? tx.planId,
    amount: tx.amount,
    currency: tx.currency,
    paidAt: tx.paidAt,
    issuedAt,
  });

  const safe = tx.providerPaymentId.replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 80);

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="AdReportly-invoice-${safe}.html"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
