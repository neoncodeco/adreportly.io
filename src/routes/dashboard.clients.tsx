import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Eye, Pencil, Plus, Filter } from "lucide-react";
import { mockClients } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/dashboard/clients")({
  component: ClientsPage,
});

function ClientsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-sm text-muted-foreground">Manage your agency clients</p>
        </div>
        <Button className="rounded-full bg-foreground text-background hover:opacity-90">
          <Plus className="mr-2 h-4 w-4" /> Add new client
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Input placeholder="Search clients..." className="h-10 rounded-full border-border bg-card pl-4" />
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">
          All Status
        </button>
        <Button variant="outline" size="sm" className="rounded-full">
          <Filter className="mr-2 h-3.5 w-3.5" /> Filter
        </Button>
      </div>

      <div className="glass rounded-3xl p-6 shadow-soft">
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
