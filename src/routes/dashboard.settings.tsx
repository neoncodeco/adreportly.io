import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-2xl"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your agency profile</p>
      </div>

      <div className="glass rounded-3xl p-6 shadow-soft">
        <h3 className="text-lg font-bold">Profile</h3>
        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email || ""} disabled />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="org">Agency</Label>
            <Input id="org" value={organization} onChange={(e) => setOrganization(e.target.value)} />
          </div>
          <Button
            disabled={saving}
            onClick={save}
            className="rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
          >
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
