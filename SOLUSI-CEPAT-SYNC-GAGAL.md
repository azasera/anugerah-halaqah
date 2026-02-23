# 🚨 Solusi Cepat: "Data tersimpan lokal, tetapi belum tersimpan di server"

## ❓ Apa yang Terjadi?

Saat Anda tambah/import santri, muncul peringatan:
```
⚠️ Data tersimpan lokal, tetapi belum tersimpan di server.
```

Ini berarti data santri tersimpan di browser (localStorage) tapi **TIDAK tersimpan** ke database Supabase.

## 🔍 Penyebab Utama

### 1. Role User Bukan Admin/Guru (PALING UMUM)
Sistem hanya mengizinkan **Admin** dan **Guru** untuk menyimpan data ke Supabase. Jika Anda login sebagai role lain (misalnya "parent"), data tidak akan tersinkron.

### 2. Tidak Ada Koneksi Internet
Jika offline, data tidak bisa dikirim ke server.

### 3. Supabase Tidak Terkonfigurasi
Jika konfigurasi Supabase salah atau belum diisi.

## ✅ Solusi Langkah-demi-Langkah

### Langkah 1: Cek Role Anda
1. Buka file: **`test-sync-permission.html`**
2. Lihat bagian "Role"
3. Jika role BUKAN "admin" atau "guru", lanjut ke Langkah 2

### Langkah 2: Login dengan Akun Admin/Guru
1. **Logout** dari akun saat ini
2. **Login** menggunakan akun dengan role Admin atau Guru
3. Coba tambah/import santri lagi

### Langkah 3: Sinkronkan Data yang Belum Tersimpan
Jika sudah ada data yang belum tersinkron:

1. Pastikan sudah login sebagai Admin/Guru
2. Buka: **`diagnose-tambah-santri.html`**
3. Klik tombol **"🚀 Sinkronkan Data Lokal ke Supabase"**
4. Tunggu sampai muncul notifikasi sukses
5. Refresh untuk verifikasi

## 🎯 Cara Mencegah Masalah Ini

1. **Selalu login sebagai Admin/Guru** saat akan menambah/edit data santri
2. **Cek koneksi internet** sebelum import data besar
3. **Verifikasi sinkronisasi** setelah import dengan membuka `diagnose-tambah-santri.html`

## 📊 Tool yang Tersedia

### 1. test-sync-permission.html
- Cek role user saat ini
- Cek status koneksi
- Test sinkronisasi langsung

### 2. diagnose-tambah-santri.html
- Bandingkan jumlah data lokal vs Supabase
- Lihat santri yang belum tersinkron
- Sinkronisasi manual

## 🔐 Catatan Penting tentang Permission

**Mengapa hanya Admin/Guru yang bisa sync?**
- Untuk keamanan data
- Mencegah perubahan data oleh user yang tidak berwenang
- Parent hanya bisa melihat data, tidak bisa mengubah

**Bagaimana jika saya seharusnya Admin/Guru?**
- Minta admin utama untuk mengubah role Anda
- Buka menu "Manajemen User" di dashboard
- Edit user Anda dan ubah role menjadi "admin" atau "guru"

## 📞 Jika Masalah Masih Terjadi

1. Buka Console browser (tekan F12)
2. Lihat tab "Console" untuk error message
3. Screenshot error dan dokumentasikan
4. Cek file `js/settings.js` untuk memastikan konfigurasi Supabase benar

## ✨ Setelah Masalah Teratasi

Pastikan:
- [ ] Jumlah data lokal = jumlah data Supabase
- [ ] Tidak ada peringatan saat tambah santri baru
- [ ] Data muncul di semua device
- [ ] Santri baru langsung tersinkron

---

**File Terkait**:
- `test-sync-permission.html` - Cek permission & status
- `diagnose-tambah-santri.html` - Diagnosa & sync manual
- `FIX-TAMBAH-SANTRI-SYNC.md` - Dokumentasi teknis lengkap
