import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Share2, MoreHorizontal } from "lucide-react";
import { mockRecentCampaigns } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/campaigns")({
  component: CampaignsPage,
});

const statusStyle: Record<string, string> = {
  active: "bg-success/15 text-success",
  paused: "bg-warning/15 text-warning-foreground",
  completed: "bg-muted text-muted-foreground",
};

function CampaignsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="text-sm text-muted-foreground">All Facebook ad campaigns across your accounts</p>
        </div>
      </div>

      <div className="glass rounded-3xl p-6 shadow-soft">
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
                  <td className="py-4 pr-4 text-right tabular-nums">{(Math.random() * 3 + 1).toFixed(2)}%</td>
                  <td className="py-4 pr-4 text-right tabular-nums">৳{(Math.random() * 15 + 5).toFixed(2)}</td>
                  <td className="py-4 pr-4 text-right font-semibold tabular-nums">{c.roas.toFixed(2)}×</td>
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
