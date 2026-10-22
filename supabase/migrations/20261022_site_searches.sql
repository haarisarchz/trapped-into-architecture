-- Migration: Create site_searches table to track candidate search keywords and zero-result searches
CREATE TABLE IF NOT EXISTS public.site_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    search_query TEXT,
    city TEXT,
    state TEXT,
    position TEXT,
    results_count INTEGER DEFAULT 0,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_site_searches_created_at ON public.site_searches(created_at);
CREATE INDEX IF NOT EXISTS idx_site_searches_query ON public.site_searches(search_query);
CREATE INDEX IF NOT EXISTS idx_site_searches_results_count ON public.site_searches(results_count);

-- Enable RLS
ALTER TABLE public.site_searches ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow public read access to site_searches" ON public.site_searches;
    DROP POLICY IF EXISTS "Allow public insert to site_searches" ON public.site_searches;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Allow public read access to site_searches" 
    ON public.site_searches FOR SELECT USING (true);

CREATE POLICY "Allow public insert to site_searches" 
    ON public.site_searches FOR INSERT WITH CHECK (true);
