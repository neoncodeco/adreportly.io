import mongoose, { Schema, type Document } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  percentOff: number;
  active: boolean;
  maxRedemptions: number | null;
  redemptionCount: number;
  expiresAt: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, index: true },
    percentOff: { type: Number, required: true, min: 1, max: 100 },
    active: { type: Boolean, default: true, index: true },
    maxRedemptions: { type: Number, default: null, min: 1 },
    redemptionCount: { type: Number, default: 0, min: 0 },
    expiresAt: { type: Date, default: null, index: true },
    createdBy: { type: String, required: true, index: true },
  },
  { timestamps: true, versionKey: false },
);

export const CouponModel =
  (mongoose.models.Coupon as mongoose.Model<ICoupon>) ??
  mongoose.model<ICoupon>("Coupon", CouponSchema);
