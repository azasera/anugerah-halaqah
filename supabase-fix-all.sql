-- ============================================
-- FIX ALL ERRORS - Run This Once
-- ============================================
-- This will fix:
-- - Error 400 (missing columns)
-- - Error 500 (infinite recursion)
-- - Missing NIK column
-- ============================================

-- STEP 1: Add missing columns to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS nik TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS lembaga TEXT DEFAULT 'MTA';
ALTER TABLE students ADD COLUMN IF NOT EXISTS kelas TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS nisn TEXT;

-- STEP 2: Add missing columns to halaqahs table
ALTER TABLE halaqahs ADD COLUMN IF NOT EXISTS guru TEXT;
ALTER TABLE halaqahs ADD COLUMN IF NOT EXISTS kelas TEXT;

-- STEP 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_nik ON students(nik);
CREATE INDEX IF NOT EXISTS idx_students_nisn ON students(nisn);
CREATE INDEX IF NOT EXISTS idx_students_halaqah ON students(halaqah);
CREATE INDEX IF NOT EXISTS idx_halaqahs_name ON halaqahs(name);

-- STEP 4: Fix RLS policies (remove infinite recursion)
-- Drop ALL existing policies on profiles
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON profiles CASCADE';
    END LOOP;
END $$;

-- Create simple policies without recursion
CREATE POLICY "Enable read access for authenticated users" ON profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- STEP 5: Verification
SELECT '=== STUDENTS TABLE COLUMNS ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'students'
ORDER BY ordinal_position;

SELECT '=== HALAQAHS TABLE COLUMNS ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'halaqahs'
ORDER BY ordinal_position;

SELECT '=== PROFILES POLICIES ===' as info;
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'profiles';

SELECT '✅ ALL FIXES APPLIED SUCCESSFULLY!' as status;
SELECT 'Now refresh your application (clear localStorage first)' as next_step;
