const CUID_REGEX = /^c[a-z0-9]{24}$/i;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Validates cuid (legacy) or uuid (Supabase user ids, agency ids, share tokens). */
export function isValidId(id: string): boolean {
  return CUID_REGEX.test(id) || UUID_REGEX.test(id);
}

export function isUuid(id: string): boolean {
  return UUID_REGEX.test(id);
}
