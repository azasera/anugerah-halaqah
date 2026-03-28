-- Migration: Create app_settings table for global configuration
-- Run this in Supabase SQL Editor to enable cloud-based settings

-- 1. Create table
CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- 2. Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies

-- Everyone can read settings (needed for initial load)
CREATE POLICY "Everyone can read settings" ON app_settings
    FOR SELECT USING (true);

-- Only Admins can update settings
CREATE POLICY "Admins can update settings" ON app_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 4. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE app_settings;

-- 5. Insert default empty settings if not exists (Optional)
-- INSERT INTO app_settings (key, value) VALUES ('global', '{}') ON CONFLICT DO NOTHING;
