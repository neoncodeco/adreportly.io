import mongoose, { Schema } from "mongoose";

export type TicketStatus = "open" | "in_progress" | "waiting_user" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketCategory = "billing" | "technical" | "feature_request" | "account" | "general";

const ReplySchema = new Schema(
  {
    authorId: { type: String, required: true },
    authorName: { type: String, default: "" },
    authorEmail: { type: String, default: "" },
    isAdmin: { type: Boolean, default: false },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true, versionKey: false },
);

const TicketSchema = new Schema(
  {
    ticketNumber: { type: String, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, required: true },
    userName: { type: String, default: "" },
    subject: { type: String, required: true, trim: true, maxlength: 180 },
    category: {
      type: String,
      enum: ["billing", "technical", "feature_request", "account", "general"],
      default: "general",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      index: true,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "waiting_user", "resolved", "closed"],
      default: "open",
      index: true,
    },
    description: { type: String, required: true, trim: true },
    replies: { type: [ReplySchema], default: [] },
    resolvedAt: { type: Date, default: null },
    lastRepliedAt: { type: Date, default: null },
    lastRepliedByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

TicketSchema.index({ userId: 1, status: 1, updatedAt: -1 });
TicketSchema.index({ status: 1, priority: 1, updatedAt: -1 });

// Auto-generate a short readable ticket number before saving
TicketSchema.pre("save", async function (next) {
  if (!this.ticketNumber) {
    const count = await (this.constructor as typeof mongoose.Model).countDocuments();
    const pad = String(count + 1).padStart(4, "0");
    const year = new Date().getFullYear();
    this.ticketNumber = `TKT-${year}-${pad}`;
  }
  next();
});

export const TicketModel = mongoose.models.Ticket ?? mongoose.model("Ticket", TicketSchema);
