import type { Prisma } from "@prisma/client";

export function isPrismaUniqueViolation(error: unknown, field?: string): boolean {
  if (
    typeof error !== "object" ||
    error === null ||
    !("code" in error) ||
    (error as Prisma.PrismaClientKnownRequestError).code !== "P2002"
  ) {
    return false;
  }
  if (!field) return true;
  const target = (error as Prisma.PrismaClientKnownRequestError).meta?.target;
  if (Array.isArray(target)) return target.includes(field);
  if (typeof target === "string") return target.includes(field);
  return false;
}
