import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { requireMongo } from "@/lib/db";
import { TicketModel } from "@/models/ticket";
import { UserModel } from "@/models/user";

const createSchema = z.object({
  subject: z.string().trim().min(5, "Subject must be at least 5 characters").max(180),
  category: z.enum(["billing", "technical", "feature_request", "account", "general"]),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(4000),
});

export async function GET() {
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

  const tickets = await TicketModel.find({ userId: session.user.id })
    .sort({ updatedAt: -1 })
    .select("-replies")
    .lean()
    .exec();

  return NextResponse.json({
    tickets: tickets.map((t) => ({
      id: t._id.toString(),
      ticketNumber: t.ticketNumber,
      subject: t.subject,
      category: t.category,
      priority: t.priority,
      status: t.status,
      repliesCount: (t.replies ?? []).length,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      lastRepliedByAdmin: t.lastRepliedByAdmin,
    })),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
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
    await requireMongo();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Database unavailable" },
      { status: 503 },
    );
  }

  const userRow = (await UserModel.findById(session.user.id).select("fullName").lean().exec()) as {
    fullName?: string;
  } | null;

  const ticket = await TicketModel.create({
    userId: session.user.id,
    userEmail: session.user.email,
    userName: userRow?.fullName ?? session.user.name ?? "",
    subject: parsed.data.subject,
    category: parsed.data.category,
    priority: parsed.data.priority,
    description: parsed.data.description,
  });

  return NextResponse.json({ id: ticket._id.toString(), ticketNumber: ticket.ticketNumber });
}
