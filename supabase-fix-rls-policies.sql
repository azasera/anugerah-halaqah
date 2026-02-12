-- Fix RLS Policies - Remove Infinite Recursion
-- Run this if you get error: "infinite recursion detected in policy"

-- ============================================
-- FIX PROFILES TABLE POLICIES
-- ============================================

-- Drop ALL existing policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Enable delete for admins only" ON profiles;

-- Create simple policies WITHOUT recursion
-- Policy 1: Allow users to view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT 
    USING (auth.uid() = id);

-- Policy 2: Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE 
    USING (auth.uid() = id);

-- Policy 3: Allow all authenticated users to read profiles
-- This is needed to check admin role without causing recursion
CREATE POLICY "Enable read access for authenticated users" ON profiles
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Policy 4: Allow authenticated users to insert their own profile
CREATE POLICY "Enable insert for authenticated users" ON profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- ============================================
-- VERIFICATION
-- ============================================
-- Show all policies on profiles table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles';

-- Test query (should work without recursion error)
SELECT id, email, role FROM profiles LIMIT 1;

SELECT '✅ RLS Policies fixed successfully!' as status;
