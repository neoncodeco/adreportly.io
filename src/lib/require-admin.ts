import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { prisma, requireDb } from "@/lib/db";

const roleCache = new Map<string, { role: string | null; expiresAt: number }>();
const ROLE_CACHE_TTL_MS = 20_000;

/**
 * Server-only guard for admin APIs. Always reads `role` from the database
 * so manual DB updates take effect without trusting session metadata alone.
 */
export async function requireAdmin(): Promise<
  { ok: true; userId: string } | { ok: false; response: NextResponse }
> {
  const authUser = await getServerUser();
  if (!authUser) {
    return {
      ok: false,
      response: NextResponse.json({ success: false, error: "Sign in required." }, { status: 401 }),
    };
  }

  try {
    await requireDb();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable";
    return {
      ok: false,
      response: NextResponse.json({ success: false, error: msg }, { status: 503 }),
    };
  }

  const now = Date.now();
  const cached = roleCache.get(authUser.id);
  let role: string | null = null;
  if (cached && cached.expiresAt > now) {
    role = cached.role;
  } else {
    const row = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { role: true, isBanned: true },
    });
    if (row?.isBanned) {
      return {
        ok: false,
        response: NextResponse.json(
          { success: false, error: "Sign in required." },
          { status: 401 },
        ),
      };
    }
    role = row?.role ?? null;
    roleCache.set(authUser.id, { role, expiresAt: now + ROLE_CACHE_TTL_MS });
  }

  if (role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, userId: authUser.id };
}
