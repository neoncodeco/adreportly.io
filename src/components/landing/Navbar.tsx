import { Link } from "@tanstack/react-router";
import { Menu, Moon, Sun, Zap, ArrowRight } from "lucide-react";
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
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 w-full"
    >
      <div
        className={cn(
          "px-3 sm:px-4 lg:px-6 transition-all duration-300",
          scrolled ? "pt-3" : "pt-4 sm:pt-5",
        )}
      >
        <nav
          className={cn(
            "mx-auto flex max-w-6xl items-center justify-between gap-3 rounded bg-background px-3 py-2 transition-all duration-300 sm:px-4",
            scrolled
              ? "card-brutal shadow-brutal"
              : "border-2 border-ink/15",
          )}
        >
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-2 shrink-0 pl-1">
            <span className="relative flex h-9 w-9 items-center justify-center rounded bg-brand text-ink border-2 border-ink transition-transform duration-300 group-hover:rotate-12">
              <Zap className="h-4 w-4 fill-ink" />
            </span>
            <span className="text-sm font-bold tracking-tight whitespace-nowrap sm:text-base">
              <span className="hidden sm:inline">FB Ads Analytics</span>
              <span className="sm:hidden">FB Ads</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-0.5 lg:flex">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="whitespace-nowrap rounded px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-ink"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label="Toggle theme"
              className="rounded-full h-9 w-9 hover:bg-accent"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden rounded-full lg:inline-flex"
            >
              <Link to="/login">Sign in</Link>
            </Button>

            <Button
              asChild
              size="sm"
              className="hidden rounded-full bg-brand text-brand-foreground btn-brutal h-9 px-4 hover:bg-brand lg:inline-flex"
            >
              <Link to="/signup">
                Get Started <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>

            {/* Mobile / md menu trigger */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Open menu"
                  className="rounded-full h-9 w-9 border-2 border-ink bg-card lg:hidden"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] border-l-2 border-ink bg-background p-0 sm:w-[340px]"
              >
                <SheetHeader className="border-b-2 border-ink/10 p-5">
                  <SheetTitle asChild>
                    <Link
                      to="/"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-ink border-2 border-ink">
                        <Zap className="h-4 w-4 fill-ink" />
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
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * i, duration: 0.3 }}
                        href={l.href}
                        className="group flex items-center justify-between rounded px-4 py-3 text-sm font-semibold text-foreground transition-all hover:bg-accent"
                      >
                        <span>{l.label}</span>
                        <span className="text-muted-foreground transition-all group-hover:text-ink group-hover:translate-x-1">
                          →
                        </span>
                      </motion.a>
                    </SheetClose>
                  ))}
                </nav>

                <div className="mt-auto flex flex-col gap-2 border-t-2 border-ink/10 p-4">
                  <SheetClose asChild>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full rounded bg-card btn-brutal h-auto py-3 hover:bg-card"
                    >
                      <Link to="/login">Sign in</Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      asChild
                      className="w-full rounded bg-brand text-brand-foreground btn-brutal h-auto py-3 hover:bg-brand"
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
