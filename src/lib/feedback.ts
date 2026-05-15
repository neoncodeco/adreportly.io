export const FEEDBACK_TYPES = [
  "bug",
  "improvement",
  "feature_request",
  "usability",
  "praise",
  "other",
] as const;

export const FEEDBACK_AREAS = [
  "overall",
  "dashboard",
  "campaigns",
  "reports",
  "billing",
  "meta_connect",
  "support",
  "settings",
] as const;

export const FEEDBACK_STATUSES = ["new", "reviewed", "planned", "archived"] as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[number];
export type FeedbackArea = (typeof FEEDBACK_AREAS)[number];
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
  bug: "Bug",
  improvement: "Improvement",
  feature_request: "Feature Request",
  usability: "Usability",
  praise: "Praise",
  other: "Other",
};

export const FEEDBACK_AREA_LABELS: Record<FeedbackArea, string> = {
  overall: "Overall Website",
  dashboard: "Dashboard",
  campaigns: "Campaigns",
  reports: "Reports",
  billing: "Billing",
  meta_connect: "Meta Connect",
  support: "Support",
  settings: "Settings",
};

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  new: "New",
  reviewed: "Reviewed",
  planned: "Planned",
  archived: "Archived",
};

export function feedbackStatusClass(status: FeedbackStatus) {
  if (status === "new") return "bg-brand/10 text-brand";
  if (status === "reviewed") return "bg-sky-500/10 text-sky-600";
  if (status === "planned") return "bg-emerald-500/10 text-emerald-600";
  return "bg-muted text-muted-foreground";
}

export function feedbackRatingClass(rating: number) {
  if (rating >= 4) return "text-emerald-600";
  if (rating === 3) return "text-amber-600";
  return "text-rose-600";
}
