
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'agency_owner');
CREATE TYPE public.subscription_plan AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE public.subscription_status AS ENUM ('active', 'past_due', 'canceled', 'trialing');
CREATE TYPE public.client_status AS ENUM ('active', 'paused', 'archived');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  organization TEXT,
  avatar_url TEXT,
  fb_user_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by owner" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============ USER ROLES (separate, security definer) ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- ============ AD ACCOUNTS ============
CREATE TABLE public.ad_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fb_account_id TEXT NOT NULL,
  name TEXT NOT NULL,
  currency TEXT DEFAULT 'USD',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (agency_id, fb_account_id)
);
ALTER TABLE public.ad_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency views own ad accounts" ON public.ad_accounts
  FOR SELECT USING (auth.uid() = agency_id);
CREATE POLICY "Agency inserts own ad accounts" ON public.ad_accounts
  FOR INSERT WITH CHECK (auth.uid() = agency_id);
CREATE POLICY "Agency updates own ad accounts" ON public.ad_accounts
  FOR UPDATE USING (auth.uid() = agency_id);
CREATE POLICY "Agency deletes own ad accounts" ON public.ad_accounts
  FOR DELETE USING (auth.uid() = agency_id);

-- ============ CLIENTS ============
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  organization TEXT,
  email TEXT NOT NULL,
  status public.client_status NOT NULL DEFAULT 'active',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency views own clients" ON public.clients
  FOR SELECT USING (auth.uid() = agency_id);
CREATE POLICY "Agency inserts own clients" ON public.clients
  FOR INSERT WITH CHECK (auth.uid() = agency_id);
CREATE POLICY "Agency updates own clients" ON public.clients
  FOR UPDATE USING (auth.uid() = agency_id);
CREATE POLICY "Agency deletes own clients" ON public.clients
  FOR DELETE USING (auth.uid() = agency_id);

-- ============ SHARED LINKS ============
CREATE TABLE public.shared_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_token TEXT NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
  agency_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  campaign_id TEXT NOT NULL,
  campaign_name TEXT,
  report_name TEXT,
  client_email TEXT,
  date_from DATE,
  date_to DATE,
  expires_at TIMESTAMPTZ NOT NULL,
  view_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX shared_links_token_idx ON public.shared_links (unique_token);
ALTER TABLE public.shared_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency views own shared links" ON public.shared_links
  FOR SELECT USING (auth.uid() = agency_id);
CREATE POLICY "Agency inserts own shared links" ON public.shared_links
  FOR INSERT WITH CHECK (auth.uid() = agency_id);
CREATE POLICY "Agency deletes own shared links" ON public.shared_links
  FOR DELETE USING (auth.uid() = agency_id);
-- Public read by token is handled server-side via service role.

-- ============ FB TOKENS (encrypted, server-only) ============
CREATE TABLE public.fb_tokens (
  agency_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_token TEXT NOT NULL,
  iv TEXT NOT NULL,
  auth_tag TEXT NOT NULL,
  fb_user_id TEXT,
  scope TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fb_tokens ENABLE ROW LEVEL SECURITY;
-- No SELECT/INSERT/UPDATE policies — only service role can access.

-- ============ SUBSCRIPTIONS ============
CREATE TABLE public.subscriptions (
  agency_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan public.subscription_plan NOT NULL DEFAULT 'free',
  status public.subscription_status NOT NULL DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency views own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = agency_id);

-- ============ TIMESTAMP TRIGGER ============
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER fb_tokens_touch BEFORE UPDATE ON public.fb_tokens
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER subscriptions_touch BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ AUTO-PROFILE ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, organization)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'organization'
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'agency_owner');

  INSERT INTO public.subscriptions (agency_id, plan, status)
  VALUES (NEW.id, 'free', 'active');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
