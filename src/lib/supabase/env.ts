/**
 * Read NEXT_PUBLIC_* inside getters so Next.js can inline them in the client bundle.
 * Module-level `const x = process.env.NEXT_PUBLIC_*` is often undefined in the browser.
 */
export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL. Add it to .env and restart the dev server (npm run dev).",
    );
  }
  return url;
}

export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Add it to .env and restart the dev server (npm run dev).",
    );
  }
  return key;
}

/** Server-only — middleware admin checks and admin user deletion. */
export function getSupabaseServiceRoleKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}
