-- ============================================
-- FIX COLUMNS ONLY - No Policy Changes
-- ============================================
-- This only adds missing columns to fix Error 400
-- Does NOT touch RLS policies
-- ============================================

-- Add missing columns to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS nik TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS lembaga TEXT DEFAULT 'MTA';
ALTER TABLE students ADD COLUMN IF NOT EXISTS kelas TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS nisn TEXT;

-- Add missing columns to halaqahs table
ALTER TABLE halaqahs ADD COLUMN IF NOT EXISTS guru TEXT;
ALTER TABLE halaqahs ADD COLUMN IF NOT EXISTS kelas TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_nik ON students(nik);
CREATE INDEX IF NOT EXISTS idx_students_nisn ON students(nisn);
CREATE INDEX IF NOT EXISTS idx_students_halaqah ON students(halaqah);
CREATE INDEX IF NOT EXISTS idx_halaqahs_name ON halaqahs(name);

-- Verification
SELECT '=== STUDENTS TABLE COLUMNS ===' as info;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'students'
ORDER BY ordinal_position;

SELECT '=== HALAQAHS TABLE COLUMNS ===' as info;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'halaqahs'
ORDER BY ordinal_position;

SELECT '✅ COLUMNS ADDED SUCCESSFULLY!' as status;
SELECT 'Error 400 should be fixed now. Refresh your app.' as next_step;
