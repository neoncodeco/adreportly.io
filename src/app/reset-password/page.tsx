import { Suspense } from "react";
import { ResetPasswordForm } from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4 py-12">
          <div className="w-full max-w-md rounded card-brutal bg-card p-8 text-center text-sm text-muted-foreground">
            Loading…
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
