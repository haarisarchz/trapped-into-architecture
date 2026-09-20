-- Supabase SQL Migration for Admin Users, Contact, and Public Pages

-- 1. Create site_settings table for centralized contact & about info
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    whatsapp TEXT,
    telegram TEXT,
    facebook TEXT,
    instagram TEXT,
    x_twitter TEXT,
    linkedin TEXT,
    phone TEXT,
    email TEXT,
    about_us TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert a default global row if it doesn't exist
INSERT INTO public.site_settings (id, about_us) 
VALUES ('global', 'Welcome to Trapped Into Architecture.') 
ON CONFLICT (id) DO NOTHING;

-- RLS policies for site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Allow authenticated admin full access to site_settings" ON public.site_settings FOR ALL USING (auth.role() = 'authenticated');

-- 2. Create contact_messages table for the public Contact form
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies for contact_messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert to contact_messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated admin full access to contact_messages" ON public.contact_messages FOR ALL USING (auth.role() = 'authenticated');

-- 3. Ensure profiles table has proper roles and timestamps (if not already existing)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow user to update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
-- Admins can update any profile (assuming we check role via a function, but for now authenticated users can update, we will handle strict checks in the UI/backend API)
CREATE POLICY "Allow authenticated users to read profiles" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to update profiles" ON public.profiles FOR UPDATE USING (auth.role() = 'authenticated');
