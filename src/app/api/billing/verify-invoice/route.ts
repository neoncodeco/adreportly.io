import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerUser } from "@/lib/auth/session";
import {
  applyUddoktaPayPayloadToSubscriptions,
  extractBillingEventId,
  flattenProviderPayload,
  resolveBillingUserId,
} from "@/lib/billing/process-provider-payment";
import { normalizeProviderStatus, verifyUddoktaPayInvoice } from "@/lib/billing/uddoktapay";
import { prisma, requireDb } from "@/lib/db";

const bodySchema = z.object({
  invoice_id: z.string().min(4).max(200),
});

export async function POST(request: Request) {
  const authUser = await getServerUser();
  if (!authUser?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    await requireDb();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  let verified: Record<string, unknown>;
  try {
    verified = await verifyUddoktaPayInvoice(parsed.data.invoice_id);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Verification failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const flat = flattenProviderPayload(verified);
  const resolvedUserId = await resolveBillingUserId(flat);
  if (!resolvedUserId || resolvedUserId !== authUser.id) {
    return NextResponse.json(
      {
        error:
          "This payment does not match your signed-in account. Use the same email you used at checkout, or ensure metadata includes your user id.",
      },
      { status: 403 },
    );
  }

  const normalized = normalizeProviderStatus(verified.status);
  if (normalized.paymentStatus !== "paid") {
    return NextResponse.json({
      ok: true,
      synced: false,
      status: verified.status ?? null,
    });
  }

  const eventId = extractBillingEventId(verified);
  if (!eventId) {
    return NextResponse.json({ error: "Verified payload missing invoice id." }, { status: 502 });
  }

  const existing = await prisma.billingEventLog.findUnique({ where: { eventId } });
  if (existing?.status === "processed") {
    return NextResponse.json({ ok: true, synced: true, idempotent: true });
  }

  await prisma.billingEventLog.upsert({
    where: { eventId },
    create: {
      provider: "uddoktapay",
      eventId,
      eventType: "verify_payment",
      payload: verified as Prisma.InputJsonValue,
      status: "received",
    },
    update: {
      status: "received",
      error: null,
    },
  });

  try {
    await applyUddoktaPayPayloadToSubscriptions(verified);
    await prisma.billingEventLog.update({
      where: { eventId },
      data: { status: "processed", processedAt: new Date(), error: null },
    });
    return NextResponse.json({ ok: true, synced: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sync failed";
    await prisma.billingEventLog.update({
      where: { eventId },
      data: { status: "failed", error: message },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
