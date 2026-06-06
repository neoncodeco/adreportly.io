import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerUser } from "@/lib/auth/session";
import { prisma, requireDb } from "@/lib/db";
import { isValidId } from "@/lib/id";
import { invalidateCacheByPrefix } from "@/lib/server-cache";

const replySchema = z.object({
  message: z.string().trim().min(2).max(4000),
});
const patchSchema = z.object({
  status: z.enum(["open", "in_progress", "waiting_user", "resolved", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authUser = await getServerUser();
  if (!authUser?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  try {
    await requireDb();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Database unavailable" },
      { status: 503 },
    );
  }

  if (!isValidId(id)) {
    return NextResponse.json({ error: "Invalid ticket id." }, { status: 400 });
  }

  const userRow = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { role: true },
  });
  const isAdmin = userRow?.role === "admin";

  const ticket = await prisma.ticket.findFirst({
    where: isAdmin ? { id } : { id, userId: authUser.id },
    include: { replies: { orderBy: { createdAt: "asc" } } },
  });

  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  }

  const { replies, ...rest } = ticket;

  return NextResponse.json({
    ticket: {
      ...rest,
      id: ticket.id,
      replies: replies.map((r) => ({
        ...r,
        _id: r.id,
      })),
    },
  });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authUser = await getServerUser();
  if (!authUser?.id || !authUser.email) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = replySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    await requireDb();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Database unavailable" },
      { status: 503 },
    );
  }

  if (!isValidId(id)) {
    return NextResponse.json({ error: "Invalid ticket id." }, { status: 400 });
  }

  const userRow = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { role: true, fullName: true },
  });
  const isAdmin = userRow?.role === "admin";

  const ticket = await prisma.ticket.findFirst({
    where: isAdmin ? { id } : { id, userId: authUser.id },
  });

  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  }
  if (ticket.status === "closed") {
    return NextResponse.json({ error: "Cannot reply to a closed ticket." }, { status: 400 });
  }

  const now = new Date();
  let nextStatus = ticket.status;
  if (isAdmin && ticket.status === "open") {
    nextStatus = "in_progress";
  } else if (!isAdmin && ticket.status === "waiting_user") {
    nextStatus = "in_progress";
  }

  await prisma.$transaction([
    prisma.ticketReply.create({
      data: {
        ticketId: id,
        authorId: authUser.id,
        authorName: userRow?.fullName ?? "",
        authorEmail: authUser.email,
        isAdmin,
        message: parsed.data.message,
      },
    }),
    prisma.ticket.update({
      where: { id },
      data: {
        lastRepliedAt: now,
        lastRepliedByAdmin: isAdmin,
        status: nextStatus,
      },
    }),
  ]);

  invalidateCacheByPrefix("admin:tickets:");

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authUser = await getServerUser();
  if (!authUser?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    await requireDb();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Database unavailable" },
      { status: 503 },
    );
  }

  if (!isValidId(id)) {
    return NextResponse.json({ error: "Invalid ticket id." }, { status: 400 });
  }

  const userRow = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { role: true },
  });
  const isAdmin = userRow?.role === "admin";

  const body = parsed.data;
  const update: {
    status?: typeof body.status;
    priority?: typeof body.priority;
    resolvedAt?: Date | null;
  } = {};

  if (body.status) {
    const allowed = isAdmin
      ? ["open", "in_progress", "waiting_user", "resolved", "closed"]
      : ["closed"];
    if (!allowed.includes(body.status)) {
      return NextResponse.json({ error: "Status not allowed." }, { status: 403 });
    }
    update.status = body.status;
    if (body.status === "resolved" || body.status === "closed") {
      update.resolvedAt = new Date();
    }
  }
  if (isAdmin && body.priority) {
    update.priority = body.priority;
  }

  const result = await prisma.ticket.updateMany({
    where: isAdmin ? { id } : { id, userId: authUser.id },
    data: update,
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  }

  invalidateCacheByPrefix("admin:tickets:");

  return NextResponse.json({ ok: true });
}
