/** Shared fetchers + query keys for dashboard TanStack Query usage */

/** Aligns with server `getOrSetCache` window for `/api/dashboard/overview` (~20s). */
export const DASHBOARD_OVERVIEW_STALE_MS = 20_000;
export const DASHBOARD_CLIENTS_STALE_MS = 30_000;
export const SHELL_PROFILE_STALE_MS = 30_000;
/** Matches `/api/notifications/me` cache (~8s). */
export const SHELL_NOTIFICATIONS_STALE_MS = 8_000;
export const CAMPAIGN_INSIGHTS_STALE_MS = 60_000;

export const dashboardQk = {
  overview: () => ["dashboard", "overview"] as const,
  clients: () => ["dashboard", "clients"] as const,
  campaignInsights: (campaignId: string) => ["dashboard", "campaign-insights", campaignId] as const,
  campaignsPage: (page: number, limit: number, q: string) =>
    ["dashboard", "campaigns", "paged", { page, limit, q }] as const,
};

export const DASHBOARD_CAMPAIGNS_PAGE_SIZE = 20;

export const shellQk = {
  profile: () => ["user", "profile"] as const,
  notifications: () => ["user", "notifications"] as const,
};

const creds = { credentials: "include" as const };

export type DashboardOverview = {
  success: boolean;
  error?: string;
  connected?: boolean;
  currencySymbol?: string;
  spendTrend: Array<{ date: string; label: string; spend: number; results: number }>;
  topCampaigns: Array<{
    id: string;
    code: string;
    name: string;
    spend: number;
    color: "primary" | "dark" | "muted";
  }>;
  recentCampaigns: Array<{
    id: string;
    code: string;
    name: string;
    accounts: number;
    spend: number;
    results: number;
    roas: number;
    status: "active" | "paused" | "completed" | "other";
    ctr?: number;
    cpc?: number;
  }>;
  campaigns?: Array<{
    id: string;
    code: string;
    name: string;
    accounts: number;
    spend: number;
    results: number;
    roas: number;
    status: "active" | "paused" | "completed" | "other";
    ctr: number;
    cpc: number;
  }>;
  kpis: {
    totalSpend: number;
    conversions: number;
    avgRoas: string;
    avgCpc: string;
  };
};

export type DashboardCampaignRow = NonNullable<DashboardOverview["campaigns"]>[number];

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  const res = await fetch("/api/dashboard/overview", creds);
  const json = (await res.json()) as DashboardOverview & { success?: boolean; error?: string };
  if (!res.ok || json.success === false) {
    throw new Error(typeof json.error === "string" ? json.error : "Could not load dashboard");
  }
  return json;
}

export type DashboardCampaignsPageResponse = {
  success: boolean;
  error?: string;
  currencySymbol?: string;
  connected?: boolean;
  campaigns: DashboardCampaignRow[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  summary: { activeCount: number };
};

export async function fetchDashboardCampaignsPage(opts: {
  page: number;
  limit?: number;
  q?: string;
}): Promise<DashboardCampaignsPageResponse> {
  const limit = opts.limit ?? DASHBOARD_CAMPAIGNS_PAGE_SIZE;
  const params = new URLSearchParams({
    page: String(opts.page),
    limit: String(limit),
  });
  const q = opts.q?.trim() ?? "";
  if (q) params.set("q", q);
  const res = await fetch(`/api/dashboard/campaigns?${params}`, creds);
  const json = (await res.json()) as DashboardCampaignsPageResponse & {
    success?: boolean;
    error?: string;
    campaigns?: DashboardCampaignRow[];
  };
  if (!res.ok || json.success === false) {
    throw new Error(typeof json.error === "string" ? json.error : "Could not load campaigns");
  }
  const campaigns = (json.campaigns ?? []).map((r) => ({
    ...r,
    ctr: r.ctr ?? 0,
    cpc: r.cpc ?? 0,
  }));
  return {
    ...json,
    campaigns,
    pagination: json.pagination ?? {
      page: 1,
      limit,
      total: 0,
      totalPages: 1,
    },
    summary: json.summary ?? { activeCount: 0 },
  };
}

export type ClientRow = {
  id: string;
  initials: string;
  name: string;
  organization: string;
  email: string;
  accounts: number;
  status: "active";
  lastShared: string;
};

export async function fetchDashboardClients(): Promise<ClientRow[]> {
  const res = await fetch("/api/clients", creds);
  const data = (await res.json()) as {
    success?: boolean;
    clients?: ClientRow[];
    error?: string;
  };
  if (!res.ok || data.success === false) {
    throw new Error(typeof data.error === "string" ? data.error : "Could not load clients");
  }
  return data.clients ?? [];
}

export type UserProfileSnippet = {
  full_name: string;
  organization: string;
  email: string;
};

export async function fetchUserProfileSnippet(): Promise<UserProfileSnippet> {
  const res = await fetch("/api/user/profile", creds);
  const data = (await res.json()) as {
    error?: string;
    full_name?: string;
    organization?: string;
    email?: string;
  };
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Could not load profile");
  }
  return {
    full_name: data.full_name ?? "",
    organization: data.organization ?? "",
    email: data.email ?? "",
  };
}

export type NotificationRow = {
  id: string;
  title: string;
  message: string;
  link: string | null;
  createdAt: string;
  read: boolean;
};

export type NotificationsPayload = {
  success: boolean;
  notifications: NotificationRow[];
  unreadCount: number;
};

export async function fetchNotificationsPayload(): Promise<NotificationsPayload> {
  const res = await fetch("/api/notifications/me", creds);
  const json = (await res.json()) as NotificationsPayload & { success?: boolean; error?: string };
  if (!res.ok || json.success === false) {
    throw new Error(typeof json.error === "string" ? json.error : "Could not load notifications");
  }
  return {
    success: true,
    notifications: json.notifications ?? [],
    unreadCount: json.unreadCount ?? 0,
  };
}

export type CampaignInsightRow = {
  date_start?: string;
  date_stop?: string;
  spend?: string;
  impressions?: string;
  clicks?: string;
  cpc?: string;
  cpm?: string;
  ctr?: string;
  reach?: string;
};

export async function fetchCampaignInsights(campaignId: string): Promise<CampaignInsightRow[]> {
  const res = await fetch(
    `/api/campaign-insights/${encodeURIComponent(campaignId)}?time_increment=1`,
    creds,
  );
  const data = (await res.json()) as {
    success?: boolean;
    error?: string;
    insights?: CampaignInsightRow[];
  };
  if (!res.ok || data.success === false) {
    throw new Error(data.error || "Failed to fetch campaign insights.");
  }
  return data.insights ?? [];
}
