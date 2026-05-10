import { stableClientDisplayId } from "@/lib/client-display";
import type { CampaignInsightApiRow } from "@/lib/performance-report";

/** Shared fetchers + query keys for dashboard TanStack Query usage */

/** Aligns with server `getOrSetCache` window for `/api/dashboard/overview` (~20s). */
export const DASHBOARD_OVERVIEW_STALE_MS = 20_000;
export const DASHBOARD_CLIENTS_STALE_MS = 30_000;
export const SHELL_PROFILE_STALE_MS = 30_000;
/** Matches `/api/notifications/me` cache (~8s). */
export const SHELL_NOTIFICATIONS_STALE_MS = 8_000;
export const CAMPAIGN_INSIGHTS_STALE_MS = 60_000;

/** Meta `date_preset` values for campaign insights (reports / exports). */
export const REPORT_DATE_PRESET_OPTIONS = [
  { value: "last_7d", label: "Last 7 days" },
  { value: "last_14d", label: "Last 14 days" },
  { value: "last_28d", label: "Last 28 days" },
  { value: "last_30d", label: "Last 30 days" },
  { value: "last_90d", label: "Last 90 days" },
  { value: "this_month", label: "This month" },
  {
    value: "lifetime",
    label: "Maximum / lifetime (slow, large PDF)",
  },
] as const;

export type ReportDatePreset = (typeof REPORT_DATE_PRESET_OPTIONS)[number]["value"];

export type DashboardCampaignsStatusFilter = "all" | "active" | "paused" | "completed" | "other";
export type DashboardCampaignsSort = "spend" | "results" | "roas" | "name" | "ctr" | "cpc";

export const dashboardQk = {
  overview: () => ["dashboard", "overview"] as const,
  clients: () => ["dashboard", "clients"] as const,
  campaignInsights: (campaignId: string, datePreset: string) =>
    ["dashboard", "campaign-insights", campaignId, datePreset] as const,
  campaignsPage: (
    page: number,
    limit: number,
    q: string,
    status: DashboardCampaignsStatusFilter,
    sort: DashboardCampaignsSort,
  ) => ["dashboard", "campaigns", "paged", { page, limit, q, status, sort }] as const,
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
  /** ISO 4217 code from Meta ad account (e.g. USD, BDT). */
  currency?: string;
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
  status?: DashboardCampaignsStatusFilter;
  sort?: DashboardCampaignsSort;
}): Promise<DashboardCampaignsPageResponse> {
  const limit = opts.limit ?? DASHBOARD_CAMPAIGNS_PAGE_SIZE;
  const status = opts.status ?? "all";
  const sort = opts.sort ?? "spend";
  const params = new URLSearchParams({
    page: String(opts.page),
    limit: String(limit),
    status,
    sort,
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
  displayId: string;
  initials: string;
  name: string;
  organization: string;
  email: string;
  mobile: string | null;
  status: "active";
  lastShared: string;
  latestShareUrl: string | null;
};

export type DashboardClientsPayload = {
  clients: ClientRow[];
  clientCount: number;
  clientLimit: number | null;
  planName?: string;
};

export async function fetchDashboardClients(): Promise<DashboardClientsPayload> {
  const res = await fetch("/api/clients", creds);
  const data = (await res.json()) as {
    success?: boolean;
    clients?: Partial<ClientRow>[];
    clientCount?: number;
    clientLimit?: number | null;
    planName?: string;
    error?: string;
  };
  if (!res.ok || data.success === false) {
    throw new Error(typeof data.error === "string" ? data.error : "Could not load clients");
  }
  const raw = data.clients ?? [];
  const clients: ClientRow[] = raw.map((c) => {
    const email = typeof c.email === "string" ? c.email : "";
    const id = typeof c.id === "string" ? c.id : "";
    return {
      id,
      displayId: typeof c.displayId === "string" ? c.displayId : stableClientDisplayId(id || email),
      initials: typeof c.initials === "string" ? c.initials : "?",
      name: typeof c.name === "string" ? c.name : email,
      organization: typeof c.organization === "string" ? c.organization : "Shared reports",
      email,
      mobile: c.mobile ?? null,
      status: "active" as const,
      lastShared: typeof c.lastShared === "string" ? c.lastShared : new Date(0).toISOString(),
      latestShareUrl:
        typeof c.latestShareUrl === "string" && c.latestShareUrl.length > 0
          ? c.latestShareUrl
          : null,
    };
  });
  return {
    clients,
    clientCount: typeof data.clientCount === "number" ? data.clientCount : clients.length,
    clientLimit:
      data.clientLimit === null || typeof data.clientLimit === "number" ? data.clientLimit : null,
    planName: typeof data.planName === "string" ? data.planName : undefined,
  };
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

export type CampaignInsightRow = CampaignInsightApiRow;

export async function fetchCampaignInsights(
  campaignId: string,
  options?: { datePreset?: string },
): Promise<CampaignInsightRow[]> {
  const datePreset = options?.datePreset ?? "last_30d";
  const params = new URLSearchParams({
    time_increment: "1",
    date_preset: datePreset,
  });
  const res = await fetch(
    `/api/campaign-insights/${encodeURIComponent(campaignId)}?${params}`,
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

/** Single-row campaign rollup for the date preset (no daily split). Improves reach / ROAS alignment with Meta. */
export async function fetchCampaignInsightRollup(
  campaignId: string,
  datePreset = "last_30d",
): Promise<CampaignInsightRow | null> {
  const params = new URLSearchParams({ date_preset: datePreset });
  const res = await fetch(
    `/api/campaign-insights/${encodeURIComponent(campaignId)}?${params}`,
    creds,
  );
  const data = (await res.json()) as {
    success?: boolean;
    error?: string;
    insights?: CampaignInsightRow[];
  };
  if (!res.ok || data.success === false) {
    throw new Error(data.error || "Failed to fetch campaign rollup.");
  }
  const rows = data.insights ?? [];
  return rows[0] ?? null;
}
