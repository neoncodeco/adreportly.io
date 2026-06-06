import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const functionSql = `
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (
    id,
    email,
    full_name,
    organization,
    role,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'organization', ''),
    'user'::"UserRole",
    now(),
    now()
  );

  return new;
end;
$$;
`;

try {
  await prisma.$executeRawUnsafe(functionSql);
  await prisma.$executeRawUnsafe(
    "grant execute on function public.handle_new_user() to supabase_auth_admin",
  );
  await prisma.$executeRawUnsafe("grant insert on table public.users to supabase_auth_admin");
  console.log("Applied handle_new_user timestamp fix.");
} catch (e) {
  console.error("Failed:", e.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
