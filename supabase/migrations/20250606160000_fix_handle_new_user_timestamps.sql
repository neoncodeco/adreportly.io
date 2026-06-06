-- Fix signup: public.users.updated_at is NOT NULL but trigger did not set it.

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

-- Ensure auth can invoke the trigger function (Supabase recommendation)
grant execute on function public.handle_new_user() to supabase_auth_admin;
grant insert on table public.users to supabase_auth_admin;
