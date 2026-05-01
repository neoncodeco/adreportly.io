import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Facebook, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/meta-connect")({
  component: MetaConnectPage,
});

function MetaConnectPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meta (Facebook) Connection</h1>
          <p className="text-sm text-muted-foreground">Connect and manage your Facebook Ad Accounts</p>
        </div>
        <Button
          className="rounded-full bg-primary text-primary-foreground shadow-glow hover:opacity-95"
          onClick={() =>
            toast.message("Add your Facebook App credentials in Settings → Secrets to enable OAuth", {
              description: "FACEBOOK_APP_ID and FACEBOOK_APP_SECRET are required.",
            })
          }
        >
          <Facebook className="mr-2 h-4 w-4" /> Connect Facebook
        </Button>
      </div>

      <div className="glass mb-6 flex flex-col items-center justify-center rounded-3xl px-6 py-16 text-center shadow-soft">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Facebook className="h-8 w-8" />
        </div>
        <h3 className="mt-6 text-lg font-bold">No Facebook Account Connected</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect your Facebook account to start syncing ad data.
        </p>
        <Button
          className="mt-6 rounded-full bg-primary text-primary-foreground shadow-glow hover:opacity-95"
          onClick={() => toast.message("OAuth flow ready — add Facebook App credentials to enable")}
        >
          Connect Facebook Account
        </Button>
      </div>

      <div className="glass rounded-3xl p-6 shadow-soft">
        <h3 className="text-lg font-bold">Ad Accounts</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 pr-4">Account</th>
                <th className="pb-3 pr-4">Currency</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Last Synced</th>
                <th className="pb-3 pr-4 text-center">Active</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border/60">
                <td className="py-4 pr-4">
                  <div className="font-semibold">Demo Ad Account</div>
                  <div className="text-xs text-muted-foreground">demo123456</div>
                </td>
                <td className="py-4 pr-4">BDT</td>
                <td className="py-4 pr-4">
                  <span className="inline-flex items-center rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold uppercase text-success">
                    Active
                  </span>
                </td>
                <td className="py-4 pr-4 text-muted-foreground">Never</td>
                <td className="py-4 pr-4 text-center">
                  <Switch defaultChecked />
                </td>
                <td className="py-4 text-right">
                  <button
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase text-primary hover:underline"
                    onClick={() => toast.success("Sync started")}
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Sync Now
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
