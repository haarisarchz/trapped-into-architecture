-- Migration: Create Student Institution Shortlists System
-- For Trapped Into Architecture (TI2A)

-- 1. Create user_shortlists table
CREATE TABLE IF NOT EXISTS public.user_shortlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shortlist_name TEXT NOT NULL DEFAULT 'My Architecture Shortlist',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index on user_id
CREATE INDEX IF NOT EXISTS idx_user_shortlists_user_id ON public.user_shortlists(user_id);

-- 2. Create shortlist_institutions table
CREATE TABLE IF NOT EXISTS public.shortlist_institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shortlist_id UUID NOT NULL REFERENCES public.user_shortlists(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_shortlist_institution UNIQUE (shortlist_id, institution_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shortlist_inst_shortlist_id ON public.shortlist_institutions(shortlist_id);
CREATE INDEX IF NOT EXISTS idx_shortlist_inst_institution_id ON public.shortlist_institutions(institution_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.user_shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortlist_institutions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for user_shortlists
CREATE POLICY "Users can view their own shortlists"
  ON public.user_shortlists
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shortlists"
  ON public.user_shortlists
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shortlists"
  ON public.user_shortlists
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shortlists"
  ON public.user_shortlists
  FOR DELETE
  USING (auth.uid() = user_id);

-- 5. RLS Policies for shortlist_institutions
CREATE POLICY "Users can view institutions in their own shortlists"
  ON public.shortlist_institutions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_shortlists s
      WHERE s.id = shortlist_institutions.shortlist_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add institutions to their own shortlists"
  ON public.shortlist_institutions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_shortlists s
      WHERE s.id = shortlist_institutions.shortlist_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update institutions in their own shortlists"
  ON public.shortlist_institutions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_shortlists s
      WHERE s.id = shortlist_institutions.shortlist_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete institutions from their own shortlists"
  ON public.shortlist_institutions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_shortlists s
      WHERE s.id = shortlist_institutions.shortlist_id
      AND s.user_id = auth.uid()
    )
  );
