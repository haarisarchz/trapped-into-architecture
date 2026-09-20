-- Supabase SQL Migration to create the social_publishing_logs table

CREATE TABLE IF NOT EXISTS public.social_publishing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'publishing', 'published', 'failed', 'not_configured'
    external_post_id TEXT,
    external_post_url TEXT,
    error_message TEXT,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure a specific job can only have one tracking record per platform
    UNIQUE(job_id, platform)
);

-- RLS policies
ALTER TABLE public.social_publishing_logs ENABLE ROW LEVEL SECURITY;

-- Allow reading for everyone or restrict to authenticated (admin panel will read it)
CREATE POLICY "Allow public read access to social logs"
    ON public.social_publishing_logs FOR SELECT
    USING (true);

-- Allow authenticated users (admins) to insert/update
CREATE POLICY "Allow authenticated full access to social logs"
    ON public.social_publishing_logs FOR ALL
    USING (auth.role() = 'authenticated');
