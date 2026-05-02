import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { verifyAgencyJwt, COOKIE_NAME } from "@/lib/jwt";
import { getDecryptedTokenForAgency } from "@/lib/agency-service";
import { fetchAdAccounts } from "@/services/facebook";

async function agencyIdFromRequest(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const payload = await verifyAgencyJwt(authHeader.slice(7));
    if (payload?.agencyId) return payload.agencyId;
  }
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (cookie) {
    const payload = await verifyAgencyJwt(cookie);
    if (payload?.agencyId) return payload.agencyId;
  }
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function GET(request: NextRequest) {
  const agencyId = await agencyIdFromRequest(request);
  if (!agencyId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const token = await getDecryptedTokenForAgency(agencyId);
  if (!token) {
    return NextResponse.json({ success: true, adAccounts: [] as unknown[] });
  }

  try {
    const data = await fetchAdAccounts(token);
    return NextResponse.json({ success: true, adAccounts: data.data ?? [] });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Facebook API error";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
