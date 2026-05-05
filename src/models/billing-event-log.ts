import mongoose, { Schema, type Document } from "mongoose";

export interface IBillingEventLog extends Document {
  provider: string;
  eventId: string;
  eventType: string;
  processedAt: Date | null;
  status: "received" | "processed" | "ignored" | "failed";
  error: string | null;
  payload: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const BillingEventLogSchema = new Schema<IBillingEventLog>(
  {
    provider: { type: String, default: "uddoktapay", index: true },
    eventId: { type: String, required: true, unique: true, index: true },
    eventType: { type: String, default: "unknown", index: true },
    processedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["received", "processed", "ignored", "failed"],
      default: "received",
    },
    error: { type: String, default: null },
    payload: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, versionKey: false },
);

export const BillingEventLogModel =
  (mongoose.models.BillingEventLog as mongoose.Model<IBillingEventLog>) ??
  mongoose.model<IBillingEventLog>("BillingEventLog", BillingEventLogSchema);
