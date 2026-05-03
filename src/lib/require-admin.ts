import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { requireMongo } from "@/lib/db";
import { UserModel } from "@/models/user";

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

  const row = (await UserModel.findById(session.user.id).select("role").lean().exec()) as {
    role?: string | null;
  } | null;

  if (row?.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, userId: session.user.id };
}
