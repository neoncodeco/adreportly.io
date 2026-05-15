"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2, MessageSquareHeart, Send, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  FEEDBACK_AREA_LABELS,
  FEEDBACK_AREAS,
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_TYPE_LABELS,
  FEEDBACK_TYPES,
  feedbackRatingClass,
  feedbackStatusClass,
  type FeedbackArea,
  type FeedbackStatus,
  type FeedbackType,
} from "@/lib/feedback";
import { cn } from "@/lib/utils";

type FeedbackRow = {
  id: string;
  type: FeedbackType;
  area: FeedbackArea;
  rating: number;
  message: string;
  pageUrl: string | null;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
};

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

export function UserFeedbackPage() {
  const [type, setType] = useState<FeedbackType>("improvement");
  const [area, setArea] = useState<FeedbackArea>("overall");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const loadFeedback = useCallback(async () => {
    setLoadingList(true);
    setListError(null);
    try {
      const res = await fetch("/api/feedback", { credentials: "include" });
      const json = (await res.json()) as { feedback?: FeedbackRow[]; error?: string };
      if (!res.ok) {
        setListError(json.error || "Could not load feedback.");
        return;
      }
      setFeedback(json.feedback ?? []);
    } catch {
      setListError("Network error.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void loadFeedback();
  }, [loadFeedback]);

  const trimmedMessage = message.trim();
  const messageError = trimmedMessage.length > 0 && trimmedMessage.length < 10;
  const canSubmit = !saving && trimmedMessage.length >= 10 && !messageError;
  const averageRating = useMemo(() => {
    if (feedback.length === 0) return null;
    return feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length;
  }, [feedback]);

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type,
          area,
          rating,
          message: trimmedMessage,
          pageUrl: window.location.pathname,
        }),
      });
      const json = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !json.id) {
        setError(json.error || "Could not submit feedback.");
        return;
      }
      setType("improvement");
      setArea("overall");
      setRating(5);
      setMessage("");
      toast.success("Thanks for the feedback.");
      await loadFeedback();
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div {...fadeUp} className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Customer Feedback</h1>
          <p className="text-sm text-muted-foreground">
            Share what feels useful, confusing, slow, or missing.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm shadow-soft">
          <MessageSquareHeart className="h-4 w-4 text-brand" />
          <span className="font-semibold">{feedback.length}</span>
          <span className="text-muted-foreground">submitted</span>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
        <section className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-7">
          {error ? (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          ) : null}

          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Feedback Type</Label>
                <Select value={type} onValueChange={(value) => setType(value as FeedbackType)}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FEEDBACK_TYPES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {FEEDBACK_TYPE_LABELS[item]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Website Area</Label>
                <Select value={area} onValueChange={(value) => setArea(value as FeedbackArea)}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FEEDBACK_AREAS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {FEEDBACK_AREA_LABELS[item]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Experience Rating</Label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((score) => {
                  const active = score <= rating;
                  return (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setRating(score)}
                      className={cn(
                        "flex h-12 items-center justify-center gap-1 rounded-xl border text-sm font-semibold transition",
                        active
                          ? "border-brand/40 bg-brand/10 text-brand"
                          : "border-border bg-background text-muted-foreground hover:text-foreground",
                      )}
                      aria-label={`${score} star rating`}
                    >
                      <Star className={cn("h-4 w-4", active && "fill-current")} />
                      {score}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Feedback</Label>
                <span
                  className={cn(
                    "text-xs",
                    trimmedMessage.length < 10 ? "text-muted-foreground" : "text-emerald-600",
                  )}
                >
                  {trimmedMessage.length} / 3000
                </span>
              </div>
              <Textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Tell us what we should improve..."
                rows={7}
                className={cn("resize-none rounded-xl", messageError && "border-destructive")}
              />
              {messageError ? (
                <p className="text-xs text-destructive">Feedback must be at least 10 characters.</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                disabled={!canSubmit}
                onClick={() => void submit()}
                className="h-11 rounded-full bg-gradient-primary text-primary-foreground shadow-glow"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Submit Feedback
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-full"
                onClick={() => {
                  setType("improvement");
                  setArea("overall");
                  setRating(5);
                  setMessage("");
                  setError(null);
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold">Your Feedback</h2>
                <p className="text-xs text-muted-foreground">
                  {averageRating ? `Average rating ${averageRating.toFixed(1)}/5` : "No rating yet"}
                </p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
          </div>

          {listError ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {listError}
            </div>
          ) : null}

          {loadingList ? (
            <div className="rounded-3xl border border-border bg-card p-10 text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-muted-foreground" />
            </div>
          ) : feedback.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card p-10 text-center">
              <MessageSquareHeart className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="font-semibold">No feedback yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your submissions will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {feedback.map((item) => (
                <FeedbackHistoryItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
}

function FeedbackHistoryItem({ item }: { item: FeedbackRow }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{FEEDBACK_TYPE_LABELS[item.type]}</span>
            <span>·</span>
            <span>{FEEDBACK_AREA_LABELS[item.area]}</span>
            <span>·</span>
            <span>
              {new Date(item.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed">{item.message}</p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
            feedbackStatusClass(item.status),
          )}
        >
          {FEEDBACK_STATUS_LABELS[item.status]}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((score) => (
          <Star
            key={score}
            className={cn(
              "h-3.5 w-3.5",
              score <= item.rating
                ? cn("fill-current", feedbackRatingClass(item.rating))
                : "text-muted-foreground/30",
            )}
          />
        ))}
        <span className={cn("ml-1 text-xs font-semibold", feedbackRatingClass(item.rating))}>
          {item.rating}/5
        </span>
      </div>
    </div>
  );
}
