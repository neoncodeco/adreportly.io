import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { requireMongo } from "@/lib/db";
import { UserModel } from "@/models/user";

const roleCache = new Map<string, { role: string | null; expiresAt: number }>();
const ROLE_CACHE_TTL_MS = 20_000;

/**
 * Server-only guard for admin APIs and layouts. Always reads `role` from the database
 * so manual DB updates take effect without trusting the JWT alone.
 */
export async function requireAdmin(): Promise<
  { ok: true; userId: string } | { ok: false; response: NextResponse }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      ok: false,
      response: NextResponse.json({ success: false, error: "Sign in required." }, { status: 401 }),
    };
  }

  try {
    await requireMongo();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable";
    return {
      ok: false,
      response: NextResponse.json({ success: false, error: msg }, { status: 503 }),
    };
  }

  const now = Date.now();
  const cached = roleCache.get(session.user.id);
  let role: string | null = null;
  if (cached && cached.expiresAt > now) {
    role = cached.role;
  } else {
    const row = (await UserModel.findById(session.user.id).select("role").lean().exec()) as {
      role?: string | null;
    } | null;
    role = row?.role ?? null;
    roleCache.set(session.user.id, { role, expiresAt: now + ROLE_CACHE_TTL_MS });
  }

  if (role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, userId: session.user.id };
}
