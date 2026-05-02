"use client";

import { motion } from "framer-motion";
import { Eye, Pencil, Plus, Filter, Search, Mail } from "lucide-react";
import { mockClients } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ClientsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Clients</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">Manage your agency clients</p>
        </div>
        <Button className="rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95 sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Add new client
        </Button>
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            className="h-10 rounded-full border-border bg-card pl-9"
          />
        </div>
        <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-full">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
        {mockClients.map((c) => (
          <div
            key={c.id}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant"
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-sm font-bold text-primary-foreground shadow-glow">
                {c.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{c.name}</p>
                <p className="truncate text-xs text-muted-foreground">{c.organization}</p>
                <span className="mt-1.5 inline-flex items-center rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-success">
                  Active
                </span>
              </div>
            </div>

            <div className="relative mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{c.email}</span>
            </div>

            <div className="relative mt-3 flex items-center justify-between border-t border-border/60 pt-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Accounts
                </div>
                <div className="text-base font-bold tabular-nums">{c.accounts}</div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden rounded-3xl border border-border bg-card p-6 shadow-soft lg:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 pr-4">Client</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4 text-center">Accounts</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Last Login</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockClients.map((c) => (
                <tr key={c.id} className="border-t border-border/60">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                        {c.initials}
                      </span>
                      <div>
                        <div className="font-semibold">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.organization}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-muted-foreground">{c.email}</td>
                  <td className="py-4 pr-4 text-center tabular-nums">{c.accounts}</td>
                  <td className="py-4 pr-4">
                    <span className="inline-flex items-center rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">
                      Active
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-muted-foreground">{c.last_login || "Never"}</td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
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
