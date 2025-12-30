-- Migration for System Settings, Announcements and Points System

-- 1. System Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read settings
DROP POLICY IF EXISTS "Allow public read settings" ON public.settings;
CREATE POLICY "Allow public read settings" ON public.settings
    FOR SELECT USING (true);

-- Only super_admin can update settings
DROP POLICY IF EXISTS "Allow super_admin to update settings" ON public.settings;
CREATE POLICY "Allow super_admin to update settings" ON public.settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
        )
    );

-- 2. Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    author_id UUID REFERENCES auth.users(id)
);

-- Enable RLS for appointments
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read active announcements
DROP POLICY IF EXISTS "Allow public read active announcements" ON public.announcements;
CREATE POLICY "Allow public read active announcements" ON public.announcements
    FOR SELECT USING (is_active = true);

-- Only super_admin can manage announcements
DROP POLICY IF EXISTS "Allow super_admin to manage announcements" ON public.announcements;
CREATE POLICY "Allow super_admin to manage announcements" ON public.announcements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
        )
    );

-- 3. Update Profiles for Points System (Surprise Gimmick)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Initial settings data
INSERT INTO public.settings (key, value) VALUES 
('company_name', 'Microtronic Account'),
('company_logo_url', '')
ON CONFLICT (key) DO NOTHING;
