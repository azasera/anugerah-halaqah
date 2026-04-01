-- ============================================
-- FIX PROFILES TABLE COLUMNS
-- ============================================
-- This script adds missing columns to the profiles table
-- to fix Error 400 when updating user profile.
-- ============================================

-- 1. Add missing columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name TEXT;

-- 2. Sync 'name' with 'full_name' if name is empty
UPDATE profiles SET name = full_name WHERE name IS NULL OR name = '';

-- 3. (Optional) If you want to keep full_name in sync with name for future updates
-- but since the app uses 'name' for updates, we ensure both exist.

-- 4. Verify the columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

SELECT '✅ PROFILES TABLE UPDATED SUCCESSFULLY!' as status;
SELECT 'You can now edit your profile without Error 400.' as message;
