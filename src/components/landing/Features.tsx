import { motion } from "framer-motion";
import { Lock, Zap, LineChart, Users, Globe, FileText } from "lucide-react";

const features = [
  { icon: Zap, title: "Real-time sync", desc: "Direct Graph API calls — never stale, always live." },
  { icon: Lock, title: "AES-256 encryption", desc: "Access tokens encrypted at rest and never exposed." },
  { icon: LineChart, title: "Beautiful charts", desc: "Spend, results, ROAS visualized clearly." },
  { icon: Users, title: "Multi-client", desc: "Manage unlimited clients from a single dashboard." },
  { icon: Globe, title: "Secure share links", desc: "UUID tokens that expire automatically." },
  { icon: FileText, title: "PDF & CSV export", desc: "One-click branded reports your clients will love." },
];

export function Features() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Features
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Built for ads agencies that ship reports daily
          </h2>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
              className="group rounded-2xl border border-border bg-card p-6 shadow-soft hover-lift"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-gradient-primary group-hover:text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
