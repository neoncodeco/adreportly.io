"use client";

import { motion } from "framer-motion";
import { Share2, MoreHorizontal, Search, SlidersHorizontal } from "lucide-react";
import { mockRecentCampaigns } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const statusStyle: Record<string, string> = {
  active: "bg-success/15 text-success",
  paused: "bg-warning/15 text-warning-foreground",
  completed: "bg-muted text-muted-foreground",
};

export function CampaignsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Campaigns</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            All Facebook ad campaigns across your accounts
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />{" "}
            {mockRecentCampaigns.filter((c) => c.status === "active").length} Active
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold">
            Total: {mockRecentCampaigns.length}
          </span>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            className="h-10 rounded-full border-border bg-card pl-9"
          />
        </div>
        <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-full">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 lg:hidden">
        {mockRecentCampaigns.map((c) => {
          const ctr = (Math.random() * 3 + 1).toFixed(2);
          const cpc = (Math.random() * 15 + 5).toFixed(2);
          return (
            <div key={c.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-sm font-bold text-primary-foreground shadow-glow">
                  {c.code}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{c.name}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="-mr-2 h-7 w-7 shrink-0 rounded-full"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                        statusStyle[c.status],
                      )}
                    >
                      {c.status}
                    </span>
                    <span className="text-xs text-muted-foreground">· {c.accounts} accounts</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-background/50 p-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Spend
                  </div>
                  <div className="text-sm font-bold tabular-nums">
                    ৳{c.spend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Results
                  </div>
                  <div className="text-sm font-bold tabular-nums">{c.results}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    CTR · CPC
                  </div>
                  <div className="text-sm font-bold tabular-nums">
                    {ctr}% · ৳{cpc}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    ROAS
                  </div>
                  <div className="text-sm font-bold tabular-nums text-success">
                    {c.roas.toFixed(2)}×
                  </div>
                </div>
              </div>

              <Button variant="outline" size="sm" className="mt-3 w-full rounded-full">
                <Share2 className="mr-2 h-3.5 w-3.5" /> Share
              </Button>
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden rounded-3xl border border-border bg-card p-6 shadow-soft lg:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 pr-4">Campaign</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4 text-right">Spend</th>
                <th className="pb-3 pr-4 text-right">Results</th>
                <th className="pb-3 pr-4 text-right">CTR</th>
                <th className="pb-3 pr-4 text-right">CPC</th>
                <th className="pb-3 pr-4 text-right">ROAS</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockRecentCampaigns.map((c) => (
                <tr key={c.id} className="border-t border-border/60">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                        {c.code}
                      </span>
                      <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.accounts} accounts</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                        statusStyle[c.status],
                      )}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-right font-medium tabular-nums">
                    ৳{c.spend.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 pr-4 text-right tabular-nums">{c.results}</td>
                  <td className="py-4 pr-4 text-right tabular-nums">
                    {(Math.random() * 3 + 1).toFixed(2)}%
                  </td>
                  <td className="py-4 pr-4 text-right tabular-nums">
                    ৳{(Math.random() * 15 + 5).toFixed(2)}
                  </td>
                  <td className="py-4 pr-4 text-right font-semibold tabular-nums">
                    {c.roas.toFixed(2)}×
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-8 rounded-full">
                        <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <MoreHorizontal className="h-4 w-4" />
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
