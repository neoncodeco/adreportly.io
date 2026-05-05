"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, Ticket, ChevronRight, ArrowLeft, Send, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  priorityClass,
  statusClass,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
} from "./ticket-utils";

type TicketRow = {
  id: string;
  ticketNumber: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  repliesCount: number;
  createdAt: string;
  updatedAt: string;
  lastRepliedByAdmin: boolean;
};

type Reply = {
  _id: string;
  authorName: string;
  authorEmail: string;
  isAdmin: boolean;
  message: string;
  createdAt: string;
};

type TicketDetail = TicketRow & {
  description: string;
  replies: Reply[];
};

type View = "list" | "create" | "detail";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3 },
};

export function UserSupportPage() {
  const [view, setView] = useState<View>("list");
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [activeTicket, setActiveTicket] = useState<TicketDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [listErr, setListErr] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    setLoadingList(true);
    setListErr(null);
    try {
      const res = await fetch("/api/tickets", { credentials: "include" });
      const json = (await res.json()) as { tickets?: TicketRow[]; error?: string };
      if (!res.ok) {
        setListErr(json.error || "Could not load tickets.");
        return;
      }
      setTickets(json.tickets ?? []);
    } catch {
      setListErr("Network error.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const openDetail = async (id: string) => {
    setLoadingDetail(true);
    setView("detail");
    try {
      const res = await fetch(`/api/tickets/${id}`, { credentials: "include" });
      const json = (await res.json()) as { ticket?: TicketDetail; error?: string };
      if (!res.ok || !json.ticket) {
        toast.error(json.error || "Could not load ticket.");
        setView("list");
        return;
      }
      setActiveTicket(json.ticket);
    } catch {
      toast.error("Network error.");
      setView("list");
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="space-y-5">
      <AnimatePresence mode="wait">
        {view === "list" && (
          <motion.div key="list" {...fadeUp} className="space-y-5">
            <TicketList
              tickets={tickets}
              loading={loadingList}
              error={listErr}
              onNew={() => setView("create")}
              onOpen={openDetail}
            />
          </motion.div>
        )}
        {view === "create" && (
          <motion.div key="create" {...fadeUp}>
            <CreateTicketForm
              onBack={() => setView("list")}
              onSuccess={(id) => {
                void loadList();
                void openDetail(id);
              }}
            />
          </motion.div>
        )}
        {view === "detail" && (
          <motion.div key="detail" {...fadeUp}>
            <TicketDetailView
              ticket={activeTicket}
              loading={loadingDetail}
              onBack={() => {
                setView("list");
                void loadList();
              }}
              onRefresh={async () => {
                if (activeTicket) await openDetail(activeTicket.id);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TicketList({
  tickets,
  loading,
  error,
  onNew,
  onOpen,
}: {
  tickets: TicketRow[];
  loading: boolean;
  error: string | null;
  onNew: () => void;
  onOpen: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Support Tickets</h1>
          <p className="text-sm text-muted-foreground">Submit and track your support requests.</p>
        </div>
        <Button
          onClick={onNew}
          className="h-10 rounded-full bg-gradient-primary text-primary-foreground shadow-glow"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Ticket
        </Button>
      </div>

      {error ? (
        <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-3xl border border-border bg-card p-14 text-center">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-14 text-center">
          <Ticket className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-semibold">No tickets yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a support ticket and we'll get back to you soon.
          </p>
          <Button
            onClick={onNew}
            className="mt-5 h-10 rounded-full bg-gradient-primary text-primary-foreground shadow-glow"
          >
            <Plus className="mr-2 h-4 w-4" />
            Open a ticket
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => onOpen(t.id)}
                    className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {t.ticketNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 font-medium">
                        {t.lastRepliedByAdmin && t.status !== "closed" && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-brand" />
                        )}
                        <span className="line-clamp-1">{t.subject}</span>
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
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                          priorityClass(t.priority),
                        )}
                      >
                        {PRIORITY_LABELS[t.priority]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
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
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateTicketForm({
  onBack,
  onSuccess,
}: {
  onBack: () => void;
  onSuccess: (id: string) => void;
}) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<TicketCategory>("general");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const subjectErr = subject.trim().length > 0 && subject.trim().length < 5;
  const descErr = description.trim().length > 0 && description.trim().length < 10;
  const canSubmit =
    !saving &&
    subject.trim().length >= 5 &&
    description.trim().length >= 10 &&
    !subjectErr &&
    !descErr;

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subject, category, priority, description }),
      });
      const json = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !json.id) {
        setErr(typeof json.error === "string" ? json.error : "Could not create ticket.");
        return;
      }
      toast.success("Ticket submitted successfully!");
      onSuccess(json.id);
    } catch {
      setErr("Network error.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold">New Support Ticket</h1>
          <p className="text-sm text-muted-foreground">
            Describe your issue and we'll respond as soon as possible.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-7">
        {err ? (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {err}
          </div>
        ) : null}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of your issue (min. 5 characters)"
              className={cn("h-11 rounded-xl", subjectErr && "border-destructive")}
            />
            {subjectErr && (
              <p className="text-xs text-destructive">Subject must be at least 5 characters.</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as TicketCategory)}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(CATEGORY_LABELS) as [TicketCategory, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(PRIORITY_LABELS) as [TicketPriority, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Description</Label>
              <span
                className={cn(
                  "text-xs",
                  description.trim().length < 10
                    ? "text-muted-foreground"
                    : "text-success-foreground",
                )}
              >
                {description.trim().length} / 4000
              </span>
            </div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your issue in detail (min. 10 characters). Include any error messages or steps to reproduce..."
              rows={6}
              className={cn("resize-none rounded-xl", descErr && "border-destructive")}
            />
            {descErr && (
              <p className="text-xs text-destructive">
                Description must be at least 10 characters.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <Button
              disabled={!canSubmit}
              onClick={() => void submit()}
              className="h-11 rounded-full bg-gradient-primary text-primary-foreground shadow-glow"
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit Ticket
            </Button>
            <Button variant="outline" className="h-11 rounded-full" onClick={onBack}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TicketDetailView({
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
  const [reply, setReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [closing, setClosing] = useState(false);

  const sendReply = async () => {
    if (!ticket || !reply.trim()) return;
    setSendingReply(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: reply }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        toast.error(json.error || "Could not send reply.");
        return;
      }
      setReply("");
      toast.success("Reply sent.");
      await onRefresh();
    } catch {
      toast.error("Network error.");
    } finally {
      setSendingReply(false);
    }
  };

  const closeTicket = async () => {
    if (!ticket) return;
    setClosing(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "closed" }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        toast.error(json.error || "Could not close ticket.");
        return;
      }
      toast.success("Ticket closed.");
      await onRefresh();
    } catch {
      toast.error("Network error.");
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-border bg-card p-14 text-center">
        <Loader2 className="mx-auto h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!ticket) return null;

  const isClosed = ticket.status === "closed" || ticket.status === "resolved";

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold sm:text-xl">{ticket.subject}</h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">{ticket.ticketNumber}</span>
            <span>·</span>
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-0.5 font-semibold",
                statusClass(ticket.status),
              )}
            >
              {STATUS_LABELS[ticket.status]}
            </span>
            <span>·</span>
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-0.5 font-semibold",
                priorityClass(ticket.priority),
              )}
            >
              {PRIORITY_LABELS[ticket.priority]}
            </span>
          </div>
        </div>
        {!isClosed && (
          <Button
            variant="outline"
            size="sm"
            className="ml-auto shrink-0 rounded-full text-xs"
            disabled={closing}
            onClick={() => void closeTicket()}
          >
            {closing ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
            Close ticket
          </Button>
        )}
      </div>

      {/* Original message */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {ticket.userName || ticket.userEmail}
            </span>
            <span>·</span>
            <span>
              {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span>·</span>
            <span>{CATEGORY_LABELS[ticket.category]}</span>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{ticket.description}</p>
        </div>
      </div>

      {/* Replies */}
      {ticket.replies.length > 0 && (
        <div className="space-y-3">
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
        </div>
      )}

      {/* Reply box */}
      {!isClosed ? (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Add a reply
          </p>
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Write your message here..."
            rows={4}
            className="resize-none rounded-xl"
          />
          <div className="mt-3 flex justify-end">
            <Button
              disabled={sendingReply || !reply.trim()}
              onClick={() => void sendReply()}
              className="h-10 rounded-full bg-gradient-primary text-primary-foreground shadow-glow"
            >
              {sendingReply ? (
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
          This ticket is {STATUS_LABELS[ticket.status].toLowerCase()}. Open a new ticket if you need
          further assistance.
        </div>
      )}
    </div>
  );
}
