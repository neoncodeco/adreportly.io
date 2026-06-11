const DEFAULT_SITE_URL = "https://adreportly.io";

export function normalizeSiteUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getPublicSiteUrl(): string {
  return normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL);
}

export function getPublicSiteBase(): URL {
  return new URL(`${getPublicSiteUrl()}/`);
}

export function getPublicSiteCallbackUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getPublicSiteUrl()}${normalizedPath}`;
}
