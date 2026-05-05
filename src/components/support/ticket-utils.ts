export type TicketStatus = "open" | "in_progress" | "waiting_user" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketCategory = "billing" | "technical" | "feature_request" | "account" | "general";

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  billing: "Billing",
  technical: "Technical",
  feature_request: "Feature Request",
  account: "Account",
  general: "General",
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  waiting_user: "Waiting on You",
  resolved: "Resolved",
  closed: "Closed",
};

export function priorityClass(p: TicketPriority): string {
  return {
    low: "bg-muted text-muted-foreground",
    medium: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    high: "bg-warning/15 text-warning-foreground",
    urgent: "bg-destructive/10 text-destructive",
  }[p];
}

export function statusClass(s: TicketStatus): string {
  return {
    open: "bg-brand/15 text-brand-foreground",
    in_progress: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    waiting_user: "bg-warning/15 text-warning-foreground",
    resolved: "bg-success/15 text-success-foreground",
    closed: "bg-muted text-muted-foreground",
  }[s];
}
