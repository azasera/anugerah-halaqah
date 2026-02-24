# Cara Fix: Data Tidak Persist Setelah Refresh

## Masalah
Setelah klik "Sinkron Total Hafalan", data berhasil update tapi setelah refresh kembali ke nilai awal.

## Solusi Cepat

### Opsi 1: Gunakan Debug Tool (RECOMMENDED)

1. **Buka file `debug-sync-issue.html` di browser**

2. **Jalankan langkah-langkah berikut:**
   - Klik "Step 1: Cek Status" 
     - Pastikan role adalah 'admin' atau 'guru'
     - Jika bukan, login ulang sebagai admin/guru
   
   - Klik "Step 2: Sync dari API"
     - Tunggu hingga selesai
     - Lihat berapa santri yang diupdate
   
   - Klik "Step 3: Cek Supabase"
     - Lihat apakah data di localStorage sama dengan Supabase
     - Jika berbeda, lanjut ke step 4
   
   - Klik "Step 4: Force Sync"
     - Konfirmasi untuk force sync
     - Tunggu hingga semua data tersync
   
   - **Refresh halaman**
   
   - Klik "Step 5: Verify Persist"
     - Verifikasi data sudah persist setelah refresh

### Opsi 2: Force Sync Manual

1. **Buka file `force-sync-to-supabase.html` di browser**

2. **Jalankan 3 langkah:**
   - Step 1: Sync dari API ke localStorage
   - Step 2: Cek Data di localStorage
   - Step 3: Force Sync ke Supabase

3. **Refresh dashboard** untuk melihat perubahan

### Opsi 3: Via Console

1. **Buka browser console (F12)**

2. **Check user role:**
   ```javascript
   JSON.parse(localStorage.getItem('currentProfile'))
   ```
   - Pastikan role adalah 'admin' atau 'guru'

3. **Force sync:**
   ```javascript
   await window.syncStudentsToSupabase()
   ```
   - Tunggu hingga return `{ status: 'success', count: X }`

4. **Refresh halaman** untuk verifikasi

## Penyebab Umum

### 1. User Bukan Admin/Guru
**Gejala:** Console log menunjukkan "⛔ Sync blocked: User is not admin or guru"

**Solusi:** Login sebagai admin atau guru

### 2. Sync Sedang Berjalan
**Gejala:** Console log menunjukkan "⏭️ Sync already in progress"

**Solusi:** Tunggu beberapa detik, lalu coba lagi

### 3. Network Error
**Gejala:** Console log menunjukkan error "Failed to upload chunk" atau "timeout"

**Solusi:** 
- Check koneksi internet
- Coba lagi setelah beberapa saat
- Gunakan force sync tool

## Cara Cek Apakah Sudah Fix

1. **Sync total hafalan dari dashboard**
2. **Buka console (F12)** dan cari pesan:
   - `[MTA] Syncing to Supabase...`
   - `[MTA] Supabase sync completed`
3. **Refresh halaman**
4. **Cek apakah data masih sama**

## Tools yang Tersedia

| Tool | Fungsi | Kapan Digunakan |
|------|--------|-----------------|
| `debug-sync-issue.html` | Diagnosa lengkap + fix | Untuk debugging menyeluruh |
| `force-sync-to-supabase.html` | Force sync cepat | Untuk quick fix |
| Console commands | Manual sync | Untuk developer |

## Catatan Penting

⚠️ **Hanya admin dan guru yang bisa sync ke Supabase** - Ini adalah fitur keamanan

✅ **Selalu check console log** - Semua operasi sync tercatat di console

🔄 **Sync adalah async** - Tunggu hingga selesai sebelum refresh

📊 **Gunakan debugging tools** - Jangan tebak-tebakan, gunakan tools yang sudah disediakan

## Jika Masih Bermasalah

1. **Buka `debug-sync-issue.html`**
2. **Jalankan semua steps 1-5**
3. **Screenshot hasil log**
4. **Share screenshot untuk analisa lebih lanjut**
