-- Migration: Create contact_inquiries table for recording submissions from /contact
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created_at ON public.contact_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_is_read ON public.contact_inquiries(is_read);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_email ON public.contact_inquiries(email);

-- Enable Row Level Security
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow public visitor submissions
DROP POLICY IF EXISTS "Allow public insert on contact_inquiries" ON public.contact_inquiries;
CREATE POLICY "Allow public insert on contact_inquiries"
    ON public.contact_inquiries FOR INSERT
    WITH CHECK (true);

-- Allow reading inquiries (admin panel and API)
DROP POLICY IF EXISTS "Allow public select on contact_inquiries" ON public.contact_inquiries;
CREATE POLICY "Allow public select on contact_inquiries"
    ON public.contact_inquiries FOR SELECT
    USING (true);

-- Allow updating inquiries (e.g. mark read/unread)
DROP POLICY IF EXISTS "Allow public update on contact_inquiries" ON public.contact_inquiries;
CREATE POLICY "Allow public update on contact_inquiries"
    ON public.contact_inquiries FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Allow deleting inquiries
DROP POLICY IF EXISTS "Allow public delete on contact_inquiries" ON public.contact_inquiries;
CREATE POLICY "Allow public delete on contact_inquiries"
    ON public.contact_inquiries FOR DELETE
    USING (true);
