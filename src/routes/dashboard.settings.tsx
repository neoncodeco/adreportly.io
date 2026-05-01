import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { User, Building2, Mail, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, organization")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setFullName(data?.full_name || "");
        setOrganization(data?.organization || "");
      });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, organization })
      .eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  };

  const initials = (fullName || user?.email || "AU")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-2xl space-y-5"
    >
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Settings</h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Manage your agency profile
        </p>
      </div>

      {/* Profile header card */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary text-lg font-bold text-primary-foreground shadow-glow sm:h-20 sm:w-20">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-bold sm:text-lg">
              {fullName || "Your name"}
            </p>
            <p className="truncate text-xs text-muted-foreground sm:text-sm">
              {user?.email}
            </p>
            <span className="mt-1.5 inline-flex items-center rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-success">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
        <h3 className="text-base font-bold sm:text-lg">Profile</h3>
        <p className="text-xs text-muted-foreground">Update your account information</p>

        <div className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="h-11 rounded-xl pl-9"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold">Full name</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-11 rounded-xl pl-9"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="org" className="text-xs font-semibold">Agency</Label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="org"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="h-11 rounded-xl pl-9"
              />
            </div>
          </div>
          <Button
            disabled={saving}
            onClick={save}
            className="h-11 w-full rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95 sm:w-auto"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
