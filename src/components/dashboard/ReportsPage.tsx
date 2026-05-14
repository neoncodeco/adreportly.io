"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Download, Link2, FileText, Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createShareLinkAction } from "@/app/actions/share";
import {
  CAMPAIGN_INSIGHTS_STALE_MS,
  DASHBOARD_OVERVIEW_STALE_MS,
  REPORT_DATE_PRESET_OPTIONS,
  SHELL_PROFILE_STALE_MS,
  dashboardQk,
  fetchCampaignInsightRollup,
  fetchCampaignInsights,
  fetchDashboardOverview,
  fetchUserProfileSnippet,
  shellQk,
  type ReportDatePreset,
} from "@/lib/dashboard-queries";
import {
  aggregatePerformanceReport,
  brandLetterFromText,
  buildDailyReportRows,
  buildPerformanceReportHtml,
  downloadPerformanceReportPdf,
  periodLabelFromDaily,
} from "@/lib/performance-report";

type CampOpt = { id: string; name: string };

export function ReportsPage() {
  const queryClient = useQueryClient();
  const [campaignId, setCampaignId] = useState("");
  const [reportClientName, setReportClientName] = useState("");
  const [reportClientEmail, setReportClientEmail] = useState("");
  const [reportDatePreset, setReportDatePreset] = useState<ReportDatePreset>("last_30d");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [expiryDays, setExpiryDays] = useState(30);
  const [shareBusy, setShareBusy] = useState(false);
  const [lastShareUrl, setLastShareUrl] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [exportBusy, setExportBusy] = useState<null | "csv" | "pdf">(null);

  const { data: overview } = useQuery({
    queryKey: dashboardQk.overview(),
    queryFn: () => fetchDashboardOverview(),
    staleTime: DASHBOARD_OVERVIEW_STALE_MS,
  });

  const { data: profile } = useQuery({
    queryKey: shellQk.profile(),
    queryFn: fetchUserProfileSnippet,
    staleTime: SHELL_PROFILE_STALE_MS,
  });

  const campaigns: CampOpt[] = useMemo(() => {
    if (!overview) return [];
    const list = overview.campaigns?.length ? overview.campaigns : (overview.recentCampaigns ?? []);
    return list.map((c) => ({ id: c.id, name: c.name }));
  }, [overview]);

  useEffect(() => {
    if (campaignId || campaigns.length === 0) return;
    setCampaignId(campaigns[0].id);
  }, [campaignId, campaigns]);

  const selectedCampaign = campaigns.find((c) => c.id === campaignId);

  const exportCsv = async () => {
    setExportBusy("csv");
    try {
      if (!campaignId) throw new Error("Select a campaign first.");
      const insights = await queryClient.fetchQuery({
        queryKey: dashboardQk.campaignInsights(campaignId, reportDatePreset),
        queryFn: () => fetchCampaignInsights(campaignId, { datePreset: reportDatePreset }),
        staleTime: CAMPAIGN_INSIGHTS_STALE_MS,
      });
      if (!insights.length) {
        toast.error("No data available for this campaign.");
        return;
      }
      const cn = reportClientName.trim();
      const ce = reportClientEmail.trim();
      const headers = [
        "Client Name",
        "Client Email",
        "Campaign ID",
        "Campaign Name",
        "Date Start",
        "Date Stop",
        "Amount Spent",
        "Impressions",
        "Reach",
        "Clicks",
        "CTR",
        "CPC",
        "CPM",
      ];
      const escapeCell = (v: string | number | undefined) => {
        const s = String(v ?? "");
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const rows = insights.map((row) => [
        cn,
        ce,
        campaignId,
        selectedCampaign?.name ?? "Campaign",
        row.date_start ?? "",
        row.date_stop ?? "",
        row.spend ?? "0",
        row.impressions ?? "0",
        row.reach ?? "0",
        row.clicks ?? "0",
        row.ctr ?? "0",
        row.cpc ?? "0",
        row.cpm ?? "0",
      ]);
      const csv = [headers, ...rows].map((line) => line.map(escapeCell).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${campaignId}-${reportDatePreset}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("CSV report downloaded.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "CSV export failed.");
    } finally {
      setExportBusy(null);
    }
  };

  const exportPdf = async () => {
    setExportBusy("pdf");
    try {
      if (!campaignId) throw new Error("Select a campaign first.");
      const [insights, rollup] = await Promise.all([
        queryClient.fetchQuery({
          queryKey: dashboardQk.campaignInsights(campaignId, reportDatePreset),
          queryFn: () => fetchCampaignInsights(campaignId, { datePreset: reportDatePreset }),
          staleTime: CAMPAIGN_INSIGHTS_STALE_MS,
        }),
        fetchCampaignInsightRollup(campaignId, reportDatePreset),
      ]);

      const rowsForReport = insights.length ? insights : rollup ? [rollup] : [];
      if (!rowsForReport.length) {
        toast.error("No data available for this campaign.");
        return;
      }

      const currency = overview?.currency ?? "USD";
      const aggregates = aggregatePerformanceReport(rowsForReport, rollup);
      const dailyRows = buildDailyReportRows(rowsForReport);
      const orgOrName = profile?.organization?.trim() || profile?.full_name?.trim() || "";
      const brandLetter = brandLetterFromText(orgOrName);
      const presetLabel =
        REPORT_DATE_PRESET_OPTIONS.find((o) => o.value === reportDatePreset)?.label ??
        reportDatePreset;
      const periodLabelForPdf = rowsForReport.some((r) => r.date_start)
        ? periodLabelFromDaily(rowsForReport)
        : presetLabel;

      const html = buildPerformanceReportHtml({
        brandLetter,
        campaignName: selectedCampaign?.name ?? "Campaign",
        clientName: reportClientName,
        clientEmail: reportClientEmail,
        periodLabel: periodLabelForPdf,
        generatedAt: new Date(),
        currency,
        aggregates,
        dailyRows,
      });

      const safeSlug = (selectedCampaign?.name ?? campaignId)
        .replace(/[^\w-]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 48);
      await downloadPerformanceReportPdf({
        html,
        filename: `performance-report-${safeSlug || campaignId}-${reportDatePreset}-${new Date().toISOString().slice(0, 10)}.pdf`,
      });
      toast.success("PDF downloaded.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "PDF export failed.");
    } finally {
      setExportBusy(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Reports</h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Pick a date range for exports—shorter ranges load faster. PDF and CSV use the same Meta
          preset.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold sm:text-lg">Generate Report</h3>
              <p className="text-xs text-muted-foreground">
                PDF (summary + daily rows) or CSV — choose how many days to pull
              </p>
            </div>
          </div>

          <div className="relative mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label>Campaign</Label>
              <Select
                value={campaignId || undefined}
                onValueChange={setCampaignId}
                disabled={campaigns.length === 0}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue
                    placeholder={
                      campaigns.length ? "Select campaign" : "No campaigns (connect Meta)"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="report-date-range">Date range</Label>
              <Select
                value={reportDatePreset}
                onValueChange={(v) => setReportDatePreset(v as ReportDatePreset)}
              >
                <SelectTrigger id="report-date-range" className="h-11 rounded-xl">
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_DATE_PRESET_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Fewer days = quicker download. &quot;Lifetime&quot; can be very slow.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="report-client-name">Client name</Label>
                <Input
                  id="report-client-name"
                  type="text"
                  placeholder="e.g. Fashion House BD"
                  value={reportClientName}
                  onChange={(e) => setReportClientName(e.target.value)}
                  className="h-11 rounded-xl"
                  autoComplete="name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="report-client-email">Client email</Label>
                <Input
                  id="report-client-email"
                  type="email"
                  placeholder="client@company.com"
                  value={reportClientEmail}
                  onChange={(e) => setReportClientEmail(e.target.value)}
                  className="h-11 rounded-xl"
                  autoComplete="email"
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Included on PDF and every CSV row for this export.
            </p>
            <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
              <Button
                type="button"
                disabled={exportBusy !== null || !campaignId}
                className="h-11 rounded-full bg-foreground text-background"
                onClick={() => void exportPdf()}
              >
                <Download className="mr-2 h-4 w-4" />{" "}
                {exportBusy === "pdf" ? "Preparing..." : "PDF"}
              </Button>
              <Button
                type="button"
                disabled={exportBusy !== null || !campaignId}
                variant="outline"
                className="h-11 rounded-full"
                onClick={() => void exportCsv()}
              >
                <Download className="mr-2 h-4 w-4" />{" "}
                {exportBusy === "csv" ? "Preparing..." : "CSV"}
              </Button>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
          <div className="pointer-events-none absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-success/10 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-success/15 text-success">
              <Share2 className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold sm:text-lg">Shareable Link</h3>
              <p className="text-xs text-muted-foreground">
                Client opens read-only metrics (no login)
              </p>
            </div>
          </div>

          <div className="relative mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label>Campaign</Label>
              <Select
                value={campaignId || undefined}
                onValueChange={setCampaignId}
                disabled={campaigns.length === 0}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue
                    placeholder={
                      campaigns.length ? "Select campaign" : "No campaigns (connect Meta)"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="share-name">Client name</Label>
                <Input
                  id="share-name"
                  type="text"
                  placeholder="e.g. Acme Marketing"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="h-11 rounded-xl"
                  autoComplete="name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="share-email">Client email</Label>
                <Input
                  id="share-email"
                  type="email"
                  placeholder="client@company.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="exp">Expires in (days)</Label>
              <Input
                id="exp"
                type="number"
                value={expiryDays}
                min={1}
                max={365}
                onChange={(e) =>
                  setExpiryDays(Math.min(365, Math.max(1, Number(e.target.value) || 30)))
                }
                className="h-11 rounded-xl"
              />
            </div>
            <Button
              type="button"
              disabled={
                shareBusy || !campaignId || !clientEmail.trim() || clientName.trim().length < 2
              }
              className="h-11 w-full rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95 disabled:opacity-50"
              onClick={async () => {
                setShareBusy(true);
                const r = await createShareLinkAction({
                  campaignId,
                  clientEmail: clientEmail.trim(),
                  clientName: clientName.trim(),
                  expiryDays,
                });
                setShareBusy(false);
                if (r.ok) {
                  void queryClient.invalidateQueries({ queryKey: dashboardQk.clients() });
                  setLastShareUrl(r.shareUrl);
                  setLinkCopied(false);
                  toast.success("Share link created", {
                    description: "Copy it from the box below or use the Copy button.",
                  });
                } else {
                  toast.error(r.error);
                }
              }}
            >
              <Link2 className="mr-2 h-4 w-4" /> Create link
            </Button>

            {lastShareUrl ? (
              <div className="space-y-2 rounded-2xl border border-border bg-muted/25 p-4">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Your share link
                </Label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                  <Input
                    readOnly
                    value={lastShareUrl}
                    className="h-11 flex-1 rounded-xl font-mono text-xs"
                    onFocus={(e) => e.currentTarget.select()}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 shrink-0 rounded-xl sm:w-auto"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(lastShareUrl);
                        setLinkCopied(true);
                        toast.success("Link copied to clipboard");
                        window.setTimeout(() => setLinkCopied(false), 2200);
                      } catch {
                        toast.error(
                          "Could not copy automatically — select the link and press Ctrl+C.",
                        );
                      }
                    }}
                  >
                    {linkCopied ? (
                      <Check className="mr-2 h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    {linkCopied ? "Copied" : "Copy link"}
                  </Button>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Send this URL to your client. It stays read-only until it expires.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
