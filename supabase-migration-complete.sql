-- Complete Migration for Halaqah Tracker
-- Safe to run multiple times - will only add missing columns/tables

-- ============================================
-- STEP 1: Add NIK column to students table
-- ============================================
DO $$ 
BEGIN
    -- Add NIK column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'nik'
    ) THEN
        ALTER TABLE students ADD COLUMN nik TEXT;
        RAISE NOTICE 'Column nik added to students table';
    ELSE
        RAISE NOTICE 'Column nik already exists in students table';
    END IF;
    
    -- Add other missing columns if needed
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'lembaga'
    ) THEN
        ALTER TABLE students ADD COLUMN lembaga TEXT DEFAULT 'MTA';
        RAISE NOTICE 'Column lembaga added to students table';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'kelas'
    ) THEN
        ALTER TABLE students ADD COLUMN kelas TEXT;
        RAISE NOTICE 'Column kelas added to students table';
    END IF;
END $$;

-- Create index for NIK lookup
CREATE INDEX IF NOT EXISTS idx_students_nik ON students(nik);

-- ============================================
-- STEP 2: Create profiles table for user management
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'guru', 'ortu', 'staff')),
    halaqah_id BIGINT,
    student_id BIGINT,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_halaqah_id ON profiles(halaqah_id);
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ============================================
-- STEP 3: Enable Row Level Security
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: Create/Update RLS Policies
-- ============================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Enable delete for admins only" ON profiles;

-- Simple policies without recursion
-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT 
    USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE 
    USING (auth.uid() = id);

-- Allow authenticated users to view all profiles (for admin checks)
-- This prevents infinite recursion
CREATE POLICY "Enable read access for authenticated users" ON profiles
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert their own profile
CREATE POLICY "Enable insert for authenticated users" ON profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- ============================================
-- STEP 5: Create Functions and Triggers
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles
    FOR EACH ROW 
    EXECUTE FUNCTION update_profiles_updated_at();

-- Function to create profile after user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'ortu')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 6: Enable Realtime (if not already enabled)
-- ============================================
DO $$
BEGIN
    -- Try to add profiles to realtime publication
    -- This will fail silently if already added
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'profiles already in realtime publication';
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not add profiles to realtime: %', SQLERRM;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================
-- Show students table structure
SELECT 'Students table columns:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'students'
ORDER BY ordinal_position;

-- Show profiles table structure
SELECT 'Profiles table columns:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Show success message
SELECT '✅ Migration completed successfully!' as status;
