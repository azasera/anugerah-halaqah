-- Add missing columns for Student Profile (TTL, Address, Parents, etc.)
-- Run this in Supabase SQL Editor

DO $$ 
BEGIN
    -- 1. Tempat Lahir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'tempat_lahir') THEN
        ALTER TABLE students ADD COLUMN tempat_lahir TEXT;
    END IF;

    -- 2. Tanggal Lahir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'tanggal_lahir') THEN
        ALTER TABLE students ADD COLUMN tanggal_lahir TEXT; -- Using TEXT to be safe with various formats, or DATE if strict
    END IF;

    -- 3. Jenis Kelamin
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'jenis_kelamin') THEN
        ALTER TABLE students ADD COLUMN jenis_kelamin TEXT;
    END IF;

    -- 4. Alamat
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'alamat') THEN
        ALTER TABLE students ADD COLUMN alamat TEXT;
    END IF;

    -- 5. HP
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'hp') THEN
        ALTER TABLE students ADD COLUMN hp TEXT;
    END IF;

    -- 6. Nama Ayah
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'nama_ayah') THEN
        ALTER TABLE students ADD COLUMN nama_ayah TEXT;
    END IF;

    -- 7. Nama Ibu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'nama_ibu') THEN
        ALTER TABLE students ADD COLUMN nama_ibu TEXT;
    END IF;

    -- 8. Sekolah Asal
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'sekolah_asal') THEN
        ALTER TABLE students ADD COLUMN sekolah_asal TEXT;
    END IF;

END $$;
