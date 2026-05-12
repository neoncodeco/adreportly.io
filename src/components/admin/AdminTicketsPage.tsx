"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Search, ArrowLeft, Send, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ADMIN_PAGE_SIZE,
  ADMIN_STALE_MS,
  adminQk,
  fetchAdminTicketDetail,
  fetchAdminTickets,
  patchAdmin,
  postAdmin,
  type AdminTicketCategory as TicketCategory,
  type AdminTicketDetail as TicketDetail,
  type AdminTicketPriority as TicketPriority,
  type AdminTicketRow as TicketRow,
  type AdminTicketStatus as TicketStatus,
} from "@/lib/admin-queries";
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  priorityClass,
  statusClass,
} from "@/components/support/ticket-utils";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3 },
};

export function AdminTicketsPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"list" | "detail">("list");
  const [q, setQ] = useState("");
  const deferredQ = useDeferredValue(q);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [deferredQ, status, priority, category]);

  const { data, isPending, isError, error, isFetching, isPlaceholderData, refetch } = useQuery({
    queryKey: adminQk.tickets(page, ADMIN_PAGE_SIZE, deferredQ, status, priority, category),
    queryFn: () => fetchAdminTickets(page, ADMIN_PAGE_SIZE, deferredQ, status, priority, category),
    staleTime: ADMIN_STALE_MS,
    placeholderData: keepPreviousData,
  });

  const tickets = data?.tickets ?? [];
  const total = data?.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const canPrev = page > 1;
  const canNext = page < lastPage;

  const {
    data: detailData,
    isPending: loadingDetail,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: adminQk.ticketDetail(activeTicketId ?? ""),
    queryFn: () => fetchAdminTicketDetail(activeTicketId ?? ""),
    enabled: view === "detail" && Boolean(activeTicketId),
    staleTime: ADMIN_STALE_MS,
  });

  const openDetail = (id: string) => {
    setActiveTicketId(id);
    setView("detail");
  };

  return (
    <div className="space-y-5">
      <AnimatePresence mode="wait">
        {view === "list" ? (
          <motion.div key="list" {...fadeUp} className="space-y-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-xl font-bold sm:text-2xl">Support Tickets</h1>
                <p className="text-sm text-muted-foreground">
                  {total.toLocaleString()} ticket{total === 1 ? "" : "s"} total.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search tickets..."
                    className="h-10 rounded-full pl-9"
                  />
                </div>
                <FilterSelect
                  value={status}
                  onChange={setStatus}
                  placeholder="All status"
                  options={Object.entries(STATUS_LABELS)}
                />
                <FilterSelect
                  value={priority}
                  onChange={setPriority}
                  placeholder="All priority"
                  options={Object.entries(PRIORITY_LABELS)}
                />
                <FilterSelect
                  value={category}
                  onChange={setCategory}
                  placeholder="All category"
                  options={Object.entries(CATEGORY_LABELS)}
                />
              </div>
            </div>

            {isError ? (
              <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-sm font-medium text-destructive">
                {error instanceof Error ? error.message : "Could not load tickets."}
              </div>
            ) : null}

            <div
              className={cn(
                "overflow-hidden rounded-2xl border border-border bg-card shadow-soft",
                isFetching && isPlaceholderData && "opacity-80",
              )}
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isPending && tickets.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-14 text-center text-muted-foreground">
                          <Loader2 className="mx-auto h-7 w-7 animate-spin" />
                        </td>
                      </tr>
                    ) : tickets.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                          No tickets match this filter.
                        </td>
                      </tr>
                    ) : (
                      tickets.map((t) => (
                        <tr
                          key={t.id}
                          onClick={() => void openDetail(t.id)}
                          className="cursor-pointer border-b border-border/70 last:border-0 hover:bg-muted/30"
                        >
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                            {t.ticketNumber}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium leading-tight">{t.userName || "—"}</div>
                            <div className="text-xs text-muted-foreground">{t.userEmail}</div>
                          </td>
                          <td className="max-w-[220px] px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              {!t.lastRepliedByAdmin &&
                                t.repliesCount > 0 &&
                                t.status !== "closed" && (
                                  <span className="h-2 w-2 shrink-0 rounded-full bg-brand" />
                                )}
                              <span className="line-clamp-1 font-medium">{t.subject}</span>
                            </div>
                            {t.repliesCount > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {t.repliesCount} {t.repliesCount === 1 ? "reply" : "replies"}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {CATEGORY_LABELS[t.category]}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                                priorityClass(t.priority),
                              )}
                            >
                              {PRIORITY_LABELS[t.priority]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                                statusClass(t.status),
                              )}
                            >
                              {STATUS_LABELS[t.status]}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                            {new Date(t.updatedAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Showing {(total === 0 ? 0 : (page - 1) * ADMIN_PAGE_SIZE + 1).toLocaleString()}-
                {Math.min(page * ADMIN_PAGE_SIZE, total).toLocaleString()} of{" "}
                {total.toLocaleString()}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!canPrev || isFetching}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {page} / {lastPage}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!canNext || isFetching}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="detail" {...fadeUp}>
            <AdminTicketDetail
              ticket={detailData?.ticket ?? null}
              loading={loadingDetail}
              onBack={() => {
                setView("list");
                setActiveTicketId(null);
                void refetch();
              }}
              onRefresh={async () => {
                await refetchDetail();
                await queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: [string, string][];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-full border border-border bg-card px-3 text-sm"
    >
      <option value="">{placeholder}</option>
      {options.map(([k, v]) => (
        <option key={k} value={k}>
          {v}
        </option>
      ))}
    </select>
  );
}

function AdminTicketDetail({
  ticket,
  loading,
  onBack,
  onRefresh,
}: {
  ticket: TicketDetail | null;
  loading: boolean;
  onBack: () => void;
  onRefresh: () => Promise<void>;
}) {
  const queryClient = useQueryClient();
  const [reply, setReply] = useState("");
  const [ticketInfoOpen, setTicketInfoOpen] = useState(false);
  const [replyErr, setReplyErr] = useState<string | null>(null);

  const replyMutation = useMutation({
    mutationFn: () =>
      postAdmin<{ ok: true }>(`/api/tickets/${ticket?.id ?? ""}`, { message: reply.trim() }),
    onSuccess: async () => {
      setReply("");
      toast.success("Reply sent to user.");
      await queryClient.invalidateQueries({ queryKey: ["admin", "ticket"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });
      await onRefresh();
    },
    onError: (error: Error) => {
      setReplyErr(error.message || "Could not send reply.");
    },
  });

  const statusMutation = useMutation({
    mutationFn: (newStatus: string) =>
      patchAdmin<{ ok: true }>(`/api/tickets/${ticket?.id ?? ""}`, { status: newStatus }),
    onSuccess: async () => {
      toast.success("Status updated.");
      await queryClient.invalidateQueries({ queryKey: ["admin", "ticket"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });
      await onRefresh();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Could not update status.");
    },
  });

  const priorityMutation = useMutation({
    mutationFn: (newPriority: string) =>
      patchAdmin<{ ok: true }>(`/api/tickets/${ticket?.id ?? ""}`, { priority: newPriority }),
    onSuccess: async () => {
      toast.success("Priority updated.");
      await queryClient.invalidateQueries({ queryKey: ["admin", "ticket"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });
      await onRefresh();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Could not update priority.");
    },
  });

  if (loading) {
    return (
      <div className="rounded-3xl border border-border bg-card p-14 text-center">
        <Loader2 className="mx-auto h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!ticket) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Ticket details could not be loaded.</p>
        <Button variant="outline" className="mt-4 rounded-full" onClick={onBack}>
          Back to tickets
        </Button>
      </div>
    );
  }

  const isClosed = ticket.status === "closed" || ticket.status === "resolved";

  return (
    <div className="w-full space-y-5">
      <div className="flex flex-wrap items-start gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold sm:text-xl">{ticket.subject}</h1>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">{ticket.ticketNumber}</span>
            <span>·</span>
            <span>{ticket.userEmail}</span>
            <span>·</span>
            <span>{CATEGORY_LABELS[ticket.category]}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        {/* Main thread */}
        <div className="min-w-0 space-y-4 xl:order-1">
          {/* Original message */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-primary text-[10px] font-bold text-primary-foreground">
                {(ticket.userName || ticket.userEmail).charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-foreground">
                {ticket.userName || ticket.userEmail}
              </span>
              <span>·</span>
              <span>
                {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{ticket.description}</p>
          </div>

          {/* Replies */}
          {ticket.replies.map((r) => (
            <div
              key={r._id}
              className={cn(
                "rounded-2xl border p-4 text-sm",
                r.isAdmin ? "border-brand/20 bg-brand/5" : "border-border bg-card",
              )}
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {r.isAdmin && (
                  <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-foreground">
                    Support
                  </span>
                )}
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                  {(r.authorName || r.authorEmail).charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-foreground">
                  {r.authorName || r.authorEmail}
                </span>
                <span>·</span>
                <span>
                  {new Date(r.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap leading-relaxed">{r.message}</p>
            </div>
          ))}

          {/* Admin reply box */}
          {!isClosed ? (
            <div className="rounded-2xl border border-border bg-card p-3 shadow-soft">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Reply as Support
              </p>
              {replyErr ? (
                <div className="mb-3 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {replyErr}
                </div>
              ) : null}
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write your response to the user..."
                rows={3}
                className="resize-none rounded-xl"
              />
              <div className="mt-3 flex justify-end">
                <Button
                  disabled={replyMutation.isPending || !reply.trim()}
                  onClick={() => {
                    setReplyErr(null);
                    replyMutation.mutate();
                  }}
                  className="h-10 rounded-full bg-gradient-primary text-primary-foreground shadow-glow"
                >
                  {replyMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Send Reply
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-muted/30 px-5 py-4 text-center text-sm text-muted-foreground">
              Ticket is {STATUS_LABELS[ticket.status].toLowerCase()}.
            </div>
          )}
        </div>

        {/* Sidebar controls */}
        <div className="order-first space-y-4 xl:order-2">
          <div className="rounded-2xl border border-border bg-card p-3 shadow-soft">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Status
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(STATUS_LABELS) as [TicketStatus, string][]).map(([k, v]) => (
                <button
                  key={k}
                  type="button"
                  disabled={statusMutation.isPending || ticket.status === k}
                  onClick={() => statusMutation.mutate(k)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                    ticket.status === k
                      ? statusClass(k)
                      : "border border-border text-muted-foreground hover:border-brand hover:text-foreground",
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-3 shadow-soft">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Priority
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(PRIORITY_LABELS) as [TicketPriority, string][]).map(([k, v]) => (
                <button
                  key={k}
                  type="button"
                  disabled={priorityMutation.isPending || ticket.priority === k}
                  onClick={() => priorityMutation.mutate(k)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                    ticket.priority === k
                      ? priorityClass(k)
                      : "border border-border text-muted-foreground hover:border-brand hover:text-foreground",
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-3 shadow-soft xl:hidden">
            <button
              type="button"
              onClick={() => setTicketInfoOpen((prev) => !prev)}
              className="flex w-full items-center justify-between text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              <span>Ticket Info</span>
              <span>{ticketInfoOpen ? "Hide" : "Show"}</span>
            </button>
            <AnimatePresence initial={false}>
              {ticketInfoOpen ? (
                <motion.div
                  key="ticket-info-mobile"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <dl className="mt-3 space-y-2 text-xs">
                    <div>
                      <dt className="text-muted-foreground">Ticket #</dt>
                      <dd className="font-mono font-medium">{ticket.ticketNumber}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">User</dt>
                      <dd className="truncate font-medium">{ticket.userEmail}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Category</dt>
                      <dd className="font-medium">{CATEGORY_LABELS[ticket.category]}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Replies</dt>
                      <dd className="font-medium">{ticket.replies.length}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Created</dt>
                      <dd className="font-medium">
                        {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </dd>
                    </div>
                  </dl>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="hidden rounded-2xl border border-border bg-card p-3 shadow-soft xl:block">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ticket Info
            </p>
            <dl className="space-y-2 text-xs">
              <div>
                <dt className="text-muted-foreground">Ticket #</dt>
                <dd className="font-mono font-medium">{ticket.ticketNumber}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">User</dt>
                <dd className="truncate font-medium">{ticket.userEmail}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Category</dt>
                <dd className="font-medium">{CATEGORY_LABELS[ticket.category]}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Replies</dt>
                <dd className="font-medium">{ticket.replies.length}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Created</dt>
                <dd className="font-medium">
                  {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
