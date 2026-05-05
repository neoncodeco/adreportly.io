import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { requireMongo } from "@/lib/db";
import { TicketModel } from "@/models/ticket";
import { UserModel } from "@/models/user";

const replySchema = z.object({
  message: z.string().trim().min(2).max(4000),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  try {
    await requireMongo();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Database unavailable" },
      { status: 503 },
    );
  }

  const userRow = (await UserModel.findById(session.user.id).select("role").lean().exec()) as {
    role?: string;
  } | null;
  const isAdmin = userRow?.role === "admin";

  const query = isAdmin ? { _id: id } : { _id: id, userId: session.user.id };
  const ticket = await TicketModel.findOne(query).lean().exec();

  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  }

  return NextResponse.json({ ticket });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
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
    await requireMongo();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Database unavailable" },
      { status: 503 },
    );
  }

  const userRow = (await UserModel.findById(session.user.id)
    .select("role fullName")
    .lean()
    .exec()) as { role?: string; fullName?: string } | null;
  const isAdmin = userRow?.role === "admin";

  const query = isAdmin ? { _id: id } : { _id: id, userId: session.user.id };
  const ticket = await TicketModel.findOne(query).exec();

  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  }
  if (ticket.status === "closed") {
    return NextResponse.json({ error: "Cannot reply to a closed ticket." }, { status: 400 });
  }

  ticket.replies.push({
    authorId: session.user.id,
    authorName: userRow?.fullName ?? session.user.name ?? "",
    authorEmail: session.user.email,
    isAdmin,
    message: parsed.data.message,
  } as Parameters<typeof ticket.replies.push>[0]);

  ticket.lastRepliedAt = new Date();
  ticket.lastRepliedByAdmin = isAdmin;
  if (isAdmin && ticket.status === "open") {
    ticket.status = "in_progress";
  } else if (!isAdmin && ticket.status === "waiting_user") {
    ticket.status = "in_progress";
  }

  await ticket.save();

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    await requireMongo();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Database unavailable" },
      { status: 503 },
    );
  }

  const userRow = (await UserModel.findById(session.user.id).select("role").lean().exec()) as {
    role?: string;
  } | null;
  const isAdmin = userRow?.role === "admin";

  const body = json as { status?: string; priority?: string };

  const update: Record<string, unknown> = {};
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

  const query = isAdmin ? { _id: id } : { _id: id, userId: session.user.id };
  const ticket = await TicketModel.findOneAndUpdate(query, { $set: update }, { new: true })
    .lean()
    .exec();
  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
