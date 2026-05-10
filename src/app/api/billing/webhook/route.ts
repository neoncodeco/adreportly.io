import { NextResponse } from "next/server";
import {
  applyUddoktaPayPayloadToSubscriptions,
  extractBillingEventId,
} from "@/lib/billing/process-provider-payment";
import { getBillingWebhookCredential, verifyUddoktaPayWebhook } from "@/lib/billing/uddoktapay";
import { requireMongo } from "@/lib/db";
import { BillingEventLogModel } from "@/models/billing-event-log";

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
    await requireMongo();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const existing = await BillingEventLogModel.findOne({ eventId }).lean().exec();
  if (existing?.status === "processed") {
    return NextResponse.json({ ok: true, idempotent: true });
  }

  const flat = payload;
  await BillingEventLogModel.updateOne(
    { eventId },
    {
      $setOnInsert: {
        provider: "uddoktapay",
        eventId,
        eventType: typeof flat.event === "string" ? flat.event : "unknown",
        payload: flat,
      },
      $set: { status: "received", error: null },
    },
    { upsert: true },
  );

  try {
    await applyUddoktaPayPayloadToSubscriptions(payload);
    await BillingEventLogModel.updateOne(
      { eventId },
      { $set: { status: "processed", processedAt: new Date(), error: null } },
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Webhook processing failed";
    await BillingEventLogModel.updateOne(
      { eventId },
      { $set: { status: "failed", error: message } },
    );
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
