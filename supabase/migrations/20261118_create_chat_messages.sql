-- Migration: Create chat_messages table for persistent visitor-to-admin live conversations
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    sender TEXT NOT NULL DEFAULT 'visitor', -- 'visitor' | 'admin' | 'system'
    message TEXT NOT NULL,
    image_url TEXT,
    status TEXT DEFAULT 'active', -- 'active' | 'resolved'
    sender_name TEXT,
    sender_contact TEXT,
    client_ip TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Upgrade existing table if already created
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Indexes for fast session retrieval and unread tracking
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_read ON public.chat_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_chat_messages_status ON public.chat_messages(status);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert on chat_messages" ON public.chat_messages;
CREATE POLICY "Allow public insert on chat_messages" ON public.chat_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select on chat_messages" ON public.chat_messages;
CREATE POLICY "Allow public select on chat_messages" ON public.chat_messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public update on chat_messages" ON public.chat_messages;
CREATE POLICY "Allow public update on chat_messages" ON public.chat_messages FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete on chat_messages" ON public.chat_messages;
CREATE POLICY "Allow public delete on chat_messages" ON public.chat_messages FOR DELETE USING (true);
