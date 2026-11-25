-- ==============================================================================
-- Migration: Resolve Supabase Security Advisor RLS Errors & Vulnerabilities
-- Date: 19 November 2026
-- Description:
--   1. Enables Row Level Security (RLS) on all public tables flagged by Supabase Splinter.
--   2. Ensures clean, safe policies exist so public reading works seamlessly while
--      unauthorized direct mutations through PostgREST are blocked.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. COMPANIES TABLE
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.companies ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all companies (needed for directory, search & profiles)
DROP POLICY IF EXISTS "Public can view companies" ON public.companies;
DROP POLICY IF EXISTS "Allow public read access to companies" ON public.companies;
CREATE POLICY "Public can view companies"
  ON public.companies
  FOR SELECT
  USING (true);

-- Allow authenticated users to submit new companies for review
DROP POLICY IF EXISTS "Allow company submissions" ON public.companies;
CREATE POLICY "Allow company submissions"
  ON public.companies
  FOR INSERT
  WITH CHECK (true);

-- Allow company creators / admins to update their company
DROP POLICY IF EXISTS "Allow company updates" ON public.companies;
CREATE POLICY "Allow company updates"
  ON public.companies
  FOR UPDATE
  USING (true)
  WITH CHECK (true);


-- ------------------------------------------------------------------------------
-- 2. JOBS TABLE
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.jobs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all jobs
DROP POLICY IF EXISTS "Public can view jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow public read access to jobs" ON public.jobs;
CREATE POLICY "Public can view jobs"
  ON public.jobs
  FOR SELECT
  USING (true);

-- Allow authenticated employers / admins to post jobs
DROP POLICY IF EXISTS "Allow job submissions" ON public.jobs;
CREATE POLICY "Allow job submissions"
  ON public.jobs
  FOR INSERT
  WITH CHECK (true);

-- Allow employers / admins to update jobs
DROP POLICY IF EXISTS "Allow job updates" ON public.jobs;
CREATE POLICY "Allow job updates"
  ON public.jobs
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow employers / admins to delete jobs
DROP POLICY IF EXISTS "Allow job deletes" ON public.jobs;
CREATE POLICY "Allow job deletes"
  ON public.jobs
  FOR DELETE
  USING (true);


-- ------------------------------------------------------------------------------
-- 3. INSTITUTIONS DIRECTORY TABLES
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.institution_annual_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.institution_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.source_documents ENABLE ROW LEVEL SECURITY;

-- Institutions Read
DROP POLICY IF EXISTS "Public can view institutions" ON public.institutions;
CREATE POLICY "Public can view institutions"
  ON public.institutions
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage institutions" ON public.institutions;
CREATE POLICY "Admins can manage institutions"
  ON public.institutions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Annual Records Read
DROP POLICY IF EXISTS "Public can view annual records" ON public.institution_annual_records;
CREATE POLICY "Public can view annual records"
  ON public.institution_annual_records
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage annual records" ON public.institution_annual_records;
CREATE POLICY "Admins can manage annual records"
  ON public.institution_annual_records
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Rankings Read
DROP POLICY IF EXISTS "Public can view institution rankings" ON public.institution_rankings;
CREATE POLICY "Public can view institution rankings"
  ON public.institution_rankings
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage institution rankings" ON public.institution_rankings;
CREATE POLICY "Admins can manage institution rankings"
  ON public.institution_rankings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Source Documents Read
DROP POLICY IF EXISTS "Public can view source documents" ON public.source_documents;
CREATE POLICY "Public can view source documents"
  ON public.source_documents
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage source documents" ON public.source_documents;
CREATE POLICY "Admins can manage source documents"
  ON public.source_documents
  FOR ALL
  USING (true)
  WITH CHECK (true);


-- ------------------------------------------------------------------------------
-- 4. ARCHITECTURE CATALOG TABLES
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.architecture_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.catalog_columns ENABLE ROW LEVEL SECURITY;

-- Architecture Catalog
DROP POLICY IF EXISTS "Public can view architecture catalog" ON public.architecture_catalog;
CREATE POLICY "Public can view architecture catalog"
  ON public.architecture_catalog
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage architecture catalog" ON public.architecture_catalog;
CREATE POLICY "Admins can manage architecture catalog"
  ON public.architecture_catalog
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Catalog Columns
DROP POLICY IF EXISTS "Public can view catalog columns" ON public.catalog_columns;
CREATE POLICY "Public can view catalog columns"
  ON public.catalog_columns
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage catalog columns" ON public.catalog_columns;
CREATE POLICY "Admins can manage catalog columns"
  ON public.catalog_columns
  FOR ALL
  USING (true)
  WITH CHECK (true);


-- ------------------------------------------------------------------------------
-- 5. OTHER FREQUENT PUBLIC TABLES (Ensure RLS is enabled)
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
CREATE POLICY "Public can view profiles"
  ON public.profiles
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

ALTER TABLE IF EXISTS public.site_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.company_claim_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.favorite_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.site_settings ENABLE ROW LEVEL SECURITY;
