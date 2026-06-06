import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export type MiddlewareAuthUser = {
  id: string;
  email: string;
};

/**
 * Refreshes the Supabase session cookie on each request and returns the authenticated user.
 */
export async function updateSession(request: NextRequest): Promise<{
  response: NextResponse;
  user: MiddlewareAuthUser | null;
}> {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    response: supabaseResponse,
    user: user?.id
      ? {
          id: user.id,
          email: user.email ?? "",
        }
      : null,
  };
}
