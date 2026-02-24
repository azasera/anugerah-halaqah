# Cara Sync Total Hafalan MTA Otomatis

## 📋 Overview

Fitur ini memungkinkan data total hafalan MTA dari API secara otomatis masuk ke aplikasi dashboard.

## 🔧 Perbaikan yang Dilakukan

### Sebelum:
- Endpoint salah: `/api/totalHafalan2025/mta/{namaGuru}` (404 error)
- Loop per guru (tidak efisien)
- Data tidak bisa sync

### Sesudah:
- Endpoint benar: `/api/totalHafalan2025/mta` ✅
- Ambil semua data sekaligus (lebih efisien)
- Auto sync ke localStorage
- Fuzzy matching untuk handle typo nama

## 🚀 Cara Menggunakan

### Metode 1: Dari Dashboard Utama

1. Buka `dashboard.html`
2. Klik menu **Import Data**
3. Pilih **"Sinkron Total Hafalan MTA 2025"**
4. Data otomatis masuk ke aplikasi

### Metode 2: Test Manual

1. Buka file `test-sync-hafalan-mta.html`
2. Ikuti step by step:
   - **Step 1**: Cek API Endpoint (pastikan API berfungsi)
   - **Step 2**: Cek Data Lokal (pastikan ada data MTA)
   - **Step 3**: Sync Total Hafalan (jalankan sync)
   - **Step 4**: Verifikasi Hasil (lihat tabel hasil)

## 📊 Format Data API

API mengembalikan data dengan struktur:

```json
{
  "path": "totalHafalan2025/mta",
  "data": {
    "Naufal": {
      "Adnan Al Fathir": {"totalHafalan": 6.1},
      "Muhammad Husain": {"totalHafalan": "17.2"}
    },
    "Alim": {
      "Ahmad Fatih": {"totalHafalan": 5.5}
    },
    "Harziki": {
      "Billy Permana": {"totalHafalan": 8.3}
    }
  }
}
```

## ✨ Fitur

1. **Auto Parse**: Handle totalHafalan sebagai number atau string
2. **Fuzzy Matching**: Cocokkan nama meskipun ada typo (similarity > 80%)
3. **Logging**: Console log detail untuk debugging
4. **Error Handling**: Tangani error dengan baik
5. **Notification**: Tampilkan hasil sync ke user

## 🔍 Troubleshooting

### Data tidak masuk?

1. Cek console browser (F12)
2. Lihat log `[MTA]` untuk detail
3. Pastikan nama di API sama dengan nama di localStorage
4. Gunakan file test untuk debug

### Nama tidak match?

Fuzzy matching otomatis handle:
- "Aldenta regan abimayu" → "Aldenta Regan Abimayu"
- "Adnan Al Fathir" → "Adnan Alfathir"
- Similarity threshold: 80%

### API error?

- Cek koneksi internet
- Pastikan endpoint API aktif
- Gunakan test file untuk cek response API

## 📝 Log Console

Saat sync, akan muncul log seperti:

```
[MTA] Fetching data from: https://...
[MTA] Received data for gurus: Naufal, Alim, Harziki
[MTA] Processing guru: Naufal, students: 12
[MTA] Updated: Muhammad Husain = 17.2 juz
[MTA] Fuzzy match: "Aldenta regan abimayu" → "Aldenta Regan Abimayu" (95.5%)
[MTA] Not found in local data: "Unknown Student"
```

## ✅ Hasil

Setelah sync berhasil:
- Total hafalan MTA terupdate di localStorage
- Dashboard refresh otomatis
- Notifikasi sukses muncul
- Data siap digunakan untuk ranking, laporan, dll

## 🔄 Kapan Harus Sync?

- Setelah guru input hafalan baru di sistem
- Sebelum generate laporan
- Saat data hafalan tidak sesuai
- Minimal 1x per hari untuk data terbaru
