export type NormalizedDeliveryStatus = "active" | "paused" | "completed" | "other";

export function normalizeDeliveryStatus(status: string | undefined): NormalizedDeliveryStatus {
  const value = (status ?? "").toUpperCase();
  if (value === "ACTIVE") return "active";
  if (value === "PAUSED" || value === "ADSET_PAUSED" || value === "CAMPAIGN_PAUSED") {
    return "paused";
  }
  if (value === "ARCHIVED" || value === "DELETED" || value === "COMPLETED") {
    return "completed";
  }
  const normalized = (status ?? "").toLowerCase();
  if (normalized === "active" || normalized === "paused" || normalized === "completed") {
    return normalized;
  }
  return "other";
}

export function deliveryLabel(status: string | undefined): string {
  const normalized = normalizeDeliveryStatus(status);
  if (normalized === "active") return "Active";
  if (normalized === "paused") return "Off";
  if (normalized === "completed") return "Completed";
  return "Other";
}

export function deliveryPillClass(status: string | undefined): string {
  const normalized = normalizeDeliveryStatus(status);
  if (normalized === "active") return "bg-success/15 text-success";
  if (normalized === "paused") return "bg-slate-500/15 text-slate-700 dark:text-slate-300";
  return "bg-muted text-muted-foreground";
}

export function deliveryDotClass(status: string | undefined): string {
  const normalized = normalizeDeliveryStatus(status);
  if (normalized === "active") return "bg-success";
  if (normalized === "paused") return "bg-slate-400";
  return "bg-muted-foreground/40";
}
