"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Eye, ExternalLink, Filter, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DASHBOARD_CLIENTS_STALE_MS,
  dashboardQk,
  fetchDashboardClients,
  type DashboardClientsPayload,
  type ClientRow,
} from "@/lib/dashboard-queries";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;
const DEFAULT_DOLLAR_RATE_BDT = 126;

function formatUsd(value: number | null) {
  if (value == null) return "Not set";
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function formatRate(value: number | null) {
  if (value == null) return "Not set";
  return `৳${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function ClientsPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ClientRow | null>(null);
  const [editTarget, setEditTarget] = useState<ClientRow | null>(null);
  const [editDeposit, setEditDeposit] = useState("");
  const [editDollarRate, setEditDollarRate] = useState(String(DEFAULT_DOLLAR_RATE_BDT));
  const [deletedClientIds, setDeletedClientIds] = useState<Set<string>>(() => new Set());

  const { data, isPending, isError, error } = useQuery({
    queryKey: dashboardQk.clients(),
    queryFn: fetchDashboardClients,
    staleTime: DASHBOARD_CLIENTS_STALE_MS,
  });

  const clients = (data?.clients ?? []).filter((c) => !deletedClientIds.has(c.id));
  const clientCount = data?.clientCount ?? 0;
  const clientLimit = data?.clientLimit ?? null;
  const planName = data?.planName ?? "";

  const atClientLimit = clientLimit !== null && clientCount >= clientLimit;

  const createMut = useMutation({
    mutationFn: async (body: { name: string; email: string }) => {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const j = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok)
        throw new Error(typeof j.error === "string" ? j.error : "Could not create client");
      return j;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dashboardQk.clients() });
      toast.success("Client added");
      setAddOpen(false);
      setNewName("");
      setNewEmail("");
      setPage(1);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/clients/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const j = (await res.json()) as { success?: boolean; error?: string };
      // If the server says "not found", it was likely already deleted but still visible due to cache.
      if (!res.ok && res.status !== 404) {
        throw new Error(typeof j.error === "string" ? j.error : "Could not delete client");
      }
      return { ...(j ?? {}), success: true };
    },
    onSuccess: (_, deletedId) => {
      setDeletedClientIds((prev) => {
        const next = new Set(prev);
        next.add(deletedId);
        return next;
      });
      // Update the UI immediately, even if the list endpoint is cached briefly.
      queryClient.setQueryData(
        dashboardQk.clients(),
        (prev: DashboardClientsPayload | undefined) => {
          if (!prev) return prev;
          return {
            ...prev,
            clients: (prev.clients ?? []).filter((c) => c.id !== deletedId),
          };
        },
      );
      void queryClient.invalidateQueries({ queryKey: dashboardQk.clients() });
      void queryClient.refetchQueries({ queryKey: dashboardQk.clients() });
      toast.success("Client removed");
      setDeleteTarget(null);
      setPage(1);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateFinancialsMut = useMutation({
    mutationFn: async (params: {
      id: string;
      totalDeposit: number | null;
      dollarRateBdt: number;
    }) => {
      const res = await fetch(`/api/clients/${encodeURIComponent(params.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          totalDeposit: params.totalDeposit,
          dollarRateBdt: params.dollarRateBdt,
        }),
      });
      const j = (await res.json()) as {
        success?: boolean;
        error?: string;
        totalDeposit?: number | null;
        dollarRateBdt?: number;
        updatedCount?: number;
      };
      if (!res.ok || j.success === false) {
        throw new Error(typeof j.error === "string" ? j.error : "Could not update client");
      }
      return j;
    },
    onSuccess: (result, params) => {
      queryClient.setQueryData(
        dashboardQk.clients(),
        (prev: DashboardClientsPayload | undefined) => {
          if (!prev) return prev;
          return {
            ...prev,
            clients: (prev.clients ?? []).map((c) =>
              c.id === params.id
                ? {
                    ...c,
                    totalDeposit: result.totalDeposit ?? null,
                    dollarRateBdt: result.dollarRateBdt ?? DEFAULT_DOLLAR_RATE_BDT,
                  }
                : c,
            ),
          };
        },
      );
      void queryClient.invalidateQueries({ queryKey: dashboardQk.clients() });
      setEditTarget(null);
      toast.success(
        result.updatedCount && result.updatedCount > 0
          ? "Client budget and dollar rate updated"
          : "Saved, but this client has no active share link yet",
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    const qt = q.trim().toLowerCase();
    let list = clients;
    if (qt) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(qt) ||
          c.email.toLowerCase().includes(qt) ||
          c.displayId.toLowerCase().includes(qt),
      );
    }
    if (statusFilter === "active") {
      list = list.filter((c) => c.status === "active");
    }
    return list;
  }, [clients, q, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  const copyId = (id: string) => {
    void navigator.clipboard.writeText(id);
    toast.success("Client ID copied");
  };

  const openClientShare = (c: ClientRow) => {
    if (c.latestShareUrl) {
      window.open(c.latestShareUrl, "_blank", "noopener,noreferrer");
    } else {
      toast.error("No active share link for this client yet. Create one under Reports.");
    }
  };

  const submitAdd = () => {
    createMut.mutate({ name: newName.trim(), email: newEmail.trim() });
  };

  const openEdit = (client: ClientRow) => {
    setEditTarget(client);
    setEditDeposit(client.totalDeposit == null ? "" : String(client.totalDeposit));
    setEditDollarRate(String(client.dollarRateBdt ?? DEFAULT_DOLLAR_RATE_BDT));
  };

  const submitEdit = () => {
    if (!editTarget) return;
    const totalDeposit = editDeposit.trim() ? Number(editDeposit) : null;
    const dollarRateBdt = Number(editDollarRate);
    if (totalDeposit !== null && (!Number.isFinite(totalDeposit) || totalDeposit <= 0)) {
      toast.error("Budget must be a positive number.");
      return;
    }
    if (!Number.isFinite(dollarRateBdt) || dollarRateBdt <= 0) {
      toast.error("Dollar rate must be a positive number.");
      return;
    }
    updateFinancialsMut.mutate({ id: editTarget.id, totalDeposit, dollarRateBdt });
  };

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-label="Loading" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {error instanceof Error ? error.message : "Could not load clients"}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Clients</h1>
          <p className="text-sm text-muted-foreground">Manage your agency clients</p>
          {clientLimit !== null ? (
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{clientCount}</span> /{" "}
              <span className="font-semibold text-foreground">{clientLimit}</span> clients created
              {planName ? ` on ${planName}` : ""}
              <span className="text-muted-foreground/80"> (deleting doesn’t free slots)</span>
              {atClientLimit ? (
                <>
                  {" "}
                  ·{" "}
                  <Link
                    href="/dashboard/billing"
                    className="font-medium text-primary hover:underline"
                  >
                    Upgrade plan
                  </Link>{" "}
                  for more
                </>
              ) : null}
            </p>
          ) : null}
        </div>
        <Button
          className="h-11 shrink-0 rounded-full bg-gradient-primary px-5 text-primary-foreground shadow-glow hover:opacity-95 sm:h-10 disabled:opacity-60"
          type="button"
          disabled={atClientLimit}
          onClick={() => setAddOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add new client
        </Button>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add client</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="new-client-name">Client name</Label>
              <Input
                id="new-client-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-client-email">Email</Label>
              <Input
                id="new-client-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="client@example.com"
                className="rounded-xl"
              />
            </div>
            {atClientLimit ? (
              <p className="text-xs text-destructive">
                Client limit reached.
                <Link href="/dashboard/billing" className="ml-1 font-medium underline">
                  Upgrade your plan
                </Link>
              </p>
            ) : null}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-gradient-primary text-primary-foreground"
              disabled={createMut.isPending || atClientLimit || !newName.trim() || !newEmail.trim()}
              onClick={() => submitAdd()}
            >
              {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save client"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove client?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes <span className="font-medium text-foreground">{deleteTarget?.name}</span>{" "}
              from your roster and deletes all share links for{" "}
              <span className="font-medium text-foreground">{deleteTarget?.email}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
            >
              {deleteMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={Boolean(editTarget)} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit budget and dollar rate</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              <div className="truncate font-semibold text-foreground">{editTarget?.name}</div>
              <div className="truncate">{editTarget?.email}</div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-client-budget">Client budget / deposit (USD)</Label>
              <Input
                id="edit-client-budget"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={editDeposit}
                onChange={(e) => setEditDeposit(e.target.value)}
                placeholder="e.g. 500"
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-client-rate">Dollar rate (BDT)</Label>
              <Input
                id="edit-client-rate"
                type="number"
                inputMode="decimal"
                min="1"
                step="0.01"
                value={editDollarRate}
                onChange={(e) => setEditDollarRate(e.target.value)}
                placeholder="126"
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-gradient-primary text-primary-foreground"
              disabled={updateFinancialsMut.isPending}
              onClick={() => submitEdit()}
            >
              {updateFinancialsMut.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="relative min-w-0 flex-1 sm:min-w-[240px]">
          <Label htmlFor="clients-search" className="sr-only">
            Search clients
          </Label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="clients-search"
            placeholder="Search clients…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            className="h-11 rounded-xl border-border bg-card pl-10 sm:h-10"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-11 w-full rounded-xl sm:h-10 sm:w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            type="button"
            className="h-11 rounded-xl sm:h-10"
            onClick={() => toast.info("More filters coming soon")}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
          No clients yet. Click{" "}
          <span className="font-semibold text-foreground">Add new client</span> or open{" "}
          <Link href="/dashboard/reports" className="font-semibold text-primary hover:underline">
            Reports
          </Link>{" "}
          after adding a client to send a share link.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
            <table className="w-full min-w-[58rem] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left">
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-5">
                    Client
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Budget
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Dollar rate
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Client ID
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:pr-5">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageRows.map((c) => (
                  <tr key={c.id} className="bg-card transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3.5 sm:px-5">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                            "bg-gradient-primary text-xs font-bold text-primary-foreground shadow-sm",
                          )}
                        >
                          {c.initials}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-foreground">{c.name}</div>
                          <div className="truncate text-xs text-muted-foreground">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <div className="font-semibold text-foreground">
                        {formatUsd(c.totalDeposit)}
                      </div>
                      <div className="text-xs text-muted-foreground">client deposit</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <div className="font-semibold text-foreground">
                        {formatRate(c.dollarRateBdt)}
                      </div>
                      <div className="text-xs text-muted-foreground">per USD</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => copyId(c.displayId)}
                        className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-primary hover:underline"
                      >
                        {c.displayId}
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                          "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
                        )}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right sm:pr-5">
                      <div className="inline-flex items-center justify-end gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-lg"
                          type="button"
                          aria-label="Open client share link"
                          onClick={() => openClientShare(c)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-lg"
                          type="button"
                          aria-label="Edit client budget and dollar rate"
                          onClick={() => openEdit(c)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive"
                          type="button"
                          aria-label="Delete client"
                          onClick={() => setDeleteTarget(c)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {filtered.length === 0 ? 0 : start + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-foreground">
                {Math.min(start + PAGE_SIZE, filtered.length)}
              </span>{" "}
              of <span className="font-medium text-foreground">{filtered.length}</span> results
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
