import mongoose, { Schema, type Document } from "mongoose";

export type NotificationTargetRole = "all" | "user" | "admin";

export interface INotification extends Document {
  title: string;
  message: string;
  link: string | null;
  createdByUserId: string;
  targetRole: NotificationTargetRole;
  recipientUserId: string | null;
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    link: { type: String, default: null },
    createdByUserId: { type: String, required: true, index: true },
    targetRole: {
      type: String,
      enum: ["all", "user", "admin"] satisfies NotificationTargetRole[],
      default: "all",
      index: true,
    },
    recipientUserId: { type: String, default: null, index: true },
    readBy: { type: [String], default: [] },
  },
  { timestamps: true, versionKey: false },
);

NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ recipientUserId: 1, createdAt: -1 });
NotificationSchema.index({ targetRole: 1, createdAt: -1 });

export const NotificationModel =
  (mongoose.models.Notification as mongoose.Model<INotification>) ??
  mongoose.model<INotification>("Notification", NotificationSchema);
