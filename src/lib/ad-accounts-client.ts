/** TanStack Query keys + fetch for Meta ad accounts (paginated) */

export const AD_ACCOUNTS_PAGE_DEFAULT = 15;
export const AD_ACCOUNTS_PAGE_MAX = 100;
export const AD_ACCOUNTS_STALE_MS = 20_000;

export const adAccountsQk = {
  paged: (page: number, limit: number, q: string) =>
    ["ad-accounts", "paged", { page, limit, q }] as const,
};

export type AdAccountApiRow = {
  id: string;
  name: string;
  currency: string;
  account_status: number;
  enabled: boolean;
};

export type AdAccountsPageResponse = {
  success: boolean;
  error?: string;
  adAccounts: AdAccountApiRow[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  summary: { enabledTotal: number; disabledTotal: number; totalAccounts: number };
};

const creds = { credentials: "include" as const };

export async function fetchAdAccountsPage(opts: {
  page: number;
  limit?: number;
  q?: string;
}): Promise<AdAccountsPageResponse> {
  const limit = opts.limit ?? AD_ACCOUNTS_PAGE_DEFAULT;
  const params = new URLSearchParams({
    page: String(opts.page),
    limit: String(limit),
  });
  const q = opts.q?.trim() ?? "";
  if (q) params.set("q", q);
  const res = await fetch(`/api/ad-accounts?${params}`, creds);
  const json = (await res.json()) as AdAccountsPageResponse & { success?: boolean; error?: string };
  if (!res.ok || json.success === false) {
    throw new Error(typeof json.error === "string" ? json.error : "Could not load ad accounts");
  }
  return {
    ...json,
    adAccounts: json.adAccounts ?? [],
    pagination: json.pagination ?? { page: 1, limit, total: 0, totalPages: 1 },
    summary: json.summary ?? { enabledTotal: 0, disabledTotal: 0, totalAccounts: 0 },
  };
}

export async function patchAdAccountEnabled(adAccountId: string, enabled: boolean): Promise<void> {
  const res = await fetch("/api/ad-accounts", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ adAccountId, enabled }),
  });
  const json = (await res.json()) as { success?: boolean; error?: string };
  if (!res.ok || json.success === false) {
    throw new Error(typeof json.error === "string" ? json.error : "Could not update ad account");
  }
}
