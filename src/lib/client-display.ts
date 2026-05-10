/** Stable, non-reversible display id for client tables (not a secret). */
export function stableClientDisplayId(email: string): string {
  let h = 2166136261;
  for (let i = 0; i < email.length; i++) {
    h ^= email.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const part = (h >>> 0)
    .toString(36)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "0")
    .padEnd(8, "0")
    .slice(0, 8);
  return `CLT-${part}`;
}
