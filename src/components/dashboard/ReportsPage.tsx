"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Download, Link2, FileText, Share2 } from "lucide-react";
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
  dashboardQk,
  fetchCampaignInsights,
  fetchDashboardOverview,
} from "@/lib/dashboard-queries";

type CampOpt = { id: string; name: string };

export function ReportsPage() {
  const queryClient = useQueryClient();
  const [campaignId, setCampaignId] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [expiryDays, setExpiryDays] = useState(30);
  const [shareBusy, setShareBusy] = useState(false);
  const [exportBusy, setExportBusy] = useState<null | "csv" | "pdf">(null);

  const { data: overview } = useQuery({
    queryKey: dashboardQk.overview(),
    queryFn: fetchDashboardOverview,
    staleTime: DASHBOARD_OVERVIEW_STALE_MS,
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
        queryKey: dashboardQk.campaignInsights(campaignId),
        queryFn: () => fetchCampaignInsights(campaignId),
        staleTime: CAMPAIGN_INSIGHTS_STALE_MS,
      });
      if (!insights.length) {
        toast.error("No data available for this campaign.");
        return;
      }
      const headers = [
        "Campaign ID",
        "Campaign Name",
        "Date Start",
        "Date Stop",
        "Spend",
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
      a.download = `report-${campaignId}-${new Date().toISOString().slice(0, 10)}.csv`;
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
      const insights = await queryClient.fetchQuery({
        queryKey: dashboardQk.campaignInsights(campaignId),
        queryFn: () => fetchCampaignInsights(campaignId),
        staleTime: CAMPAIGN_INSIGHTS_STALE_MS,
      });
      if (!insights.length) {
        toast.error("No data available for this campaign.");
        return;
      }
      const totalSpend = insights.reduce(
        (acc, row) => acc + (parseFloat(row.spend ?? "0") || 0),
        0,
      );
      const totalImpressions = insights.reduce(
        (acc, row) => acc + (parseInt(row.impressions ?? "0", 10) || 0),
        0,
      );
      const totalClicks = insights.reduce(
        (acc, row) => acc + (parseInt(row.clicks ?? "0", 10) || 0),
        0,
      );
      const avgCtr = totalImpressions ? (totalClicks / totalImpressions) * 100 : 0;

      const reportHtml = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Campaign Report</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
    h1 { margin: 0 0 6px; font-size: 22px; }
    p { margin: 0 0 8px; color: #4b5563; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin: 16px 0 20px; }
    .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; }
    .label { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
    .value { font-size: 16px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 12px; text-align: left; }
    th { background: #f9fafb; }
  </style>
</head>
<body>
  <h1>Campaign Report</h1>
  <p><strong>Campaign:</strong> ${selectedCampaign?.name ?? "Campaign"} (${campaignId})</p>
  <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
  <div class="grid">
    <div class="card"><div class="label">Total Spend</div><div class="value">${totalSpend.toFixed(2)}</div></div>
    <div class="card"><div class="label">Impressions</div><div class="value">${totalImpressions.toLocaleString()}</div></div>
    <div class="card"><div class="label">Clicks</div><div class="value">${totalClicks.toLocaleString()}</div></div>
    <div class="card"><div class="label">Average CTR</div><div class="value">${avgCtr.toFixed(2)}%</div></div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Date Start</th>
        <th>Date Stop</th>
        <th>Spend</th>
        <th>Impressions</th>
        <th>Clicks</th>
        <th>CTR</th>
      </tr>
    </thead>
    <tbody>
      ${insights
        .map(
          (row) => `<tr>
        <td>${row.date_start ?? ""}</td>
        <td>${row.date_stop ?? ""}</td>
        <td>${row.spend ?? "0"}</td>
        <td>${row.impressions ?? "0"}</td>
        <td>${row.clicks ?? "0"}</td>
        <td>${row.ctr ?? "0"}%</td>
      </tr>`,
        )
        .join("")}
    </tbody>
  </table>
</body>
</html>`;
      const w = window.open("", "_blank", "noopener,noreferrer,width=1100,height=800");
      if (!w) throw new Error("Popup blocked. Allow popups and try again.");
      w.document.open();
      w.document.write(reportHtml);
      w.document.close();
      w.focus();
      w.print();
      toast.success("Printable report opened. Save as PDF from print dialog.");
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
          Export real campaign data as CSV or open a print-ready PDF view.
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
              <p className="text-xs text-muted-foreground">PDF or CSV export</p>
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
            <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2">
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
              disabled={shareBusy || !campaignId || !clientEmail.trim()}
              className="h-11 w-full rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95 disabled:opacity-50"
              onClick={async () => {
                setShareBusy(true);
                const r = await createShareLinkAction({
                  campaignId,
                  clientEmail: clientEmail.trim(),
                  expiryDays,
                });
                setShareBusy(false);
                if (r.ok) {
                  void queryClient.invalidateQueries({ queryKey: dashboardQk.clients() });
                  try {
                    await navigator.clipboard.writeText(r.shareUrl);
                  } catch {
                    /* ignore */
                  }
                  toast.success("Share link created and copied", { description: r.shareUrl });
                } else {
                  toast.error(r.error);
                }
              }}
            >
              <Link2 className="mr-2 h-4 w-4" /> Create link
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
