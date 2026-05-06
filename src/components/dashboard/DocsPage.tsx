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
  Zap,
  Globe,
  Key,
  Shield,
  Settings,
  Facebook,
  Link2,
  Code2,
  Users,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────── types ────────────────────────────── */
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

/* ─────────────────────────── helpers ──────────────────────────── */
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

/* ─────────────────────────── data ─────────────────────────────── */
const SECTIONS: Section[] = [
  {
    id: "meta-app",
    icon: <Facebook className="h-5 w-5" />,
    title: "Create a Meta Developer App",
    subtitle: "Facebook App setup করুন — এটা Meta connect-এর মূল ভিত্তি",
    color: "bg-[#1877F2]",
    steps: [
      {
        title: "Meta Developer Account তৈরি করুন",
        description: "Meta Developers platform-এ account খুলুন এবং developer হিসেবে verify করুন।",
        status: "required",
        details: [
          "developers.facebook.com-এ যান",
          "আপনার personal Facebook account দিয়ে log in করুন",
          "Get Started বা My Apps এ ক্লিক করুন",
          "Developer account verify করতে phone number দিন",
        ],
        links: [
          { label: "Meta Developers Portal", href: "https://developers.facebook.com" },
          {
            label: "Developer Account Guide",
            href: "https://developers.facebook.com/docs/development/register",
          },
        ],
      },
      {
        title: "নতুন App তৈরি করুন",
        description: "My Apps থেকে একটা নতুন App create করুন এবং Business type সিলেক্ট করুন।",
        status: "required",
        details: [
          "My Apps → Create App-এ ক্লিক করুন",
          'App Type হিসেবে "Business" সিলেক্ট করুন',
          "App name দিন (যেমন: MyAgency Ads Reporter)",
          "Contact email দিন এবং Create App চাপুন",
          "Security check (CAPTCHA) complete করুন",
        ],
        links: [
          {
            label: "App Creation Guide",
            href: "https://developers.facebook.com/docs/development/create-an-app",
          },
        ],
      },
      {
        title: "Marketing API Product যোগ করুন",
        description:
          "App Dashboard থেকে Marketing API enable করুন — Ad Account access-এর জন্য দরকার।",
        status: "required",
        details: [
          "App Dashboard-এ Add Products-এ যান",
          'Marketing API খুঁজে "Set Up" করুন',
          "Tools section থেকে প্রয়োজনীয় permissions চেক করুন:",
          "  • ads_read — Ad account data পড়তে",
          "  • ads_management — Campaign manage করতে",
          "  • read_insights — Insights data পেতে",
        ],
        links: [
          {
            label: "Marketing API Docs",
            href: "https://developers.facebook.com/docs/marketing-apis",
          },
        ],
      },
      {
        title: "Facebook Login যোগ করুন",
        description: "OAuth login-এর জন্য Facebook Login product setup করুন।",
        status: "required",
        details: [
          "Add Products → Facebook Login → Set Up",
          "Web platform সিলেক্ট করুন",
          "Site URL দিন: আপনার deployed app URL (যেমন: https://yourdomain.com)",
          "Settings → Valid OAuth Redirect URIs-এ আপনার callback URL যোগ করুন:",
          "  https://yourdomain.com/api/auth/facebook",
          "  http://localhost:3000/api/auth/facebook (development)",
          "Save Changes করুন",
        ],
        links: [
          {
            label: "Facebook Login Setup",
            href: "https://developers.facebook.com/docs/facebook-login/web",
          },
        ],
      },
    ],
  },
  {
    id: "app-credentials",
    icon: <Key className="h-5 w-5" />,
    title: "App Credentials সংগ্রহ করুন",
    subtitle: ".env ফাইলে এই credentials দিতে হবে",
    color: "bg-violet-600",
    steps: [
      {
        title: "App ID এবং App Secret নিন",
        description: "App Dashboard-এর Settings > Basic থেকে credentials copy করুন।",
        status: "required",
        details: [
          "App Dashboard → Settings → Basic-এ যান",
          "App ID copy করুন → FACEBOOK_APP_ID",
          "App Secret দেখতে Show ক্লিক করুন → FACEBOOK_APP_SECRET",
          "কাউকে App Secret share করবেন না",
        ],
        links: [{ label: "App Settings", href: "https://developers.facebook.com/apps" }],
        code: "FACEBOOK_APP_ID=your_app_id_here\nFACEBOOK_APP_SECRET=your_app_secret_here",
      },
      {
        title: "JWT Secret ও Encryption Key তৈরি করুন",
        description: "সিকিউর random keys generate করুন — Meta OAuth token encrypt করতে লাগবে।",
        status: "required",
        details: [
          "Terminal-এ নিচের command চালান:",
          "Minimum 32 characters হতে হবে",
          "Production-এ নতুন keys generate করুন — development key কখনো reuse করবেন না",
        ],
        code: "# Generate secure keys (run in terminal)\nopenssl rand -hex 32   # for JWT_SECRET\nopenssl rand -hex 32   # for ENCRYPTION_KEY\n\n# Add to .env\nJWT_SECRET=generated_value_here\nENCRYPTION_KEY=generated_value_here",
      },
      {
        title: "NEXTAUTH_SECRET তৈরি করুন",
        description: "NextAuth session encryption-এর জন্য আলাদা secret লাগবে।",
        status: "required",
        details: [
          "JWT_SECRET থেকে আলাদা value দিন",
          "npx auth secret command দিয়েও generate করা যায়",
        ],
        code: "NEXTAUTH_SECRET=another_random_32_char_string\nNEXTAUTH_URL=https://yourdomain.com",
      },
    ],
  },
  {
    id: "env-setup",
    icon: <Settings className="h-5 w-5" />,
    title: ".env ফাইল সম্পূর্ণ Setup",
    subtitle: "সব environment variables একসাথে — copy করে নিজের values দিন",
    color: "bg-emerald-600",
    steps: [
      {
        title: "সম্পূর্ণ .env template",
        description: "এই template copy করে project root-এ .env ফাইলে paste করুন এবং values দিন।",
        status: "info",
        details: [
          "প্রতিটা variable-এর value নিজের দিয়ে replace করুন",
          "MONGODB_URI-তে MongoDB Atlas connection string দিন",
          "কোনো variable blank রাখবেন না — app crash করবে",
          ".env ফাইল .gitignore-এ আছে কিনা নিশ্চিত করুন",
        ],
        code: `# ── Database ──────────────────────────────
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/adreportly

# ── NextAuth ───────────────────────────────
NEXTAUTH_SECRET=your_nextauth_secret_min_32_chars
NEXTAUTH_URL=https://yourdomain.com

# ── Meta / Facebook OAuth ──────────────────
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# ── Security Keys ──────────────────────────
JWT_SECRET=your_jwt_secret_min_32_chars
ENCRYPTION_KEY=your_encryption_key_min_32_chars

# ── App URL ────────────────────────────────
NEXT_PUBLIC_APP_URL=https://yourdomain.com`,
      },
    ],
  },
  {
    id: "app-review",
    icon: <Shield className="h-5 w-5" />,
    title: "App Review ও Permissions",
    subtitle: "Production-এ publish করতে Meta App Review লাগবে",
    color: "bg-amber-500",
    steps: [
      {
        title: "Development Mode-এ Test করুন",
        description:
          "App যতক্ষণ Development mode-এ থাকবে, শুধু app-এর admin/developer/tester রা ব্যবহার করতে পারবে।",
        status: "info",
        details: [
          "Development mode-এ যেকোনো Facebook user test করতে পারবে না",
          "Roles → Add Testers দিয়ে নির্দিষ্ট users যোগ করুন",
          "নিজের personal account দিয়ে test করতে পারবেন (App owner হিসেবে)",
          "সব feature test করে নিন production-এ যাওয়ার আগে",
        ],
        links: [
          {
            label: "App Roles Guide",
            href: "https://developers.facebook.com/docs/development/build-and-test/app-roles",
          },
        ],
      },
      {
        title: "Required Permissions Review-এ Submit করুন",
        description: "Public users-এর জন্য app open করতে Meta-এর App Review দরকার।",
        status: "required",
        details: [
          "App Review → Permissions and Features-এ যান",
          "নিচের permissions-এর জন্য request করুন:",
          "  • ads_read — Ad account read access",
          "  • ads_management — Campaign management",
          "  • read_insights — Advertising insights",
          "প্রতিটা permission-এর জন্য use case describe করুন",
          "Screen recordings দিয়ে দেখান কীভাবে permission ব্যবহার হবে",
          "Review 5–14 business days সময় নিতে পারে",
        ],
        links: [
          { label: "App Review Overview", href: "https://developers.facebook.com/docs/app-review" },
          {
            label: "Marketing API Permissions",
            href: "https://developers.facebook.com/docs/marketing-api/access",
          },
        ],
      },
      {
        title: "Business Verification করুন",
        description: "Marketing API full access পেতে Meta Business Verification দরকার।",
        status: "required",
        details: [
          "Meta Business Suite-এ যান → Settings → Business Info",
          "Business documents upload করুন (trade license / incorporation certificate)",
          "Verification 3–7 business days লাগতে পারে",
          "Verified হলে Advanced Access পাবেন",
        ],
        links: [
          {
            label: "Business Verification",
            href: "https://www.facebook.com/business/help/2058515294227817",
          },
          { label: "Meta Business Suite", href: "https://business.facebook.com" },
        ],
      },
    ],
  },
  {
    id: "connect-flow",
    icon: <Link2 className="h-5 w-5" />,
    title: "AdReportly-তে Meta Connect করুন",
    subtitle: "Settings-এ credentials save করে Meta connect করার ধাপ",
    color: "bg-primary",
    steps: [
      {
        title: "Settings-এ App ID ও Secret সেভ করুন",
        description:
          "Dashboard → Settings পেইজে Facebook App Credentials section-এ App ID এবং App Secret দিন।",
        status: "required",
        details: [
          "Dashboard → Settings পেইজে যান",
          "Facebook App Credentials section খুঁজুন",
          "App ID field-এ আপনার Facebook App ID দিন",
          "App Secret field-এ App Secret দিন (encrypted হয়ে DB-তে save হবে)",
          'Save credentials বাটনে ক্লিক করুন — "Credentials saved" দেখাবে',
        ],
        links: [{ label: "Settings Page", href: "/dashboard/settings" }],
      },
      {
        title: "OAuth Redirect URL Meta App-এ Add করুন",
        description:
          "Settings পেইজে দেখানো Redirect URL টা Meta Developer App-এ exactly add করতে হবে।",
        status: "required",
        details: [
          "Dashboard → Settings-এ OAuth Redirect URL copy করুন (Copy button আছে)",
          "URL format: https://yourdomain.com/api/auth/facebook/callback",
          "Meta Developer App → Facebook Login → Settings-এ যান",
          "Valid OAuth Redirect URIs-এ এই URL paste করুন",
          "Exactly same URL দিন — trailing slash বা http/https mistake করবেন না",
          "Save Changes করুন",
          "Development-এ: http://localhost:3000/api/auth/facebook/callback ও add করুন",
        ],
        links: [{ label: "Facebook Login Settings", href: "https://developers.facebook.com/apps" }],
        code: "# Redirect URL format:\nhttps://yourdomain.com/api/auth/facebook/callback\n\n# For local development also add:\nhttp://localhost:3000/api/auth/facebook/callback",
      },
      {
        title: "Dashboard থেকে Meta Connect করুন",
        description:
          "Credentials save হওয়ার পর Meta Connect পেইজে গিয়ে Facebook account connect করুন।",
        status: "required",
        details: [
          "Dashboard → Meta Connect-এ যান",
          "Connect Facebook Account বাটনে ক্লিক করুন",
          "Facebook-এ redirect হবে — আপনার account দিয়ে log in করুন",
          "Required permissions গুলো Allow করুন",
          "Redirect হয়ে dashboard-এ ফিরে আসবেন",
          "Ad accounts list-এ আপনার accounts দেখাবে",
        ],
      },
      {
        title: "Ad Accounts Verify করুন",
        description: "Connect হওয়ার পর আপনার ad accounts সঠিকভাবে দেখাচ্ছে কিনা confirm করুন।",
        status: "required",
        details: [
          "Meta Connect পেইজে Ad Accounts section দেখুন",
          "আপনার সব Facebook Ad accounts list-এ আসা উচিত",
          "Account status 'active' দেখালে সব ঠিক আছে",
          "Dashboard → Campaigns-এ গিয়ে data দেখুন",
          "Reports পেইজ থেকে campaign export করুন",
        ],
      },
      {
        title: "Client Share Link তৈরি করুন",
        description:
          "Connect হওয়ার পর Reports পেইজ থেকে client-দের জন্য read-only link তৈরি করুন।",
        status: "optional",
        details: [
          "Dashboard → Reports-এ যান",
          "Shareable Link section-এ campaign সিলেক্ট করুন",
          "Client email এবং expiry days দিন",
          "Create Link চাপুন — link automatically copy হবে",
          "Client link open করলে login ছাড়াই metrics দেখতে পারবে",
        ],
        links: [{ label: "Reports Page", href: "/dashboard/reports" }],
      },
    ],
  },
  {
    id: "troubleshoot",
    icon: <AlertTriangle className="h-5 w-5" />,
    title: "Common Issues ও Solutions",
    subtitle: "সবচেয়ে বেশি দেখা সমস্যা এবং সমাধান",
    color: "bg-rose-500",
    steps: [
      {
        title: "OAuth State Mismatch Error",
        description: 'Meta Connect-এ "OAuth state mismatch" দেখালে এটি করুন।',
        status: "info",
        details: [
          "JWT_SECRET এবং ENCRYPTION_KEY .env-এ সঠিকভাবে set আছে কিনা দেখুন",
          "Minimum 32 characters হতে হবে",
          "Server restart করুন",
          "Browser cookies clear করে আবার try করুন",
        ],
      },
      {
        title: "Token Exchange Failed",
        description:
          'Facebook callback-এ "token exchange failed" দেখালে App credentials check করুন।',
        status: "info",
        details: [
          "FACEBOOK_APP_ID এবং FACEBOOK_APP_SECRET সঠিক কিনা check করুন",
          "Facebook Login OAuth Redirect URIs-এ আপনার callback URL আছে কিনা দেখুন",
          "URL হবে: https://yourdomain.com/api/auth/facebook",
          "http ও https আলাদা — production-এ https দিন",
          "Trailing slash নেই কিনা নিশ্চিত করুন",
        ],
      },
      {
        title: "Ad Accounts দেখাচ্ছে না",
        description: "Connect হওয়ার পরও ad accounts list খালি থাকলে:",
        status: "info",
        details: [
          "Facebook account-এ ad account access আছে কিনা দেখুন",
          "Meta Business Suite-এ account কি active আছে?",
          "App-কে correct permissions দেওয়া হয়েছে কিনা — ads_read অবশ্যই লাগবে",
          "Re-connect করুন: Meta Connect পেইজে আবার Connect করুন",
          "Meta Ads Manager-এ সরাসরি গিয়ে account status দেখুন",
        ],
        links: [
          { label: "Meta Ads Manager", href: "https://www.facebook.com/adsmanager" },
          { label: "Business Settings", href: "https://business.facebook.com/settings" },
        ],
      },
      {
        title: "App Needs Review (Permission Error)",
        description: "Development mode-এ অন্য users access পাচ্ছে না বা permission error দেখাচ্ছে:",
        status: "info",
        details: [
          "Development mode-এ শুধু app-এর admin, developer, tester role-এর users connect করতে পারবে",
          "Facebook App → Roles → Testers-এ user যোগ করুন",
          "Production users-এর জন্য App Review submit করুন",
          "App Review approve হলে Live mode-এ switch করুন",
        ],
        links: [{ label: "App Review Status", href: "https://developers.facebook.com/apps" }],
      },
    ],
  },
];

