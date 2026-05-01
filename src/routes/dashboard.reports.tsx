import { createFileRoute } from "@tanstack/react-router";
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
import { mockClients } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/reports")({
  component: ReportsPage,
});

function ReportsPage() {
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
          Generate PDF and CSV reports for your clients
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Generate Report */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold sm:text-lg">Generate Report</h3>
              <p className="text-xs text-muted-foreground">PDF or CSV for a client</p>
            </div>
          </div>

          <div className="relative mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label>Client</Label>
              <Select>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {mockClients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="from">Start Date</Label>
                <Input id="from" type="date" defaultValue="2025-12-17" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="to">End Date</Label>
                <Input id="to" type="date" defaultValue="2026-01-16" className="h-11 rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2">
              <Button
                className="h-11 rounded-full bg-foreground text-background hover:opacity-90"
                onClick={() => toast.success("PDF generation queued")}
              >
                <Download className="mr-2 h-4 w-4" /> PDF
              </Button>
              <Button
                variant="outline"
                className="h-11 rounded-full"
                onClick={() => toast.success("CSV generation queued")}
              >
                <Download className="mr-2 h-4 w-4" /> CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Create Shareable Link */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
          <div className="pointer-events-none absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-success/10 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-success/15 text-success">
              <Share2 className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold sm:text-lg">Shareable Link</h3>
              <p className="text-xs text-muted-foreground">View without login</p>
            </div>
          </div>

          <div className="relative mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label>Client</Label>
              <Select>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {mockClients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rname">Report Name (Optional)</Label>
              <Input
                id="rname"
                placeholder="e.g., Monthly Report – January"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Date From</Label>
                <Input type="date" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>Date To</Label>
                <Input type="date" className="h-11 rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="exp">Expires In (Days)</Label>
              <Input
                id="exp"
                type="number"
                defaultValue={30}
                min={1}
                max={365}
                className="h-11 rounded-xl"
              />
            </div>
            <Button
              className="h-11 w-full rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
              onClick={() => toast.success("Share link created and copied")}
            >
              <Link2 className="mr-2 h-4 w-4" /> Create Link
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
