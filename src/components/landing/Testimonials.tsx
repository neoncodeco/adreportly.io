import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    name: "Sarah Ahmed",
    role: "Founder, Hive Marketing",
    quote:
      "We replaced three tools with this. Our clients adore the share links — no more screenshots in WhatsApp.",
    initials: "SA",
    accent: "bg-brand text-brand-foreground",
  },
  {
    name: "Rakib Hassan",
    role: "Performance Lead, BoostBD",
    quote:
      "The ROAS dashboard alone saved us hours per week. Reports our team used to build manually now take 30 seconds.",
    initials: "RH",
    accent: "bg-accent text-ink",
  },
  {
    name: "Mira Chen",
    role: "Director, Pixel & Penny",
    quote:
      "Beautiful UI, real-time data, and rock-solid encryption. This is the FB ads tool agencies have been waiting for.",
    initials: "MC",
    accent: "bg-warning text-ink",
  },
  {
    name: "Tomás Vega",
    role: "Growth, Lumen Studio",
    quote:
      "Onboarded a new client in under 5 minutes. The shareable read-only view is genius — they can't break anything.",
    initials: "TV",
    accent: "bg-success text-ink",
  },
  {
    name: "Aisha Rahman",
    role: "CEO, Fashion House BD",
    quote:
      "As a client, I finally get clean weekly reports without back-and-forth emails. Game changer.",
    initials: "AR",
    accent: "bg-brand text-brand-foreground",
  },
];

export function Testimonials() {
  const [active, setActive] = useState(0);
  const total = testimonials.length;

  const go = (dir: number) => setActive((a) => (a + dir + total) % total);
  const current = testimonials[active];

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink">
            Loved by agencies
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-5xl">
            What our customers say
          </h2>
        </div>

        {/* Featured testimonial */}
        <div className="mt-12 grid gap-8 lg:grid-cols-5 lg:items-stretch">
          <div className="lg:col-span-3 flex">
            <div className="relative flex flex-col w-full rounded card-brutal bg-card p-8 sm:p-10">
              <Quote className="absolute -top-4 -left-4 h-12 w-12 rounded card-brutal bg-brand p-2 text-brand-foreground" />

              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="h-5 w-5 fill-warning text-warning" />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="mt-5 text-lg font-medium leading-relaxed text-foreground sm:text-xl">
                    "{current.quote}"
                  </p>

                  <div className="mt-7 flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded card-brutal text-base font-bold ${current.accent}`}
                    >
                      {current.initials}
                    </div>
                    <div>
                      <div className="text-base font-semibold">{current.name}</div>
                      <div className="text-sm text-muted-foreground">{current.role}</div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-auto pt-8 flex items-center justify-between border-t-2 border-ink/10">
                <div className="pt-5 flex items-center justify-between w-full" style={{display:'none'}}>
                <div className="flex gap-2">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActive(i)}
                      aria-label={`Show testimonial ${i + 1}`}
                      className={`h-2.5 rounded-full transition-all ${
                        i === active ? "w-8 bg-ink" : "w-2.5 bg-ink/25 hover:bg-ink/50"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => go(-1)}
                    className="rounded card-brutal h-10 w-10 bg-card"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => go(1)}
                    className="rounded card-brutal h-10 w-10 bg-card"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Side list */}
          <div className="lg:col-span-2 space-y-3">
            {testimonials.map((t, i) => (
              <button
                key={t.name}
                onClick={() => setActive(i)}
                className={`w-full text-left rounded card-brutal p-4 transition-all ${
                  i === active
                    ? "bg-brand text-brand-foreground translate-x-0"
                    : "bg-card hover:-translate-y-0.5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded text-sm font-bold border-2 border-ink ${
                      i === active ? "bg-card text-ink" : t.accent
                    }`}
                  >
                    {t.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{t.name}</div>
                    <div
                      className={`text-xs truncate ${
                        i === active ? "text-brand-foreground/80" : "text-muted-foreground"
                      }`}
                    >
                      {t.role}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
