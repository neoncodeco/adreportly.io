import mongoose, { Schema } from "mongoose";

const SharedLinkSchema = new Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    campaignId: { type: String, required: true },
    agencyId: { type: String, required: true },
    clientEmail: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, required: true },
  },
  { versionKey: false },
);

export const SharedLinkModel =
  mongoose.models.SharedLink ?? mongoose.model("SharedLink", SharedLinkSchema);
