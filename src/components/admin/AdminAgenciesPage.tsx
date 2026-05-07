"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type AgencyRow = {
  agencyId: string;
  name: string;
  email: string;
  fbUserId: string | null;
  appUserId: string | null;
  linkedUsers: number;
};

export function AdminAgenciesPage() {
  const pageSize = 20;
  const [rows, setRows] = useState<AgencyRow[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [savingAgencyId, setSavingAgencyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const params = new URLSearchParams({
        limit: String(pageSize),
        skip: String((page - 1) * pageSize),
      });
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/admin/agencies?${params.toString()}`, {
        credentials: "include",
      });
      const json = (await res.json()) as {
        success?: boolean;
        error?: string;
        agencies?: AgencyRow[];
        total?: number;
      };
      if (!res.ok || json.success === false) {
        if (res.status === 403) setErr("You do not have admin access.");
        else setErr(typeof json.error === "string" ? json.error : "Could not load agencies");
        setRows([]);
        setTotal(0);
        return;
      }
      setRows(json.agencies ?? []);
      setTotal(json.total ?? 0);
    } catch {
      setErr("Network error");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, q]);

  useEffect(() => {
    setPage(1);
  }, [q]);

  useEffect(() => {
    void load();
  }, [load]);

  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < lastPage;
  const runAction = async (agencyId: string, action: "unlinkUsers" | "deleteAgency") => {
    setSavingAgencyId(agencyId);
    try {
      const res = await fetch("/api/admin/agencies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ agencyId, action }),
      });
      const json = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || json.success === false) {
        toast.error(json.error || "Could not update agency.");
        return;
      }
      toast.success("Agency updated.");
      await load();
    } catch {
      toast.error("Network error.");
    } finally {
      setSavingAgencyId(null);
    }
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

      {err ? (
        <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm font-medium text-destructive">
          {err}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="md:hidden">
          {loading && rows.length === 0 ? (
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
              {loading && rows.length === 0 ? (
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
          Showing {(total === 0 ? 0 : (page - 1) * pageSize + 1).toLocaleString()}-
          {Math.min(page * pageSize, total).toLocaleString()} of {total.toLocaleString()}
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={!canPrev || loading}
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
            disabled={!canNext || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
