import mongoose, { Schema } from "mongoose";

const BillingEventLogSchema = new Schema(
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
  mongoose.models.BillingEventLog ?? mongoose.model("BillingEventLog", BillingEventLogSchema);
