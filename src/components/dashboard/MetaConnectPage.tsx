"use client";

import { useDeferredValue, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Facebook,
  RefreshCw,
  MoreVertical,
  Loader2,
  Settings,
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  Unplug,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AD_ACCOUNTS_PAGE_DEFAULT,
  AD_ACCOUNTS_STALE_MS,
  adAccountsQk,
  fetchAdAccountsPage,
  patchAdAccountEnabled,
  type AdAccountApiRow,
} from "@/lib/ad-accounts-client";
import { cn } from "@/lib/utils";

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

type FbAppInfo = {
  fbAppId: string | null;
  hasSecret: boolean;
  metaLinked?: boolean;
};

export function MetaConnectPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const setupAutoShown = useRef(false);
  const [banner, setBanner] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const deferredQ = useDeferredValue(q);

  const { data: fbAppInfo } = useQuery({
    queryKey: ["user", "fb-app"],
    queryFn: async (): Promise<FbAppInfo | null> => {
      const res = await fetch("/api/user/fb-app", { credentials: "include" });
      if (!res.ok) return null;
      return (await res.json()) as FbAppInfo;
    },
  });

  useEffect(() => {
    setPage(1);
  }, [deferredQ]);

  const { data, isPending, isError, error, isFetching, isPlaceholderData, refetch } = useQuery({
    queryKey: adAccountsQk.paged(page, AD_ACCOUNTS_PAGE_DEFAULT, deferredQ),
    queryFn: () =>
      fetchAdAccountsPage({
        page,
        limit: AD_ACCOUNTS_PAGE_DEFAULT,
        q: deferredQ,
      }),
    staleTime: AD_ACCOUNTS_STALE_MS,
    placeholderData: keepPreviousData,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      patchAdAccountEnabled(id, enabled),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["ad-accounts"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/user/meta-disconnect", {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Could not disconnect.");
      }
    },
    onSuccess: async () => {
      setupAutoShown.current = false;
      setShowDisconnectDialog(false);
      await queryClient.invalidateQueries({ queryKey: ["user", "fb-app"] });
      await queryClient.invalidateQueries({ queryKey: ["ad-accounts"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setBanner({
        kind: "ok",
        text: "Meta disconnected and app credentials removed. Add App ID & Secret in Settings, then connect again.",
      });
      toast.success("Meta disconnected");
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  const accounts: AdAccountApiRow[] = data?.adAccounts ?? [];
  const pagination = data?.pagination;
  const totalAccounts = data?.summary.totalAccounts ?? 0;
  const listTotal = pagination?.total ?? 0;

  useEffect(() => {
    if (window.location.hash === "#_=_") {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    const stripQueryKeys = (keys: string[]) => {
      const next = new URLSearchParams(searchParams.toString());
      let changed = false;
      for (const k of keys) {
        if (next.has(k)) {
          next.delete(k);
          changed = true;
        }
      }
      if (!changed) return;
      const q = next.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    };

    if (searchParams.get("connected") === "1") {
      setBanner({ kind: "ok", text: "Facebook connected. Ad accounts refreshed below." });
      void queryClient.invalidateQueries({ queryKey: ["ad-accounts"] });
      stripQueryKeys(["connected"]);
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
      stripQueryKeys(["error"]);
    }
  }, [searchParams, queryClient, router, pathname]);

  useEffect(() => {
    if (!fbAppInfo) return;
    const needsSetup = !fbAppInfo.fbAppId || !fbAppInfo.hasSecret;
    if (needsSetup && !setupAutoShown.current) {
      setShowSetupModal(true);
      setupAutoShown.current = true;
    }
  }, [fbAppInfo]);

  const connectHref = "/api/auth/facebook";
  const loadError = isError ? (error instanceof Error ? error.message : "Could not load") : null;
  const initialLoading = isPending && !isPlaceholderData;
  const canDisconnect = Boolean(
    fbAppInfo?.metaLinked || fbAppInfo?.hasSecret || fbAppInfo?.fbAppId,
  );

  const from = !pagination || listTotal === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const to =
    !pagination || listTotal === 0 ? 0 : Math.min(pagination.page * pagination.limit, listTotal);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn("space-y-5", isFetching && isPlaceholderData && "opacity-85")}
    >
      <Dialog open={showSetupModal} onOpenChange={setShowSetupModal}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-[420px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add your App ID & Secret first</DialogTitle>
            <DialogDescription>
              Meta connect করতে আগে `Settings` থেকে Facebook App ID এবং App Secret save করতে হবে।
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
              ? "flex items-start gap-3 rounded-2xl border border-success/30 bg-success/10 py-3 pl-4 pr-2 text-sm text-foreground"
              : "flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 py-3 pl-4 pr-2 text-sm text-destructive"
          }
        >
          <p className="min-w-0 flex-1 pt-0.5 leading-snug">{banner.text}</p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={
              banner.kind === "ok"
                ? "h-8 w-8 shrink-0 rounded-lg text-foreground/70 hover:bg-success/20 hover:text-foreground"
                : "h-8 w-8 shrink-0 rounded-lg text-destructive/80 hover:bg-destructive/15 hover:text-destructive"
            }
            onClick={() => setBanner(null)}
            aria-label="Dismiss message"
          >
            <X className="h-4 w-4" />
          </Button>
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

      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Meta connection?</AlertDialogTitle>
            <AlertDialogDescription className="text-left leading-relaxed">
              This disconnects your Facebook access, deletes saved <strong>App ID</strong> and{" "}
              <strong>App Secret</strong> from your account, and removes synced ad data, clients,
              and share links for this workspace. To use Meta again, add credentials in{" "}
              <strong>Settings</strong> and connect here.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              className="rounded-xl"
              disabled={disconnectMutation.isPending}
              onClick={() => disconnectMutation.mutate()}
            >
              {disconnectMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Remove Meta & app credentials"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {canDisconnect ? (
        <div className="rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h3 className="text-sm font-bold">Disconnect</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Remove Meta and clear App ID / Secret from the database. Re-add them in Settings
                before connecting again.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-11 shrink-0 rounded-full border-destructive/40 text-destructive hover:bg-destructive/10"
              onClick={() => setShowDisconnectDialog(true)}
            >
              <Unplug className="mr-2 h-4 w-4" />
              Remove Meta account
            </Button>
          </div>
        </div>
      ) : null}

      {totalAccounts === 0 && !initialLoading && !loadError && (
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 text-center shadow-soft sm:p-12">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#1877F2]/10 via-transparent to-primary/10" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#1877F2]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />

          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1877F2] text-white shadow-glow sm:h-20 sm:w-20">
            <Facebook className="h-8 w-8 sm:h-10 sm:w-10" />
          </div>
          <h3 className="relative mt-5 text-lg font-bold sm:text-xl">No Ad Accounts Yet</h3>
          <p className="relative mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
            Connect your Facebook account to sync the ad accounts you manage.
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
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-bold sm:text-lg">Ad Accounts</h3>
            <p className="text-xs text-muted-foreground">
              From Meta (live). Turn off to exclude an account from Dashboard &amp; Campaigns.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-bold text-primary">
              {initialLoading ? "…" : totalAccounts}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={isFetching}
              onClick={() => void refetch()}
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
            </Button>
          </div>
        </div>

        {totalAccounts > 0 ? (
          <div className="mb-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or account id…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-10 rounded-full border-border bg-background pl-9"
              />
            </div>
          </div>
        ) : null}

        {initialLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-label="Loading" />
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <p className="text-center text-sm text-destructive">{loadError}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        ) : totalAccounts === 0 ? (
          <p className="text-sm text-muted-foreground">
            No ad accounts returned yet. Connect Facebook above, then refresh this list.
          </p>
        ) : listTotal === 0 ? (
          <p className="text-sm text-muted-foreground">No accounts match your search.</p>
        ) : (
          <>
            <div className="space-y-3 lg:hidden">
              {accounts.map((a) => {
                const status = accountStatusLabel(a.account_status);
                const displayId = a.id.replace(/^act_/, "");
                const rowBusy = toggleMutation.isPending && toggleMutation.variables?.id === a.id;
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
                          In dashboard
                        </div>
                        <div className="text-xs font-semibold text-muted-foreground">
                          {a.enabled ? "Included" : "Excluded"}
                        </div>
                      </div>
                      <Switch
                        checked={a.enabled}
                        disabled={rowBusy}
                        aria-label={`Include ad account ${a.name} in dashboard`}
                        onCheckedChange={(enabled) => toggleMutation.mutate({ id: a.id, enabled })}
                      />
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
                    <th className="pb-3 pr-4 text-center">In dashboard</th>
                    <th className="pb-3 text-right">Include</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((a) => {
                    const status = accountStatusLabel(a.account_status);
                    const displayId = a.id.replace(/^act_/, "");
                    const rowBusy =
                      toggleMutation.isPending && toggleMutation.variables?.id === a.id;
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
                        <td className="py-4 pr-4 text-center text-muted-foreground">
                          {a.enabled ? "Yes" : "No"}
                        </td>
                        <td className="py-4 text-right">
                          <Switch
                            checked={a.enabled}
                            disabled={rowBusy}
                            aria-label={`Include ad account ${a.name} in dashboard`}
                            onCheckedChange={(enabled) =>
                              toggleMutation.mutate({ id: a.id, enabled })
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {listTotal > 0 && pagination ? (
              <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {from}–{to}
                  </span>{" "}
                  of <span className="font-medium text-foreground">{listTotal}</span>
                  {deferredQ ? ` (search)` : ""}
                  {isFetching ? (
                    <Loader2
                      className="ml-2 inline h-3.5 w-3.5 animate-spin align-middle text-muted-foreground"
                      aria-hidden
                    />
                  ) : null}
                </p>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    disabled={pagination.page <= 1 || isFetching}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[7rem] text-center text-xs font-semibold tabular-nums">
                    Page {pagination.page} / {pagination.totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    disabled={pagination.page >= pagination.totalPages || isFetching}
                    onClick={() => setPage((p) => p + 1)}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </motion.div>
  );
}
