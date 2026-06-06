import { prisma } from "@/lib/prisma";

export async function generateTicketNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.ticket.count();
  const pad = String(count + 1).padStart(4, "0");
  return `TKT-${year}-${pad}`;
}
