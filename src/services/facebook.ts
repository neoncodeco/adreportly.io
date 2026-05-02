const GRAPH_VERSION = "v18.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

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
  datePreset = "last_30d",
) {
  const url = new URL(`${GRAPH_BASE}/${campaignId}/insights`);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("fields", "spend,reach,impressions,clicks,actions,date_start,date_stop");
  url.searchParams.set("date_preset", datePreset);
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ data: unknown[] }>;
}
