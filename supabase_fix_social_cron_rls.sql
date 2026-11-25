-- =========================================================================
-- RUN THIS IN SUPABASE SQL EDITOR (https://supabase.com/dashboard/project/bcifyymjfktabtsmocnc/sql)
-- =========================================================================

-- 1. Create the social_publishing_logs table for permanent deduplication
CREATE TABLE IF NOT EXISTS public.social_publishing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'publishing', 'published', 'failed'
    external_post_id TEXT,
    external_post_url TEXT,
    error_message TEXT,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, platform)
);

-- Enable RLS and grant access for server publishing
ALTER TABLE public.social_publishing_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to social_publishing_logs" ON public.social_publishing_logs;
CREATE POLICY "Allow all access to social_publishing_logs"
    ON public.social_publishing_logs FOR ALL
    USING (true)
    WITH CHECK (true);

-- 2. Allow server/app to update jobs table (for cron status transition & scheduled_at)
DROP POLICY IF EXISTS "Allow server update on jobs" ON public.jobs;
CREATE POLICY "Allow server update on jobs"
    ON public.jobs FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 3. Immediately mark the 7 stuck jobs as published so they never trigger again
UPDATE public.jobs
SET status = 'published', scheduled_at = NOW()
WHERE id IN (
  '04d1d2e7-9330-468c-bd86-327621c04641', -- Bawdekar Consultants LLP
  '48169c43-8709-4663-a3a5-8566a8434a56', -- DOT Architecture (Junior Architect)
  '92824152-8655-469f-b617-6e7419e5cf9a', -- DOT Architecture (Junior Designer)
  '92efa347-0f27-4bae-a3e9-acc38571669b', -- DOT Architecture (Senior Designer)
  'b9a1785b-2845-40b8-b949-9731158d1b34', -- DOT Architecture (Design Intern)
  '722ce785-46b6-455f-a873-c966c0dbd8e6', -- DOT Architecture (Accountant)
  'c327a8e0-3690-4a3c-9545-bbfeff0386d0'  -- DOT Architecture (AI Design Strategist)
);

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
