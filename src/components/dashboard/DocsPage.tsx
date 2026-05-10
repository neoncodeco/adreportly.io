"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Info,
  AlertTriangle,
  Key,
  Shield,
  Facebook,
  Code2,
  Users,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

type StepStatus = "required" | "optional" | "info";

type Step = {
  title: string;
  description: string;
  status: StepStatus;
  details: string[];
  links?: { label: string; href: string }[];
  code?: string;
};

type Section = {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  steps: Step[];
};

function statusBadge(s: StepStatus) {
  if (s === "required") return "bg-rose-500/15 text-rose-700 ring-1 ring-rose-400/30";
  if (s === "optional") return "bg-amber-500/15 text-amber-700 ring-1 ring-amber-400/30";
  return "bg-blue-500/15 text-blue-700 ring-1 ring-blue-400/30";
}

function statusLabel(s: StepStatus) {
  if (s === "required") return "Required";
  if (s === "optional") return "Optional";
  return "Info";
}

const SECTIONS: Section[] = [
  {
    id: "meta-app",
    icon: <Facebook className="h-5 w-5" />,
    title: "Create your Meta developer app",
    subtitle: "One-time setup in Meta for Developers",
    color: "bg-[#1877F2]",
    steps: [
      {
        title: "Register and open the developer portal",
        description: "Use your Meta account to access the developer dashboard.",
        status: "required",
        details: [
          "Sign in at developers.facebook.com",
          "Complete developer registration if prompted",
          "Open My Apps when you are ready to create an application",
        ],
        links: [
          { label: "Meta for Developers", href: "https://developers.facebook.com" },
          {
            label: "Developer registration",
            href: "https://developers.facebook.com/docs/development/register",
          },
        ],
      },
      {
        title: "Create a new app",
        description: "Choose a business-oriented app type suitable for ads data.",
        status: "required",
        details: [
          "Select Create App and choose the Business app type where available",
          "Enter an app display name and contact email",
          "Complete any security verification required by Meta",
        ],
        links: [
          {
            label: "Create an app",
            href: "https://developers.facebook.com/docs/development/create-an-app",
          },
        ],
      },
      {
        title: "Enable Marketing API",
        description: "Required so AdReportly can read ad accounts and performance data.",
        status: "required",
        details: [
          "In the app dashboard, add the Marketing API product and complete setup",
          "Typical permissions include ads read, ads management, and insights as needed for your use case",
          "Follow Meta’s documentation for the exact permission names in your app version",
        ],
        links: [
          {
            label: "Marketing API overview",
            href: "https://developers.facebook.com/docs/marketing-apis",
          },
        ],
      },
      {
        title: "Configure Facebook Login (web)",
        description:
          "OAuth uses Facebook Login; your site URL and redirect URI must match exactly.",
        status: "required",
        details: [
          "Add the Facebook Login product and choose the website platform",
          "Set the site URL to your production domain (and use localhost only for local testing)",
          "Under Valid OAuth Redirect URIs, you will add the callback URL shown in AdReportly Settings (see the next section)",
        ],
        links: [
          {
            label: "Facebook Login for the web",
            href: "https://developers.facebook.com/docs/facebook-login/web",
          },
        ],
      },
    ],
  },
  {
    id: "adreportly-connect",
    icon: <Key className="h-5 w-5" />,
    title: "Connect AdReportly",
    subtitle: "Store your App ID and Secret in Settings, then authorize Meta",
    color: "bg-violet-600",
    steps: [
      {
        title: "Add App ID and App Secret in Settings",
        description:
          "Credentials are stored encrypted on the server. They are not written to a local .env file in your browser.",
        status: "required",
        details: [
          "Open Dashboard → Settings",
          "In Facebook App credentials, paste your App ID from Meta → App settings → Basic",
          "Paste your App Secret (treat it like a password; do not share it)",
          "Save. You must enter both values together when adding or updating the secret",
        ],
        links: [{ label: "Open Settings", href: "/dashboard/settings" }],
      },
      {
        title: "Register the OAuth redirect URI in Meta",
        description:
          "The redirect URI in Meta must match the value shown in Settings, character for character.",
        status: "required",
        details: [
          "In Settings, copy the OAuth redirect URL (callback) using the copy control",
          "In your Meta app: Facebook Login → Settings → Valid OAuth Redirect URIs",
          "Paste the same URL. For local development, include your localhost callback if you test locally",
          "Use HTTPS in production. Avoid trailing slashes unless your copied URL includes one",
        ],
        links: [{ label: "Meta app dashboard", href: "https://developers.facebook.com/apps" }],
        code: "Example (replace with your domain):\nhttps://yourdomain.com/api/auth/facebook/callback\n\nLocal development:\nhttp://localhost:3000/api/auth/facebook/callback",
      },
      {
        title: "Authorize with Meta Connect",
        description:
          "After credentials are saved, connect your Facebook user that has access to ad accounts.",
        status: "required",
        details: [
          "Go to Dashboard → Meta Connect",
          "Choose Connect Facebook and approve the requested permissions",
          "When you return to the dashboard, your ad accounts should appear in the list",
          "You can exclude individual accounts from reporting using the toggles on that page",
        ],
        links: [{ label: "Open Meta Connect", href: "/dashboard/meta-connect" }],
      },
    ],
  },
  {
    id: "using-dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    title: "Using the dashboard",
    subtitle: "Campaigns, clients, and reports in AdReportly",
    color: "bg-primary",
    steps: [
      {
        title: "Campaigns and overview",
        description: "Spend and performance roll up from the ad accounts you include.",
        status: "info",
        details: [
          "The overview reflects Meta data for enabled ad accounts",
          "Campaign lists respect your plan limits and search filters",
        ],
        links: [{ label: "Campaigns", href: "/dashboard/campaigns" }],
      },
      {
        title: "Clients",
        description:
          "Maintain a client roster before generating share links for their email addresses.",
        status: "required",
        details: [
          "Add each client under Dashboard → Clients",
          "Your plan defines how many clients you can create",
          "Removing a client also removes associated share links for that email",
        ],
        links: [{ label: "Clients", href: "/dashboard/clients" }],
      },
      {
        title: "Reports and client links",
        description: "Export data or create time-limited read-only links for clients.",
        status: "optional",
        details: [
          "Reports: choose a campaign, date range, and optional client name and email on the export",
          "PDF and CSV use the same Meta date preset you select",
          "Shareable links are created on the Reports page and expire on the date you set",
        ],
        links: [{ label: "Reports", href: "/dashboard/reports" }],
      },
    ],
  },
  {
    id: "app-review",
    icon: <Shield className="h-5 w-5" />,
    title: "App review and production access",
    subtitle: "When you need Meta approval beyond development testing",
    color: "bg-amber-500",
    steps: [
      {
        title: "Development versus live mode",
        description:
          "In development, typically only app admins, developers, and testers can complete login.",
        status: "info",
        details: [
          "Add testers under App roles in the Meta developer app if colleagues need access before review",
          "Broader access usually requires App Review and switching to live mode per Meta’s process",
        ],
        links: [
          {
            label: "Testing your app",
            href: "https://developers.facebook.com/docs/development/build-and-test/app-roles",
          },
        ],
      },
      {
        title: "Submitting for review",
        description:
          "Prepare use cases and any screen recordings Meta requests for each permission.",
        status: "optional",
        details: [
          "Use App Review in the Meta developer app to request advanced access where needed",
          "Timeframes and requirements are determined by Meta",
        ],
        links: [
          { label: "App Review", href: "https://developers.facebook.com/docs/app-review" },
          {
            label: "Marketing API access",
            href: "https://developers.facebook.com/docs/marketing-api/access",
          },
        ],
      },
      {
        title: "Business verification",
        description: "Some features may require a verified business in Meta Business Manager.",
        status: "optional",
        details: ["Follow Meta’s business verification flow in Business Manager when prompted"],
        links: [
          {
            label: "Business verification help",
            href: "https://www.facebook.com/business/help/2058515294227817",
          },
          { label: "Meta Business Suite", href: "https://business.facebook.com" },
        ],
      },
    ],
  },
  {
    id: "troubleshoot",
    icon: <AlertTriangle className="h-5 w-5" />,
    title: "Troubleshooting",
    subtitle: "Common connection and data issues",
    color: "bg-rose-500",
    steps: [
      {
        title: "OAuth or redirect errors",
        description: "Usually a mismatch between Meta and AdReportly Settings.",
        status: "info",
        details: [
          "Confirm the redirect URI in Meta matches the copied URL from Settings exactly",
          "Confirm App ID and App Secret in Settings match the Meta app you configured",
          "Try the connection again after saving changes in Meta (allow a short time to propagate)",
        ],
      },
      {
        title: "Token or permission errors after login",
        description: "The Meta app may be missing products or permissions for your use case.",
        status: "info",
        details: [
          "Verify Marketing API and Facebook Login are configured as Meta describes",
          "Ensure the Facebook user you authorize has access to the relevant ad accounts",
        ],
      },
      {
        title: "No ad accounts listed",
        description:
          "The authorized user must see those accounts in Ads Manager or Business settings.",
        status: "info",
        details: [
          "Check Meta Ads Manager with the same Facebook user you connected",
          "Confirm accounts are not disabled and that your app has appropriate access",
        ],
        links: [
          { label: "Ads Manager", href: "https://www.facebook.com/adsmanager" },
          { label: "Business settings", href: "https://business.facebook.com/settings" },
        ],
      },
      {
        title: "Disconnect and start over",
        description:
          "You can remove the Meta connection from Meta Connect when you need a clean setup.",
        status: "info",
        details: [
          "Meta Connect includes an option to disconnect and clear stored app credentials",
          "After disconnecting, add App ID and App Secret again in Settings before reconnecting",
        ],
        links: [{ label: "Meta Connect", href: "/dashboard/meta-connect" }],
      },
    ],
  },
];

