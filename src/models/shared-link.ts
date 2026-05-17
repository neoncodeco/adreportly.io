import mongoose, { Schema } from "mongoose";

const SharedLinkSchema = new Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    campaignId: { type: String, required: true },
    agencyId: { type: String, required: true },
    /** Roster row ID (allows multiple clients with same email). */
    clientId: { type: String, required: false, default: null },
    clientEmail: { type: String, required: true },
    /** Display name for the client; shown on the public /view/[token] page. */
    clientName: { type: String, default: "" },
    /** Agency-entered client deposit amount for this shared campaign report. */
    totalDeposit: { type: Number, default: null },
    /** BDT conversion rate for 1 USD on this shared report. */
    dollarRateBdt: { type: Number, default: 126 },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, required: true },
  },
  { versionKey: false },
);

// Fast path for clients list + client-limit checks (match by agency, group/sort by client and recency).
SharedLinkSchema.index({ agencyId: 1, clientEmail: 1, createdAt: -1 });
SharedLinkSchema.index({ agencyId: 1, clientId: 1, createdAt: -1 });
// Fast cleanup/report queries by agency + expiry.
SharedLinkSchema.index({ agencyId: 1, expiresAt: 1 });

export const SharedLinkModel =
  mongoose.models.SharedLink ?? mongoose.model("SharedLink", SharedLinkSchema);
