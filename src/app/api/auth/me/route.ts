import { NextResponse } from "next/server";
import { getAppProfile, getServerUser } from "@/lib/auth/session";

export async function GET() {
  const authUser = await getServerUser();
  if (!authUser) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const profile = await getAppProfile(authUser.id);
  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: profile.id,
    email: profile.email,
    role: profile.role,
    is_banned: profile.isBanned,
  });
}
