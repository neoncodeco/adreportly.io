"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Zap, Loader2, Facebook } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type FormData = { email: string; password: string };

export default function LoginPage() {
  const { signIn, user } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [verifyState, setVerifyState] = useState<string | null>(null);
  const [verifyEmail, setVerifyEmail] = useState<string>("");

  const getSafeNext = () => {
    if (typeof window === "undefined") return null;
    const nextParam = new URLSearchParams(window.location.search).get("next");
    return nextParam?.startsWith("/") ? nextParam : null;
  };

  useEffect(() => {
    // Facebook sometimes appends `#_=_` in callback flows; remove it for cleaner URL/state.
    if (window.location.hash === "#_=_") {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    const safeNext = getSafeNext();
    if (user) {
      router.replace(safeNext ?? (user.role === "admin" ? "/admin" : "/dashboard"));
    }
  }, [user, router]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verify = params.get("verify");
    const email = params.get("email") ?? "";
    setVerifyState(verify);
    setVerifyEmail(email);
    if (verify === "success") toast.success("Email verified. You can sign in now.");
    if (verify === "pending") toast.info("Check your inbox to verify your email.");
    if (verify === "expired") toast.error("Verification link expired. Request a new one.");
    if (verify === "invalid") toast.error("Invalid verification link.");
    if (verify === "error") toast.error("Could not verify email right now.");
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    const { error } = await signIn(data.email.trim(), data.password);
    setSubmitting(false);
    if (error) {
      toast.error(error.message || "Invalid credentials");
    } else {
      toast.success("Welcome back!");
      const safeNext = getSafeNext();
      if (safeNext) {
        router.replace(safeNext);
        return;
      }
      const s = await getSession();
      const dest =
        (s?.user as { role?: string } | undefined)?.role === "admin" ? "/admin" : "/dashboard";
      router.replace(dest);
    }
  };

  const resendVerification = async () => {
    if (!verifyEmail) {
      toast.error("Enter your email to resend verification.");
      return;
    }
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifyEmail }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(json.error || "Could not resend verification email.");
        return;
      }
      toast.success("Verification email sent.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded card-brutal bg-brand text-ink">
            <Zap className="h-4 w-4" />
          </span>
          <span className="text-base font-bold">AdReportly</span>
        </Link>

        <div className="rounded card-brutal bg-card p-8">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your agency dashboard</p>
          {(verifyState === "pending" || verifyState === "expired") && verifyEmail && (
            <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800">
              Verification required for <strong>{verifyEmail}</strong>.
              <button
                type="button"
                className="ml-2 font-semibold underline underline-offset-2"
                onClick={() => void resendVerification()}
                disabled={resending}
              >
                {resending ? "Sending..." : "Resend link"}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                className="rounded"
                id="email"
                type="email"
                placeholder="you@agency.com"
                {...register("email", {
                  required: "Enter your email",
                  maxLength: { value: 255, message: "Email is too long" },
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email",
                  },
                })}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                className="rounded"
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password", {
                  required: "Enter your password",
                  minLength: { value: 8, message: "Min 8 characters" },
                  maxLength: { value: 72, message: "Password is too long" },
                })}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full rounded bg-brand text-brand-foreground btn-brutal h-auto py-3 hover:bg-brand font-semibold"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wide">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full rounded border-2 border-[#1877F2]/40 bg-background py-3 font-semibold hover:bg-[#1877F2]/5"
            asChild
          >
            <a href="/api/auth/facebook">
              <Facebook className="mr-2 h-4 w-4 shrink-0 text-[#1877F2]" />
              Continue with Facebook
            </a>
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Opens Meta OAuth, then returns to Meta Connect. Sign in with email first if you want the
            same user linked in MongoDB.
          </p>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
