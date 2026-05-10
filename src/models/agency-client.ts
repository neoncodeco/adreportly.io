import mongoose, { Schema } from "mongoose";

const AgencyClientSchema = new Schema(
  {
    agencyId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

AgencyClientSchema.index({ agencyId: 1, email: 1 }, { unique: true });

export const AgencyClientModel =
  mongoose.models.AgencyClient ?? mongoose.model("AgencyClient", AgencyClientSchema);
