import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/forever",
    desc: "Perfect for solo agencies getting started.",
    features: [
      "1 ad account",
      "Up to 5 campaigns",
      "7 days data retention",
      "Basic dashboard",
    ],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$50",
    period: "/month",
    desc: "Everything growing agencies need.",
    features: [
      "5 ad accounts",
      "Up to 50 campaigns",
      "90 days data retention",
      "Unlimited share links",
      "PDF & CSV reports",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For large agencies & networks.",
    features: [
      "Unlimited everything",
      "API access",
      "Custom integrations",
      "White-label options",
      "Dedicated success manager",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Pricing
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-3 text-muted-foreground">
            Start free. Upgrade when your agency grows.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={cn(
                "relative rounded-3xl border p-8 shadow-soft hover-lift",
                p.highlight
                  ? "border-primary/40 bg-gradient-primary text-primary-foreground shadow-glow"
                  : "border-border bg-card",
              )}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-card px-3 py-1 text-xs font-semibold text-primary shadow-soft">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{p.price}</span>
                <span className={cn("text-sm", p.highlight ? "text-primary-foreground/80" : "text-muted-foreground")}>
                  {p.period}
                </span>
              </div>
              <p className={cn("mt-2 text-sm", p.highlight ? "text-primary-foreground/85" : "text-muted-foreground")}>
                {p.desc}
              </p>

              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        p.highlight ? "text-primary-foreground" : "text-primary",
                      )}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={cn(
                  "mt-8 w-full rounded-full",
                  p.highlight
                    ? "bg-card text-primary hover:bg-card/90"
                    : "bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95",
                )}
              >
                <Link to="/signup">{p.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
