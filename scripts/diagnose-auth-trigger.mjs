import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const enums = await prisma.$queryRaw`
    SELECT t.typname, e.enumlabel
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ORDER BY t.typname, e.enumsortorder
  `;
  console.log("Public enums:", enums);

  const trigger = await prisma.$queryRaw`
    SELECT tgname, proname, tgenabled
    FROM pg_trigger t
    JOIN pg_proc p ON t.tgfoid = p.oid
    WHERE tgname = 'on_auth_user_created'
  `;
  console.log("Trigger:", trigger);

  const fn = await prisma.$queryRaw`
    SELECT proname, prosecdef, proowner::regrole::text AS owner
    FROM pg_proc WHERE proname = 'handle_new_user'
  `;
  console.log("Function:", fn);

  const cols = await prisma.$queryRaw`
    SELECT column_name, udt_name, is_nullable, column_default IS NOT NULL AS has_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users'
    ORDER BY ordinal_position
  `;
  console.log("users columns:", cols);

  const rls = await prisma.$queryRaw`
    SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'users'
  `;
  console.log("RLS:", rls);

  // Simulate trigger insert (rollback) to surface NOT NULL errors
  try {
    await prisma.$executeRaw`
      INSERT INTO public.users (id, email, full_name, organization, role, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        'trigger-test@example.com',
        'Test',
        'Test Org',
        'user'::"UserRole",
        now(),
        now()
      )
    `;
    console.log("Test insert: OK (unexpected — should rollback manually)");
    await prisma.$executeRaw`DELETE FROM public.users WHERE email = 'trigger-test@example.com'`;
  } catch (insertErr) {
    console.log("Test insert error (likely root cause):", insertErr.message);
  }
} catch (e) {
  console.error("Error:", e.message);
} finally {
  await prisma.$disconnect();
}
