"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { signIn as nextAuthSignIn, useSession } from "next-auth/react";

/** Shape compatible with previous Supabase `User` usage in dashboard UI. */
export type AppUser = {
  id: string;
  email: string | null;
  role: "user" | "admin";
};

interface AuthContextValue {
  user: AppUser | null;
  session: ReturnType<typeof useSession>["data"];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    meta?: { full_name?: string; organization?: string },
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession();

  const loading = status === "loading";

  const user = useMemo((): AppUser | null => {
    if (!session?.user?.id) return null;
    return {
      id: session.user.id,
      email: session.user.email ?? null,
      role: session.user.role === "admin" ? "admin" : "user",
    };
  }, [session]);

  const signIn = async (email: string, password: string) => {
    const res = await nextAuthSignIn("credentials", {
      email: email.trim(),
      password,
      redirect: false,
    });
    if (res?.error) {
      return {
        error: new Error(res.error === "CredentialsSignin" ? "Invalid credentials" : res.error),
      };
    }
    await update();
    return { error: null };
  };

  const signUp = async (
    email: string,
    password: string,
    meta?: { full_name?: string; organization?: string },
  ) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        full_name: meta?.full_name ?? "",
        organization: meta?.organization ?? "",
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string | Record<string, unknown>;
    };
    if (!res.ok) {
      const msg =
        typeof data.error === "string"
          ? data.error
          : res.status === 409
            ? "An account with this email already exists"
            : "Sign up failed";
      return { error: new Error(msg) };
    }
    const signInRes = await nextAuthSignIn("credentials", {
      email: email.trim(),
      password,
      redirect: false,
    });
    if (signInRes?.error) {
      return { error: new Error("Account created but sign-in failed. Please log in manually.") };
    }
    await update();
    return { error: null };
  };

  const signOut = async () => {
    // Single full navigation: server clears httpOnly cookies (session + agency) then redirects to /login.
    window.location.assign("/api/auth/logout");
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
