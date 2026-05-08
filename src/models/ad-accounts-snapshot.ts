import mongoose, { Schema, type Document } from "mongoose";

export interface IAdAccountsSnapshot extends Document {
  agencyId: string;
  payload: unknown[];
  fetchedAt: Date;
  lastError: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const AdAccountsSnapshotSchema = new Schema<IAdAccountsSnapshot>(
  {
    agencyId: { type: String, required: true, unique: true, index: true },
    payload: { type: [Schema.Types.Mixed], default: [] },
    fetchedAt: { type: Date, required: true, index: true },
    lastError: { type: String, default: null },
  },
  { timestamps: true, versionKey: false },
);

export const AdAccountsSnapshotModel =
  (mongoose.models.AdAccountsSnapshot as mongoose.Model<IAdAccountsSnapshot>) ??
  mongoose.model<IAdAccountsSnapshot>("AdAccountsSnapshot", AdAccountsSnapshotSchema);
