export function clampPageSize(value: string | null, fallback: number, max: number): number {
  const parsed = parseInt(value ?? "", 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(max, Math.max(1, parsed));
}

export function clampSkip(value: string | null): number {
  const parsed = parseInt(value ?? "", 10);
  if (Number.isNaN(parsed)) return 0;
  return Math.max(0, parsed);
}

export function sanitizeSearchQuery(value: string | null | undefined, maxLength = 120): string {
  if (!value) return "";
  return value.trim().slice(0, maxLength);
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function normalizeOptionalBooleanParam(value: string | null): boolean | null {
  if (!value) return null;
  if (value === "true" || value === "1" || value.toLowerCase() === "active") return true;
  if (value === "false" || value === "0" || value.toLowerCase() === "inactive") return false;
  return null;
}

export function isSafeInternalLink(value: string): boolean {
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//")) return false;
  return !/[\r\n]/.test(value);
}
