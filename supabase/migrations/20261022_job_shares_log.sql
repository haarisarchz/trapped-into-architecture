-- Migration: Create job_shares table for real-time tracking of job shares with timestamps and user roles
CREATE TABLE IF NOT EXISTS public.job_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT,
    user_email TEXT,
    user_role TEXT DEFAULT 'guest', -- 'superadmin', 'admin', 'jobadmin', 'employer', 'user', 'guest'
    platform TEXT DEFAULT 'whatsapp', -- 'whatsapp', 'linkedin', 'facebook', 'twitter', 'copy_link'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning fast time-range filtering and job aggregations
CREATE INDEX IF NOT EXISTS idx_job_shares_created_at ON public.job_shares(created_at);
CREATE INDEX IF NOT EXISTS idx_job_shares_job_id ON public.job_shares(job_id);
CREATE INDEX IF NOT EXISTS idx_job_shares_user_role ON public.job_shares(user_role);

-- Enable RLS
ALTER TABLE public.job_shares ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow public read access to job_shares" ON public.job_shares;
    DROP POLICY IF EXISTS "Allow public insert to job_shares" ON public.job_shares;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Allow public read access to job_shares" 
    ON public.job_shares FOR SELECT USING (true);

CREATE POLICY "Allow public insert to job_shares" 
    ON public.job_shares FOR INSERT WITH CHECK (true);
