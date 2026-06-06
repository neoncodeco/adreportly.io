import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerUser } from "@/lib/auth/session";
import { metaAccessContext } from "@/lib/agency-from-request";
import { getDisabledAdAccountIdSet, setAdAccountEnabledForAgency } from "@/lib/agency-service";
import { resolvePlanForUsage } from "@/lib/billing/usage";
import {
  getAdAccountsSnapshot,
  isAdAccountsSnapshotFresh,
  syncAdAccountsSnapshot,
} from "@/lib/facebook/ad-accounts-snapshot";
import { syncAgencyOverviewSnapshot } from "@/lib/facebook/overview-snapshot";
import { getOrSetCache, invalidateCacheKey, USER_CACHE_HEADERS } from "@/lib/server-cache";
import { normalizeActId } from "@/services/facebook";

const DEFAULT_LIMIT = 15;
const MAX_LIMIT = 100;

type AdAccountItem = {
  id: string;
  name: string;
  currency: string;
  account_status: number;
};

const patchBodySchema = z.object({
  adAccountId: z.string().min(1),
  enabled: z.boolean(),
});

async function loadRawAdAccounts(
  agencyId: string,
  maxAccounts: number | null,
): Promise<AdAccountItem[]> {
  const payload = await getOrSetCache(`user:ad-accounts:${agencyId}`, 20_000, async () => {
    const snapshot = await getAdAccountsSnapshot(agencyId);
    if (snapshot?.payload && isAdAccountsSnapshotFresh(snapshot.fetchedAt)) {
      return { success: true as const, adAccounts: snapshot.payload as AdAccountItem[] };
    }
    if (snapshot?.payload) {
      void syncAdAccountsSnapshot(agencyId, maxAccounts).catch(() => undefined);
      return { success: true as const, adAccounts: snapshot.payload as AdAccountItem[] };
    }
    const adAccounts = (await syncAdAccountsSnapshot(agencyId, maxAccounts)) as AdAccountItem[];
    return { success: true as const, adAccounts };
  });
  return payload.adAccounts ?? [];
}

export async function GET(request: NextRequest) {
  const { agencyId, isAuthenticated } = await metaAccessContext(request);
  if (!isAuthenticated) {
    return NextResponse.json({ success: false, error: "Sign in required." }, { status: 401 });
  }

  const url = request.nextUrl;
  const pageRaw = parseInt(url.searchParams.get("page") ?? "1", 10);
  const limitRaw = parseInt(url.searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : DEFAULT_LIMIT),
  );
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();

  if (!agencyId) {
    return NextResponse.json(
      {
        success: true as const,
        adAccounts: [],
        pagination: { page: 1, limit, total: 0, totalPages: 1 },
        summary: { enabledTotal: 0, disabledTotal: 0, totalAccounts: 0 },
      },
      { headers: USER_CACHE_HEADERS },
    );
  }

  try {
    const authUser = await getServerUser();
    const plan = await resolvePlanForUsage({ userId: authUser?.id ?? null, agencyId });
    const raw = await loadRawAdAccounts(agencyId, plan.limits.adAccounts);
    const disabled = await getDisabledAdAccountIdSet(agencyId);

    const enriched = raw.map((a) => ({
      ...a,
      enabled: !disabled.has(normalizeActId(a.id)),
    }));

    const filtered = q
      ? enriched.filter((a) => {
          const name = (a.name ?? "").toLowerCase();
          const id = a.id.replace(/^act_/, "").toLowerCase();
          return name.includes(q) || id.includes(q) || `act_${id}`.includes(q);
        })
      : enriched;

    const enabledTotal = enriched.filter((a) => a.enabled).length;
    const disabledTotal = enriched.length - enabledTotal;
    const totalAccounts = enriched.length;

    const total = filtered.length;
    const totalPages = total === 0 ? 1 : Math.ceil(total / limit);
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * limit;
    const adAccounts = filtered.slice(start, start + limit);

    return NextResponse.json(
      {
        success: true as const,
        adAccounts,
        pagination: { page: safePage, limit, total, totalPages },
        summary: { enabledTotal, disabledTotal, totalAccounts },
      },
      { headers: USER_CACHE_HEADERS },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Facebook API error";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}

export async function PATCH(request: NextRequest) {
  const { agencyId, isAuthenticated } = await metaAccessContext(request);
  if (!isAuthenticated) {
    return NextResponse.json({ success: false, error: "Sign in required." }, { status: 401 });
  }
  if (!agencyId) {
    return NextResponse.json({ success: false, error: "No agency linked." }, { status: 400 });
  }

  let body: z.infer<typeof patchBodySchema>;
  try {
    const json = await request.json();
    const parsed = patchBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid body." }, { status: 400 });
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON." }, { status: 400 });
  }

  try {
    await setAdAccountEnabledForAgency(agencyId, body.adAccountId, body.enabled);
    invalidateCacheKey(`user:dashboard-overview:${agencyId}`);
    invalidateCacheKey(`user:ad-accounts:${agencyId}`);
    await syncAgencyOverviewSnapshot(agencyId);
    return NextResponse.json({ success: true as const }, { headers: USER_CACHE_HEADERS });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
