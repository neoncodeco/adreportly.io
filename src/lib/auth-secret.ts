/**
 * Auth.js accepts AUTH_SECRET (v5) or NEXTAUTH_SECRET (legacy).
 * Define one of them in `.env` — see `.env.example`.
 */
export function getAuthSecret(): string | undefined {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
}
