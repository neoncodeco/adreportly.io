import { Suspense } from "react";
import { SignupClient } from "./signup-client";

function SignupFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4 py-12">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"
        aria-hidden
      />
      <span className="sr-only">Loading</span>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <SignupClient />
    </Suspense>
  );
}
