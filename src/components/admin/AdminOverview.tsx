"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Users, Shield, Building2, Link2, Share2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Totals = {
  totalUsers: number;
  adminUsers: number;
  usersWithAgency: number;
  totalAgencies: number;
  totalShareLinks: number;
};

const cards = [
  {
    key: "totalUsers" as const,
    label: "Registered users",
    icon: Users,
    accent: "from-violet-500/20 to-fuchsia-500/10",
    iconBg: "bg-violet-500/15 text-violet-500",
  },
  {
    key: "adminUsers" as const,
    label: "Admin accounts",
    icon: Shield,
    accent: "from-amber-500/20 to-orange-500/10",
    iconBg: "bg-amber-500/15 text-amber-500",
  },
  {
    key: "usersWithAgency" as const,
    label: "Meta linked users",
    icon: Link2,
    accent: "from-emerald-500/20 to-teal-500/10",
    iconBg: "bg-emerald-500/15 text-emerald-500",
  },
  {
    key: "totalAgencies" as const,
    label: "Agency records",
    icon: Building2,
    accent: "from-sky-500/20 to-blue-500/10",
    iconBg: "bg-sky-500/15 text-sky-500",
  },
  {
    key: "totalShareLinks" as const,
    label: "Share links",
    icon: Share2,
    accent: "from-primary/25 to-primary/5",
    iconBg: "bg-primary/15 text-primary",
  },
];

export function AdminOverview() {
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/overview", { credentials: "include" });
      const json = (await res.json()) as { success?: boolean; error?: string; totals?: Totals };
      if (!res.ok || json.success === false) {
        if (res.status === 403) {
          setErr("You do not have admin access.");
        } else {
          setErr(typeof json.error === "string" ? json.error : "Could not load overview");
        }
        setTotals(null);
        return;
      }
      setTotals(json.totals ?? null);
    } catch {
      setErr("Network error");
      setTotals(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const values = useMemo(() => {
    const t = totals;
    return Object.fromEntries(cards.map((c) => [c.key, t?.[c.key] ?? 0])) as Record<
      (typeof cards)[number]["key"],
      number
    >;
  }, [totals]);

  if (loading && !totals) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center rounded-3xl border border-border bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-label="Loading" />
      </div>
    );
  }

  if (err) {
    return (
      <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <p className="text-sm font-medium text-destructive">{err}</p>
        <button
          type="button"
          className="mt-4 text-sm font-semibold text-primary underline"
          onClick={() => void load()}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5 sm:space-y-6"
    >
      <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        Platform snapshot. Promote users in MongoDB by setting{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
          role
        </code>{" "}
        to{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
          &quot;admin&quot;
        </code>
        . Manage agencies in{" "}
        <Link href="/admin/agencies" className="font-semibold text-primary hover:underline">
          Agencies
        </Link>{" "}
        and accounts in{" "}
        <Link href="/admin/users" className="font-semibold text-primary hover:underline">
          Users
        </Link>
        .
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {cards.map((c) => (
          <div
            key={c.key}
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant sm:p-5",
              c.key === "totalShareLinks" && "col-span-2 lg:col-span-1",
            )}
          >
            <div
              className={cn(
                "pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-60 blur-2xl",
                c.accent,
              )}
            />
            <div className="relative flex items-start justify-between">
              <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", c.iconBg)}>
                <c.icon className="h-4 w-4" />
              </span>
            </div>
            <div className="relative mt-3 sm:mt-4">
              <div className="text-xl font-bold leading-tight sm:text-2xl">
                {values[c.key].toLocaleString()}
              </div>
              <div className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                {c.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
