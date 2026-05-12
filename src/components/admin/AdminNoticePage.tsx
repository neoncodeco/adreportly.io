"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BellRing, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { postAdmin } from "@/lib/admin-queries";

export function AdminNoticePage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState<"all" | "user" | "admin">("all");
  const [link, setLink] = useState("");

  const sendMutation = useMutation({
    mutationFn: () =>
      postAdmin<{ success: true; id: string }>("/api/admin/notifications", {
        title: title.trim(),
        message: message.trim(),
        targetRole,
        link: link.trim() || "",
      }),
    onSuccess: () => {
      toast.success("Notification sent.");
      setTitle("");
      setMessage("");
      setLink("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Could not send notification.");
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5 sm:space-y-6"
    >
      <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BellRing className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-bold">Send Notification</h3>
            <p className="text-xs text-muted-foreground">Broadcast to user dashboards instantly.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-semibold">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="System maintenance notice"
              className="h-10 rounded-xl"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-semibold">Message</Label>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="We will update servers tonight at 2 AM UTC."
              className="h-10 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Audience</Label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value as "all" | "user" | "admin")}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
            >
              <option value="all">All users + admins</option>
              <option value="user">Users only</option>
              <option value="admin">Admins only</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Optional Link</Label>
            <Input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="/dashboard/docs"
              className="h-10 rounded-xl"
            />
          </div>
          <div className="sm:col-span-2">
            <Button
              type="button"
              disabled={sendMutation.isPending || !title.trim() || !message.trim()}
              onClick={() => sendMutation.mutate()}
              className="h-10 rounded-full bg-gradient-primary text-primary-foreground"
            >
              <Send className="mr-2 h-4 w-4" />{" "}
              {sendMutation.isPending ? "Sending..." : "Send notification"}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
