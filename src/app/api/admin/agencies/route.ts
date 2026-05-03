import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { AgencyModel } from "@/models/agency";

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const rows = await AgencyModel.find({})
    .select("agencyId name email fbUserId appUserId")
    .sort({ agencyId: 1 })
    .lean()
    .exec();

  return NextResponse.json({
    success: true,
    agencies: rows.map((a) => ({
      agencyId: a.agencyId,
      name: a.name ?? "",
      email: a.email ?? "",
      fbUserId: a.fbUserId ?? null,
      appUserId: a.appUserId ?? null,
    })),
  });
}
