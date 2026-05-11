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
  options?: {
    datePreset?: string;
    timeIncrement?: string;
    timeRange?: { since: string; until: string };
  },
) {
  const url = new URL(`${GRAPH_BASE}/${campaignId}/insights`);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set(
    "fields",
    "spend,reach,impressions,clicks,actions,action_values,cost_per_action_type,date_start,date_stop,cpc,cpm,ctr,frequency,inline_link_clicks,purchase_roas",
  );
  if (options?.timeRange) {
    url.searchParams.set("time_range", JSON.stringify(options.timeRange));
  } else {
    const datePreset = options?.datePreset ?? "last_30d";
    // Meta removed date_preset=lifetime; "maximum" is the closest supported preset.
    url.searchParams.set("date_preset", datePreset === "lifetime" ? "maximum" : datePreset);
  }
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
  url.searchParams.set(
    "fields",
    "id,name,objective,status,effective_status,account_id,start_time,created_time",
  );
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{
    id: string;
    name?: string;
    objective?: string;
    status?: string;
    effective_status?: string;
    account_id?: string;
    start_time?: string;
    created_time?: string;
  }>;
}

/** Billing-style fields (amounts in account minor units except where noted in Meta docs). */
export async function fetchAdAccountBilling(accessToken: string, adAccountId: string) {
  const id = normalizeActId(adAccountId);
  const url = new URL(`${GRAPH_BASE}/${id}`);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("fields", "currency,balance,amount_spent,spend_cap");
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return null;
  return res.json() as Promise<{
    currency?: string;
    balance?: string;
    amount_spent?: string;
    spend_cap?: string;
  }>;
}

export type CampaignAdInsightRow = {
  date_start?: string;
  date_stop?: string;
  spend?: string;
  impressions?: string;
  reach?: string;
  clicks?: string;
  ctr?: string;
  cpc?: string;
  cpm?: string;
  frequency?: string;
  inline_link_clicks?: string;
  actions?: Array<{ action_type: string; value: string }>;
  action_values?: Array<{ action_type: string; value: string }>;
  cost_per_action_type?: Array<{ action_type: string; value: string }>;
  purchase_roas?: Array<{ action_type: string; value: string }>;
};

export type CampaignAdRow = {
  id: string;
  name?: string;
  status?: string;
  effective_status?: string;
  creative?: {
    thumbnail_url?: string;
    image_url?: string;
  };
  adset?: {
    id?: string;
    daily_budget?: string;
    lifetime_budget?: string;
    end_time?: string;
    effective_status?: string;
  };
  insights?: { data?: CampaignAdInsightRow[] };
};

/** Ads belonging to a campaign (via ad account filtering). */
export async function fetchAdsForCampaign(
  accessToken: string,
  adAccountId: string,
  campaignId: string,
  datePreset: string,
): Promise<CampaignAdRow[]> {
  const id = normalizeActId(adAccountId);
  const url = new URL(`${GRAPH_BASE}/${id}/ads`);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("limit", "150");
  url.searchParams.set(
    "filtering",
    JSON.stringify([{ field: "campaign.id", operator: "EQUAL", value: campaignId }]),
  );
  const preset =
    /^last_7d$|^last_14d$|^last_28d$|^last_30d$|^last_90d$|^this_month$|^lifetime$/i.test(
      datePreset,
    )
      ? datePreset === "lifetime"
        ? "maximum"
        : datePreset
      : "last_30d";
  const fields = [
    "id",
    "name",
    "status",
    "effective_status",
    "creative{thumbnail_url,image_url}",
    "adset{id,daily_budget,lifetime_budget,end_time,effective_status}",
    `insights.date_preset(${preset}){spend,impressions,reach,clicks,ctr,cpc,frequency,actions,action_values,cost_per_action_type,inline_link_clicks,purchase_roas}`,
  ].join(",");
  url.searchParams.set("fields", fields);
  try {
    return await fetchGraphPagedJson<CampaignAdRow>(url.toString());
  } catch {
    return [];
  }
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
