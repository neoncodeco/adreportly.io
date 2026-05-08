import mongoose, { Schema, type Document } from "mongoose";

export interface ICampaignInsightsSnapshot extends Document {
  agencyId: string;
  campaignId: string;
  datePreset: string;
  timeIncrement: string;
  payload: unknown[];
  fetchedAt: Date;
  lastError: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignInsightsSnapshotSchema = new Schema<ICampaignInsightsSnapshot>(
  {
    agencyId: { type: String, required: true, index: true },
    campaignId: { type: String, required: true, index: true },
    datePreset: { type: String, required: true, index: true },
    timeIncrement: { type: String, required: true, index: true },
    payload: { type: [Schema.Types.Mixed], default: [] },
    fetchedAt: { type: Date, required: true, index: true },
    lastError: { type: String, default: null },
  },
  { timestamps: true, versionKey: false },
);

CampaignInsightsSnapshotSchema.index(
  { agencyId: 1, campaignId: 1, datePreset: 1, timeIncrement: 1 },
  { unique: true },
);

export const CampaignInsightsSnapshotModel =
  (mongoose.models.CampaignInsightsSnapshot as mongoose.Model<ICampaignInsightsSnapshot>) ??
  mongoose.model<ICampaignInsightsSnapshot>(
    "CampaignInsightsSnapshot",
    CampaignInsightsSnapshotSchema,
  );
