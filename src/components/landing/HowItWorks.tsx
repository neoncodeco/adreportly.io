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
    <section id="how-it-works" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            How it works
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Three steps from raw data to client report
          </h2>
        </div>

        <div className="relative mt-16 grid gap-6 lg:grid-cols-3">
          {/* connecting line */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
          />
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="glass relative rounded-3xl p-7 shadow-soft hover-lift"
            >
              <div className="absolute -top-5 left-7 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-primary text-sm font-bold text-primary-foreground shadow-glow">
                {i + 1}
              </div>
              <s.icon className="h-7 w-7 text-primary" />
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
