import { Link } from "@tanstack/react-router";
import { Zap, Twitter, Github, Linkedin, Mail, ArrowUpRight, Send } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const cols = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Changelog", href: "#" },
      { label: "Roadmap", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "API reference", href: "#" },
      { label: "Help center", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Security", href: "#" },
      { label: "DPA", href: "#" },
    ],
  },
];

export function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Subscribed!", { description: `We'll keep ${email} in the loop.` });
    setEmail("");
  };

  return (
    <footer className="relative overflow-hidden bg-ink text-ink-foreground">
      {/* Decorative glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-brand/20 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 right-0 h-[320px] w-[420px] rounded-full bg-primary/15 blur-[120px]"
      />

      {/* Newsletter card */}
      <div className="relative mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="rounded card-brutal bg-card p-6 text-foreground sm:p-10">
          <div className="grid gap-6 lg:grid-cols-5 lg:items-center lg:gap-10">
            <div className="lg:col-span-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-foreground">
                <Mail className="h-3 w-3" /> Newsletter
              </span>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Get growth tips for ad agencies
              </h3>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Monthly playbooks, product updates, and reporting templates. No spam, ever.
              </p>
            </div>
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col gap-3 sm:flex-row lg:col-span-2"
            >
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@agency.com"
                className="rounded card-brutal h-12 bg-background"
              />
              <Button
                type="submit"
                className="h-12 rounded bg-brand text-brand-foreground btn-brutal hover:bg-brand sm:shrink-0"
              >
                <Send className="h-4 w-4" /> Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded card-brutal bg-brand text-ink">
                <Zap className="h-5 w-5 fill-ink" />
              </span>
              <span className="text-base font-bold tracking-tight">FB Ads Analytics</span>
            </Link>
            <p className="mt-5 max-w-xs text-sm text-ink-foreground/70">
              The all-in-one platform for tracking Facebook ad campaigns and sharing
              beautiful reports with clients.
            </p>
            <div className="mt-6 flex gap-3">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="group flex h-10 w-10 items-center justify-center rounded border-2 border-ink-foreground/15 bg-ink-foreground/5 text-ink-foreground transition hover:-translate-y-0.5 hover:border-brand hover:bg-brand hover:text-ink"
                  aria-label="Social"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand">
                {c.title}
              </h4>
              <ul className="mt-5 space-y-3">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="group inline-flex items-center gap-1 text-sm text-ink-foreground/70 transition hover:text-brand"
                    >
                      {l.label}
                      <ArrowUpRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t-2 border-ink-foreground/10 pt-6 text-xs text-ink-foreground/60 sm:flex-row">
          <span>© {new Date().getFullYear()} FB Ads Analytics. All rights reserved.</span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-success animate-pulse" />
            All systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}
