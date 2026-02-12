-- Simple Migration: Add NIK column to students table
-- Run this FIRST before anything else

-- Add NIK column
ALTER TABLE students ADD COLUMN IF NOT EXISTS nik TEXT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_students_nik ON students(nik);

-- Verify column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'students' AND column_name = 'nik';

-- Show success
SELECT '✅ NIK column added successfully!' as status;