function StepCard({ step, index }: { step: Step; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 p-4 text-left transition hover:bg-muted/30"
      >
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-foreground">{step.title}</span>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                statusBadge(step.status),
              )}
            >
              {statusLabel(step.status)}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
        </div>
        {open ? (
          <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="space-y-3 border-t border-border px-4 pb-4 pt-3">
          <ul className="space-y-1.5">
            {step.details.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <span
                  className={
                    d.startsWith("  ") ? "pl-3 font-mono text-xs text-muted-foreground" : ""
                  }
                >
                  {d.trim()}
                </span>
              </li>
            ))}
          </ul>

          {step.code && (
            <div className="rounded-xl border border-border bg-muted/60">
              <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Reference
                </span>
              </div>
              <pre className="overflow-x-auto px-4 py-3 text-xs leading-relaxed text-foreground">
                <code>{step.code}</code>
              </pre>
            </div>
          )}

          {step.links && step.links.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {step.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/8 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/15"
                >
                  <ExternalLink className="h-3 w-3" />
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function SectionCard({ section, idx }: { section: Section; idx: number }) {
  const [collapsed, setCollapsed] = useState(idx !== 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: idx * 0.08 }}
      className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
    >
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-muted/20 sm:p-6"
      >
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-glow",
            section.color,
          )}
        >
          {section.icon}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-foreground sm:text-lg">{section.title}</h2>
          <p className="text-xs text-muted-foreground">{section.subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground sm:inline">
            {section.steps.length} steps
          </span>
          {collapsed ? (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {!collapsed && (
        <div className="space-y-3 border-t border-border px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
          {section.steps.map((step, i) => (
            <StepCard key={i} step={step} index={i} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export function DocsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
            <BookOpen className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Documentation</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Connect Meta to AdReportly: developer app setup, credentials in Settings, and how to
              use campaigns, clients, and reports. Hosting and server configuration are handled by
              your deployment environment, not on this page.
            </p>
          </div>
        </div>

        <div className="relative mt-5 flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted hover:text-primary"
            >
              <ArrowRight className="h-3 w-3" />
              {s.title.length > 42 ? `${s.title.slice(0, 40)}…` : s.title}
            </a>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-sm text-foreground">
          Expand each section for an overview, then open individual steps for detail. Steps marked{" "}
          <span className="font-semibold text-rose-700">Required</span> are necessary to connect and
          load data. <span className="font-semibold text-amber-700">Optional</span> items apply only
          in specific situations.
        </p>
      </div>

      <div className="space-y-4">
        {SECTIONS.map((section, idx) => (
          <div key={section.id} id={section.id}>
            <SectionCard section={section} idx={idx} />
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700">
            <Users className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold">Need more help?</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Open a ticket from Support and describe what you tried and any error messages you see.
            </p>
            <a
              href="/dashboard/support"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition hover:underline"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              Go to Support
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