/* ─────────────────────────── sub-components ────────────────────── */
function StepCard({ step, index }: { step: Step; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden"
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
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
          <ul className="space-y-1.5">
            {step.details.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <span
                  className={
                    d.startsWith("  ") ? "pl-3 text-muted-foreground font-mono text-xs" : ""
                  }
                >
                  {d.trim()}
                </span>
              </li>
            ))}
          </ul>

          {step.code && (
            <div className="rounded-xl bg-muted/60 border border-border">
              <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Code / Config
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
      className="rounded-3xl border border-border bg-card shadow-soft overflow-hidden"
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
        <div className="flex items-center gap-2 shrink-0">
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
        <div className="border-t border-border px-5 pb-5 pt-4 space-y-3 sm:px-6 sm:pb-6">
          {section.steps.map((step, i) => (
            <StepCard key={i} step={step} index={i} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ─────────────────────────── main page ─────────────────────────── */
export function DocsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
            <BookOpen className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Documentation & Setup Guide</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Meta App তৈরি থেকে শুরু করে AdReportly-তে connect করা পর্যন্ত — সব ধাপ এখানে আছে।
            </p>
          </div>
        </div>

        {/* Quick links */}
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
              {s.title.split(" ").slice(0, 3).join(" ")}…
            </a>
          ))}
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-400/30 bg-blue-500/8 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
        <p className="text-sm text-foreground">
          প্রতিটা section-এ ক্লিক করলে expand হবে। প্রতিটা step-এ ক্লিক করলে বিস্তারিত দেখাবে।{" "}
          <span className="font-semibold text-rose-700">Required</span> steps না করলে app কাজ করবে
          না। <span className="font-semibold text-amber-700">Optional</span> steps পরে করা যাবে।
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {SECTIONS.map((section, idx) => (
          <div key={section.id} id={section.id}>
            <SectionCard section={section} idx={idx} />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700">
            <Users className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold">এখনও সমস্যা হচ্ছে?</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Support পেইজে টিকেট খুলুন — আমরা সাহায্য করব।
            </p>
            <a
              href="/dashboard/support"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition hover:underline"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              Support পেইজে যান
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
