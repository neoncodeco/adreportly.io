import mongoose, { Schema, type Document } from "mongoose";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "canceled";

export interface IPaymentTransaction extends Document {
  userId: string;
  subscriptionId: string | null;
  planId: string;
  provider: string;
  providerPaymentId: string;
  providerSubscriptionId: string | null;
  providerReference: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paidAt: Date | null;
  raw: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentTransactionSchema = new Schema<IPaymentTransaction>(
  {
    userId: { type: String, required: true, index: true },
    subscriptionId: { type: String, default: null, index: true },
    planId: { type: String, required: true },
    provider: { type: String, default: "uddoktapay", index: true },
    providerPaymentId: { type: String, required: true, unique: true, index: true },
    providerSubscriptionId: { type: String, default: null, index: true },
    providerReference: { type: String, default: null, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "canceled"],
      default: "pending",
      index: true,
    },
    paidAt: { type: Date, default: null },
    raw: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, versionKey: false },
);

PaymentTransactionSchema.index({ userId: 1, createdAt: -1 });

export const PaymentTransactionModel =
  (mongoose.models.PaymentTransaction as mongoose.Model<IPaymentTransaction>) ??
  mongoose.model<IPaymentTransaction>("PaymentTransaction", PaymentTransactionSchema);
