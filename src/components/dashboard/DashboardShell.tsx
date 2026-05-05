"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  PieChart,
  Users,
  FileText,
  Link2,
  Settings,
  Search,
  Sun,
  Moon,
  Bell,
  ChevronRight,
  Zap,
  LogOut,
  Download,
  Plus,
  Menu,
  Building2,
  Shield,
  ArrowLeftRight,
  CreditCard,
  LifeBuoy,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const userNav: Array<{ to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }> =
  [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/dashboard/campaigns", label: "Campaigns", icon: PieChart },
    { to: "/dashboard/clients", label: "Clients", icon: Users },
    { to: "/dashboard/reports", label: "Reports", icon: FileText },
    { to: "/dashboard/billing", label: "Billing", icon: CreditCard },
    { to: "/dashboard/meta-connect", label: "Meta Connect", icon: Link2 },
    { to: "/dashboard/support", label: "Support", icon: LifeBuoy },
    { to: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

const adminNav: Array<{
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}> = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/agencies", label: "Agencies", icon: Building2 },
  { to: "/admin/billing", label: "Billing", icon: CreditCard },
  { to: "/admin/tickets", label: "Support Tickets", icon: LifeBuoy },
];

export function DashboardShell({
  children,
  variant = "user",
}: {
  children: ReactNode;
  variant?: "user" | "admin";
}) {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const nav = variant === "admin" ? adminNav : userNav;
  const [greeting, setGreeting] = useState("Good Morning");
  const [profile, setProfile] = useState<{
    full_name: string | null;
    organization: string | null;
  } | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening");
  }, []);

  useEffect(() => {
    if (!user) return;
    void fetch("/api/user/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { full_name?: string; organization?: string } | null) => {
        if (data) {
          setProfile({
            full_name: data.full_name ?? null,
            organization: data.organization ?? null,
          });
        }
      });
  }, [user]);

  const initials = (profile?.full_name || user?.email || "AU")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);

  return (
    <div className="flex min-h-screen w-full bg-gradient-soft">
      <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
        <div className="flex items-center gap-2 px-6 py-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
            {variant === "admin" ? <Shield className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
          </span>
          <div className="min-w-0">
            <span className="block text-base font-bold tracking-tight">AdReportly</span>
            {variant === "admin" ? (
              <span className="mt-0.5 inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                Admin
              </span>
            ) : null}
          </div>
        </div>

        <div className="px-4">
          <p className="px-2 pb-2 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Menu
          </p>
          <nav className="space-y-1">
            {nav.map((item) => {
              const active = isActive(item.to, item.exact);
              return (
                <Link
                  key={item.to}
                  href={item.to}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                      : "text-sidebar-foreground/70 hover:bg-muted hover:text-sidebar-foreground",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition",
                      active
                        ? "text-brand"
                        : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground",
                    )}
                  />
                  {item.label}
                  {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{profile?.full_name || "Agency"}</div>
              <div className="truncate text-xs text-muted-foreground">{user?.email}</div>
            </div>
            <a
              href="/api/auth/logout"
              aria-label="Sign out"
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </a>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex flex-wrap items-center gap-2 border-b border-border bg-background/80 px-3 py-3 backdrop-blur sm:gap-3 sm:px-6 sm:py-4 lg:px-8">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Open menu"
                className="rounded-full border-border bg-card lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[280px] border-r border-border bg-sidebar p-0 sm:w-[300px]"
            >
              <SheetHeader className="border-b border-border p-6">
                <SheetTitle asChild>
                  <Link
                    href={variant === "admin" ? "/admin" : "/dashboard"}
                    className="flex items-center gap-2"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                      {variant === "admin" ? (
                        <Shield className="h-4 w-4" />
                      ) : (
                        <Zap className="h-4 w-4" />
                      )}
                    </span>
                    <span className="text-base font-bold tracking-tight">AdReportly</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <div className="px-4 pt-4">
                <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Menu
                </p>
                <nav className="space-y-1">
                  {nav.map((item) => {
                    const active = isActive(item.to, item.exact);
                    return (
                      <SheetClose asChild key={item.to}>
                        <Link
                          href={item.to}
                          className={cn(
                            "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                            active
                              ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                              : "text-sidebar-foreground/70 hover:bg-muted hover:text-sidebar-foreground",
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-4 w-4 shrink-0 transition",
                              active
                                ? "text-brand"
                                : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground",
                            )}
                          />
                          {item.label}
                          {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand" />}
                        </Link>
                      </SheetClose>
                    );
                  })}
                </nav>
              </div>

              <div className="mt-auto p-4">
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">
                      {profile?.full_name || "Agency"}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{user?.email}</div>
                  </div>
                  <a
                    href="/api/auth/logout"
                    aria-label="Sign out"
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-bold leading-tight sm:text-xl">
              Hi, {(profile?.full_name || "there").split(" ")[0]} 👋
            </div>
            <div className="truncate text-xs text-muted-foreground sm:text-sm">{greeting}</div>
          </div>

          <div className="order-3 hidden w-full sm:order-2 sm:block sm:w-auto sm:flex-1 sm:max-w-md">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search"
                className="h-10 rounded-full border-border bg-card pl-9"
              />
            </div>
          </div>

          <div className="order-2 ml-auto flex items-center gap-2 sm:order-3">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground sm:hidden"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={toggle}
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground sm:flex"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground sm:flex"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-border bg-card p-1 text-left transition hover:bg-muted sm:px-2 sm:py-1.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-[11px] font-semibold text-primary-foreground sm:h-7 sm:w-7">
                  {initials}
                </span>
                <span className="hidden text-sm xl:block">
                  <span className="block font-semibold leading-tight">
                    {profile?.full_name || "User"}
                  </span>
                  <span className="block text-xs text-muted-foreground">{user?.email}</span>
                </span>
                <ChevronRight className="hidden h-4 w-4 text-muted-foreground xl:block" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {variant === "user" && user?.role === "admin" ? (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Shield className="mr-2 h-4 w-4" /> Admin dashboard
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                {variant === "admin" ? (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <ArrowLeftRight className="mr-2 h-4 w-4" /> Agency dashboard
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={variant === "admin" ? "/admin/billing" : "/dashboard/billing"}>
                    Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={variant === "admin" ? "/admin/tickets" : "/dashboard/support"}>
                    Support
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/api/auth/logout">
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              className="hidden rounded-full xl:inline-flex"
              asChild
            >
              <Link href="/dashboard/reports">
                <Download className="mr-2 h-4 w-4" /> Reports
              </Link>
            </Button>
            {variant === "admin" ? (
              <Button
                size="sm"
                aria-label="Open agency dashboard"
                className="rounded-full bg-primary text-primary-foreground shadow-soft hover:bg-primary/90"
                asChild
              >
                <Link href="/dashboard">
                  <ArrowLeftRight className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Agency</span>
                </Link>
              </Button>
            ) : (
              <Button
                size="sm"
                aria-label="Connect Meta or manage ads"
                className="rounded-full bg-primary text-primary-foreground shadow-soft hover:bg-primary/90"
                asChild
              >
                <Link href="/dashboard/meta-connect">
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Meta</span>
                </Link>
              </Button>
            )}
          </div>
        </header>

        <main className="min-w-0 flex-1 px-3 py-5 sm:px-6 sm:py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
