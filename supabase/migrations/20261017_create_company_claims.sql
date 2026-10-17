-- Migration: Create company_claims and update companies table for verification badges
CREATE TABLE IF NOT EXISTS public.company_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    company_slug TEXT,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    claimant_name TEXT NOT NULL,
    designation TEXT NOT NULL,
    official_email TEXT NOT NULL,
    phone TEXT NOT NULL,
    proof_notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'scrutiny_needed', 'approved', 'rejected'
    admin_notes TEXT,
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by company_id and user_id
CREATE INDEX IF NOT EXISTS idx_company_claims_company_id ON public.company_claims(company_id);
CREATE INDEX IF NOT EXISTS idx_company_claims_user_id ON public.company_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_company_claims_status ON public.company_claims(status);

-- Add verification badge columns to companies table if not exists
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS is_claimed BOOLEAN DEFAULT false;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS verification_badge TEXT DEFAULT 'none'; -- 'none', 'scrutiny_needed', 'gold_verified'
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS claimed_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

-- Enable RLS & policies
ALTER TABLE public.company_claims ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow public read access to company_claims" ON public.company_claims;
    DROP POLICY IF EXISTS "Allow public insert to company_claims" ON public.company_claims;
    DROP POLICY IF EXISTS "Allow public update to company_claims" ON public.company_claims;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Allow public read access to company_claims" 
    ON public.company_claims FOR SELECT USING (true);

CREATE POLICY "Allow public insert to company_claims" 
    ON public.company_claims FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to company_claims" 
    ON public.company_claims FOR UPDATE USING (true) WITH CHECK (true);
