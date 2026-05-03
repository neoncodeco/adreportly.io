import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { UserModel } from "@/models/user";
import { AgencyModel } from "@/models/agency";
import { SharedLinkModel } from "@/models/shared-link";

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const [totalUsers, adminUsers, usersWithAgency, totalAgencies, totalShareLinks] =
    await Promise.all([
      UserModel.countDocuments({}),
      UserModel.countDocuments({ role: "admin" }),
      UserModel.countDocuments({
        agencyId: { $exists: true, $nin: [null, ""] },
      }),
      AgencyModel.countDocuments({}),
      SharedLinkModel.countDocuments({}),
    ]);

  return NextResponse.json({
    success: true,
    totals: {
      totalUsers,
      adminUsers,
      usersWithAgency,
      totalAgencies,
      totalShareLinks,
    },
  });
}
