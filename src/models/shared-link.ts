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

// Fast path for clients list + client-limit checks (match by agency, group/sort by client and recency).
SharedLinkSchema.index({ agencyId: 1, clientEmail: 1, createdAt: -1 });
// Fast cleanup/report queries by agency + expiry.
SharedLinkSchema.index({ agencyId: 1, expiresAt: 1 });

export const SharedLinkModel =
  mongoose.models.SharedLink ?? mongoose.model("SharedLink", SharedLinkSchema);
