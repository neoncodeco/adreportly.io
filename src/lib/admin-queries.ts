export const ADMIN_STALE_MS = 20_000;
export const ADMIN_PAGE_SIZE = 20;
export const ADMIN_COUPONS_PAGE_SIZE = 25;

export type AdminPagedResponse = {
  total: number;
  limit: number;
  skip: number;
};

export type AdminUserRow = {
  id: string;
  email: string;
  fullName: string;
  organization: string;
  role: "user" | "admin";
  metaLinked: boolean;
  agencyId: string | null;
  billingPlanId: "free" | "starter" | "pro" | "enterprise";
  billingStatus: "inactive" | "pending" | "active" | "past_due" | "canceled" | "expired";
  isBanned: boolean;
  bannedAt: string | null;
  createdAt: string | null;
};

export type AdminAgencyRow = {
  agencyId: string;
  name: string;
  email: string;
  fbUserId: string | null;
  appUserId: string | null;
  linkedUsers: number;
};

export type AdminBillingRow = {
  id: string;
  userId: string;
  planId: string;
  status: string;
  amount: number;
  currency: string;
  providerSubscriptionId: string | null;
  providerReference: string | null;
  nextBillingAt: string | null;
  updatedAt: string | null;
};

export type AdminCouponRow = {
  id: string;
  code: string;
  percentOff: number;
  active: boolean;
  maxRedemptions: number | null;
  redemptionCount: number;
  expiresAt: string | null;
  createdAt: string | null;
};

export type AdminOverviewTotals = {
  totalUsers: number;
  adminUsers: number;
  usersWithAgency: number;
  totalAgencies: number;
  totalShareLinks: number;
  totalIncome: number;
  totalPackageSales: number;
  totalPaidTransactions: number;
  totalFailedTransactions: number;
  totalCanceledTransactions: number;
  totalRefundedTransactions: number;
  avgOrderValue: number;
};

export type AdminPackageStat = {
  planId: string;
  planName: string;
  income: number;
  sales: number;
};

export type AdminMonthlyTrend = {
  key: string;
  label: string;
  income: number;
  sales: number;
};

export type AdminTicketStatus = "open" | "in_progress" | "waiting_user" | "resolved" | "closed";
export type AdminTicketPriority = "low" | "medium" | "high" | "urgent";
export type AdminTicketCategory =
  | "billing"
  | "technical"
  | "feature_request"
  | "account"
  | "general";

export type AdminTicketRow = {
  id: string;
  ticketNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  category: AdminTicketCategory;
  priority: AdminTicketPriority;
  status: AdminTicketStatus;
  repliesCount: number;
  lastRepliedByAdmin: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminTicketReply = {
  _id: string;
  authorName: string;
  authorEmail: string;
  isAdmin: boolean;
  message: string;
  createdAt: string;
};

export type AdminTicketDetail = AdminTicketRow & {
  description: string;
  replies: AdminTicketReply[];
};

type ApiEnvelope = {
  success?: boolean;
  error?: string;
};

async function adminFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    credentials: "include",
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
  });
  const json = (await res.json().catch(() => ({}))) as T & ApiEnvelope;
  if (!res.ok || json.success === false) {
    throw new Error(typeof json.error === "string" ? json.error : "Request failed.");
  }
  return json;
}

function withPaging(params: URLSearchParams, page: number, limit: number) {
  params.set("limit", String(limit));
  params.set("skip", String((page - 1) * limit));
}

export const adminQk = {
  overview: (from: string, to: string) => ["admin", "overview", from, to] as const,
  users: (page: number, limit: number, q: string) => ["admin", "users", page, limit, q] as const,
  agencies: (page: number, limit: number, q: string) =>
    ["admin", "agencies", page, limit, q] as const,
  billing: (page: number, limit: number, q: string, status: string) =>
    ["admin", "billing", page, limit, q, status] as const,
  coupons: (page: number, limit: number) => ["admin", "coupons", page, limit] as const,
  tickets: (
    page: number,
    limit: number,
    q: string,
    status: string,
    priority: string,
    category: string,
  ) => ["admin", "tickets", page, limit, q, status, priority, category] as const,
  ticketDetail: (id: string) => ["admin", "ticket", id] as const,
};

export function fetchAdminOverview(from: string, to: string) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const query = params.toString();
  return adminFetch<{
    totals: AdminOverviewTotals;
    packageStats: AdminPackageStat[];
    monthlyTrend: AdminMonthlyTrend[];
    filters?: { from: string | null; to: string | null };
  }>(`/api/admin/overview${query ? `?${query}` : ""}`);
}

export function fetchAdminUsers(page: number, limit: number, q: string) {
  const params = new URLSearchParams();
  withPaging(params, page, limit);
  if (q.trim()) params.set("q", q.trim());
  return adminFetch<{ users: AdminUserRow[] } & AdminPagedResponse>(`/api/admin/users?${params}`);
}

export function fetchAdminAgencies(page: number, limit: number, q: string) {
  const params = new URLSearchParams();
  withPaging(params, page, limit);
  if (q.trim()) params.set("q", q.trim());
  return adminFetch<{ agencies: AdminAgencyRow[] } & AdminPagedResponse>(
    `/api/admin/agencies?${params}`,
  );
}

export function fetchAdminBilling(page: number, limit: number, q: string, status: string) {
  const params = new URLSearchParams();
  withPaging(params, page, limit);
  if (q.trim()) params.set("q", q.trim());
  if (status.trim()) params.set("status", status.trim());
  return adminFetch<{ subscriptions: AdminBillingRow[] } & AdminPagedResponse>(
    `/api/admin/billing?${params}`,
  );
}

export function fetchAdminCoupons(page: number, limit: number) {
  const params = new URLSearchParams();
  withPaging(params, page, limit);
  return adminFetch<{ coupons: AdminCouponRow[] } & AdminPagedResponse>(
    `/api/admin/coupons?${params}`,
  );
}

export function fetchAdminTickets(
  page: number,
  limit: number,
  q: string,
  status: string,
  priority: string,
  category: string,
) {
  const params = new URLSearchParams();
  withPaging(params, page, limit);
  if (q.trim()) params.set("q", q.trim());
  if (status) params.set("status", status);
  if (priority) params.set("priority", priority);
  if (category) params.set("category", category);
  return adminFetch<{ tickets: AdminTicketRow[] } & AdminPagedResponse>(
    `/api/admin/tickets?${params}`,
  );
}

export function fetchAdminTicketDetail(id: string) {
  return adminFetch<{ ticket: AdminTicketDetail }>(`/api/tickets/${encodeURIComponent(id)}`);
}

export function postAdmin<T>(input: string, body: Record<string, unknown>) {
  return adminFetch<T>(input, { method: "POST", body: JSON.stringify(body) });
}

export function patchAdmin<T>(input: string, body: Record<string, unknown>) {
  return adminFetch<T>(input, { method: "PATCH", body: JSON.stringify(body) });
}
