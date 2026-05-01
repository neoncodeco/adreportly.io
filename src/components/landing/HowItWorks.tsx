import { motion } from "framer-motion";
import { Facebook, BarChart3, Share2 } from "lucide-react";

const steps = [
  {
    icon: Facebook,
    title: "Connect Facebook",
    desc: "Securely link your ad accounts in one click. Tokens are encrypted with AES-256 — never stored in plaintext.",
  },
  {
    icon: BarChart3,
    title: "Analyze Data",
    desc: "Real-time insights pulled directly from the Graph API. Spend, ROAS, CTR, CPC — all updated live.",
  },
  {
    icon: Share2,
    title: "Share Reports",
    desc: "Generate secure UUID share links that expire automatically. Clients view read-only dashboards — no login required.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink">
            How it works
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Three steps from raw data to{" "}
            <span className="relative inline-block">
              <span className="relative z-10">client report</span>
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-1 -z-0 h-3 -skew-x-6 bg-brand"
              />
            </span>
          </h2>
        </div>

        <div className="relative mt-20 grid gap-8 lg:grid-cols-3">
          {/* connecting dashed line */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
          />
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: i * 0.15 }}
              className="group relative rounded-3xl border border-border bg-card p-8 shadow-soft hover-lift"
            >
              <div className="absolute -top-6 left-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-base font-bold text-ink-foreground shadow-glow-ink ring-4 ring-background">
                {i + 1}
              </div>
              <div className="mt-2 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-ink transition-all duration-500 group-hover:bg-brand group-hover:rotate-6">
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold tracking-tight">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
