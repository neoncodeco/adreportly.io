import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { requireMongo } from "@/lib/db";
import { UserModel } from "@/models/user";
import { NotificationModel } from "@/models/notification";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Sign in required." }, { status: 401 });
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

  const filter = {
    $or: [
      { recipientUserId: uid },
      { recipientUserId: null, targetRole: "all" },
      { recipientUserId: null, targetRole: role },
    ],
  };

  const docs = await NotificationModel.find(filter).sort({ createdAt: -1 }).limit(20).lean().exec();

  const notifications = docs.map((n) => {
    const read = Array.isArray(n.readBy) && n.readBy.includes(uid);
    return {
      id: n._id.toString(),
      title: n.title,
      message: n.message,
      link: n.link ?? null,
      createdAt: n.createdAt,
      read,
    };
  });

  const unreadCount = notifications.reduce((acc, n) => acc + (n.read ? 0 : 1), 0);

  return NextResponse.json({ success: true, notifications, unreadCount });
}
