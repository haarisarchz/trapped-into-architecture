-- ==============================================================================
-- NEWS FEED TABLE MIGRATION FOR TRAPPED INTO ARCHITECTURE
-- Run this in your Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.news_feed_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  details TEXT,
  category TEXT NOT NULL DEFAULT 'Platform Update',
  badge_color TEXT DEFAULT 'bg-amber-100 text-amber-800 border-amber-300',
  feature_highlights JSONB DEFAULT '[]'::jsonb,
  link_url TEXT,
  link_text TEXT,
  author TEXT DEFAULT 'Platform Engineering',
  published_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'published'
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.news_feed_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all published feed posts
CREATE POLICY "Allow public read access on published news feed posts"
ON public.news_feed_posts
FOR SELECT
USING (status = 'published');

-- Allow anon/service role write access (for automated script updates)
CREATE POLICY "Allow write access on news feed posts"
ON public.news_feed_posts
FOR ALL
USING (true)
WITH CHECK (true);

-- Insert initial feature updates so the feed is populated immediately
INSERT INTO public.news_feed_posts (title, summary, category, badge_color, feature_highlights, link_url, link_text, author)
VALUES 
(
  'Platform Update: 2-Column News Feed & Live Studio Directory',
  'We have updated the News Feed with a dedicated quick-access sidebar, interactive architecture job alerts, and real-time studio registration capabilities.',
  'Platform Update',
  'bg-amber-100 text-amber-800 border-amber-300',
  '[
    {"feature": "Sidebar Directory", "desc": "One-click access to Jobs, Studio Directory, Internships, and Individual Profiles."},
    {"feature": "Interactive Job Alerts", "desc": "Subscribe directly to daily architectural vacancy digests tailored to your role."},
    {"feature": "Studio & Profile Registration", "desc": "Instant CTAs for practitioners and studios to showcase their portfolios."}
  ]'::jsonb,
  '/jobs',
  'Explore Job Listings',
  'Platform Engineering'
),
(
  'Hiring & Careers: New Architectural Openings Added',
  'New vacancies for Junior Architects, Urban Planners, and BIM Coordinators across leading studios in Mumbai, Bengaluru, and Delhi NCR.',
  'Hiring & Careers',
  'bg-blue-100 text-blue-800 border-blue-200',
  '[
    {"feature": "Studio Direct Apply", "desc": "Verified architects can now submit pre-linked portfolios directly to hiring directors."}
  ]'::jsonb,
  '/jobs',
  'Browse Current Openings',
  'Careers Desk'
),
(
  'Community: Verified Practice & Studio Profiles Are Live',
  'Practice principals and studio founders can now claim, register, and showcase their architectural projects to thousands of design professionals.',
  'Studio Spotlight',
  'bg-purple-100 text-purple-800 border-purple-200',
  '[
    {"feature": "Studio Verification Badges", "desc": "Earn firm verification tiers to gain high-visibility placement across the platform."}
  ]'::jsonb,
  '/post-job',
  'Register Your Studio',
  'Community Editorial'
);
