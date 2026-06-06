import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerUser } from "@/lib/auth/session";
import { prisma, requireDb } from "@/lib/db";
import { generateTicketNumber } from "@/lib/ticket-number";

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
    await requireDb();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database unavailable";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const userRow = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { fullName: true, organization: true },
  });

  const lines = [
    "Custom / Enterprise plan inquiry",
    "",
    `Account email: ${authUser.email}`,
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

  const ticketNumber = await generateTicketNumber();
  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber,
      userId: authUser.id,
      userEmail: authUser.email,
      userName: userRow?.fullName ?? "",
      subject: "Custom plan quote — AdReportly",
      category: "billing",
      priority: "medium",
      description: lines.join("\n"),
    },
  });

  return NextResponse.json({
    success: true as const,
    ticketNumber: ticket.ticketNumber,
    id: ticket.id,
  });
}
