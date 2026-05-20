import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteAgencyClient, updateAgencyClientShareSettings } from "@/lib/agency-client-service";
import { metaAccessContext } from "@/lib/agency-from-request";
import { getAgencyIdForAppUser } from "@/lib/agency-service";
import { invalidateCacheByPrefix } from "@/lib/server-cache";
import { normalizeDollarRateBdt, positiveFiniteNumber } from "@/lib/share-financial";

async function resolveAgency(request: NextRequest) {
  const session = await auth();
  const reqCtx = await metaAccessContext(request);
  const fallbackAgencyId =
    !reqCtx.agencyId && session?.user?.id ? await getAgencyIdForAppUser(session.user.id) : null;
  const agencyId = reqCtx.agencyId ?? fallbackAgencyId;
  const isAuthenticated = reqCtx.isAuthenticated || Boolean(session?.user?.id);
  return { agencyId, isAuthenticated };
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await ctx.params;
  if (!clientId) {
    return NextResponse.json({ success: false, error: "Missing client id" }, { status: 400 });
  }

  const { agencyId, isAuthenticated } = await resolveAgency(request);
  if (!isAuthenticated || !agencyId) {
    return NextResponse.json({ success: false, error: "Sign in required." }, { status: 401 });
  }

  let body: { totalDeposit?: number | string | null; dollarRateBdt?: number | string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const totalDeposit = positiveFiniteNumber(body.totalDeposit);
  const dollarRateBdt = normalizeDollarRateBdt(body.dollarRateBdt);
  const result = await updateAgencyClientShareSettings(agencyId, clientId, {
    totalDeposit,
    dollarRateBdt,
  });
  if (!result.ok) {
    return NextResponse.json({ success: false, error: result.error }, { status: 404 });
  }

  invalidateCacheByPrefix(`user:clients:${agencyId}`);
  return NextResponse.json({
    success: true,
    updatedCount: result.updatedCount,
    totalDeposit,
    dollarRateBdt,
  });
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await ctx.params;
  if (!clientId) {
    return NextResponse.json({ success: false, error: "Missing client id" }, { status: 400 });
  }

  const { agencyId, isAuthenticated } = await resolveAgency(request);
  if (!isAuthenticated || !agencyId) {
    return NextResponse.json({ success: false, error: "Sign in required." }, { status: 401 });
  }

  const ok = await deleteAgencyClient(agencyId, clientId);
  if (!ok) {
    return NextResponse.json({ success: false, error: "Client not found." }, { status: 404 });
  }

  invalidateCacheByPrefix(`user:clients:${agencyId}`);
  return NextResponse.json({ success: true });
}
