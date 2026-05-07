"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Row = {
  id: string;
  email: string;
  fullName: string;
  organization: string;
  role: "user" | "admin";
  metaLinked: boolean;
  agencyId: string | null;
  billingPlanId: "free" | "starter" | "pro" | "enterprise";
  billingStatus: "inactive" | "pending" | "active" | "past_due" | "canceled" | "expired";
  isBanned: boolean;
  bannedAt: string | null;
  createdAt: string | null;
};

export function AdminUsersPage() {
  const pageSize = 20;
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
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
      const res = await fetch(`/api/admin/users?${params}`, { credentials: "include" });
      const json = (await res.json()) as {
        success?: boolean;
        error?: string;
        users?: Row[];
        total?: number;
      };
      if (!res.ok || json.success === false) {
        if (res.status === 403) setErr("You do not have admin access.");
        else setErr(typeof json.error === "string" ? json.error : "Could not load users");
        setRows([]);
        setTotal(0);
        return;
      }
      setRows(json.users ?? []);
      setTotal(json.total ?? 0);
    } catch {
      setErr("Network error");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [q, page]);

  useEffect(() => {
    setPage(1);
  }, [q]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 280);
    return () => clearTimeout(t);
  }, [load]);

  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < lastPage;

  const runAction = async (
    userId: string,
    action: "banUser" | "unbanUser" | "unlinkAgency" | "resetBilling" | "deleteUser",
  ) => {
    setSavingUserId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, action }),
      });
      const json = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || json.success === false) {
        toast.error(json.error || "Could not update user.");
        return;
      }
      toast.success("User updated.");
      await load();
    } catch {
      toast.error("Network error.");
    } finally {
      setSavingUserId(null);
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
          <h1 className="text-lg font-bold tracking-tight sm:text-xl">Users</h1>
          <p className="text-sm text-muted-foreground">
            {total.toLocaleString()} account{total === 1 ? "" : "s"} total
          </p>
        </div>
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search email or name"
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
              No users match this search.
            </div>
          ) : (
            <div className="space-y-3 p-3">
              {rows.map((r) => (
                <div key={r.id} className="rounded-xl border border-border/70 bg-background/50 p-3">
                  <div className="font-medium text-foreground">{r.email}</div>
                  <div className="text-xs text-muted-foreground">{r.fullName || "—"}</div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Role</p>
                      <p className="font-medium capitalize">{r.isBanned ? "banned" : r.role}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Billing</p>
                      <p className="font-medium capitalize">{r.billingPlanId}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={savingUserId === r.id}
                      onClick={() => {
                        if (!window.confirm(r.isBanned ? "Unban this user?" : "Ban this user?"))
                          return;
                        void runAction(r.id, r.isBanned ? "unbanUser" : "banUser");
                      }}
                      className="h-7 rounded-full px-2 text-xs"
                    >
                      {r.isBanned ? "Unban user" : "Ban user"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={savingUserId === r.id || !r.metaLinked}
                      onClick={() => void runAction(r.id, "unlinkAgency")}
                      className="h-7 rounded-full px-2 text-xs"
                    >
                      Unlink meta
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={savingUserId === r.id}
                      onClick={() => void runAction(r.id, "resetBilling")}
                      className="h-7 rounded-full px-2 text-xs"
                    >
                      Reset billing
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={savingUserId === r.id}
                      onClick={() => {
                        if (!window.confirm("Delete this user permanently?")) return;
                        void runAction(r.id, "deleteUser");
                      }}
                      className="h-7 rounded-full px-2 text-xs text-destructive hover:text-destructive"
                    >
                      Delete user
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Billing</th>
                <th className="px-4 py-3">Meta</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Controls</th>
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" aria-label="Loading" />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    No users match this search.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-border/80 last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{r.email}</div>
                      <div className="text-xs text-muted-foreground">{r.fullName || "—"}</div>
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-muted-foreground">
                      {r.organization || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                          r.isBanned
                            ? "bg-destructive/15 text-destructive"
                            : r.role === "admin"
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                              : "bg-muted text-muted-foreground",
                        )}
                      >
                        {r.isBanned ? "banned" : r.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <div className="capitalize">{r.billingPlanId}</div>
                      <div className="capitalize">{r.billingStatus.replace(/_/g, " ")}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.metaLinked ? (
                        <span className="text-xs">
                          Linked
                          {r.agencyId ? <span className="ml-1 font-mono">{r.agencyId}</span> : null}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={savingUserId === r.id}
                          onClick={() => {
                            if (!window.confirm(r.isBanned ? "Unban this user?" : "Ban this user?"))
                              return;
                            void runAction(r.id, r.isBanned ? "unbanUser" : "banUser");
                          }}
                          className="h-7 rounded-full px-2 text-xs"
                        >
                          {r.isBanned ? "Unban user" : "Ban user"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={savingUserId === r.id || !r.metaLinked}
                          onClick={() => void runAction(r.id, "unlinkAgency")}
                          className="h-7 rounded-full px-2 text-xs"
                        >
                          Unlink meta
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={savingUserId === r.id}
                          onClick={() => void runAction(r.id, "resetBilling")}
                          className="h-7 rounded-full px-2 text-xs"
                        >
                          Reset billing
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={savingUserId === r.id}
                          onClick={() => {
                            if (!window.confirm("Delete this user permanently?")) return;
                            void runAction(r.id, "deleteUser");
                          }}
                          className="h-7 rounded-full px-2 text-xs text-destructive hover:text-destructive"
                        >
                          Delete user
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
