# 📘 Panduan Lengkap: Sistem Setoran Harian

## ✅ Status Implementasi
**SELESAI** - Sistem sudah diimplementasi lengkap dan siap digunakan!

## 🎯 Fitur Utama

### 1. Form Input Setoran yang User-Friendly
- ✨ 4 tombol besar dengan emoji dan warna berbeda
- 📊 Menampilkan 5 history setoran terakhir
- ⏰ Indikator status waktu (tepat waktu/terlambat)
- 💬 Field catatan opsional
- 🎨 Desain mobile-first dengan animasi smooth

### 2. Tracking History Lengkap
- 📅 Riwayat setoran per santri
- 🕐 Timestamp lengkap (tanggal + jam)
- 📝 Catatan untuk setiap setoran
- 🎨 Color coding berdasarkan poin

### 3. Ranking Real-time
- 🏆 Ranking halaqah harian
- ⭐ Top 3 santri tercepat setor
- 📊 Statistik per halaqah

## 🚀 Cara Menggunakan

### Langkah 1: Jalankan Migrasi Database

1. Buka **Supabase Dashboard** → Project Anda
2. Klik menu **SQL Editor** di sidebar kiri
3. Klik **New Query**
4. Copy seluruh isi file `supabase-migration-setoran-harian.sql`
5. Paste ke SQL Editor
6. Klik **Run** atau tekan `Ctrl+Enter`
7. Tunggu sampai muncul pesan sukses

**Verifikasi:**
```sql
-- Jalankan query ini untuk memastikan tabel sudah dibuat
SELECT * FROM public.setoran_harian LIMIT 1;
SELECT * FROM v_ranking_harian LIMIT 5;
SELECT * FROM v_top_setoran_harian LIMIT 3;
```

### Langkah 2: Refresh Aplikasi

1. Buka aplikasi di browser
2. Tekan `Ctrl+Shift+R` (hard refresh) untuk clear cache
3. Login sebagai Guru atau Admin

### Langkah 3: Input Setoran Pertama

1. **Klik kartu santri** di dashboard
2. **Klik tombol hijau** (ikon buku) untuk input setoran
3. **Pilih poin** dengan klik salah satu tombol besar:
   - 🌟 **+2 Poin**: Tepat waktu, lancar, target tercapai
   - 👍 **+1 Poin**: Tepat waktu, kurang lancar
   - 😐 **0 Poin**: Terlambat atau tidak target
   - ❌ **-1 Poin**: Tidak setor sama sekali
4. **Tambahkan catatan** (opsional): "Lancar, hafalan kuat"
5. **Klik Simpan** 💾

### Langkah 4: Lihat History

1. **Klik kartu santri** di dashboard
2. **Klik tombol kuning** (ikon jam) untuk lihat history
3. Akan muncul modal dengan riwayat lengkap

## 🎨 Tampilan Form Baru

### Tombol Poin (Lebih Besar & Jelas)
```
┌─────────────────┬─────────────────┐
│  🌟 +2          │  👍 +1          │
│  Tepat Waktu    │  Tepat Waktu    │
│  Lancar & Target│  Kurang Lancar  │
└─────────────────┴─────────────────┘
┌─────────────────┬─────────────────┐
│  😐 0           │  ❌ -1          │
│  Terlambat atau │  Tidak Setor    │
│  Tidak Target   │  Sama Sekali    │
└─────────────────┴─────────────────┘
```

### Status Sesi
- ✅ **Hijau**: Tepat waktu (dalam sesi aktif)
- ⚠️ **Kuning**: Tidak tepat waktu (di luar sesi)

### History 5 Terakhir
```
12 Feb  [+2]  ← Hijau
11 Feb  [+1]  ← Kuning
10 Feb  [0]   ← Abu-abu
09 Feb  [-1]  ← Merah
08 Feb  [+2]  ← Hijau
```

## 🔧 Testing Checklist

### ✅ Test 1: Input Setoran
- [ ] Buka dashboard
- [ ] Klik santri
- [ ] Klik tombol hijau (input setoran)
- [ ] Form muncul dengan 4 tombol besar
- [ ] Pilih poin (tombol ter-highlight)
- [ ] Isi catatan (opsional)
- [ ] Klik Simpan
- [ ] Muncul notifikasi sukses
- [ ] Modal tertutup otomatis

