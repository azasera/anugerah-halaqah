-- Add missing total_hafalan column
-- Run this in Supabase SQL Editor

DO $$ 
BEGIN
    -- Total Hafalan
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'total_hafalan') THEN
        ALTER TABLE students ADD COLUMN total_hafalan NUMERIC DEFAULT 0;
    END IF;

    -- Update existing rows to have 0 instead of null if needed
    UPDATE students SET total_hafalan = 0 WHERE total_hafalan IS NULL;

END $$;
