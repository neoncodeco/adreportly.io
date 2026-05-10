"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = searchParams.get("token");
    if (!token) {
      toast.error("Invalid or expired reset link");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setSubmitting(false);
    if (!res.ok) {
      toast.error(typeof data.error === "string" ? data.error : "Could not reset password");
    } else {
      toast.success("Password updated — you can sign in now.");
      router.replace("/login");
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
          <h1 className="text-2xl font-bold">Set a new password</h1>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">New password</Label>
              <PasswordInput
                className="rounded"
                id="password"
                required
                minLength={8}
                value={password}
                autoComplete="new-password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full rounded bg-brand text-brand-foreground btn-brutal h-auto py-3 hover:bg-brand font-semibold"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
