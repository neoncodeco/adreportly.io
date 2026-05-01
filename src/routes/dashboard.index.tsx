import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, ChevronDown } from "lucide-react";
import { mockSpendTrend, mockTopCampaigns, mockRecentCampaigns, totalSpend } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="grid gap-6 lg:grid-cols-3"
    >
      {/* Ad Spend Trend */}
      <div className="glass rounded-3xl p-6 shadow-soft lg:col-span-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">Ad Spend Trend</h3>
            <p className="text-xs text-muted-foreground">Daily spend performance</p>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
            Last 30 Days <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-bold">৳{totalSpend.toLocaleString()}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
            <TrendingUp className="h-3 w-3" /> +4,397.8%
          </span>
        </div>

        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockSpendTrend} barCategoryGap={6}>
              <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                interval={3}
                tickLine={false}
                axisLine={false}
                stroke="var(--muted-foreground)"
                fontSize={11}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "var(--muted)" }}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              <Bar dataKey="spend" name="Spend" fill="var(--chart-1)" radius={[6, 6, 0, 0]} maxBarSize={10} />
              <Bar dataKey="results" name="Results" fill="var(--chart-2)" radius={[6, 6, 0, 0]} maxBarSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Campaigns */}
      <div className="glass rounded-3xl p-6 shadow-soft">
        <h3 className="text-lg font-bold">Top Campaigns</h3>
        <p className="text-xs text-muted-foreground">By spend (Dec 17 – Jan 16)</p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {mockTopCampaigns.map((c) => {
            const pillStyle =
              c.color === "primary"
                ? "bg-gradient-primary text-primary-foreground"
                : c.color === "dark"
                  ? "bg-foreground text-background"
                  : "bg-muted text-foreground border border-border";
            return (
              <div
                key={c.id}
                className={cn(
                  "flex h-72 flex-col items-center justify-between rounded-full px-3 py-5 text-center",
                  pillStyle,
                )}
              >
                <div
                  className="text-xs font-semibold uppercase tracking-wider opacity-90"
                  style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                >
                  {c.name}
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-full bg-background/15 px-2 py-1 text-[10px] font-medium opacity-90">
                    Spend
                  </div>
                  <div className="text-xs font-bold">{c.spend.toLocaleString()}</div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-background/20 text-xs font-bold">
                    {c.code}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Total: 3 campaigns</p>
      </div>

      {/* Recent Campaigns */}
      <div className="glass rounded-3xl p-6 shadow-soft lg:col-span-2">
        <h3 className="text-lg font-bold">Recent Campaigns</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 pr-4">No</th>
                <th className="pb-3 pr-4">Campaign Name</th>
                <th className="pb-3 pr-4 text-right">Spend</th>
                <th className="pb-3 pr-4 text-right">Results</th>
                <th className="pb-3 text-right">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {mockRecentCampaigns.slice(0, 3).map((c, i) => (
                <tr key={c.id} className="border-t border-border/60">
                  <td className="py-4 pr-4 text-muted-foreground">{i + 1}</td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                        {c.code}
                      </span>
                      <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.accounts}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-right font-medium tabular-nums">
                    {c.spend.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 pr-4 text-right tabular-nums">{c.results}</td>
                  <td className="py-4 text-right font-semibold tabular-nums">{c.roas.toFixed(2)}×</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Account Status */}
      <div className="glass relative overflow-hidden rounded-3xl p-6 shadow-soft">
        <h3 className="text-lg font-bold">Account Status</h3>
        <ul className="mt-4 space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success" /> Account Active
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success" /> Reporting Live
          </li>
        </ul>

        <div className="mt-12">
          <div className="text-5xl font-bold">3</div>
          <div className="mt-1 text-sm font-medium">Active Campaigns</div>
          <div className="text-xs text-muted-foreground">Tracking</div>
        </div>

        <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
      </div>
    </motion.div>
  );
}
