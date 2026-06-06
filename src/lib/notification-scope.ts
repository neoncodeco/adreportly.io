import type { Prisma } from "@prisma/client";

export function notificationScopeWhere(
  uid: string,
  role: "admin" | "user",
): Prisma.NotificationWhereInput {
  return {
    OR: [
      { recipientUserId: uid },
      { recipientUserId: null, targetRole: "all" },
      { recipientUserId: null, targetRole: role },
    ],
  };
}

export async function markNotificationsRead(
  uid: string,
  role: "admin" | "user",
  notificationId?: string,
): Promise<void> {
  const { prisma } = await import("@/lib/prisma");
  const scope = notificationScopeWhere(uid, role);
  const where = notificationId ? { ...scope, id: notificationId } : scope;

  const rows = await prisma.notification.findMany({
    where,
    select: { id: true, readBy: true },
  });

  const updates = rows
    .filter((row) => !row.readBy.includes(uid))
    .map((row) =>
      prisma.notification.update({
        where: { id: row.id },
        data: { readBy: [...row.readBy, uid] },
      }),
    );

  if (updates.length > 0) {
    await prisma.$transaction(updates);
  }
}
