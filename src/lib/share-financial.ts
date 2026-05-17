export const DEFAULT_DOLLAR_RATE_BDT = 126;

export function positiveFiniteNumber(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function normalizeDollarRateBdt(value: unknown): number {
  return positiveFiniteNumber(value) ?? DEFAULT_DOLLAR_RATE_BDT;
}
