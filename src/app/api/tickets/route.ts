import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerUser } from "@/lib/auth/session";
import { prisma, requireDb } from "@/lib/db";
import { generateTicketNumber } from "@/lib/ticket-number";

const createSchema = z.object({
  subject: z.string().trim().min(5, "Subject must be at least 5 characters").max(180),
  category: z.enum(["billing", "technical", "feature_request", "account", "general"]),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(4000),
});

export async function GET() {
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

  const tickets = await prisma.ticket.findMany({
    where: { userId: authUser.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { replies: true } } },
  });

  return NextResponse.json({
    tickets: tickets.map((t) => ({
      id: t.id,
      ticketNumber: t.ticketNumber,
      subject: t.subject,
      category: t.category,
      priority: t.priority,
      status: t.status,
      repliesCount: t._count.replies,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      lastRepliedByAdmin: t.lastRepliedByAdmin,
    })),
  });
}

export async function POST(request: Request) {
  const authUser = await getServerUser();
  if (!authUser?.id || !authUser.email) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstMessage =
      Object.values(fieldErrors)
        .flat()
        .find((m) => typeof m === "string") ?? "Validation failed. Check your input.";
    return NextResponse.json({ error: firstMessage, fieldErrors }, { status: 400 });
  }

  try {
    await requireDb();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Database unavailable" },
      { status: 503 },
    );
  }

  const userRow = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { fullName: true },
  });

  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber: await generateTicketNumber(),
      userId: authUser.id,
      userEmail: authUser.email,
      userName: userRow?.fullName ?? "",
      subject: parsed.data.subject,
      category: parsed.data.category,
      priority: parsed.data.priority,
      description: parsed.data.description,
    },
  });

  return NextResponse.json({ id: ticket.id, ticketNumber: ticket.ticketNumber });
}
