# 🔍 Troubleshooting Login dengan NIK

## Masalah: Tidak Bisa Login dengan NIK Santri

### Kemungkinan Penyebab

#### 1. ❌ Data NIK Tidak Ada di Database
**Gejala:**
- Error: "NIK tidak ditemukan dalam database santri"

**Solusi:**
1. Buka halaman debug: `test-login-debug.html`
2. Klik "Cek Data Lokal" untuk melihat data santri
3. Periksa apakah santri memiliki NIK yang terisi
4. Jika NIK kosong, update data santri melalui:
   - Import Excel dengan kolom NIK
   - Edit manual di halaman Admin

#### 2. ❌ Data Tanggal Lahir Tidak Ada
**Gejala:**
- Error: "Data tanggal lahir kosong. Hubungi Admin."

**Solusi:**
1. Buka `test-login-debug.html`
2. Klik "Cek Data Lokal"
3. Periksa kolom "Tanggal Lahir" untuk santri tersebut
4. Jika kosong, update data:
   - Via Import Excel dengan kolom "Tanggal Lahir"
   - Via Edit Manual di Admin Panel

#### 3. ❌ Format Password Salah
**Gejala:**
- Error: "Password salah. Gunakan Tanggal Lahir (DDMMYYYY)"

**Format Password yang Benar:**
- Format: `DDMMYYYY` (8 digit angka)
- Contoh: Lahir 5 Januari 2000 → Password: `05012000`
- Contoh: Lahir 25 Desember 1995 → Password: `25121995`

**Cara Test:**
1. Buka `test-login-debug.html`
2. Masukkan NIK dan Password
3. Klik "Simulasi Login"
4. Lihat password yang diharapkan vs yang diinput

#### 4. ❌ Format Tanggal Lahir di Database Salah
**Gejala:**
- Login gagal meskipun password sudah benar

**Format yang Didukung:**
- `YYYY-MM-DD` (2000-01-05)
- `DD-MM-YYYY` (05-01-2000)
- `DD/MM/YYYY` (05/01/2000)

**Solusi:**
1. Periksa format tanggal di database
2. Pastikan menggunakan salah satu format di atas
3. Re-import data jika perlu

#### 5. ❌ Koneksi Supabase Bermasalah
**Gejala:**
- Login gagal dengan error 400
- Auto-registration tidak berjalan

**Solusi:**
1. Buka `test-login-debug.html`
2. Klik "Cek Supabase"
3. Periksa apakah koneksi berhasil
4. Jika gagal:
   - Cek koneksi internet
   - Cek konfigurasi Supabase di `js/supabase.js`
   - Cek RLS policies di Supabase Dashboard

---

## 🧪 Cara Menggunakan Debug Tool

### Langkah 1: Buka Debug Page
```
Buka file: test-login-debug.html di browser
```

### Langkah 2: Test Format Password
1. Masukkan password (contoh: 01012000)
2. Klik "Test Format"
3. Pastikan format valid (8 digit)

### Langkah 3: Cek Data Lokal
1. Klik "Cek Data Lokal"
2. Lihat 3 santri pertama
3. Periksa:
   - ✅ NIK terisi
   - ✅ Tanggal Lahir terisi
   - ✅ Password Expected muncul

### Langkah 4: Simulasi Login
1. Masukkan NIK santri
2. Masukkan password TTL (DDMMYYYY)
3. Klik "Simulasi Login"
4. Lihat hasil:
   - ✅ Santri ditemukan
   - ✅ Password cocok
   - ❌ Jika gagal, lihat pesan error

### Langkah 5: Cek Supabase
1. Klik "Cek Supabase"
2. Periksa:
   - Koneksi berhasil
   - Data santri bisa di-fetch
   - NIK dan Tanggal Lahir terisi

---

## 📋 Checklist Sebelum Login

- [ ] Data santri sudah di-import
- [ ] Kolom NIK terisi untuk santri yang akan login
- [ ] Kolom Tanggal Lahir terisi dengan format yang benar
- [ ] Password menggunakan format DDMMYYYY
- [ ] Koneksi internet aktif (untuk Supabase)
- [ ] Supabase sudah dikonfigurasi dengan benar

---

## 🔧 Cara Memperbaiki Data

### Via Import Excel
1. Siapkan file Excel dengan kolom:
   - `NIK` atau `nik`
   - `Tanggal Lahir` atau `tanggal_lahir`
2. Format tanggal: DD/MM/YYYY atau YYYY-MM-DD
3. Import via menu Admin → Import Data

### Via Edit Manual
1. Login sebagai Admin
2. Buka menu "Data Induk Santri"
3. Klik "Edit" pada santri yang ingin diupdate
4. Isi NIK dan Tanggal Lahir
5. Simpan

---

## 🎯 Contoh Login yang Benar

### Contoh 1: Santri Ahmad
```
Data di Database:
- Nama: Ahmad Fauzi
- NIK: 3201012000123456
- Tanggal Lahir: 2000-01-05

Login:
- NIK: 3201012000123456
- Password: 05012000
```

### Contoh 2: Santri Fatimah
```
Data di Database:
- Nama: Fatimah Azzahra
- NIK: 3201012005654321
- Tanggal Lahir: 25/12/2005

Login:
- NIK: 3201012005654321
- Password: 25122005
```

---

## 🆘 Masih Bermasalah?

Jika masih tidak bisa login setelah mengikuti panduan ini:

1. **Cek Console Browser:**
   - Tekan F12
   - Buka tab "Console"
   - Lihat error message yang muncul
   - Screenshot dan kirim ke developer

2. **Cek Network Tab:**
   - Tekan F12
   - Buka tab "Network"
   - Coba login lagi
   - Lihat request yang gagal (warna merah)
   - Screenshot dan kirim ke developer

3. **Hubungi Admin:**
   - Berikan informasi:
     - NIK yang digunakan
     - Error message yang muncul
     - Screenshot dari debug tool

---

## 📝 Catatan Penting

1. **Password Default = Tanggal Lahir**
   - Format: DDMMYYYY (8 digit)
   - Tidak ada spasi atau karakter lain
   - Hanya angka

2. **NIK vs NISN**
   - Bisa login dengan NIK atau NISN
   - Pastikan salah satu terisi di database

3. **Auto-Registration**
   - Jika data valid, sistem akan otomatis membuat akun
   - Email yang dibuat: `{NIK}@sekolah.id`
   - Login berikutnya akan lebih cepat

4. **Mode Offline**
   - Login NIK tetap bisa bekerja offline
   - Menggunakan data lokal di browser
   - Sync otomatis saat online kembali
