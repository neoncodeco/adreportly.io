"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  Zap,
  LogOut,
  Menu,
  Building2,
  Shield,
  ArrowLeftRight,
  CreditCard,
  LifeBuoy,
  BookOpen,
  Megaphone,
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
import {
  DASHBOARD_OVERVIEW_STALE_MS,
  SHELL_NOTIFICATIONS_STALE_MS,
  SHELL_PROFILE_STALE_MS,
  dashboardQk,
  fetchDashboardOverview,
  fetchNotificationsPayload,
  fetchUserProfileSnippet,
  shellQk,
  type NotificationsPayload,
} from "@/lib/dashboard-queries";

const userNav: Array<{ to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }> =
  [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/dashboard/campaigns", label: "Campaigns", icon: PieChart },
    { to: "/dashboard/clients", label: "Clients", icon: Users },
    { to: "/dashboard/reports", label: "Reports", icon: FileText },
    { to: "/dashboard/billing", label: "Billing", icon: CreditCard },
    { to: "/dashboard/meta-connect", label: "Meta Connect", icon: Link2 },
    { to: "/dashboard/docs", label: "Docs", icon: BookOpen },
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
  { to: "/admin/notice", label: "Notice", icon: Megaphone },
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
  const queryClient = useQueryClient();
  const nav = variant === "admin" ? adminNav : userNav;
  const [greeting, setGreeting] = useState("Good Morning");
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: shellQk.profile(),
    queryFn: fetchUserProfileSnippet,
    enabled: Boolean(user),
    staleTime: SHELL_PROFILE_STALE_MS,
    select: (d) => ({
      full_name: d.full_name ? d.full_name : null,
      organization: d.organization ? d.organization : null,
    }),
  });

  const { data: notifData } = useQuery({
    queryKey: shellQk.notifications(),
    queryFn: fetchNotificationsPayload,
    enabled: Boolean(user),
    staleTime: SHELL_NOTIFICATIONS_STALE_MS,
    refetchInterval: 20_000,
  });

  const notifications = notifData?.notifications ?? [];
  const unreadCount = notifData?.unreadCount ?? 0;

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ all: true }),
      });
      if (!res.ok) throw new Error("Failed to mark notifications read");
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: shellQk.notifications() });
      const prev = queryClient.getQueryData<NotificationsPayload>(shellQk.notifications());
      queryClient.setQueryData<NotificationsPayload | undefined>(shellQk.notifications(), (old) =>
        old
          ? {
              ...old,
              unreadCount: 0,
              notifications: old.notifications.map((n) => ({ ...n, read: true })),
            }
          : old,
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(shellQk.notifications(), ctx.prev);
    },
  });

  const markOneReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch("/api/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to mark notification read");
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: shellQk.notifications() });
      const prev = queryClient.getQueryData<NotificationsPayload>(shellQk.notifications());
      queryClient.setQueryData<NotificationsPayload | undefined>(shellQk.notifications(), (old) => {
        if (!old) return old;
        const next = old.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
        const unread = next.reduce((acc, n) => acc + (n.read ? 0 : 1), 0);
        return { ...old, notifications: next, unreadCount: unread };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(shellQk.notifications(), ctx.prev);
    },
  });

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening");
  }, []);

  useEffect(() => {
    if (!user || variant !== "user") return;
    void queryClient.prefetchQuery({
      queryKey: dashboardQk.overview(),
      queryFn: fetchDashboardOverview,
      staleTime: DASHBOARD_OVERVIEW_STALE_MS,
    });
  }, [user, variant, queryClient]);

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
            <DropdownMenu
              onOpenChange={(open) => {
                if (open && unreadCount > 0) markAllReadMutation.mutate();
              }}
            >
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="relative hidden h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground sm:flex"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 ? (
                    <span className="absolute right-1.5 top-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-foreground">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  ) : null}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[360px] p-0">
                <div className="border-b border-border px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">Notifications</p>
                    <span className="text-xs text-muted-foreground">
                      {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                    </span>
                  </div>
                </div>
                <div className="max-h-[340px] overflow-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <DropdownMenuItem
                        key={n.id}
                        className="cursor-pointer items-start gap-3 px-4 py-3"
                        asChild={Boolean(n.link)}
                        onSelect={() => {
                          if (!n.read) markOneReadMutation.mutate(n.id);
                        }}
                      >
                        {n.link ? (
                          <Link href={n.link}>
                            <span
                              className={cn(
                                "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                                n.read ? "bg-muted-foreground/30" : "bg-brand",
                              )}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-semibold">{n.title}</div>
                              <div className="line-clamp-2 text-xs text-muted-foreground">
                                {n.message}
                              </div>
                              <div className="mt-1 text-[10px] text-muted-foreground">
                                {new Date(n.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </Link>
                        ) : (
                          <>
                            <span
                              className={cn(
                                "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                                n.read ? "bg-muted-foreground/30" : "bg-brand",
                              )}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-semibold">{n.title}</div>
                              <div className="line-clamp-2 text-xs text-muted-foreground">
                                {n.message}
                              </div>
                              <div className="mt-1 text-[10px] text-muted-foreground">
                                {new Date(n.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </>
                        )}
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center rounded-full border border-border bg-card p-1 text-left transition hover:bg-muted">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-[11px] font-semibold text-primary-foreground sm:h-7 sm:w-7">
                  {initials}
                </span>
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
            ) : null}
          </div>
        </header>

        <main className="min-w-0 flex-1 px-3 py-5 sm:px-6 sm:py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
