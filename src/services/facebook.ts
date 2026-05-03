const GRAPH_VERSION = "v18.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

export function normalizeActId(adAccountId: string): string {
  return adAccountId.startsWith("act_") ? adAccountId : `act_${adAccountId}`;
}

type Paged<T> = { data?: T[]; paging?: { next?: string } };

async function fetchGraphPagedJson<T>(firstUrl: string): Promise<T[]> {
  const all: T[] = [];
  let next: string | null = firstUrl;
  while (next) {
    const res = await fetch(next, { cache: "no-store" });
    if (!res.ok) throw new Error(await res.text());
    const body = (await res.json()) as Paged<T>;
    if (body.data?.length) all.push(...body.data);
    next = body.paging?.next ?? null;
  }
  return all;
}

export async function exchangeCodeForToken(params: {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  code: string;
}): Promise<{ access_token: string; expires_in?: number }> {
  const url = new URL(`${GRAPH_BASE}/oauth/access_token`);
  url.searchParams.set("client_id", params.clientId);
  url.searchParams.set("client_secret", params.clientSecret);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("code", params.code);
  const res = await fetch(url.toString(), { method: "GET", cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Facebook token exchange failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<{ access_token: string; expires_in?: number }>;
}

export async function fetchAdAccounts(accessToken: string) {
  const url = new URL(`${GRAPH_BASE}/me/adaccounts`);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("fields", "id,name,currency,account_status");
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{
    data: Array<{ id: string; name: string; currency: string; account_status: number }>;
  }>;
}

export async function fetchCampaignInsights(
  accessToken: string,
  campaignId: string,
  options?: { datePreset?: string; timeIncrement?: string },
) {
  const datePreset = options?.datePreset ?? "last_30d";
  const url = new URL(`${GRAPH_BASE}/${campaignId}/insights`);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set(
    "fields",
    "spend,reach,impressions,clicks,actions,date_start,date_stop,cpc,ctr,frequency",
  );
  url.searchParams.set("date_preset", datePreset);
  if (options?.timeIncrement) {
    url.searchParams.set("time_increment", options.timeIncrement);
  }
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ data: unknown[] }>;
}

export async function fetchCampaignById(accessToken: string, campaignId: string) {
  const url = new URL(`${GRAPH_BASE}/${campaignId}`);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("fields", "id,name,objective,status,effective_status");
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{
    id: string;
    name?: string;
    objective?: string;
    status?: string;
    effective_status?: string;
  }>;
}

export async function fetchCampaignsForAdAccount(accessToken: string, accountId: string) {
  const id = normalizeActId(accountId);
  const url = new URL(`${GRAPH_BASE}/${id}/campaigns`);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("fields", "id,name,objective,status,effective_status");
  url.searchParams.set("limit", "200");
  return fetchGraphPagedJson<{
    id: string;
    name?: string;
    objective?: string;
    status?: string;
    effective_status?: string;
  }>(url.toString());
}

/** Daily rows for chart (last_30d, account level). */
export async function fetchAdAccountDailyInsights(accessToken: string, adAccountId: string) {
  const id = normalizeActId(adAccountId);
  const url = new URL(`${GRAPH_BASE}/${id}/insights`);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("date_preset", "last_30d");
  url.searchParams.set("time_increment", "1");
  url.searchParams.set("fields", "spend,clicks,impressions,date_start");
  return fetchGraphPagedJson<{ date_start: string; spend?: string; clicks?: string }>(
    url.toString(),
  );
}

/** Single rolled-up row for the account in last_30d (no time_increment). */
export async function fetchAdAccountAggregateInsights(accessToken: string, adAccountId: string) {
  const id = normalizeActId(adAccountId);
  const url = new URL(`${GRAPH_BASE}/${id}/insights`);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("date_preset", "last_30d");
  url.searchParams.set("fields", "spend,clicks,impressions,cpc,actions,action_values");
  const rows = await fetchGraphPagedJson<{
    spend?: string;
    clicks?: string;
    impressions?: string;
    cpc?: string;
    actions?: Array<{ action_type: string; value: string }>;
    action_values?: Array<{ action_type: string; value: string }>;
  }>(url.toString());
  return rows[0] ?? null;
}

export async function fetchCampaignLevelInsights(accessToken: string, adAccountId: string) {
  const id = normalizeActId(adAccountId);
  const url = new URL(`${GRAPH_BASE}/${id}/insights`);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("date_preset", "last_30d");
  url.searchParams.set("level", "campaign");
  url.searchParams.set(
    "fields",
    "campaign_id,campaign_name,spend,clicks,impressions,actions,action_values,cpc",
  );
  url.searchParams.set("limit", "200");
  return fetchGraphPagedJson<{
    campaign_id?: string;
    campaign_name?: string;
    spend?: string;
    clicks?: string;
    impressions?: string;
    actions?: Array<{ action_type: string; value: string }>;
    action_values?: Array<{ action_type: string; value: string }>;
    cpc?: string;
  }>(url.toString());
}

export async function fetchCampaignStatuses(accessToken: string, adAccountId: string) {
  const id = normalizeActId(adAccountId);
  const url = new URL(`${GRAPH_BASE}/${id}/campaigns`);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("fields", "id,effective_status");
  url.searchParams.set("limit", "500");
  const rows = await fetchGraphPagedJson<{ id: string; effective_status?: string }>(url.toString());
  return new Map(rows.map((r) => [r.id, r.effective_status ?? ""]));
}
