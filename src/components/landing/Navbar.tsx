import { Link } from "@tanstack/react-router";
import { Moon, Sun, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Home", href: "#top" },
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 w-full"
    >
      <div
        className={cn(
          "transition-all duration-500 ease-out",
          scrolled
            ? "border-b border-border/60 bg-background/70 backdrop-blur-xl backdrop-saturate-150 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.15)]"
            : "border-b border-transparent bg-transparent backdrop-blur-0"
        )}
      >
        <nav
          className={cn(
            "mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-500",
            scrolled ? "h-16 py-3" : "h-20 py-5"
          )}
        >
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-brand shadow-glow-ink transition-transform duration-300 group-hover:rotate-12 group-hover:scale-105">
              <Zap className="h-4 w-4 fill-brand" />
            </span>
            <span className="text-base font-bold tracking-tight">FB Ads Analytics</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/40 px-1.5 py-1 backdrop-blur-md">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label="Toggle theme"
              className="rounded-full hover:bg-accent"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button asChild variant="ghost" size="sm" className="hidden rounded-full sm:inline-flex">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="rounded-full bg-ink text-ink-foreground shadow-glow-ink transition-all hover:bg-ink/90 hover:scale-105"
            >
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </nav>
      </div>
    </motion.header>
  );
}
