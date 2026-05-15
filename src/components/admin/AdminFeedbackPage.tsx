"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Archive,
  CheckCircle2,
  Inbox,
  Loader2,
  MessageSquareHeart,
  Search,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ADMIN_PAGE_SIZE,
  ADMIN_STALE_MS,
  adminQk,
  fetchAdminFeedback,
  patchAdmin,
  type AdminFeedbackRow,
} from "@/lib/admin-queries";
import {
  FEEDBACK_AREA_LABELS,
  FEEDBACK_AREAS,
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_STATUSES,
  FEEDBACK_TYPE_LABELS,
  FEEDBACK_TYPES,
  feedbackRatingClass,
  feedbackStatusClass,
  type FeedbackStatus,
} from "@/lib/feedback";
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

export function AdminFeedbackPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const deferredQ = useDeferredValue(q);
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [area, setArea] = useState("");
  const [rating, setRating] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [deferredQ, status, type, area, rating]);

  const { data, isPending, isError, error, isFetching, isPlaceholderData } = useQuery({
    queryKey: adminQk.feedback(page, ADMIN_PAGE_SIZE, deferredQ, status, type, area, rating),
    queryFn: () => fetchAdminFeedback(page, ADMIN_PAGE_SIZE, deferredQ, status, type, area, rating),
    staleTime: ADMIN_STALE_MS,
    placeholderData: keepPreviousData,
  });

  const feedback = data?.feedback ?? [];
  const total = data?.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const canPrev = page > 1;
  const canNext = page < lastPage;
  const newCount = feedback.reduce((sum, item) => sum + (item.status === "new" ? 1 : 0), 0);

  const statusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: FeedbackStatus }) =>
      patchAdmin<{ ok: true }>(`/api/admin/feedback/${id}`, { status: nextStatus }),
    onSuccess: async () => {
      toast.success("Feedback status updated.");
      await queryClient.invalidateQueries({ queryKey: ["admin", "feedback"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
    onError: (mutationError: Error) => {
      toast.error(mutationError.message || "Could not update feedback.");
    },
  });

  return (
    <motion.div {...fadeUp} className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Customer Feedback</h1>
          <p className="text-sm text-muted-foreground">
            {total.toLocaleString()} feedback item{total === 1 ? "" : "s"} total.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm shadow-soft">
            <Inbox className="h-4 w-4 text-brand" />
            <span className="font-semibold">{newCount}</span>
            <span className="text-muted-foreground">new on page</span>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search feedback..."
              className="h-10 rounded-full pl-9"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterSelect
          value={status}
          onChange={setStatus}
          placeholder="All status"
          options={FEEDBACK_STATUSES.map((item) => [item, FEEDBACK_STATUS_LABELS[item]])}
        />
        <FilterSelect
          value={type}
          onChange={setType}
          placeholder="All type"
          options={FEEDBACK_TYPES.map((item) => [item, FEEDBACK_TYPE_LABELS[item]])}
        />
        <FilterSelect
          value={area}
          onChange={setArea}
          placeholder="All area"
          options={FEEDBACK_AREAS.map((item) => [item, FEEDBACK_AREA_LABELS[item]])}
        />
        <FilterSelect
          value={rating}
          onChange={setRating}
          placeholder="All ratings"
          options={[
            ["5", "5 stars"],
            ["4", "4 stars"],
            ["3", "3 stars"],
            ["2", "2 stars"],
            ["1", "1 star"],
          ]}
        />
      </div>

      {isError ? (
        <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-sm font-medium text-destructive">
          {error instanceof Error ? error.message : "Could not load feedback."}
        </div>
      ) : null}

      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-border bg-card shadow-soft",
          isFetching && isPlaceholderData && "opacity-80",
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Area</th>
                <th className="px-4 py-3">Feedback</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {isPending && feedback.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-7 w-7 animate-spin" />
                  </td>
                </tr>
              ) : feedback.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    <MessageSquareHeart className="mx-auto mb-3 h-9 w-9 opacity-50" />
                    No feedback matches this filter.
                  </td>
                </tr>
              ) : (
                feedback.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border/70 align-top last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium leading-tight">{item.userName || "—"}</div>
                      <div className="text-xs text-muted-foreground">{item.userEmail}</div>
                      {item.organization ? (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {item.organization}
                        </div>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <RatingStars rating={item.rating} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {FEEDBACK_TYPE_LABELS[item.type]}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {FEEDBACK_AREA_LABELS[item.area]}
                    </td>
                    <td className="max-w-[340px] px-4 py-3">
                      <p className="line-clamp-3 leading-relaxed">{item.message}</p>
                      {item.pageUrl ? (
                        <div className="mt-2 font-mono text-[11px] text-muted-foreground">
                          {item.pageUrl}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                          feedbackStatusClass(item.status),
                        )}
                      >
                        {FEEDBACK_STATUS_LABELS[item.status]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {item.status !== "reviewed" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            disabled={statusMutation.isPending}
                            onClick={() =>
                              statusMutation.mutate({ id: item.id, nextStatus: "reviewed" })
                            }
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Review
                          </Button>
                        ) : null}
                        {item.status !== "planned" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            disabled={statusMutation.isPending}
                            onClick={() =>
                              statusMutation.mutate({ id: item.id, nextStatus: "planned" })
                            }
                          >
                            Plan
                          </Button>
                        ) : null}
                        {item.status !== "archived" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-full text-muted-foreground"
                            disabled={statusMutation.isPending}
                            onClick={() =>
                              statusMutation.mutate({ id: item.id, nextStatus: "archived" })
                            }
                          >
                            <Archive className="h-3.5 w-3.5" />
                            Archive
                          </Button>
                        ) : null}
                      </div>
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
          {Math.min(page * ADMIN_PAGE_SIZE, total).toLocaleString()} of {total.toLocaleString()}
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={!canPrev || isFetching}
            onClick={() => setPage((current) => current - 1)}
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
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: string[][];
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 rounded-full border border-border bg-card px-3 text-sm"
    >
      <option value="">{placeholder}</option>
      {options.map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((score) => (
        <Star
          key={score}
          className={cn(
            "h-3.5 w-3.5",
            score <= rating
              ? cn("fill-current", feedbackRatingClass(rating))
              : "text-muted-foreground/30",
          )}
        />
      ))}
      <span className={cn("ml-1 text-xs font-semibold", feedbackRatingClass(rating))}>
        {rating}/5
      </span>
    </div>
  );
}
