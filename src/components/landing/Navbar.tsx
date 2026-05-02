import { Link } from "@tanstack/react-router";
import { Menu, Moon, Sun, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const links = [
  { label: "Home", href: "#top" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          <Link to="/" className="group flex items-center gap-2.5 shrink-0">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-brand shadow-glow-ink transition-transform duration-300 group-hover:rotate-12 group-hover:scale-105">
              <Zap className="h-4 w-4 fill-brand" />
            </span>
            <span className="text-base font-bold tracking-tight whitespace-nowrap">
              <span className="hidden sm:inline">FB Ads Analytics</span>
              <span className="sm:hidden">FB Ads</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/40 px-1.5 py-1 backdrop-blur-md">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground"
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
            <Button asChild variant="ghost" size="sm" className="hidden rounded lg:inline-flex">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="hidden rounded bg-ink text-ink-foreground btn-brutal hover:bg-ink lg:inline-flex"
            >
              <Link to="/signup">Get Started</Link>
            </Button>

            {/* Mobile / md menu trigger */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Open menu"
                  className="rounded-full border-border/60 bg-background/60 backdrop-blur-md lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[300px] border-r border-border/60 bg-background/95 backdrop-blur-xl p-0 sm:w-[340px]"
              >
                <SheetHeader className="border-b border-border/60 p-6">
                  <SheetTitle asChild>
                    <Link
                      to="/"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-brand shadow-glow-ink">
                        <Zap className="h-4 w-4 fill-brand" />
                      </span>
                      <span className="text-base font-bold tracking-tight">
                        FB Ads Analytics
                      </span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-1 p-4">
                  {links.map((l, i) => (
                    <SheetClose asChild key={l.label}>
                      <motion.a
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * i, duration: 0.3 }}
                        href={l.href}
                        className="group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-foreground transition-all hover:bg-accent hover:pl-5"
                      >
                        <span>{l.label}</span>
                        <span className="text-muted-foreground transition-all group-hover:text-brand group-hover:translate-x-1">
                          →
                        </span>
                      </motion.a>
                    </SheetClose>
                  ))}
                </nav>

                <div className="mt-auto flex flex-col gap-2 border-t border-border/60 p-4">
                  <SheetClose asChild>
                    <Button asChild variant="outline" className="w-full rounded">
                      <Link to="/login">Sign in</Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      asChild
                      className="w-full rounded bg-ink text-ink-foreground btn-brutal hover:bg-ink"
                    >
                      <Link to="/signup">Get Started</Link>
                    </Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </motion.header>
  );
}
