"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

type AgencyRow = {
  agencyId: string;
  name: string;
  email: string;
  fbUserId: string | null;
  appUserId: string | null;
};

export function AdminAgenciesPage() {
  const [rows, setRows] = useState<AgencyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/agencies", { credentials: "include" });
      const json = (await res.json()) as {
        success?: boolean;
        error?: string;
        agencies?: AgencyRow[];
      };
      if (!res.ok || json.success === false) {
        if (res.status === 403) setErr("You do not have admin access.");
        else setErr(typeof json.error === "string" ? json.error : "Could not load agencies");
        setRows([]);
        return;
      }
      setRows(json.agencies ?? []);
    } catch {
      setErr("Network error");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-4 sm:space-y-5"
    >
      <div>
        <h1 className="text-lg font-bold tracking-tight sm:text-xl">Agencies</h1>
        <p className="text-sm text-muted-foreground">
          Meta OAuth rows (tokens are never shown here). {rows.length.toLocaleString()} record
          {rows.length === 1 ? "" : "s"}.
        </p>
      </div>

      {err ? (
        <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm font-medium text-destructive">
          {err}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Agency ID</th>
                <th className="px-4 py-3">Name / email</th>
                <th className="px-4 py-3">Facebook user</th>
                <th className="px-4 py-3">App user</th>
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-16 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" aria-label="Loading" />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
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
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {r.fbUserId ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {r.appUserId ?? "—"}
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
