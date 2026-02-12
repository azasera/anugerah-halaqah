# Panduan Migration Supabase

## Error yang Muncul

### Error 1: Column NIK not found
```
Error: Failed to run sql query: ERROR: 42703: column "nik" does not exist
```

### Error 2: Infinite Recursion (CRITICAL)
```
Error: infinite recursion detected in policy for relation "profiles"
```

## Solusi

### ⚠️ PENTING: Jika Anda Sudah Jalankan Migration Sebelumnya

Jika Anda sudah jalankan `supabase-migration-complete.sql` atau `supabase-schema.sql` dan mendapat error "infinite recursion", jalankan ini DULU:

**Jalankan file: `supabase-fix-rls-policies.sql`**

File ini akan:
- ✅ Menghapus semua RLS policies yang bermasalah
- ✅ Membuat policies baru tanpa recursion
- ✅ Fix error 500 Internal Server Error

### Opsi 1: Migration Lengkap (RECOMMENDED untuk Fresh Install)
Jalankan file `supabase-migration-complete.sql` - ini sudah include fix RLS policies.

**Langkah-langkah:**
1. Buka Supabase Dashboard: https://app.supabase.com
2. Pilih project Anda
3. Klik menu **SQL Editor** di sidebar kiri
4. Klik **New Query**
5. Copy semua isi file `supabase-migration-complete.sql`
6. Paste ke SQL Editor
7. Klik **Run** atau tekan `Ctrl+Enter`
8. Tunggu sampai selesai (akan muncul pesan sukses)

**File ini akan:**
- ✅ Menambahkan kolom `nik` ke tabel `students`
- ✅ Menambahkan kolom `lembaga` dan `kelas` jika belum ada
- ✅ Membuat tabel `profiles` untuk user management
- ✅ Mengatur RLS policies untuk keamanan
- ✅ Membuat indexes untuk performa
- ✅ Setup realtime subscriptions
- ✅ Aman dijalankan berkali-kali (tidak akan duplikat)

### Opsi 2: Migration Bertahap

Jika Anda ingin migration bertahap:

#### A. Tambah kolom NIK saja
Jalankan file: `supabase-migration-add-nik.sql`

#### B. Tambah tabel Profiles untuk User Management
Jalankan file: `supabase-migration-profiles.sql`

## Verifikasi

Setelah migration berhasil, cek:

1. **Tabel Students:**
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'students';
   ```
   Harus ada kolom: `nik`, `lembaga`, `kelas`

2. **Tabel Profiles:**
   ```sql
   SELECT * FROM profiles LIMIT 1;
   ```
   Tabel harus ada dan bisa diakses

3. **Test di aplikasi:**
   - Refresh halaman aplikasi
   - Error 400 seharusnya hilang
   - Data bisa sync ke Supabase

## Troubleshooting

### Error: "infinite recursion detected in policy for relation profiles"
**Penyebab:** RLS policy mengecek tabel profiles di dalam policy profiles itu sendiri.

**Solusi:**
1. Jalankan file `supabase-fix-rls-policies.sql`
2. Atau jalankan SQL ini di SQL Editor:
   ```sql
   -- Drop all policies
   DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
   DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
   
   -- Create simple policy
   CREATE POLICY "Enable read access for authenticated users" ON profiles
       FOR SELECT USING (auth.role() = 'authenticated');
   ```
3. Refresh aplikasi

### Error: "permission denied for table profiles"
**Solusi:** RLS policies belum aktif. Jalankan ulang migration atau set policies manual.

### Error: "duplicate key value violates unique constraint"
**Solusi:** Ini normal jika migration dijalankan 2x. Abaikan saja.

### Error: "relation profiles already exists"
**Solusi:** Tabel sudah ada, skip bagian create table. Fokus ke add column NIK saja.

### Data tidak sync setelah migration
**Solusi:**
1. Clear localStorage: `localStorage.clear()` di browser console
2. Refresh halaman
3. Data akan reload dari Supabase

## Catatan Penting

- ⚠️ **Backup data** sebelum migration (export ke Excel)
- ✅ Migration ini **tidak akan menghapus data** yang sudah ada
- ✅ Aman dijalankan di production
- ✅ Bisa dijalankan berkali-kali tanpa error

## Setelah Migration

Aplikasi akan otomatis:
- Sync data students dengan kolom NIK
- Mendukung user management
- Mendukung login dengan role (admin, guru, ortu, staff)
- Realtime sync aktif untuk semua perubahan data
