"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  User,
  Building2,
  Mail,
  Save,
  Facebook,
  Key,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Info,
  Zap,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const SITE =
  typeof window !== "undefined"
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_SITE_URL ?? "https://yourdomain.com");

const REDIRECT_URL = `${SITE}/api/auth/facebook/callback`;

export function SettingsPage() {
  const { user } = useAuth();

  /* ── profile ── */
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [saving, setSaving] = useState(false);

  /* ── fb app credentials ── */
  const [fbAppId, setFbAppId] = useState("");
  const [fbAppSecret, setFbAppSecret] = useState("");
  const [hasSecret, setHasSecret] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [fbSaving, setFbSaving] = useState(false);
  const [fbDeleting, setFbDeleting] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  /* ── password change ── */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    void fetch("/api/user/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { full_name?: string; organization?: string } | null) => {
        if (data) {
          setFullName(data.full_name ?? "");
          setOrganization(data.organization ?? "");
        }
      });

    void fetch("/api/user/fb-app", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { fbAppId?: string | null; hasSecret?: boolean } | null) => {
        if (data) {
          setFbAppId(data.fbAppId ?? "");
          setHasSecret(Boolean(data.hasSecret));
        }
      });
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName, organization }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setSaving(false);
    if (!res.ok) {
      toast.error(typeof data.error === "string" ? data.error : "Could not save profile");
    } else {
      toast.success("Profile updated");
    }
  };

  const saveFbApp = async () => {
    if (!fbAppId.trim() || (!fbAppSecret.trim() && !hasSecret)) {
      toast.error("App ID and App Secret are both required.");
      return;
    }
    setFbSaving(true);
    const res = await fetch("/api/user/fb-app", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        fbAppId: fbAppId.trim(),
        ...(fbAppSecret.trim() ? { fbAppSecret: fbAppSecret.trim() } : {}),
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    setFbSaving(false);
    if (!res.ok || !data.ok) {
      toast.error(typeof data.error === "string" ? data.error : "Could not save credentials.");
    } else {
      setHasSecret(true);
      setFbAppSecret("");
      toast.success("Facebook App credentials saved securely.");
    }
  };

  const deleteFbApp = async () => {
    if (!confirm("Remove your Facebook App credentials? You will need to re-connect Meta.")) return;
    setFbDeleting(true);
    await fetch("/api/user/fb-app", { method: "DELETE", credentials: "include" });
    setFbDeleting(false);
    setFbAppId("");
    setFbAppSecret("");
    setHasSecret(false);
    toast.success("Facebook App credentials removed.");
  };

  const changePassword = async () => {
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    setPwdSaving(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Could not update password.");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully.");
    } catch {
      toast.error("Network error.");
    } finally {
      setPwdSaving(false);
    }
  };

  const copyRedirectUrl = async () => {
    try {
      await navigator.clipboard.writeText(REDIRECT_URL);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2500);
    } catch {
      toast.error("Could not copy to clipboard.");
    }
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
      className="w-full min-w-0 space-y-4 sm:space-y-6"
    >
      {/* ── Single-line page header ── */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-soft sm:h-9 sm:w-9 sm:rounded-xl">
          <Zap className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
        </span>
        <p className="min-w-0 truncate text-sm leading-tight sm:text-base">
          <span className="font-bold text-foreground">Settings</span>
          <span className="hidden font-normal text-muted-foreground md:inline">
            {" "}
            — Profile, Meta app & password
          </span>
        </p>
      </div>

      {/* ── Two-column grid: profile | Meta app ── */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 lg:items-start">
        {/* ── Profile form ── */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:rounded-3xl sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-9 sm:w-9 sm:rounded-xl">
                <User className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold sm:text-lg">Profile</h3>
                <p className="hidden text-xs text-muted-foreground sm:block">
                  Update your account information
                </p>
              </div>
            </div>
          </div>

          {/* Compact account summary (inside profile card) */}
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/30 px-2.5 py-2 sm:mt-4 sm:gap-3 sm:rounded-2xl sm:px-3 sm:py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-primary text-[11px] font-bold text-primary-foreground shadow-soft sm:h-10 sm:w-10 sm:rounded-xl sm:text-xs">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight">
                {fullName || "Your name"}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <span className="inline-flex shrink-0 items-center rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success">
              Active
            </span>
          </div>

          <div className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">
                Email
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="h-10 rounded-lg pl-9 sm:h-11 sm:rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold">
                Full name
              </Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-10 rounded-lg pl-9 sm:h-11 sm:rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="org" className="text-xs font-semibold">
                Agency
              </Label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="org"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="h-10 rounded-lg pl-9 sm:h-11 sm:rounded-xl"
                />
              </div>
            </div>
            <Button
              disabled={saving}
              onClick={() => void saveProfile()}
              className="h-10 w-full rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95 sm:h-11"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>

          <div className="mt-5 border-t border-border pt-5 sm:mt-6 sm:pt-6">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground sm:h-9 sm:w-9 sm:rounded-xl">
                <Lock className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold">Change password</h4>
                <p className="hidden text-xs text-muted-foreground sm:block">
                  Use a strong password you don&apos;t use elsewhere.
                </p>
              </div>
            </div>

            <div className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="current-pwd" className="text-xs font-semibold">
                  Current password
                </Label>
                <Input
                  id="current-pwd"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-10 rounded-lg sm:h-11 sm:rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-pwd" className="text-xs font-semibold">
                  New password
                </Label>
                <Input
                  id="new-pwd"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-10 rounded-lg sm:h-11 sm:rounded-xl"
                  placeholder="At least 8 characters"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-pwd" className="text-xs font-semibold">
                  Confirm new password
                </Label>
                <Input
                  id="confirm-pwd"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-10 rounded-lg sm:h-11 sm:rounded-xl"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={
                  pwdSaving ||
                  !currentPassword.trim() ||
                  !newPassword.trim() ||
                  !confirmPassword.trim()
                }
                onClick={() => void changePassword()}
                className="h-10 w-full rounded-full border-border font-semibold hover:bg-muted sm:h-11"
              >
                <Lock className="mr-2 h-4 w-4" />
                {pwdSaving ? "Updating..." : "Update password"}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Facebook App Credentials ── */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:rounded-3xl sm:p-6">
          <div className="mb-4 flex items-start gap-2 sm:mb-5 sm:gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1877F2] text-white shadow-glow sm:h-10 sm:w-10 sm:rounded-xl">
              <Facebook className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-bold sm:text-lg">Facebook App Credentials</h3>
              <p className="mt-0.5 hidden text-xs leading-snug text-muted-foreground sm:line-clamp-3 sm:block">
                আপনার নিজের Meta Developer App-এর credentials দিন। Secret AES-256 দিয়ে encrypt হয়ে
                database-এ save হবে — .env থেকে পড়বে না।
              </p>
            </div>
          </div>

          {/* Status */}
          <div
            className={`mb-3 flex flex-col gap-1.5 rounded-xl border px-3 py-2.5 text-xs sm:mb-4 sm:flex-row sm:items-center sm:gap-2 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm ${
              hasSecret
                ? "border-emerald-500/30 bg-emerald-500/8 text-emerald-700"
                : "border-amber-500/30 bg-amber-500/8 text-amber-700"
            }`}
          >
            {hasSecret ? (
              <>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span className="font-semibold">Saved</span>
                </div>
                <span className="break-all pl-6 text-[11px] opacity-90 sm:pl-0 sm:text-xs">
                  App ID: {fbAppId || "—"}
                </span>
              </>
            ) : (
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Add App ID &amp; Secret below.</span>
              </div>
            )}
          </div>

          <div className="space-y-3 sm:space-y-4">
            {/* App ID */}
            <div className="space-y-1.5">
              <Label htmlFor="fbAppId" className="text-xs font-semibold">
                App ID
              </Label>
              <div className="relative">
                <Key className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="fbAppId"
                  placeholder="1234567890123456"
                  value={fbAppId}
                  onChange={(e) => setFbAppId(e.target.value)}
                  className="h-10 rounded-lg pl-9 font-mono sm:h-11 sm:rounded-xl"
                />
              </div>
              <p className="hidden text-[11px] text-muted-foreground sm:block">
                Meta Developer Dashboard → Your App → Settings → Basic → App ID
              </p>
            </div>

            {/* App Secret */}
            <div className="space-y-1.5">
              <Label htmlFor="fbAppSecret" className="text-xs font-semibold">
                App Secret{" "}
                {hasSecret && (
                  <span className="ml-1 text-emerald-700">
                    (saved — leave blank to keep existing)
                  </span>
                )}
              </Label>
              <div className="relative">
                <Key className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="fbAppSecret"
                  type={showSecret ? "text" : "password"}
                  placeholder={hasSecret ? "••••••••••••••••••••••••" : "Enter App Secret"}
                  value={fbAppSecret}
                  onChange={(e) => setFbAppSecret(e.target.value)}
                  className="h-10 rounded-lg pl-9 pr-10 font-mono sm:h-11 sm:rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="hidden text-[11px] text-muted-foreground sm:block">
                Settings → Basic → App Secret (Show বাটনে ক্লিক করে দেখুন)
              </p>
            </div>

            {/* Redirect URL */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">OAuth Redirect URL</Label>
              <div className="flex items-center gap-2">
                <div className="relative min-w-0 flex-1">
                  <Input
                    readOnly
                    value={REDIRECT_URL}
                    className="h-10 rounded-lg pr-3 font-mono text-[11px] sm:h-11 sm:rounded-xl sm:pr-4 sm:text-xs"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-lg sm:h-11 sm:w-11 sm:rounded-xl"
                  onClick={() => void copyRedirectUrl()}
                >
                  {urlCopied ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="hidden items-start gap-1 text-[11px] text-muted-foreground sm:flex">
                <Info className="mt-0.5 h-3 w-3 shrink-0 text-blue-500" />
                এই URL টা Meta Developer App → Facebook Login → Settings → Valid OAuth Redirect
                URIs-এ add করুন। ঠিক এভাবে — trailing slash ছাড়া।
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                disabled={fbSaving || !fbAppId.trim() || (!fbAppSecret.trim() && !hasSecret)}
                onClick={() => void saveFbApp()}
                className="h-10 rounded-full bg-[#1877F2] text-white shadow-glow hover:bg-[#1877F2]/90"
              >
                <Save className="mr-2 h-4 w-4" />
                {fbSaving ? "Saving..." : "Save credentials"}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 rounded-full"
                asChild
              >
                <a
                  href="https://developers.facebook.com/apps"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  Open Meta Developers
                </a>
              </Button>

              {hasSecret && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={fbDeleting}
                  className="h-10 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => void deleteFbApp()}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  {fbDeleting ? "Removing..." : "Remove"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
