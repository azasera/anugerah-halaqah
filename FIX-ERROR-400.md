# Fix Error 400 - Step by Step

## Error yang Anda Alami
```
Failed to load resource: the server responded with a status of 400
Error syncing students
Error syncing halaqahs
```

## Penyebab
Kolom `nik` belum ada di tabel `students` di Supabase, tapi aplikasi mencoba mengirim data dengan kolom `nik`.

## Solusi - Ikuti Langkah Ini Secara Berurutan

### STEP 1: Tambah Kolom NIK (WAJIB)

1. Buka Supabase Dashboard: https://app.supabase.com
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar kiri
4. Klik **New Query**
5. Copy dan paste SQL ini:

```sql
-- Add NIK column to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS nik TEXT;

-- Create index
CREATE INDEX IF NOT EXISTS idx_students_nik ON students(nik);

-- Verify
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'students' AND column_name = 'nik';
```

6. Klik **Run** (atau Ctrl+Enter)
7. Pastikan muncul hasil query yang menunjukkan kolom `nik` ada

### STEP 2: Fix RLS Policies (Jika Ada Error Recursion)

Jika sebelumnya Anda dapat error "infinite recursion", jalankan SQL ini:

```sql
-- Drop problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

-- Create simple policy
CREATE POLICY "Enable read access for authenticated users" ON profiles
    FOR SELECT USING (auth.role() = 'authenticated');
```

### STEP 3: Clear Cache & Refresh

1. Buka aplikasi Anda di browser
2. Tekan **F12** untuk buka Developer Tools
3. Klik tab **Console**
4. Ketik dan enter:
   ```javascript
   localStorage.clear()
   ```
5. Refresh halaman (F5 atau Ctrl+R)

### STEP 4: Verifikasi

Setelah refresh, cek di Console:
- ✅ Tidak ada error 400 lagi
- ✅ Data sync berhasil
- ✅ Aplikasi berjalan normal

## Jika Masih Error 400

### Cek 1: Apakah kolom NIK sudah ada?
Jalankan di SQL Editor:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'students';
```

Pastikan ada kolom: `nik`

### Cek 2: Apakah ada kolom yang missing?
Error 400 juga bisa terjadi jika kolom lain tidak ada. Jalankan:

```sql
-- Add all missing columns
ALTER TABLE students ADD COLUMN IF NOT EXISTS nik TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS lembaga TEXT DEFAULT 'MTA';
ALTER TABLE students ADD COLUMN IF NOT EXISTS kelas TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS nisn TEXT;

-- Verify all columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'students'
ORDER BY ordinal_position;
```

### Cek 3: Lihat detail error
Di browser Console, klik error 400 untuk melihat detail response. Biasanya akan menunjukkan kolom mana yang bermasalah.

## Quick Fix - All in One

Jika Anda ingin fix semua sekaligus, jalankan SQL ini:

```sql
-- Add all missing columns to students
ALTER TABLE students ADD COLUMN IF NOT EXISTS nik TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS lembaga TEXT DEFAULT 'MTA';
ALTER TABLE students ADD COLUMN IF NOT EXISTS kelas TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS nisn TEXT;

-- Add missing columns to halaqahs (if needed)
ALTER TABLE halaqahs ADD COLUMN IF NOT EXISTS guru TEXT;
ALTER TABLE halaqahs ADD COLUMN IF NOT EXISTS kelas TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_students_nik ON students(nik);
CREATE INDEX IF NOT EXISTS idx_students_nisn ON students(nisn);

-- Show all columns
SELECT 'Students columns:' as info;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'students' ORDER BY ordinal_position;

SELECT 'Halaqahs columns:' as info;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'halaqahs' ORDER BY ordinal_position;
```

## Setelah Berhasil

Error 400 akan hilang dan Anda akan melihat:
- ✅ Data sync ke Supabase
- ✅ Realtime updates berfungsi
- ✅ Tidak ada error di console

## Masih Butuh Bantuan?

Kirim screenshot dari:
1. Error di Console (F12 → Console tab)
2. Hasil query: `SELECT column_name FROM information_schema.columns WHERE table_name = 'students';`
