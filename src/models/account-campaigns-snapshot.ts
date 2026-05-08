import mongoose, { Schema, type Document } from "mongoose";

export interface IAccountCampaignsSnapshot extends Document {
  agencyId: string;
  accountId: string;
  payload: unknown[];
  fetchedAt: Date;
  lastError: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const AccountCampaignsSnapshotSchema = new Schema<IAccountCampaignsSnapshot>(
  {
    agencyId: { type: String, required: true, index: true },
    accountId: { type: String, required: true, index: true },
    payload: { type: [Schema.Types.Mixed], default: [] },
    fetchedAt: { type: Date, required: true, index: true },
    lastError: { type: String, default: null },
  },
  { timestamps: true, versionKey: false },
);

AccountCampaignsSnapshotSchema.index({ agencyId: 1, accountId: 1 }, { unique: true });

export const AccountCampaignsSnapshotModel =
  (mongoose.models.AccountCampaignsSnapshot as mongoose.Model<IAccountCampaignsSnapshot>) ??
  mongoose.model<IAccountCampaignsSnapshot>(
    "AccountCampaignsSnapshot",
    AccountCampaignsSnapshotSchema,
  );
