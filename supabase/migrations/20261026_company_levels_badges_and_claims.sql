-- 20261026_company_levels_badges_and_claims.sql
-- Migration: Add Studio Levels (Bronze, Silver, Gold, Platinum, Diamond), Badges, Claims, and AI Suggestions for Companies

-- 1. ADD NEW COLUMNS TO public.companies SAFELY (Preserving all existing data)
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS badge_tier TEXT DEFAULT 'bronze',         -- 'bronze', 'silver', 'gold', 'platinum', 'diamond'
  ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 20,
  ADD COLUMN IF NOT EXISTS is_claimed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS claimed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ai_suggestions JSONB DEFAULT NULL;

-- 2. CREATE TABLE: company_claim_requests
CREATE TABLE IF NOT EXISTS public.company_claim_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  company_slug TEXT NOT NULL,
  company_name TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  requester_name TEXT,
  work_email TEXT,
  phone_number TEXT,
  designation TEXT, -- e.g. 'Principal Architect', 'Partner / CEO', 'HR Manager'
  verification_notes TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_claim_requests_company ON public.company_claim_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_company_claim_requests_user ON public.company_claim_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_company_claim_requests_status ON public.company_claim_requests(status);

-- 3. ENABLE RLS POLICIES FOR company_claim_requests
ALTER TABLE public.company_claim_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert claim requests" ON public.company_claim_requests;
CREATE POLICY "Public can insert claim requests"
  ON public.company_claim_requests
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can read claim requests" ON public.company_claim_requests;
CREATE POLICY "Authenticated can read claim requests"
  ON public.company_claim_requests
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated can update claim requests" ON public.company_claim_requests;
CREATE POLICY "Authenticated can update claim requests"
  ON public.company_claim_requests
  FOR UPDATE
  USING (true);
