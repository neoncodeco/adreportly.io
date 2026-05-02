"use client";

import { motion } from "framer-motion";
import { Facebook, RefreshCw, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const accounts = [
  {
    id: "1",
    name: "Demo Ad Account",
    accountId: "demo123456",
    currency: "BDT",
    status: "active",
    lastSynced: "Never",
    active: true,
  },
];

export function MetaConnectPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Meta Connection</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Connect and manage your Facebook Ad Accounts
          </p>
        </div>
        <Button
          className="rounded-full bg-[#1877F2] text-white shadow-glow hover:opacity-95"
          onClick={() =>
            toast.message(
              "Add your Facebook App credentials in Settings → Secrets to enable OAuth",
              {
                description: "FACEBOOK_APP_ID and FACEBOOK_APP_SECRET are required.",
              },
            )
          }
        >
          <Facebook className="mr-2 h-4 w-4" /> Connect Facebook
        </Button>
      </div>

      {/* Empty state hero */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 text-center shadow-soft sm:p-12">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#1877F2]/10 via-transparent to-primary/10" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#1877F2]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />

        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1877F2] text-white shadow-glow sm:h-20 sm:w-20">
          <Facebook className="h-8 w-8 sm:h-10 sm:w-10" />
        </div>
        <h3 className="relative mt-5 text-lg font-bold sm:text-xl">
          No Facebook Account Connected
        </h3>
        <p className="relative mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
          Connect your Facebook account to start syncing ad data automatically.
        </p>
        <Button
          className="relative mt-6 rounded-full bg-[#1877F2] text-white shadow-glow hover:opacity-95"
          onClick={() => toast.message("OAuth flow ready — add Facebook App credentials to enable")}
        >
          <Facebook className="mr-2 h-4 w-4" /> Connect Facebook Account
        </Button>
      </div>

      {/* Ad accounts */}
      <div className="rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold sm:text-lg">Ad Accounts</h3>
            <p className="text-xs text-muted-foreground">Linked accounts</p>
          </div>
          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-bold text-primary">
            {accounts.length}
          </span>
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 lg:hidden">
          {accounts.map((a) => (
            <div key={a.id} className="rounded-2xl border border-border/60 bg-background/40 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1877F2]/15 text-[#1877F2]">
                  <Facebook className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{a.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{a.accountId}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="-mr-2 h-7 w-7 shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-success">
                      {a.status}
                    </span>
                    <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-semibold">
                      {a.currency}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Last Synced
                  </div>
                  <div className="text-xs font-semibold">{a.lastSynced}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch defaultChecked={a.active} />
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => toast.success("Sync started")}
                  >
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Sync
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto lg:block">
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
              {accounts.map((a) => (
                <tr key={a.id} className="border-t border-border/60">
                  <td className="py-4 pr-4">
                    <div className="font-semibold">{a.name}</div>
                    <div className="text-xs text-muted-foreground">{a.accountId}</div>
                  </td>
                  <td className="py-4 pr-4">{a.currency}</td>
                  <td className="py-4 pr-4">
                    <span className="inline-flex items-center rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold uppercase text-success">
                      {a.status}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-muted-foreground">{a.lastSynced}</td>
                  <td className="py-4 pr-4 text-center">
                    <Switch defaultChecked={a.active} />
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
