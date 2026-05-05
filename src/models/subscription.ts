import mongoose, { Schema } from "mongoose";
import type { BillingPlanId } from "@/lib/billing/plans";

export type SubscriptionStatus =
  | "pending"
  | "active"
  | "past_due"
  | "canceled"
  | "expired"
  | "incomplete";

const SubscriptionSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    agencyId: { type: String, default: null, index: true },
    planId: {
      type: String,
      enum: ["free", "starter", "pro", "enterprise"] satisfies BillingPlanId[],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "past_due", "canceled", "expired", "incomplete"],
      default: "pending",
      index: true,
    },
    currency: { type: String, default: "USD" },
    amount: { type: Number, default: 0 },
    provider: { type: String, default: "uddoktapay", index: true },
    providerCustomerId: { type: String, default: null, index: true, sparse: true },
    providerSubscriptionId: {
      type: String,
      default: null,
      index: true,
      sparse: true,
      unique: true,
    },
    providerReference: { type: String, default: null, index: true },
    periodStartAt: { type: Date, default: null },
    periodEndAt: { type: Date, default: null },
    nextBillingAt: { type: Date, default: null },
    canceledAt: { type: Date, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, versionKey: false },
);

SubscriptionSchema.index({ userId: 1, status: 1, updatedAt: -1 });

export const SubscriptionModel =
  mongoose.models.Subscription ?? mongoose.model("Subscription", SubscriptionSchema);
