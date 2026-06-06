import { NextResponse } from "next/server";
import type { BillingPlanId, BillingStatus, UserRole } from "@prisma/client";
import { prisma, requireDb } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export type ServerAuthUser = {
  id: string;
  email: string;
};

export type AppProfile = {
  id: string;
  email: string;
  fullName: string;
  organization: string;
  role: UserRole;
  isBanned: boolean;
  agencyId: string | null;
  billingPlanId: BillingPlanId;
  billingStatus: BillingStatus;
};

const profileSelect = {
  id: true,
  email: true,
  fullName: true,
  organization: true,
  role: true,
  isBanned: true,
  agencyId: true,
  billingPlanId: true,
  billingStatus: true,
} as const;

/** Returns the Supabase auth user from cookies, or null when unauthenticated. */
export async function getServerUser(): Promise<ServerAuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.id) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? "",
  };
}

export async function requireUser(): Promise<
  { ok: true; user: ServerAuthUser } | { ok: false; response: NextResponse }
> {
  const user = await getServerUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ success: false, error: "Sign in required." }, { status: 401 }),
    };
  }
  return { ok: true, user };
}

/** Loads the app profile row keyed by Supabase auth user id. */
export async function getAppProfile(authUserId: string): Promise<AppProfile | null> {
  try {
    await requireDb();
  } catch {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: authUserId },
    select: profileSelect,
  });
}

/** Returns auth user id when signed in and not banned; otherwise null. */
export async function getAuthenticatedUserId(): Promise<string | null> {
  const authUser = await getServerUser();
  if (!authUser) return null;
  const profile = await getAppProfile(authUser.id);
  if (!profile || profile.isBanned) return null;
  return authUser.id;
}

/**
 * Supabase-session admin guard. Reads role from the database (not JWT metadata).
 */
export async function requireAdmin(): Promise<
  { ok: true; userId: string } | { ok: false; response: NextResponse }
> {
  const authResult = await requireUser();
  if (!authResult.ok) {
    return authResult;
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

  const profile = await prisma.user.findUnique({
    where: { id: authResult.user.id },
    select: { role: true, isBanned: true },
  });

  if (!profile || profile.isBanned) {
    return {
      ok: false,
      response: NextResponse.json({ success: false, error: "Sign in required." }, { status: 401 }),
    };
  }

  if (profile.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, userId: authResult.user.id };
}
