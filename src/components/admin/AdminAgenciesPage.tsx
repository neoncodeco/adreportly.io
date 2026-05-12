"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  ADMIN_PAGE_SIZE,
  ADMIN_STALE_MS,
  adminQk,
  fetchAdminAgencies,
  patchAdmin,
  type AdminAgencyRow as AgencyRow,
} from "@/lib/admin-queries";

export function AdminAgenciesPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const deferredQ = useDeferredValue(q);
  const [page, setPage] = useState(1);
  const [savingAgencyId, setSavingAgencyId] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [deferredQ]);

  const { data, isPending, isError, error, isFetching, isPlaceholderData } = useQuery({
    queryKey: adminQk.agencies(page, ADMIN_PAGE_SIZE, deferredQ),
    queryFn: () => fetchAdminAgencies(page, ADMIN_PAGE_SIZE, deferredQ),
    staleTime: ADMIN_STALE_MS,
    placeholderData: keepPreviousData,
  });

  const rows = data?.agencies ?? [];
  const total = data?.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const canPrev = page > 1;
  const canNext = page < lastPage;
  const actionMutation = useMutation({
    mutationFn: (vars: { agencyId: string; action: "unlinkUsers" | "deleteAgency" }) =>
      patchAdmin<{ success: true }>("/api/admin/agencies", vars),
    onSuccess: async () => {
      toast.success("Agency updated.");
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Could not update agency.");
    },
    onSettled: () => {
      setSavingAgencyId(null);
    },
  });

  const runAction = (agencyId: string, action: "unlinkUsers" | "deleteAgency") => {
    setSavingAgencyId(agencyId);
    actionMutation.mutate({ agencyId, action });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-4 sm:space-y-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight sm:text-xl">Agencies</h1>
          <p className="text-sm text-muted-foreground">
            Meta OAuth rows (tokens are never shown here). {total.toLocaleString()} record
            {total === 1 ? "" : "s"}.
          </p>
        </div>
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search agency, email, ids"
            className="h-10 rounded-full border-border bg-card pl-9"
          />
        </div>
      </div>

      {isError ? (
        <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm font-medium text-destructive">
          {error instanceof Error ? error.message : "Could not load agencies"}
        </div>
      ) : null}

      <div
        className={`overflow-hidden rounded-2xl border border-border bg-card shadow-soft ${
          isFetching && isPlaceholderData ? "opacity-80" : ""
        }`}
      >
        <div className="md:hidden">
          {isPending && rows.length === 0 ? (
            <div className="px-4 py-12 text-center text-muted-foreground">
              <Loader2 className="mx-auto h-8 w-8 animate-spin" aria-label="Loading" />
            </div>
          ) : rows.length === 0 ? (
            <div className="px-4 py-10 text-center text-muted-foreground">
              No agency records yet.
            </div>
          ) : (
            <div className="space-y-3 p-3">
              {rows.map((r) => (
                <div
                  key={r.agencyId}
                  className="rounded-xl border border-border/70 bg-background/50 p-3"
                >
                  <p className="font-mono text-xs text-foreground">{r.agencyId}</p>
                  <p className="mt-1 font-medium">{r.name || "—"}</p>
                  <p className="text-xs text-muted-foreground">{r.email || "—"}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Linked users</p>
                      <p className="font-medium">{r.linkedUsers}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">FB user</p>
                      <p className="font-mono">{r.fbUserId ?? "—"}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={savingAgencyId === r.agencyId || r.linkedUsers === 0}
                      onClick={() => {
                        if (!window.confirm("Unlink all users from this agency?")) return;
                        void runAction(r.agencyId, "unlinkUsers");
                      }}
                      className="h-7 rounded-full px-2 text-xs"
                    >
                      Unlink users
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={savingAgencyId === r.agencyId}
                      onClick={() => {
                        if (!window.confirm("Delete this agency and unlink all mapped users?"))
                          return;
                        void runAction(r.agencyId, "deleteAgency");
                      }}
                      className="h-7 rounded-full px-2 text-xs text-destructive hover:text-destructive"
                    >
                      Delete agency
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Agency ID</th>
                <th className="px-4 py-3">Name / email</th>
                <th className="px-4 py-3">Linked users</th>
                <th className="px-4 py-3">Facebook user</th>
                <th className="px-4 py-3">App user</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isPending && rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" aria-label="Loading" />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No agency records yet.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr
                    key={r.agencyId}
                    className="border-b border-border/80 last:border-0 hover:bg-muted/30"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-foreground">
                      {r.agencyId}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{r.email || "—"}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.linkedUsers}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {r.fbUserId ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {r.appUserId ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={savingAgencyId === r.agencyId || r.linkedUsers === 0}
                          onClick={() => {
                            if (!window.confirm("Unlink all users from this agency?")) return;
                            void runAction(r.agencyId, "unlinkUsers");
                          }}
                          className="h-7 rounded-full px-2 text-xs"
                        >
                          Unlink users
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={savingAgencyId === r.agencyId}
                          onClick={() => {
                            if (!window.confirm("Delete this agency and unlink all mapped users?"))
                              return;
                            void runAction(r.agencyId, "deleteAgency");
                          }}
                          className="h-7 rounded-full px-2 text-xs text-destructive hover:text-destructive"
                        >
                          Delete agency
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Showing {(total === 0 ? 0 : (page - 1) * ADMIN_PAGE_SIZE + 1).toLocaleString()}-
          {Math.min(page * ADMIN_PAGE_SIZE, total).toLocaleString()} of {total.toLocaleString()}
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={!canPrev || isFetching}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page} / {lastPage}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={!canNext || isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
