"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Facebook, RefreshCw, MoreVertical, Loader2, Settings, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AdAccountRow = {
  id: string;
  name: string;
  currency: string;
  account_status: number;
};

function accountStatusLabel(code: number): string {
  switch (code) {
    case 1:
    case 101:
      return "active";
    case 2:
      return "disabled";
    case 3:
      return "unsettled";
    case 7:
      return "pending review";
    case 8:
      return "grace period";
    case 9:
      return "pending closure";
    case 100:
      return "closed";
    case 201:
      return "verifying";
    default:
      return "inactive";
  }
}

function statusBadgeClass(label: string) {
  if (label === "active") return "bg-success/15 text-success";
  return "bg-muted text-muted-foreground";
}

export function MetaConnectPage() {
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<AdAccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/ad-accounts", { credentials: "include" });
      const json = (await res.json()) as {
        success?: boolean;
        adAccounts?: AdAccountRow[];
        error?: string;
      };
      if (!res.ok || json.success === false) {
        setLoadError(typeof json.error === "string" ? json.error : "Could not load ad accounts");
        setAccounts([]);
        return;
      }
      setAccounts(json.adAccounts ?? []);
    } catch {
      setLoadError("Network error");
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    if (window.location.hash === "#_=_") {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    if (searchParams.get("connected") === "1") {
      setBanner({ kind: "ok", text: "Facebook connected. Ad accounts refreshed below." });
      void loadAccounts();
    }
    const err = searchParams.get("error");
    if (err) {
      setBanner({
        kind: "err",
        text:
          err === "oauth"
            ? "OAuth state mismatch — try Connect again."
            : err === "secrets"
              ? "Set JWT_SECRET and ENCRYPTION_KEY in .env for Meta OAuth."
              : err === "token"
                ? "Could not exchange code for token — check FACEBOOK_APP_ID / SECRET and redirect URI."
                : `Connection failed (${err}).`,
      });
    }
  }, [searchParams, loadAccounts]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/user/fb-app", { credentials: "include" });
        if (!res.ok) return;
        const data = (await res.json()) as { fbAppId?: string | null; hasSecret?: boolean };
        const needsSetup = !data.fbAppId || !data.hasSecret;
        if (!cancelled && needsSetup) setShowSetupModal(true);
      } catch {
        // ignore silently
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const connectHref = "/api/auth/facebook";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      <Dialog open={showSetupModal} onOpenChange={setShowSetupModal}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-[420px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add your App ID & Secret first</DialogTitle>
            <DialogDescription>
              Meta connect করতে আগে `Settings` থেকে Facebook App ID এবং App Secret save করতে হবে.
              চাইলে `Docs` পেজে step-by-step guide দেখে নাও.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row flex-wrap justify-center gap-2 sm:justify-center sm:space-x-0">
            <Button
              asChild
              className="rounded-full bg-[#c9f742] text-[#0b1220] hover:bg-[#b9ea35] dark:text-[#0b1220]"
            >
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" /> Go to Settings
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/docs">
                <BookOpen className="mr-2 h-4 w-4" /> Read Docs
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {banner ? (
        <div
          role="status"
          className={
            banner.kind === "ok"
              ? "rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-foreground"
              : "rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          }
        >
          {banner.text}
        </div>
      ) : null}

      <div>
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Meta Connect</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Manage your Facebook ad accounts and sync live data.
          </p>
        </div>
      </div>

      {accounts.length === 0 && !loading && (
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 text-center shadow-soft sm:p-12">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#1877F2]/10 via-transparent to-primary/10" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#1877F2]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />

          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1877F2] text-white shadow-glow sm:h-20 sm:w-20">
            <Facebook className="h-8 w-8 sm:h-10 sm:w-10" />
          </div>
          <h3 className="relative mt-5 text-lg font-bold sm:text-xl">
            {loadError ? "Could not load accounts" : "No Ad Accounts Yet"}
          </h3>
          <p className="relative mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
            {loadError ?? "Connect your Facebook account to sync the ad accounts you manage."}
          </p>
          <Button
            className="relative mt-6 rounded-full bg-[#1877F2] text-white shadow-glow hover:opacity-95"
            asChild
          >
            <a href={connectHref}>
              <Facebook className="mr-2 h-4 w-4" /> Connect Facebook Account
            </a>
          </Button>
        </div>
      )}

      <div className="rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold sm:text-lg">Ad Accounts</h3>
            <p className="text-xs text-muted-foreground">From Meta (live)</p>
          </div>
          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-bold text-primary">
            {loading ? "…" : accounts.length}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-label="Loading" />
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <p className="text-center text-sm text-destructive">{loadError}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => void loadAccounts()}>
              Retry
            </Button>
          </div>
        ) : accounts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No ad accounts returned yet. Connect Facebook above, then refresh this list.
          </p>
        ) : (
          <>
            <div className="space-y-3 lg:hidden">
              {accounts.map((a) => {
                const status = accountStatusLabel(a.account_status);
                const displayId = a.id.replace(/^act_/, "");
                return (
                  <div
                    key={a.id}
                    className="rounded-2xl border border-border/60 bg-background/40 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1877F2]/15 text-[#1877F2]">
                        <Facebook className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold">{a.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{displayId}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="-mr-2 h-7 w-7 shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${statusBadgeClass(status)}`}
                          >
                            {status}
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
                          Last synced
                        </div>
                        <div className="text-xs font-semibold text-muted-foreground">
                          Live via API
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch defaultChecked disabled aria-label="Active (read-only)" />
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          type="button"
                          onClick={() => void loadAccounts()}
                        >
                          <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="pb-3 pr-4">Account</th>
                    <th className="pb-3 pr-4">Currency</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Last synced</th>
                    <th className="pb-3 pr-4 text-center">Active</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((a) => {
                    const status = accountStatusLabel(a.account_status);
                    const displayId = a.id.replace(/^act_/, "");
                    return (
                      <tr key={a.id} className="border-t border-border/60">
                        <td className="py-4 pr-4">
                          <div className="font-semibold">{a.name}</div>
                          <div className="text-xs text-muted-foreground">{displayId}</div>
                        </td>
                        <td className="py-4 pr-4">{a.currency}</td>
                        <td className="py-4 pr-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${statusBadgeClass(status)}`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="py-4 pr-4 text-muted-foreground">Live via API</td>
                        <td className="py-4 pr-4 text-center">
                          <Switch defaultChecked disabled aria-label="Active (read-only)" />
                        </td>
                        <td className="py-4 text-right">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase text-primary hover:underline"
                            onClick={() => void loadAccounts()}
                          >
                            <RefreshCw className="h-3.5 w-3.5" /> Refresh
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
