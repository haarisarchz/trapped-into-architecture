-- Migration to create favorite_companies table
CREATE TABLE IF NOT EXISTS favorite_companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    company_slug TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, company_slug)
);

-- Enable RLS
ALTER TABLE favorite_companies ENABLE ROW LEVEL SECURITY;

-- Allow anon and authenticated access to prevent auth issues with their custom auth
CREATE POLICY "Allow full access to favorite_companies for all"
ON favorite_companies FOR ALL
USING (true)
WITH CHECK (true);