### ✅ Test 2: Lihat History
- [ ] Klik santri yang sudah ada setoran
- [ ] Klik tombol kuning (history)
- [ ] Modal history muncul
- [ ] Tampil list setoran dengan tanggal & poin
- [ ] Color coding sesuai poin

### ✅ Test 3: TV Mode
- [ ] Buka `tv.html` di tab baru
- [ ] Slide 1: Ranking Halaqah Harian (dari tabel setoran_harian)
- [ ] Slide 2: Halaqah Terbaik Hari Ini
- [ ] Slide 3: Top 3 Santri Tercepat Setor
- [ ] Auto-rotate setiap 15 detik

### ✅ Test 4: Responsive
- [ ] Buka di mobile (atau resize browser)
- [ ] Tombol poin tetap besar dan mudah diklik
- [ ] Form tidak terpotong
- [ ] Scroll smooth di history

## 🐛 Troubleshooting

### Error: "showModal is not defined"
**Sudah diperbaiki!** Form sekarang menggunakan `createModal()` yang benar.

### Error: "SetoranHarian is not defined"
**Solusi:** Pastikan file `js/setoran-harian.js` sudah di-load di `index.html`:
```html
<script src="js/setoran-harian.js"></script>
<script src="js/setoran-integration.js"></script>
```

### Data tidak tersimpan
**Cek:**
1. Apakah migrasi SQL sudah dijalankan?
2. Buka Console (F12) → lihat error
3. Pastikan user sudah login (authenticated)

### History tidak muncul
**Cek:**
1. Apakah ada data di tabel `setoran_harian`?
   ```sql
   SELECT * FROM setoran_harian ORDER BY created_at DESC LIMIT 10;
   ```
2. Apakah RLS policies sudah aktif?
3. Apakah user authenticated?

## 📊 Struktur Database

### Tabel: `setoran_harian`
```
id              BIGINT (PK)
santri_id       BIGINT (FK → students)
halaqah_id      BIGINT (FK → halaqahs)
tanggal         DATE
waktu_setor     TIMESTAMP
poin            INTEGER (-1 to 2)
keterangan      TEXT
created_by      UUID (FK → auth.users)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### View: `v_ranking_harian`
Ranking halaqah per hari berdasarkan total poin

### View: `v_top_setoran_harian`
Top santri tercepat setor per hari

### Function: `get_santri_setoran_history()`
Ambil history setoran per santri

### Function: `get_halaqah_daily_stats()`
Statistik harian per halaqah

## 🎯 Keunggulan Sistem Baru

### ✅ Sebelum (Array di students.setoran)
- ❌ Tidak ada timestamp detail
- ❌ Sulit query ranking harian
- ❌ Tidak ada audit trail
- ❌ Performa lambat untuk data banyak

### ✨ Sesudah (Tabel setoran_harian)
- ✅ Timestamp lengkap (tanggal + jam)
- ✅ Query cepat dengan index
- ✅ Audit trail lengkap (created_by)
- ✅ Scalable untuk ribuan data
- ✅ View & function untuk analytics
- ✅ RLS untuk security

## 🚀 Next Steps (Opsional)

### 1. Migrasi Data Lama
Jika ada data di `students.setoran` (array lama), bisa dimigrasikan:
```sql
-- Script migrasi akan dibuat jika diperlukan
```

### 2. Notifikasi Real-time
Tambahkan Supabase Realtime untuk update otomatis saat ada setoran baru.

### 3. Export Excel
Tambahkan fitur export history setoran ke Excel per periode.

### 4. Dashboard Analytics
Grafik trend setoran per minggu/bulan.

## 📞 Support

Jika ada masalah:
1. Cek Console browser (F12)
2. Cek Supabase logs
3. Baca file `IMPLEMENTATION-SETORAN-HARIAN.md`
4. Tanya di chat

---

**Status:** ✅ READY TO USE
**Last Updated:** 12 Feb 2026
**Version:** 2.0
