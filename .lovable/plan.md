## FB Ads Analytics SaaS — Build Plan

A glassmorphic SaaS platform where ad agencies connect Facebook, view real-time ad metrics, and share read-only campaign reports with clients via secure expiring links.

### Stack adjustments (vs. original spec)

Your spec called for Next.js 14 + MongoDB; this Lovable project runs **TanStack Start (React) + Lovable Cloud (Postgres/Supabase) on Cloudflare Workers**. We'll keep all features identical but use this stack — same UX, same encryption, same security model.

---

### 1. Design System

- **Light mode default** (pure white `#FFFFFF` background) with deep navy text
- **Glassmorphism**: frosted blur cards with subtle borders + soft shadows
- **Soft UI**: rounded corners (16–24px), pill buttons, gentle gradients (blue → cyan accents)
- **Accents**: Facebook-blue primary (`#1877F2`-ish), lime green for positive metrics (matches your screenshots)
- **Typography**: clean sans (Inter), large bold display headings
- **Framer Motion** for fade-up, staggered lists, scroll-triggered reveals, and route transitions
- 100% responsive (desktop, tablet, mobile with collapsible sidebar)

### 2. Public Landing Page (`/`)

Single-route marketing page with these sections:
- **Hero** — bold headline, subhead, "Get Started" + "Watch Demo" CTAs, animated glassmorphic floating card showing live ROI/spend mock data
- **How It Works** — 3-step horizontal scroll-triggered: Connect FB → Analyze Data → Share Reports
- **Features** — grid of glass cards (real-time sync, AES-256 encryption, shareable client links, multi-account support)
- **Pricing** — 3 cards (Free / Pro $50 / Enterprise) with hover lift; Pro highlighted; each with "Get Started" → Stripe checkout
- **Testimonials** — animated auto-scrolling carousel
- **FAQ** — accordion with smooth expand
- **Footer** — multi-column (Product, Company, Resources, Legal) with social links

### 3. Auth (Email/password + Facebook link)

- Sign up / sign in with **email + password** via Lovable Cloud auth
- After signup, agency lands on dashboard; **Meta Connect** page is where they link Facebook
- Protected routes under `/_authenticated/*` using TanStack route guards
- Forgot password + `/reset-password` page included

### 4. Agency Dashboard (`/dashboard`)

Replicates your screenshots exactly:
- **Sidebar** (left): logo, MENU section with Dashboard, Campaigns, Clients, Reports, Meta Connect, Settings; active state pill; user card pinned bottom
- **Top bar**: "Good Morning, {Agency}" greeting, search, theme toggle (light/dark), notifications, profile dropdown, Export, Add new entry
- **Dashboard widgets**:
  - Ad Spend Trend (Recharts grouped bar — Spend vs Results, last 30 days)
  - Top Campaigns (3 vertical pill cards with spend totals, color-coded)
  - Recent Campaigns table (NO, name, spend, results, ROAS)
  - Account Status card (Active indicators, active campaigns count)

### 5. Other Dashboard Pages

- **Campaigns** — full table with status badges (Active / Paused / Completed), filter by ad account, Spend / Results / CTR / CPC / ROAS columns, "Share" action per row
- **Clients** — table matching screenshot (Client, Email, Accounts, Status, Last Login, Actions: view/edit), Add new client modal
- **Reports** — two-column: "Generate Report" (client + date range → Download PDF/CSV) and "Create Shareable Link" (client + name + dates + expiry days → produces unique URL)
- **Meta Connect** — empty state with "Connect Facebook Account" CTA + Ad Accounts list with active toggle and Sync Now (Facebook OAuth wired but uses placeholder until you add FB App credentials)
- **Settings** — agency profile, billing/subscription, security
- Smooth Framer Motion transitions between routes

### 6. Public Client Share View (`/view/:token`)

No-login read-only dashboard that decrypts agency's FB token server-side and fetches only the shared campaign's data. Shows campaign name, metrics summary, daily breakdown table, and chart. Returns "Link expired" if past expiry.

### 7. Backend (Lovable Cloud + TanStack server functions)

**Database tables** (Postgres equivalents of your Mongo schemas):
- `profiles` — agency profile (name, email, fb_user_id)
- `user_roles` — separate roles table (agency_owner, admin)
- `ad_accounts` — connected FB ad accounts per agency
- `clients` — agency's clients
- `shared_links` — unique_token (UUID), campaign_id, agency_id, client_email, expires_at
- `subscriptions` — Stripe plan tracking
- `fb_tokens` — encrypted FB access tokens (AES-256, server-only access via service role)

**Server functions** (`createServerFn`):
- Facebook OAuth callback → exchange code → AES-256 encrypt token → store
- `getAdAccounts`, `getCampaigns(accountId)`, `getCampaignInsights(campaignId, datePreset)` — decrypt token, call Graph API, return data
- `generateShareLink({ campaignId, clientEmail, expiryDays })` → returns share URL
- `getSharedCampaign(token)` — public, no auth, validates token + expiry
- PDF/CSV report generation

**Security**:
- AES-256-GCM encryption for FB tokens (key in `FB_TOKEN_ENCRYPTION_KEY` secret)
- RLS policies so agencies only see their own data
- Share tokens are random UUIDs, single-campaign scoped, expire automatically
- Service-role admin client only used in trusted server paths

### 8. Pricing & Stripe

- **Built-in Stripe payments** (no account needed to start)
- 3 plans: Free ($0), Pro ($50/mo), Enterprise (contact)
- Plan limits enforced server-side: Free = 1 ad account / 5 campaigns / 7-day retention; Pro = 5 / 50 / 90 days + unlimited share links; Enterprise = unlimited
- Customer portal for managing subscription
- Stripe webhook → updates `subscriptions` table

### 9. Facebook OAuth (placeholder mode)

Full OAuth flow built end-to-end, but until you add `FACEBOOK_APP_ID` + `FACEBOOK_APP_SECRET` secrets, the "Connect Facebook" button shows a friendly "Add your Facebook App credentials in Settings → Secrets to enable" message. A demo ad account row is shown so the dashboard isn't empty during development.

---

### Build order

1. Design tokens + landing page (hero → footer)
2. Email/password auth + protected routes + agency profile
3. Dashboard shell (sidebar, top bar, light/dark toggle)
4. Database schema + RLS + server functions skeleton
5. Dashboard pages: Dashboard, Campaigns, Clients, Reports, Meta Connect, Settings
6. AES-256 encryption helper + Facebook OAuth flow + Graph API server functions
7. Share link generation + public `/view/:token` page
8. Stripe payments + plan enforcement
9. PDF/CSV export + polish, animations, responsive QA

### What I'll need from you later

- Facebook App ID + Secret (when ready, added as project secrets)
- Confirm Stripe is the right payment provider (will run eligibility check before enabling)

This is a substantial build — I'll start with sections 1–3 (landing + auth + dashboard shell) so you can preview the look-and-feel quickly, then layer the backend on top.