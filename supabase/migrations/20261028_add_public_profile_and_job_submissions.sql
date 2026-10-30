-- Migration: Add public profile directory opt-in, recruiter flag, and job submission approval fields

-- 1. ADD COLUMNS TO public.profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_profile_publicly BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_recruiter BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

-- 2. ADD COLUMNS TO public.jobs
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS edit_request_payload JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS review_notes TEXT DEFAULT NULL;

-- 3. ENSURE RLS POLICIES FOR JOB SUBMISSIONS
DROP POLICY IF EXISTS "Allow job submissions" ON public.jobs;
CREATE POLICY "Allow job submissions"
  ON public.jobs
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow job updates" ON public.jobs;
CREATE POLICY "Allow job updates"
  ON public.jobs
  FOR UPDATE
  USING (true);
