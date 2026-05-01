import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass border-b border-border/60">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-2">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-brand shadow-glow-ink transition-transform duration-300 group-hover:rotate-12">
              <Zap className="h-4 w-4 fill-brand" />
            </span>
            <span className="text-base font-bold tracking-tight">FB Ads Analytics</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {[
              { label: "Features", href: "#features" },
              { label: "How it works", href: "#how-it-works" },
              { label: "Pricing", href: "#pricing" },
              { label: "FAQ", href: "#faq" },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="story-link text-sm text-muted-foreground transition hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="rounded-full bg-ink text-ink-foreground hover:bg-ink/90"
            >
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
