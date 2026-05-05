import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
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
  },
  { timestamps: true, versionKey: false },
);

export const UserModel = mongoose.models.User ?? mongoose.model("User", UserSchema);
