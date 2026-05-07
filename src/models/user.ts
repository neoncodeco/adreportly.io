import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  fullName: string;
  organization: string;
  agencyId: string | null;
  role: "user" | "admin";
  isBanned: boolean;
  bannedAt: Date | null;
  billingPlanId: "free" | "starter" | "pro" | "enterprise";
  billingStatus: "inactive" | "pending" | "active" | "past_due" | "canceled" | "expired";
  billingCurrentPeriodEnd: Date | null;
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;
  /** User's own Facebook App ID (plain text — not secret). */
  fbAppId: string | null;
  /** AES-256-GCM encrypted Facebook App Secret. */
  encryptedFbAppSecret: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, default: "" },
    organization: { type: String, default: "" },
    /** Meta / agency row id after Facebook connect (same as JWT `agencyId`). */
    agencyId: { type: String, default: null, sparse: true, index: true },
    /** Set to `"admin"` in DB for platform admins; never accept from public registration. */
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },
    isBanned: { type: Boolean, default: false, index: true },
    bannedAt: { type: Date, default: null },
    billingPlanId: {
      type: String,
      enum: ["free", "starter", "pro", "enterprise"],
      default: "free",
      index: true,
    },
    billingStatus: {
      type: String,
      enum: ["inactive", "pending", "active", "past_due", "canceled", "expired"],
      default: "inactive",
      index: true,
    },
    billingCurrentPeriodEnd: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    fbAppId: { type: String, default: null },
    encryptedFbAppSecret: { type: String, default: null },
  },
  { timestamps: true, versionKey: false },
);

export const UserModel =
  (mongoose.models.User as mongoose.Model<IUser>) ?? mongoose.model<IUser>("User", UserSchema);
