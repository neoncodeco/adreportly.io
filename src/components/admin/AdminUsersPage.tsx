"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  email: string;
  fullName: string;
  organization: string;
  role: "user" | "admin";
  metaLinked: boolean;
  createdAt: string | null;
};

export function AdminUsersPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const params = new URLSearchParams({ limit: "50", skip: "0" });
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
  }, [q]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 280);
    return () => clearTimeout(t);
  }, [load]);

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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Meta</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" aria-label="Loading" />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
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
                          r.role === "admin"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {r.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.metaLinked ? "Linked" : "—"}
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
