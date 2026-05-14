const GRAPH_VERSION = "v18.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

export function normalizeActId(adAccountId: string): string {
  return adAccountId.startsWith("act_") ? adAccountId : `act_${adAccountId}`;
}

type Paged<T> = { data?: T[]; paging?: { next?: string } };

type InsightsTimeRange = { since: string; until: string };

async function fetchGraphPagedJson<T>(firstUrl: string, maxRows?: number): Promise<T[]> {
  const all: T[] = [];
  let next: string | null = firstUrl;
  while (next) {
    const res = await fetch(next, { cache: "no-store" });
    if (!res.ok) throw new Error(await res.text());
    const body = (await res.json()) as Paged<T>;
    if (body.data?.length) {
      const room = maxRows ? Math.max(0, maxRows - all.length) : body.data.length;
      all.push(...body.data.slice(0, room));
      if (maxRows && all.length >= maxRows) break;
    }
    next = body.paging?.next ?? null;
  }
  return all;
}

function localDateString(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function timeRangeForDatePreset(datePreset: string): InsightsTimeRange | null {
  if (datePreset === "last_2d") {
    return { since: localDateString(-1), until: localDateString(0) };
  }
  return null;
}

function normalizeDatePreset(datePreset: string) {
  return /^today$|^last_7d$|^last_14d$|^last_28d$|^last_30d$|^last_90d$|^this_month$|^lifetime$/i.test(
    datePreset,
  )
    ? datePreset === "lifetime"
      ? "maximum"
      : datePreset
    : "last_30d";
}

function setInsightsDateParams(url: URL, datePreset: string) {
  const timeRange = timeRangeForDatePreset(datePreset);
  if (timeRange) {
    url.searchParams.set("time_range", JSON.stringify(timeRange));
    return;
  }
  url.searchParams.set("date_preset", normalizeDatePreset(datePreset));
}

function insightsFieldDateModifier(datePreset: string) {
  const timeRange = timeRangeForDatePreset(datePreset);
  if (timeRange) return `.time_range(${JSON.stringify(timeRange)})`;
  return `.date_preset(${normalizeDatePreset(datePreset)})`;
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
    setInsightsDateParams(url, datePreset);
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
  campaign_id?: string;
  campaign_name?: string;
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;
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
    object_story_spec?: {
      page_id?: string;
      instagram_actor_id?: string;
      link_data?: {
        picture?: string;
        child_attachments?: Array<{
          picture?: string;
        }>;
      };
    };
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
  const fields = [
    "id",
    "name",
    "status",
    "effective_status",
    "creative{thumbnail_url,image_url,object_story_spec{page_id,instagram_actor_id,link_data{picture,child_attachments{picture}}}}",
    "adset{id,daily_budget,lifetime_budget,end_time,effective_status}",
    `insights${insightsFieldDateModifier(datePreset)}{spend,impressions,reach,clicks,ctr,cpc,frequency,actions,action_values,cost_per_action_type,inline_link_clicks,purchase_roas}`,
  ].join(",");
  url.searchParams.set("fields", fields);
  try {
    return await fetchGraphPagedJson<CampaignAdRow>(url.toString());
  } catch {
    return [];
  }
}

export type FacebookAdSetStatusRow = {
  id: string;
  name?: string;
  campaign_id?: string;
  status?: string;
  effective_status?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  campaign?: {
    id?: string;
    name?: string;
  };
};

export async function fetchAdSetLevelInsights(
  accessToken: string,
  adAccountId: string,
  datePreset = "last_30d",
) {
  const id = normalizeActId(adAccountId);
  const url = new URL(`${GRAPH_BASE}/${id}/insights`);
  url.searchParams.set("access_token", accessToken);
  setInsightsDateParams(url, datePreset);
  url.searchParams.set("level", "adset");
  url.searchParams.set(
    "fields",
    "campaign_id,campaign_name,adset_id,adset_name,spend,reach,impressions,clicks,actions,action_values,cost_per_action_type,cpc,cpm,ctr,frequency,inline_link_clicks,purchase_roas",
  );
  url.searchParams.set("limit", "200");
  return fetchGraphPagedJson<CampaignAdInsightRow>(url.toString(), 500);
}

export async function fetchAdSetStatuses(accessToken: string, adAccountId: string) {
  const id = normalizeActId(adAccountId);
  const url = new URL(`${GRAPH_BASE}/${id}/adsets`);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set(
    "fields",
    "id,name,campaign_id,status,effective_status,daily_budget,lifetime_budget,campaign{id,name}",
  );
  url.searchParams.set("limit", "500");
  return fetchGraphPagedJson<FacebookAdSetStatusRow>(url.toString(), 500);
}

export type FacebookAdStatusRow = {
  id: string;
  name?: string;
  status?: string;
  effective_status?: string;
  adset?: {
    id?: string;
    name?: string;
  };
  campaign?: {
    id?: string;
    name?: string;
  };
  creative?: CampaignAdRow["creative"];
};

export async function fetchAdLevelInsights(
  accessToken: string,
  adAccountId: string,
  datePreset = "last_30d",
) {
  const id = normalizeActId(adAccountId);
  const url = new URL(`${GRAPH_BASE}/${id}/insights`);
  url.searchParams.set("access_token", accessToken);
  setInsightsDateParams(url, datePreset);
  url.searchParams.set("level", "ad");
  url.searchParams.set(
    "fields",
    "campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,spend,reach,impressions,clicks,actions,action_values,cost_per_action_type,cpc,cpm,ctr,frequency,inline_link_clicks,purchase_roas",
  );
  url.searchParams.set("limit", "200");
  return fetchGraphPagedJson<CampaignAdInsightRow>(url.toString(), 500);
}

export async function fetchAdStatuses(accessToken: string, adAccountId: string) {
  const id = normalizeActId(adAccountId);
  const url = new URL(`${GRAPH_BASE}/${id}/ads`);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set(
    "fields",
    "id,name,status,effective_status,adset{id,name},campaign{id,name},creative{thumbnail_url,image_url,object_story_spec{page_id,instagram_actor_id,link_data{picture,child_attachments{picture}}}}",
  );
  url.searchParams.set("limit", "500");
  return fetchGraphPagedJson<FacebookAdStatusRow>(url.toString(), 500);
}

export async function fetchPageProfilePicture(accessToken: string, pageId: string) {
  const url = new URL(`${GRAPH_BASE}/${pageId}`);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("fields", "picture{url}");
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return null;
  const body = (await res.json()) as { picture?: { data?: { url?: string } } };
  return body.picture?.data?.url ?? null;
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

/** Daily rows for chart, account level. */
export async function fetchAdAccountDailyInsights(
  accessToken: string,
  adAccountId: string,
  datePreset = "last_30d",
) {
  const id = normalizeActId(adAccountId);
  const url = new URL(`${GRAPH_BASE}/${id}/insights`);
  url.searchParams.set("access_token", accessToken);
  setInsightsDateParams(url, datePreset);
  url.searchParams.set("time_increment", "1");
  url.searchParams.set("fields", "spend,clicks,impressions,date_start");
  return fetchGraphPagedJson<{ date_start: string; spend?: string; clicks?: string }>(
    url.toString(),
  );
}

/** Single rolled-up row for the account (no time_increment). */
export async function fetchAdAccountAggregateInsights(
  accessToken: string,
  adAccountId: string,
  datePreset = "last_30d",
) {
  const id = normalizeActId(adAccountId);
  const url = new URL(`${GRAPH_BASE}/${id}/insights`);
  url.searchParams.set("access_token", accessToken);
  setInsightsDateParams(url, datePreset);
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

export async function fetchCampaignLevelInsights(
  accessToken: string,
  adAccountId: string,
  datePreset = "last_30d",
) {
  const id = normalizeActId(adAccountId);
  const url = new URL(`${GRAPH_BASE}/${id}/insights`);
  url.searchParams.set("access_token", accessToken);
  setInsightsDateParams(url, datePreset);
  url.searchParams.set("level", "campaign");
  url.searchParams.set(
    "fields",
    "campaign_id,campaign_name,spend,reach,clicks,impressions,actions,action_values,cost_per_action_type,cpc,inline_link_clicks,purchase_roas",
  );
  url.searchParams.set("limit", "200");
  return fetchGraphPagedJson<CampaignAdInsightRow>(url.toString());
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
