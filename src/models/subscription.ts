import mongoose, { Schema, type Document } from "mongoose";
import type { BillingCycle, BillingPlanId } from "@/lib/billing/plans";

export type SubscriptionStatus =
  | "pending"
  | "active"
  | "past_due"
  | "canceled"
  | "expired"
  | "incomplete";

export interface ISubscription extends Document {
  userId: string;
  agencyId: string | null;
  planId: BillingPlanId;
  billingCycle?: BillingCycle;
  status: SubscriptionStatus;
  currency: string;
  amount: number;
  provider: string;
  providerCustomerId: string | null;
  providerSubscriptionId: string | null;
  providerReference: string | null;
  periodStartAt: Date | null;
  periodEndAt: Date | null;
  nextBillingAt: Date | null;
  canceledAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: String, required: true, index: true },
    agencyId: { type: String, default: null, index: true },
    planId: {
      type: String,
      enum: ["free", "starter", "pro", "enterprise"] satisfies BillingPlanId[],
      required: true,
      index: true,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"] satisfies BillingCycle[],
      default: "monthly",
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
  (mongoose.models.Subscription as mongoose.Model<ISubscription>) ??
  mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
