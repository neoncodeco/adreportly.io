import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight, PlayCircle, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bar, BarChart, ResponsiveContainer, XAxis, Cell } from "recharts";
import { mockSpendTrend } from "@/lib/mock-data";

const headline = ["Turn", "ad", "spend", "into"];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      {/* Decorative animated blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-10 h-[28rem] w-[28rem] rounded-full bg-brand/30 opacity-70 blur-3xl animate-float-slow"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-32 h-96 w-96 animate-blob bg-gradient-brand opacity-25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid opacity-[0.35]"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-32">
        {/* Left: copy */}
        <div>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-md shadow-soft"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
            </span>
            <Sparkles className="h-3.5 w-3.5 text-ink" />
            Real-time Facebook Ads insights
          </motion.span>

          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-[4.25rem]">
            {headline.map((w, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.55, delay: 0.05 * i, ease: "easeOut" }}
                className="mr-3 inline-block text-ink"
              >
                {w}
              </motion.span>
            ))}
            <br />
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              className="relative inline-block"
            >
              <span className="relative z-10 text-brand-foreground">measurable ROI</span>
              <span
                aria-hidden
                className="absolute inset-0 -z-0 -skew-x-6 bg-brand"
              />
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-6 max-w-xl text-lg text-muted-foreground"
          >
            The all-in-one analytics platform agencies use to track Facebook
            campaigns, generate stunning client reports, and share secure
            read-only dashboards in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <div className="glow-ring rounded-full">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-ink px-7 text-ink-foreground hover:bg-ink/90"
              >
                <Link to="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-border bg-card/70 backdrop-blur hover-scale"
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-10 flex items-center gap-6 text-sm text-muted-foreground"
          >
            <div className="flex -space-x-2">
              {["F", "T", "A", "M"].map((c) => (
                <div
                  key={c}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-ink text-xs font-semibold text-ink-foreground shadow-soft"
                >
                  {c}
                </div>
              ))}
            </div>
            <span>
              <span className="font-semibold text-foreground">500+ agencies</span>{" "}
              tracking ৳120M+ in ad spend
            </span>
          </motion.div>
        </div>

        {/* Right: glassmorphic floating card */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.2, ease: "easeOut" }}
          className="relative"
        >
          <div className="animate-float">
            <div className="glass-strong relative overflow-hidden rounded-3xl p-6 shadow-elevated">
              {/* Internal accent gradient */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand/40 blur-2xl"
              />

              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Live ROI Tracking
                  </p>
                  <h3 className="mt-1 font-display text-3xl font-bold text-ink">
                    ৳477,710.00
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +4,397.8%
                </span>
              </div>

              <div className="relative mt-6 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockSpendTrend.slice(-14)} barCategoryGap={4}>
                    <XAxis dataKey="label" hide />
                    <Bar
                      dataKey="spend"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={14}
                    >
                      {mockSpendTrend.slice(-14).map((_, i) => (
                        <Cell key={i} fill="var(--ink)" />
                      ))}
                    </Bar>
                    <Bar
                      dataKey="results"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={14}
                    >
                      {mockSpendTrend.slice(-14).map((_, i) => (
                        <Cell key={i} fill="var(--brand)" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "ROAS", value: "6.55×" },
                  { label: "CTR", value: "2.4%" },
                  { label: "CPC", value: "৳12.7" },
                ].map((m, i) => (
                  <motion.div
                    key={m.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="rounded-xl border border-border/60 bg-background/60 px-3 py-2 backdrop-blur"
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {m.label}
                    </div>
                    <div className="text-base font-bold text-foreground">
                      {m.value}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating mini badges */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute -left-6 top-12 hidden rounded-2xl border border-border bg-card px-4 py-3 shadow-elevated backdrop-blur sm:block"
          >
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Today's spend
            </div>
            <div className="mt-1 text-lg font-bold text-ink">৳18,420</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="absolute -right-4 -bottom-2 hidden items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-elevated sm:inline-flex"
          >
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="text-xs font-semibold text-foreground">
              All accounts synced
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Logo strip */}
      <div className="relative border-t border-border/60 bg-background/40 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Trusted by</span>
            {["Hive Marketing", "BoostBD", "Pixel & Penny", "Lumen Studio", "Fashion House BD"].map((n) => (
              <span key={n} className="opacity-70 transition hover:opacity-100">
                {n}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
