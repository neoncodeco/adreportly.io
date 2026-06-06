import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Required for auth and user APIs. */
export async function requireDb(): Promise<PrismaClient> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Add it to .env for authentication and profiles.");
  }
  return prisma;
}
