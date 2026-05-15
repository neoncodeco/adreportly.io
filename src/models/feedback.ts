import mongoose, { Schema, type Document } from "mongoose";
import {
  FEEDBACK_AREAS,
  FEEDBACK_STATUSES,
  FEEDBACK_TYPES,
  type FeedbackArea,
  type FeedbackStatus,
  type FeedbackType,
} from "@/lib/feedback";

export interface IFeedback extends Document {
  userId: string;
  userEmail: string;
  userName: string;
  organization: string;
  type: FeedbackType;
  area: FeedbackArea;
  rating: number;
  message: string;
  pageUrl: string | null;
  status: FeedbackStatus;
  adminNote: string;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, required: true },
    userName: { type: String, default: "" },
    organization: { type: String, default: "" },
    type: {
      type: String,
      enum: FEEDBACK_TYPES,
      required: true,
      index: true,
    },
    area: {
      type: String,
      enum: FEEDBACK_AREAS,
      default: "overall",
      index: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5, index: true },
    message: { type: String, required: true, trim: true, maxlength: 3000 },
    pageUrl: { type: String, default: null },
    status: {
      type: String,
      enum: FEEDBACK_STATUSES,
      default: "new",
      index: true,
    },
    adminNote: { type: String, default: "", trim: true, maxlength: 1000 },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

FeedbackSchema.index({ userId: 1, createdAt: -1 });
FeedbackSchema.index({ status: 1, createdAt: -1 });
FeedbackSchema.index({ type: 1, area: 1, createdAt: -1 });

export const FeedbackModel =
  (mongoose.models.Feedback as mongoose.Model<IFeedback>) ??
  mongoose.model<IFeedback>("Feedback", FeedbackSchema);
