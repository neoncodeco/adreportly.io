import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteAgencyClient } from "@/lib/agency-client-service";
import { metaAccessContext } from "@/lib/agency-from-request";
import { getAgencyIdForAppUser } from "@/lib/agency-service";
import { invalidateCacheByPrefix } from "@/lib/server-cache";

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await ctx.params;
  if (!clientId) {
    return NextResponse.json({ success: false, error: "Missing client id" }, { status: 400 });
  }

  const session = await auth();
  const reqCtx = await metaAccessContext(request);
  const fallbackAgencyId =
    !reqCtx.agencyId && session?.user?.id ? await getAgencyIdForAppUser(session.user.id) : null;
  const agencyId = reqCtx.agencyId ?? fallbackAgencyId;
  const isAuthenticated = reqCtx.isAuthenticated || Boolean(session?.user?.id);

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
