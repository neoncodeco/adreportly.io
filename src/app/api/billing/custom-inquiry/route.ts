import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { requireMongo } from "@/lib/db";
import { TicketModel } from "@/models/ticket";
import { UserModel } from "@/models/user";

const schema = z.object({
  company: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(30).optional(),
  expectedAdAccounts: z.coerce.number().int().min(1).max(5000).optional(),
  expectedCampaigns: z.coerce.number().int().min(1).max(100_000).optional(),
  expectedClients: z.coerce.number().int().min(1).max(100_000).optional(),
  message: z
    .string()
    .trim()
    .min(20, "Please add a bit more detail (at least 20 characters).")
    .max(4000),
});

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

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstMessage =
      Object.values(fieldErrors)
        .flat()
        .find((m) => typeof m === "string") ?? "Validation failed.";
    return NextResponse.json({ error: firstMessage, fieldErrors }, { status: 400 });
  }

  try {
    await requireMongo();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const userRow = (await UserModel.findById(session.user.id)
    .select("fullName organization")
    .lean()
    .exec()) as { fullName?: string; organization?: string } | null;

  const lines = [
    "Custom / Enterprise plan inquiry",
    "",
    `Account email: ${session.user.email}`,
    userRow?.fullName ? `Profile name: ${userRow.fullName}` : null,
    userRow?.organization ? `Profile organization: ${userRow.organization}` : null,
    parsed.data.company ? `Company (form): ${parsed.data.company}` : null,
    parsed.data.phone ? `Phone: ${parsed.data.phone}` : null,
    parsed.data.expectedAdAccounts != null
      ? `Approx. ad accounts needed: ${parsed.data.expectedAdAccounts}`
      : null,
    parsed.data.expectedCampaigns != null
      ? `Approx. campaigns: ${parsed.data.expectedCampaigns}`
      : null,
    parsed.data.expectedClients != null
      ? `Approx. client share seats: ${parsed.data.expectedClients}`
      : null,
    "",
    "Requirements / notes:",
    parsed.data.message,
  ].filter((line): line is string => line != null && line !== "");

  const ticket = await TicketModel.create({
    userId: session.user.id,
    userEmail: session.user.email,
    userName: userRow?.fullName ?? session.user.name ?? "",
    subject: "Custom plan quote — AdReportly",
    category: "billing",
    priority: "medium",
    description: lines.join("\n"),
  });

  return NextResponse.json({
    success: true as const,
    ticketNumber: ticket.ticketNumber,
    id: ticket._id.toString(),
  });
}
