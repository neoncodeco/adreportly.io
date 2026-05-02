"use client";

import { motion } from "framer-motion";
import { Lock, Zap, LineChart, Users, Globe, FileText } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Real-time sync",
    desc: "Direct Graph API calls — never stale, always live.",
  },
  {
    icon: Lock,
    title: "AES-256 encryption",
    desc: "Access tokens encrypted at rest and never exposed.",
  },
  { icon: LineChart, title: "Beautiful charts", desc: "Spend, results, ROAS visualized clearly." },
  { icon: Users, title: "Multi-client", desc: "Manage unlimited clients from a single dashboard." },
  { icon: Globe, title: "Secure share links", desc: "UUID tokens that expire automatically." },
  {
    icon: FileText,
    title: "PDF & CSV export",
    desc: "One-click branded reports your clients will love.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink">
            Features
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Built for ads agencies that ship reports daily
          </h2>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              className="group relative overflow-hidden rounded card-brutal bg-card p-7 hover-lift"
            >
              {/* Always-on gradient accent */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand/40 blur-3xl"
              />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-ink text-brand">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="relative mt-5 text-base font-bold tracking-tight">{f.title}</h3>
              <p className="relative mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
