"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { getPublicSiteCallbackUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/client";

/** Shape compatible with previous Supabase `User` usage in dashboard UI. */
export type AppUser = {
  id: string;
  email: string | null;
  role: "user" | "admin";
};

type CompatSession = {
  user: {
    id: string;
    email: string | null;
    role: "user" | "admin";
  };
};

interface AuthContextValue {
  user: AppUser | null;
  session: CompatSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    meta?: { full_name?: string; organization?: string },
  ) => Promise<{ error: Error | null; verificationRequired?: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapSupabaseAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("email not confirmed") || lower.includes("not confirmed")) {
    return "Verify your email before signing in.";
  }
  if (lower.includes("invalid login credentials") || lower.includes("invalid credentials")) {
    return "Invalid credentials";
  }
  return message;
}

async function fetchAppRole(userId: string): Promise<"user" | "admin"> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (!res.ok) {
    return "user";
  }
  const data = (await res.json()) as { role?: string };
  return data.role === "admin" ? "admin" : "user";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const syncFromAuthUser = useCallback(async (authUser: SupabaseUser | null) => {
    if (!authUser?.id) {
      setAppUser(null);
      return;
    }
    const role = await fetchAppRole(authUser.id);
    setAppUser({
      id: authUser.id,
      email: authUser.email ?? null,
      role,
    });
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await syncFromAuthUser(session?.user ?? null);
      setLoading(false);
    };

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await syncFromAuthUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [syncFromAuthUser]);

  const session = useMemo((): CompatSession | null => {
    if (!appUser) return null;
    return {
      user: {
        id: appUser.id,
        email: appUser.email,
        role: appUser.role,
      },
    };
  }, [appUser]);

  const signIn = async (email: string, password: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      return { error: new Error(mapSupabaseAuthError(error.message)) };
    }
    await syncFromAuthUser((await supabase.auth.getSession()).data.session?.user ?? null);
    return { error: null };
  };

  const signUp = async (
    email: string,
    password: string,
    meta?: { full_name?: string; organization?: string },
  ) => {
    const supabase = createClient();
    const verifyNext = encodeURIComponent("/login?verify=success");
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: meta?.full_name ?? "",
          organization: meta?.organization ?? "",
        },
        emailRedirectTo: `${getPublicSiteCallbackUrl("/auth/callback")}?next=${verifyNext}`,
      },
    });

    if (error) {
      const lower = error.message.toLowerCase();
      const msg = lower.includes("already registered")
        ? "An account with this email already exists"
        : error.message;
      return { error: new Error(msg), verificationRequired: false };
    }

    const verificationRequired = !data.session;
    return { error: null, verificationRequired };
  };

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setAppUser(null);
    window.location.assign("/api/auth/logout");
  };

  return (
    <AuthContext.Provider
      value={{
        user: appUser,
        session,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
