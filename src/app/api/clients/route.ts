import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  backfillAgencyClientsFromSharesIfEmpty,
  countAgencyClientsLifetime,
  createAgencyClient,
  listAgencyClientsWithShareUrls,
} from "@/lib/agency-client-service";
import { stableClientDisplayId } from "@/lib/client-display";
import { metaAccessContext } from "@/lib/agency-from-request";
import { getAgencyIdForAppUser } from "@/lib/agency-service";
import { resolvePlanForUsage } from "@/lib/billing/usage";
import { getOrSetCache, USER_CACHE_HEADERS, invalidateCacheByPrefix } from "@/lib/server-cache";

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  const s = name.trim();
  return s.length >= 2 ? s.slice(0, 2).toUpperCase() : s.toUpperCase() || "?";
}

export async function GET(request: NextRequest) {
  const ctx = await metaAccessContext(request);
  const session = await auth();
  const fallbackAgencyId =
    !ctx.agencyId && session?.user?.id ? await getAgencyIdForAppUser(session.user.id) : null;
  const agencyId = ctx.agencyId ?? fallbackAgencyId;
  const isAuthenticated = ctx.isAuthenticated || Boolean(session?.user?.id);

  if (!isAuthenticated || !agencyId) {
    return NextResponse.json({
      success: true,
      clients: [],
      clientCount: 0,
      clientLimit: null as number | null,
    });
  }

  try {
    const plan = await resolvePlanForUsage({ userId: session?.user?.id ?? null, agencyId });
    const payload = await getOrSetCache(`user:clients:${agencyId}`, 15_000, async () => {
      await backfillAgencyClientsFromSharesIfEmpty(agencyId, plan.limits.clients);
      const rows = await listAgencyClientsWithShareUrls(agencyId);
      const count = await countAgencyClientsLifetime(agencyId);
      const clients = rows.map((r) => ({
        id: r.id,
        // Must be stable and unique per roster row (email may be duplicated).
        displayId: stableClientDisplayId(r.id),
        initials: initialsFromName(r.name),
        name: r.name,
        organization: "Shared reports",
        email: r.email,
        mobile: null as string | null,
        status: "active" as const,
        lastShared: r.createdAt.toISOString(),
        latestShareUrl: r.latestShareUrl,
      }));
      return {
        success: true as const,
        clients,
        clientCount: count,
        clientLimit: plan.limits.clients,
        planName: plan.name,
      };
    });
    return NextResponse.json(payload, { headers: USER_CACHE_HEADERS });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const ctx = await metaAccessContext(request);
  const session = await auth();
  const fallbackAgencyId =
    !ctx.agencyId && session?.user?.id ? await getAgencyIdForAppUser(session.user.id) : null;
  const agencyId = ctx.agencyId ?? fallbackAgencyId;
  const isAuthenticated = ctx.isAuthenticated || Boolean(session?.user?.id);

  if (!isAuthenticated || !agencyId) {
    return NextResponse.json({ success: false, error: "Sign in required." }, { status: 401 });
  }

  let body: { name?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const plan = await resolvePlanForUsage({ userId: session?.user?.id ?? null, agencyId });
  const maxClients = plan.limits.clients;
  if (maxClients !== null) {
    const n = await countAgencyClientsLifetime(agencyId);
    if (n >= maxClients) {
      return NextResponse.json(
        {
          success: false,
          error: `Client limit reached for ${plan.name} (max ${maxClients}). Upgrade your plan to add more.`,
          code: "limit",
        },
        { status: 403 },
      );
    }
  }

  const created = await createAgencyClient(agencyId, {
    name: typeof body.name === "string" ? body.name : "",
    email: typeof body.email === "string" ? body.email : "",
  });

  if (!created.ok) {
    const status = created.code === "duplicate" ? 409 : 400;
    return NextResponse.json({ success: false, error: created.error }, { status });
  }

  invalidateCacheByPrefix(`user:clients:${agencyId}`);

  const r = created.client;
  return NextResponse.json({
    success: true,
    client: {
      id: r.id,
      displayId: stableClientDisplayId(r.id),
      initials: initialsFromName(r.name),
      name: r.name,
      organization: "Shared reports",
      email: r.email,
      mobile: null,
      status: "active" as const,
      lastShared: r.createdAt.toISOString(),
      latestShareUrl: null as string | null,
    },
  });
}
