import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { prisma, requireDb } from "@/lib/db";
import { notificationScopeWhere } from "@/lib/notification-scope";
import { getOrSetCache, USER_CACHE_HEADERS } from "@/lib/server-cache";

export async function GET() {
  const authUser = await getServerUser();
  if (!authUser?.id) {
    return NextResponse.json({ success: false, error: "Sign in required." }, { status: 401 });
  }

  try {
    await requireDb();
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Database unavailable" },
      { status: 503 },
    );
  }

  const uid = authUser.id;
  const payload = await getOrSetCache(`user:notifications:${uid}`, 8_000, async () => {
    const me = await prisma.user.findUnique({
      where: { id: uid },
      select: { role: true },
    });
    const role = me?.role === "admin" ? "admin" : "user";

    const docs = await prisma.notification.findMany({
      where: notificationScopeWhere(uid, role),
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const notifications = docs.map((n) => {
      const read = n.readBy.includes(uid);
      return {
        id: n.id,
        title: n.title,
        message: n.message,
        link: n.link ?? null,
        createdAt: n.createdAt,
        read,
      };
    });

    const unreadCount = notifications.reduce((acc, n) => acc + (n.read ? 0 : 1), 0);
    return { success: true, notifications, unreadCount };
  });

  return NextResponse.json(payload, { headers: USER_CACHE_HEADERS });
}
