import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { requireMongo } from "@/lib/db";
import { invalidateCacheByPrefix } from "@/lib/server-cache";
import { UserModel } from "@/models/user";
import { NotificationModel } from "@/models/notification";

const bodySchema = z.object({
  id: z.string().optional(),
  all: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Sign in required." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    await requireMongo();
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Database unavailable" },
      { status: 503 },
    );
  }

  const me = await UserModel.findById(session.user.id).select("role").lean().exec();
  const role = me?.role === "admin" ? "admin" : "user";
  const uid = session.user.id;

  const scopeFilter = {
    $or: [
      { recipientUserId: uid },
      { recipientUserId: null, targetRole: "all" },
      { recipientUserId: null, targetRole: role },
    ],
  };

  if (parsed.data.all) {
    await NotificationModel.updateMany(scopeFilter, { $addToSet: { readBy: uid } }).exec();
    invalidateCacheByPrefix(`user:notifications:${uid}`);
    return NextResponse.json({ success: true });
  }

  if (!parsed.data.id) {
    return NextResponse.json({ success: false, error: "id or all is required" }, { status: 400 });
  }

  await NotificationModel.updateOne(
    { _id: parsed.data.id, ...scopeFilter },
    { $addToSet: { readBy: uid } },
  ).exec();
  invalidateCacheByPrefix(`user:notifications:${uid}`);

  return NextResponse.json({ success: true });
}
