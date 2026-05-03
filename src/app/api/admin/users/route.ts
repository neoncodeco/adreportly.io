import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { UserModel } from "@/models/user";

export async function GET(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10) || 50));
  const skip = Math.max(0, parseInt(searchParams.get("skip") ?? "0", 10) || 0);
  const q = searchParams.get("q")?.trim() ?? "";

  const filter =
    q.length > 0
      ? {
          $or: [
            { email: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
            { fullName: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
          ],
        }
      : {};

  const [rows, total] = await Promise.all([
    UserModel.find(filter)
      .select("email fullName organization role agencyId createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
    UserModel.countDocuments(filter),
  ]);

  return NextResponse.json({
    success: true,
    total,
    users: rows.map((u) => {
      const id = (u as { _id: { toString(): string } })._id.toString();
      const createdAt = (u as { createdAt?: Date }).createdAt;
      return {
        id,
        email: u.email,
        fullName: u.fullName ?? "",
        organization: u.organization ?? "",
        role: u.role === "admin" ? "admin" : "user",
        metaLinked: Boolean(u.agencyId),
        createdAt: createdAt instanceof Date ? createdAt.toISOString() : null,
      };
    }),
  });
}
