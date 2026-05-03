import { Suspense } from "react";
import { MetaConnectPage } from "@/components/dashboard/MetaConnectPage";
import { Loader2 } from "lucide-react";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-label="Loading" />
        </div>
      }
    >
      <MetaConnectPage />
    </Suspense>
  );
}
