import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Download, Link2 } from "lucide-react";
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
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground">Generate PDF and CSV reports for your clients</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Generate Report */}
        <div className="glass rounded-3xl p-6 shadow-soft">
          <h3 className="text-lg font-bold">Generate Report</h3>
          <p className="text-xs text-muted-foreground">Create a PDF or CSV report for a client</p>

          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label>Client</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select a client" /></SelectTrigger>
                <SelectContent>
                  {mockClients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="from">Start Date</Label>
                <Input id="from" type="date" defaultValue="2025-12-17" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="to">End Date</Label>
                <Input id="to" type="date" defaultValue="2026-01-16" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                className="rounded-full bg-foreground text-background hover:opacity-90"
                onClick={() => toast.success("PDF generation queued")}
              >
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => toast.success("CSV generation queued")}
              >
                <Download className="mr-2 h-4 w-4" /> Download CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Create Shareable Link */}
        <div className="glass rounded-3xl p-6 shadow-soft">
          <h3 className="text-lg font-bold">Create Shareable Link</h3>
          <p className="text-xs text-muted-foreground">Generate a link clients can view without logging in</p>

          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label>Client</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select a client" /></SelectTrigger>
                <SelectContent>
                  {mockClients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rname">Report Name (Optional)</Label>
              <Input id="rname" placeholder="e.g., Monthly Report – January" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Date From</Label>
                <Input type="date" />
              </div>
              <div className="space-y-1.5">
                <Label>Date To</Label>
                <Input type="date" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="exp">Expires In (Days)</Label>
              <Input id="exp" type="number" defaultValue={30} min={1} max={365} />
            </div>
            <Button
              className="w-full rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
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
