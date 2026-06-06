import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { requireDb } from "@/lib/db";
import { COOKIE_NAME } from "@/lib/jwt";
import { disconnectMetaForUser } from "@/lib/meta-disconnect";

export async function POST() {
  const authUser = await getServerUser();
  if (!authUser?.id) {
    return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });
  }

  try {
    await requireDb();
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Database unavailable" },
      { status: 503 },
    );
  }

  await disconnectMetaForUser(authUser.id);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
