# 🔍 Cara Cek dan Perbaiki Alumni SMA

## Masalah
Alumni SMA yang sebelumnya tampil di dashboard, sekarang tidak tampil lagi.

## Langkah Cepat

### 1. Debug - Cek Data Alumni
Buka file: **`debug-alumni-sma.html`**

Klik tombol secara berurutan:
1. **Cek localStorage** - Lihat apakah alumni SMA masih ada di browser
2. **Cek Supabase** - Lihat apakah alumni SMA masih ada di database
3. **Test Alumni Logic** - Verifikasi logika deteksi alumni bekerja
4. **Bandingkan Data** - Lihat perbedaan localStorage vs Supabase

**Hasil yang mungkin:**
- ✅ Alumni ada di keduanya → Data OK, mungkin ada filter tersembunyi
- ⚠️ Alumni ada di Supabase, tidak di localStorage → Perlu refresh data
- ⚠️ Alumni ada di localStorage, tidak di Supabase → Perlu sync ulang
- ❌ Alumni tidak ada di keduanya → Data hilang, perlu restore

### 2. Fix - Perbaiki Status Alumni
Buka file: **`fix-alumni-sma.html`**

Langkah:
1. **Load Santri SMA** - Tampilkan semua santri SMA
2. **Pilih Semua Alumni** (opsional) - Centang semua sebagai alumni
3. **Tandai sebagai Alumni** - Simpan status ke localStorage
4. **Sync ke Supabase** - Upload perubahan ke database

**Catatan:** Anda bisa centang/uncheck manual untuk setiap santri sebelum klik "Tandai sebagai Alumni"

## Penyebab Umum

### 1. Import Excel Tanpa Kolom Alumni
Saat import Excel, jika tidak ada kolom "Alumni/Non Alumni", status alumni bisa hilang.

**Solusi:** Selalu sertakan kolom alumni saat import:
```
| Nama | Halaqah | Lembaga | Kelas | Alumni/Non Alumni |
```

### 2. Data Tidak Sinkron
localStorage dan Supabase tidak sinkron setelah import atau edit.

**Solusi:** 
- Refresh data dari Supabase (di menu Pengaturan)
- Atau gunakan tool `fix-alumni-sma.html` untuk sync manual

### 3. Field Alumni Kosong
Field `is_alumni`, `kategori`, atau `status` kosong atau berubah.

**Solusi:** Gunakan tool `fix-alumni-sma.html` untuk set ulang status

## Pencegahan

### ✅ DO:
- Selalu sertakan kolom "Alumni/Non Alumni" saat import Excel
- Isi dengan "Alumni" untuk alumni, "Non Alumni" atau "Aktif" untuk santri aktif
- Backup data berkala (export ke Excel)
- Verifikasi jumlah alumni setelah import

### ❌ DON'T:
- Jangan import Excel dengan kolom alumni kosong
- Jangan lupa sync ke Supabase setelah edit manual
- Jangan hapus field `is_alumni` atau `kategori` saat edit

## File Terkait

1. **`debug-alumni-sma.html`** - Tool debugging untuk cek data alumni
2. **`fix-alumni-sma.html`** - Tool untuk memperbaiki status alumni
3. **`SOLUSI-ALUMNI-SMA.md`** - Dokumentasi lengkap masalah dan solusi
4. **`js/ui.js`** (line 305-312) - Logika deteksi alumni
5. **`js/excel.js`** (line 1370-1380) - Logika import alumni

## Kontak
Jika masalah masih berlanjut, hubungi admin sistem dengan informasi:
- Screenshot dari `debug-alumni-sma.html`
- Jumlah alumni yang hilang
- Kapan terakhir kali alumni terlihat
