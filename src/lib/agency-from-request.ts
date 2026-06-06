import type { NextRequest } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { getAgencyIdForAppUser } from "@/lib/agency-service";
import { verifyAgencyJwt, COOKIE_NAME } from "@/lib/jwt";

export type MetaAccessContext = {
  /** Meta agency row id when JWT/cookie or linked `User.agencyId` exists. */
  agencyId: string | null;
  /** Email/password session or valid agency JWT was found (may not have Meta linked yet). */
  isAuthenticated: boolean;
};

/**
 * JWT (Bearer or `ar_agency` cookie) or Supabase session. When the user is signed in but has not
 * connected Facebook, `agencyId` is null and `isAuthenticated` is still true.
 */
export async function metaAccessContext(request: NextRequest): Promise<MetaAccessContext> {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const payload = await verifyAgencyJwt(authHeader.slice(7));
    if (payload?.agencyId) return { agencyId: payload.agencyId, isAuthenticated: true };
  }
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (cookie) {
    const payload = await verifyAgencyJwt(cookie);
    if (payload?.agencyId) return { agencyId: payload.agencyId, isAuthenticated: true };
  }
  const authUser = await getServerUser();
  if (!authUser?.id) {
    return { agencyId: null, isAuthenticated: false };
  }
  const agencyId = await getAgencyIdForAppUser(authUser.id);
  return { agencyId, isAuthenticated: true };
}

/** Meta agency id only (backward compatible). */
export async function agencyIdFromRequest(request: NextRequest): Promise<string | null> {
  const { agencyId } = await metaAccessContext(request);
  return agencyId;
}
