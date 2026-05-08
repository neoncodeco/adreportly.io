import mongoose, { Schema, type Document } from "mongoose";

export interface IAnalyticsOverviewSnapshot extends Document {
  agencyId: string;
  payload: Record<string, unknown>;
  fetchedAt: Date;
  lastError: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsOverviewSnapshotSchema = new Schema<IAnalyticsOverviewSnapshot>(
  {
    agencyId: { type: String, required: true, unique: true, index: true },
    payload: { type: Schema.Types.Mixed, required: true, default: {} },
    fetchedAt: { type: Date, required: true, index: true },
    lastError: { type: String, default: null },
  },
  { timestamps: true, versionKey: false },
);

export const AnalyticsOverviewSnapshotModel =
  (mongoose.models.AnalyticsOverviewSnapshot as mongoose.Model<IAnalyticsOverviewSnapshot>) ??
  mongoose.model<IAnalyticsOverviewSnapshot>(
    "AnalyticsOverviewSnapshot",
    AnalyticsOverviewSnapshotSchema,
  );
