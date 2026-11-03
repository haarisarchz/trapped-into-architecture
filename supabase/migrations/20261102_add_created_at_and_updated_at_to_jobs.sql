-- Migration: Add created_at and updated_at to public.jobs for tracking draft saves, job edits, and creation dates
-- Run this migration in your Supabase SQL Editor.

-- 1. ADD created_at and updated_at COLUMNS
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. BACKFILL DRAFT JOBS WITH IMAGE TIMESTAMPS OR EXISTING VALUES
-- For jobs with image timestamp 1791726754536 (SSS ARCHITECTS drafts):
UPDATE public.jobs
SET created_at = to_timestamp(1791726754536 / 1000.0),
    updated_at = to_timestamp(1791726754536 / 1000.0)
WHERE image LIKE '%1791726754536%' AND (created_at IS NULL OR created_at = NOW());

-- Backfill any jobs with posted_date where created_at is still default
UPDATE public.jobs
SET created_at = posted_date,
    updated_at = posted_date
WHERE posted_date IS NOT NULL AND (created_at IS NULL OR created_at = NOW());

-- 3. TRIGGER TO AUTOMATICALLY UPDATE updated_at ON MODIFICATIONS
CREATE OR REPLACE FUNCTION update_jobs_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS trigger_jobs_updated_at ON public.jobs;
CREATE TRIGGER trigger_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION update_jobs_updated_at_column();
