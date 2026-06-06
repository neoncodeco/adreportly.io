import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  applyUddoktaPayPayloadToSubscriptions,
  extractBillingEventId,
} from "@/lib/billing/process-provider-payment";
import { getBillingWebhookCredential, verifyUddoktaPayWebhook } from "@/lib/billing/uddoktapay";
import { prisma, requireDb } from "@/lib/db";

export async function POST(request: Request) {
  const raw = await request.text();
  const credential = getBillingWebhookCredential(request);
  if (!verifyUddoktaPayWebhook(raw, credential)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const eventId = extractBillingEventId(payload);
  if (!eventId) {
    return NextResponse.json({ error: "Missing event identifier" }, { status: 400 });
  }

  try {
    await requireDb();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const existing = await prisma.billingEventLog.findUnique({ where: { eventId } });
  if (existing?.status === "processed") {
    return NextResponse.json({ ok: true, idempotent: true });
  }

  const flat = payload;
  await prisma.billingEventLog.upsert({
    where: { eventId },
    create: {
      provider: "uddoktapay",
      eventId,
      eventType: typeof flat.event === "string" ? flat.event : "unknown",
      payload: flat as Prisma.InputJsonValue,
      status: "received",
    },
    update: {
      status: "received",
      error: null,
    },
  });

  try {
    await applyUddoktaPayPayloadToSubscriptions(payload);
    await prisma.billingEventLog.update({
      where: { eventId },
      data: { status: "processed", processedAt: new Date(), error: null },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Webhook processing failed";
    await prisma.billingEventLog.update({
      where: { eventId },
      data: { status: "failed", error: message },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
