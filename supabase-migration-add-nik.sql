-- Migration: Add NIK column to students table
-- Run this if you get error: column "nik" does not exist

-- Add NIK column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'nik'
    ) THEN
        ALTER TABLE students ADD COLUMN nik TEXT UNIQUE;
        
        -- Create index for NIK lookup
        CREATE INDEX IF NOT EXISTS idx_students_nik ON students(nik);
        
        RAISE NOTICE 'Column nik added successfully';
    ELSE
        RAISE NOTICE 'Column nik already exists';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'students' AND column_name = 'nik';
