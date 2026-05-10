import mongoose, { Schema } from "mongoose";

const AgencySchema = new Schema(
  {
    agencyId: { type: String, required: true, unique: true, index: true },
    name: { type: String },
    email: { type: String },
    encryptedToken: { type: String, required: true },
    fbUserId: { type: String, unique: true, sparse: true },
    appUserId: { type: String, sparse: true, index: true },
    /** Normalized `act_*` ids excluded from dashboard overview / campaigns aggregation */
    disabledAdAccountIds: { type: [String], default: [] },
  },
  { versionKey: false },
);

export const AgencyModel = mongoose.models.Agency ?? mongoose.model("Agency", AgencySchema);
