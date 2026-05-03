"use client";

import { useCallback, useEffect, useState } from "react";
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

type CampOpt = { id: string; name: string };

export function ReportsPage() {
  const [campaigns, setCampaigns] = useState<CampOpt[]>([]);
  const [campaignId, setCampaignId] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [expiryDays, setExpiryDays] = useState(30);
  const [shareBusy, setShareBusy] = useState(false);

  const loadCampaigns = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/overview", { credentials: "include" });
      const data = (await res.json()) as {
        campaigns?: Array<{ id: string; name: string }>;
        recentCampaigns?: Array<{ id: string; name: string }>;
      };
      const list = data.campaigns?.length ? data.campaigns : (data.recentCampaigns ?? []);
      const opts = list.map((c) => ({ id: c.id, name: c.name }));
      setCampaigns(opts);
      setCampaignId((prev) => (prev ? prev : (opts[0]?.id ?? "")));
    } catch {
      setCampaigns([]);
    }
  }, []);

  useEffect(() => {
    void loadCampaigns();
  }, [loadCampaigns]);

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
          PDF/CSV export is planned; share links use live Meta campaign ids from your account.
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
              <p className="text-xs text-muted-foreground">PDF or CSV (coming soon)</p>
            </div>
          </div>

          <div className="relative mt-5 space-y-4">
            <p className="text-sm text-muted-foreground">
              Use Meta Ads Manager or add an export job later. Buttons stay disabled until wired.
            </p>
            <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2">
              <Button
                type="button"
                disabled
                title="Not implemented yet"
                className="h-11 rounded-full bg-foreground text-background opacity-60"
              >
                <Download className="mr-2 h-4 w-4" /> PDF
              </Button>
              <Button
                type="button"
                disabled
                title="Not implemented yet"
                variant="outline"
                className="h-11 rounded-full opacity-60"
              >
                <Download className="mr-2 h-4 w-4" /> CSV
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
