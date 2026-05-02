import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { DollarSign, Users, BarChart3, Globe2, ShieldCheck, Clock, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

type Stat = {
  icon: typeof DollarSign;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
  desc: string;
};

const stats: Stat[] = [
  { icon: DollarSign, value: 48, prefix: "৳", suffix: "M+", label: "Ad spend tracked", desc: "Across all connected Meta accounts" },
  { icon: Users, value: 2400, suffix: "+", label: "Active agencies", desc: "Trust us with their client reporting" },
  { icon: BarChart3, value: 18500, suffix: "+", label: "Reports generated", desc: "Branded PDFs & live dashboards delivered" },
  { icon: Globe2, value: 32, suffix: "+", label: "Countries", desc: "Agencies running campaigns worldwide" },
  { icon: ShieldCheck, value: 99.9, decimals: 1, suffix: "%", label: "Uptime SLA", desc: "Reliable infrastructure, always on" },
  { icon: Clock, value: 12, suffix: "×", label: "Faster reporting", desc: "Compared to manual spreadsheet workflows" },
];

function useCountUp(target: number, decimals = 0, duration = 1600) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const p = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - p, 3);
              setVal(target * eased);
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  const formatted =
    decimals > 0
      ? val.toFixed(decimals)
      : val >= 1000
        ? Math.floor(val).toLocaleString()
        : Math.floor(val).toString();

  return { ref, formatted };
}

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const { ref, formatted } = useCountUp(stat.value, stat.decimals ?? 0);
  const Icon = stat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition group-hover:bg-primary/15" />
      <div className="relative">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="mt-5 flex items-baseline gap-1">
          {stat.prefix && (
            <span className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              {stat.prefix}
            </span>
          )}
          <span
            ref={ref}
            className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            {formatted}
          </span>
          {stat.suffix && (
            <span className="font-display text-2xl font-bold text-primary sm:text-3xl">
              {stat.suffix}
            </span>
          )}
        </div>
        <h3 className="mt-2 text-sm font-semibold text-foreground">{stat.label}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{stat.desc}</p>
      </div>
    </motion.div>
  );
}

export function Stats() {
  return (
    <section id="stats" className="relative border-y border-border bg-muted/30 py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink">
            By the numbers
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Trusted by agencies, proven at scale
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Real numbers from real teams using our platform every day to manage Meta ad
            campaigns and deliver client reports.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((s, i) => (
            <StatCard key={s.label} stat={s} index={i} />
          ))}
        </div>

        <GetStartedCTA />
      </div>
    </section>
  );
}

function GetStartedCTA() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleClick = () => {
    if (user) {
      navigate({ to: "/dashboard" });
    } else {
      navigate({ to: "/login" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="relative mt-16 overflow-hidden rounded-2xl border border-border bg-card p-8 text-center shadow-soft sm:p-10"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
      <div className="relative">
        <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <h3 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Ready to join thousands of agencies?
        </h3>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          Start your 14-day free trial — no credit card required. Connect Meta in
          minutes and ship branded reports today.
        </p>

        <Button size="lg" className="mt-6 gap-2 rounded bg-ink text-ink-foreground shadow-glow-ink transition-all hover:bg-ink/90 hover:scale-[1.02]" onClick={handleClick}>
          Get Started <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
