import mongoose, { Schema } from "mongoose";

const AgencyClientSchema = new Schema(
  {
    agencyId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    createdAt: { type: Date, default: Date.now },
    /** Soft-delete (kept for lifetime client limits). */
    deletedAt: { type: Date, default: null },
  },
  { versionKey: false },
);

// Not unique: the same client email/name may have multiple campaign shares.
AgencyClientSchema.index({ agencyId: 1, email: 1 });
AgencyClientSchema.index({ agencyId: 1, deletedAt: 1 });

export const AgencyClientModel =
  mongoose.models.AgencyClient ?? mongoose.model("AgencyClient", AgencyClientSchema);
