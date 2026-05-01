import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight, PlayCircle, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bar, BarChart, ResponsiveContainer, XAxis } from "recharts";
import { mockSpendTrend } from "@/lib/mock-data";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">
        {/* Left: copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Real-time Facebook Ads insights
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Turn ad spend into{" "}
            <span className="text-gradient-primary">measurable ROI</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            The all-in-one analytics platform agencies use to track Facebook campaigns,
            generate stunning client reports, and share secure read-only dashboards in seconds.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-gradient-primary px-7 text-primary-foreground shadow-glow hover:opacity-95"
            >
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-border bg-card/60 backdrop-blur"
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {["F", "T", "A", "M"].map((c) => (
                <div
                  key={c}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-gradient-primary text-xs font-semibold text-primary-foreground"
                >
                  {c}
                </div>
              ))}
            </div>
            <span>500+ agencies tracking ৳120M+ in ad spend</span>
          </div>
        </motion.div>

        {/* Right: glassmorphic floating card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          className="relative"
        >
          <div className="animate-float">
            <div className="glass-strong relative rounded-3xl p-6 shadow-elevated">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Live ROI Tracking
                  </p>
                  <h3 className="mt-1 text-2xl font-bold">৳477,710.00</h3>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +4,397.8%
                </span>
              </div>

              <div className="mt-6 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockSpendTrend.slice(-14)} barCategoryGap={4}>
                    <XAxis dataKey="label" hide />
                    <Bar
                      dataKey="spend"
                      fill="var(--chart-1)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={14}
                    />
                    <Bar
                      dataKey="results"
                      fill="var(--chart-2)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={14}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "ROAS", value: "6.55×" },
                  { label: "CTR", value: "2.4%" },
                  { label: "CPC", value: "৳12.7" },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl bg-muted/60 px-3 py-2">
                    <div className="text-[10px] font-medium uppercase text-muted-foreground">
                      {m.label}
                    </div>
                    <div className="text-sm font-bold">{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Decorative blurs */}
          <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-chart-2/30 blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
}
