-- Migration: Create social_publishing_logs table for platform-specific audit & deduplication
CREATE TABLE IF NOT EXISTS public.social_publishing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'publishing', 'published', 'failed'
    attempt_count INTEGER DEFAULT 1,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_job_platform UNIQUE(job_id, platform)
);

-- Index for fast lookup by job_id and platform
CREATE INDEX IF NOT EXISTS idx_social_publishing_logs_job_platform 
    ON public.social_publishing_logs(job_id, platform);

-- Enable RLS & grant permissions to anon and authenticated
ALTER TABLE public.social_publishing_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to social_publishing_logs" 
    ON public.social_publishing_logs FOR SELECT USING (true);

CREATE POLICY "Allow public insert/update to social_publishing_logs" 
    ON public.social_publishing_logs FOR ALL USING (true) WITH CHECK (true);
