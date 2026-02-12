-- Add total_hafalan column to students table
-- Run this in Supabase SQL Editor

-- Add column if not exists
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS total_hafalan NUMERIC DEFAULT 0;

-- Add comment
COMMENT ON COLUMN students.total_hafalan IS 'Total hafalan dalam halaman (1 halaman = 15 baris)';

-- Update existing records to calculate total_hafalan from setoran
-- This is optional - you can skip if you want to start fresh
UPDATE students
SET total_hafalan = (
    SELECT COALESCE(SUM((setoran_item->>'halaman')::numeric), 0)
    FROM jsonb_array_elements(setoran::jsonb) AS setoran_item
)
WHERE setoran IS NOT NULL AND setoran != '[]';

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'students' AND column_name = 'total_hafalan';
