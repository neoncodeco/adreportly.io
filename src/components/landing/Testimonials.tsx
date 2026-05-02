import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Ahmed",
    role: "Founder, Hive Marketing",
    quote:
      "We replaced three tools with this. Our clients adore the share links — no more screenshots in WhatsApp.",
    initials: "SA",
  },
  {
    name: "Rakib Hassan",
    role: "Performance Lead, BoostBD",
    quote:
      "The ROAS dashboard alone saved us hours per week. Reports our team used to build manually now take 30 seconds.",
    initials: "RH",
  },
  {
    name: "Mira Chen",
    role: "Director, Pixel & Penny",
    quote:
      "Beautiful UI, real-time data, and rock-solid encryption. This is the FB ads tool agencies have been waiting for.",
    initials: "MC",
  },
  {
    name: "Tomás Vega",
    role: "Growth, Lumen Studio",
    quote:
      "Onboarded a new client in under 5 minutes. The shareable read-only view is genius — they can't break anything.",
    initials: "TV",
  },
  {
    name: "Aisha Rahman",
    role: "CEO, Fashion House BD",
    quote:
      "As a client, I finally get clean weekly reports without back-and-forth emails. Game changer.",
    initials: "AR",
  },
];

export function Testimonials() {
  // Duplicate for seamless infinite scroll
  const scrolling = [...testimonials, ...testimonials];

  return (
    <section className="overflow-hidden py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink">
            Loved by agencies
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-5xl">
            What our customers say
          </h2>
        </div>
      </div>

      <div className="relative mt-12 overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

        <motion.div
          className="flex gap-5"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        >
          {scrolling.map((t, i) => (
            <div
              key={i}
              className="w-[340px] shrink-0 rounded card-brutal bg-card p-6"
            >
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-foreground">"{t.quote}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-semibold text-ink-foreground">
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
