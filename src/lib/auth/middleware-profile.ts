import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/supabase/env";

export type MiddlewareProfile = {
  role: "user" | "admin";
  isBanned: boolean;
};

/** Edge-safe profile lookup for middleware (PostgREST + service role). */
export async function getMiddlewareProfile(userId: string): Promise<MiddlewareProfile | null> {
  const serviceKey = getSupabaseServiceRoleKey();
  if (!serviceKey) {
    return null;
  }

  const url = new URL("/rest/v1/users", getSupabaseUrl());
  url.searchParams.set("id", `eq.${userId}`);
  url.searchParams.set("select", "role,is_banned");

  const res = await fetch(url.toString(), {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  const rows = (await res.json()) as Array<{ role: string; is_banned: boolean }>;
  const row = rows[0];
  if (!row) {
    return null;
  }

  return {
    role: row.role === "admin" ? "admin" : "user",
    isBanned: row.is_banned === true,
  };
}
