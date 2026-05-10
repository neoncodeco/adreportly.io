"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Zap, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";

type FormData = {
  full_name: string;
  organization: string;
  email: string;
  password: string;
};

export function SignupClient() {
  const { signUp, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextAfterAuth = searchParams.get("next");
  const safeNext = nextAfterAuth && nextAfterAuth.startsWith("/") ? nextAfterAuth : null;
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) router.replace(user.role === "admin" ? "/admin" : "/dashboard");
  }, [user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { full_name: "", organization: "", email: "", password: "" },
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    const { error } = await signUp(data.email.trim(), data.password, {
      full_name: data.full_name.trim(),
      organization: data.organization.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message || "Sign up failed");
    } else {
      toast.success("Account created. Verify your email before signing in.");
      const nextQ = safeNext ? `&next=${encodeURIComponent(safeNext)}` : "";
      router.replace(
        `/login?verify=pending&email=${encodeURIComponent(data.email.trim())}${nextQ}`,
      );
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
          <h1 className="text-2xl font-bold">Create your agency account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Start tracking Facebook ads in seconds
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Your name</Label>
                <Input
                  className="rounded"
                  id="full_name"
                  placeholder="Jane Doe"
                  {...register("full_name", {
                    required: "Enter your name",
                    minLength: { value: 2, message: "Name is too short" },
                    maxLength: { value: 100, message: "Name is too long" },
                  })}
                />
                {errors.full_name && (
                  <p className="text-xs text-destructive">{errors.full_name.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="organization">Agency</Label>
                <Input
                  className="rounded"
                  id="organization"
                  placeholder="Hive Marketing"
                  {...register("organization", {
                    required: "Enter your agency",
                    minLength: { value: 2, message: "Agency name is too short" },
                    maxLength: { value: 100, message: "Agency name is too long" },
                  })}
                />
                {errors.organization && (
                  <p className="text-xs text-destructive">{errors.organization.message}</p>
                )}
              </div>
            </div>
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
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                className="rounded"
                id="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                {...register("password", {
                  required: "Choose a password",
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
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
