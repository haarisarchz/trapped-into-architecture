-- Migration: Add admin_jobs table and admin_post_id foreign key to jobs
-- This migration creates a new table for grouped admin postings and links public jobs to it.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- admin_jobs stores the common job data plus an array of position objects.
CREATE TABLE public.admin_jobs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id uuid REFERENCES public.profiles(id) NOT NULL,
    company_id uuid REFERENCES public.companies(id),
    organization_type text,
    workplace_type text,
    employment_type text,
    area text,
    city text,
    state text,
    image text,
    deadline date,
    status text NOT NULL,  -- draft, scheduled, published
    scheduled_date timestamptz,
    post_expiry_date date,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    positions jsonb NOT NULL DEFAULT '[]'::jsonb,
    -- any additional common fields that exist in the original jobs table can be added here as needed.
    CONSTRAINT admin_jobs_status_check CHECK (status IN ('draft','scheduled','published'))
);

-- Add a nullable foreign key to public.jobs that points to the admin_jobs record.
ALTER TABLE public.jobs ADD COLUMN admin_post_id uuid;
ALTER TABLE public.jobs ADD CONSTRAINT fk_jobs_admin_post FOREIGN KEY (admin_post_id) REFERENCES public.admin_jobs(id) ON DELETE SET NULL;

-- Index for fast lookup of jobs by admin_post_id
CREATE INDEX idx_jobs_admin_post_id ON public.jobs(admin_post_id);

-- RLS policies – allow admins/CEOs to read/write admin_jobs
-- Adjust role check as needed for your auth function.
CREATE POLICY "admin_jobs_select" ON public.admin_jobs FOR SELECT USING (auth.role() = ANY('{authenticated,superadmin,admin,ceo}'::text[]));
CREATE POLICY "admin_jobs_insert" ON public.admin_jobs FOR INSERT WITH CHECK (auth.role() = ANY('{superadmin,ceo}'::text[]));
CREATE POLICY "admin_jobs_update" ON public.admin_jobs FOR UPDATE USING (auth.role() = ANY('{superadmin,ceo}'::text[])) WITH CHECK (auth.role() = ANY('{superadmin,ceo}'::text[]));
CREATE POLICY "admin_jobs_delete" ON public.admin_jobs FOR DELETE USING (auth.role() = ANY('{superadmin,ceo}'::text[]));

-- Backfill existing single‑position jobs into admin_jobs (run once).
-- This block creates an admin_jobs row for each existing job that does not already have an admin_post_id.
INSERT INTO public.admin_jobs (
    creator_id,
    company_id,
    organization_type,
    workplace_type,
    employment_type,
    area,
    city,
    state,
    image,
    deadline,
    status,
    scheduled_date,
    post_expiry_date,
    created_at,
    updated_at,
    positions
)
SELECT
    COALESCE(j.author_id, p.id) AS creator_id,
    j.company_id,
    j.organization_type,
    j.workplace_type,
    j.employment_type,
    j.area,
    j.city,
    j.state,
    j.image,
    j.deadline,
    j.status,
    j.scheduled_date,
    j.post_expiry_date,
    j.created_at,
    j.updated_at,
    jsonb_build_array(
        jsonb_build_object(
            'position', j.position,
            'experience', j.experience,
            'description', j.job_description
        )
    ) AS positions
FROM public.jobs j
LEFT JOIN public.profiles p ON p.id = j.author_id
WHERE j.admin_post_id IS NULL;

-- After backfill, update jobs to point to the newly created admin_jobs record.
UPDATE public.jobs j
SET admin_post_id = aj.id
FROM public.admin_jobs aj
WHERE j.admin_post_id IS NULL
  AND (
    aj.creator_id = COALESCE(j.author_id, (SELECT id FROM public.profiles WHERE username = j.author_id))
    AND aj.company_id = j.company_id
    AND aj.status = j.status
    AND aj.positions @> jsonb_build_array(jsonb_build_object('position', j.position, 'experience', j.experience, 'description', j.job_description))
  );

-- Finally, optionally hide the old single‑position columns if they are no longer needed (commented out for safety).
-- ALTER TABLE public.jobs DROP COLUMN position;
-- ALTER TABLE public.jobs DROP COLUMN experience;
-- ALTER TABLE public.jobs DROP COLUMN job_description;
