import mongoose, { Schema, type Document } from "mongoose";
import type { BillingCycle } from "@/lib/billing/plans";

export interface IOfferRedemption extends Document {
  userId: string;
  deviceHash: string;
  couponId: string;
  couponCode: string;
  offerSlug: string;
  planId: string;
  billingCycle: BillingCycle;
  subscriptionId: string | null;
  transactionId: string | null;
  metadata: Record<string, unknown>;
  claimedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OfferRedemptionSchema = new Schema<IOfferRedemption>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    deviceHash: { type: String, required: true, unique: true, index: true },
    couponId: { type: String, required: true, index: true },
    couponCode: { type: String, required: true, index: true },
    offerSlug: { type: String, required: true, index: true },
    planId: { type: String, required: true, index: true },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"] satisfies BillingCycle[],
      required: true,
      default: "monthly",
    },
    subscriptionId: { type: String, default: null },
    transactionId: { type: String, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
    claimedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true, versionKey: false },
);

OfferRedemptionSchema.index({ couponId: 1, claimedAt: -1 });

export const OfferRedemptionModel =
  (mongoose.models.OfferRedemption as mongoose.Model<IOfferRedemption>) ??
  mongoose.model<IOfferRedemption>("OfferRedemption", OfferRedemptionSchema);
