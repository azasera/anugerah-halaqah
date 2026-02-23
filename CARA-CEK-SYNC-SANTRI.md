# 📱 Cara Cek & Perbaiki Sinkronisasi Data Santri

## 🎯 Tujuan
Memastikan jumlah data santri di localStorage (lokal) sama dengan di Supabase (cloud).

## 🔍 Langkah 1: Cek Status Sinkronisasi

1. Buka file: **`diagnose-tambah-santri.html`**
2. Lihat jumlah data:
   - **Data Lokal** (kiri) = jumlah di localStorage
   - **Data Supabase** (kanan) = jumlah di database cloud
3. Perhatikan bagian **"Perbandingan Data"**:
   - ✅ **Hijau** = Data sudah sinkron
   - ❌ **Merah** = Data TIDAK sinkron

## ⚠️ Jika Data Tidak Sinkron

### Skenario A: Lokal Lebih Banyak
**Artinya**: Ada santri yang belum terupload ke Supabase

**Solusi**:
1. Klik tombol **"🚀 Sinkronkan Data Lokal ke Supabase"**
2. Tunggu notifikasi sukses
3. Klik **"🔄 Refresh Data Supabase"**
4. Pastikan jumlah sudah sama

### Skenario B: Supabase Lebih Banyak
**Artinya**: Ada santri di cloud yang belum ada di lokal

**Solusi**:
1. Buka dashboard utama (`dashboard.html`)
2. Logout dan login kembali (untuk reload data dari Supabase)
3. Atau klik tombol refresh di browser (F5)
4. Cek kembali di `diagnose-tambah-santri.html`

## 🔧 Perbaikan Permanen

Masalah ini sudah diperbaiki di `js/forms.js`. Setelah perbaikan:
- ✅ Setiap tambah santri baru akan langsung tersinkron ke Supabase
- ✅ Tidak perlu sinkronisasi manual lagi

## 📊 Memahami Output Diagnosa

### Contoh Output Normal (Sinkron):
```
📱 Data Lokal: 50 santri
☁️ Data Supabase: 50 santri
✅ Data sudah sinkron sempurna!
```

### Contoh Output Bermasalah:
```
📱 Data Lokal: 52 santri
☁️ Data Supabase: 50 santri
❌ Data TIDAK sinkron!
Selisih: 2 santri (Lokal lebih banyak)

⚠️ 2 santri hanya ada di LOKAL:
- Ahmad Fauzi (ID: 1708234567890)
- Siti Nurhaliza (ID: 1708234567891)
```

## 🚨 Troubleshooting

### Problem: "Data tersimpan lokal, tetapi belum tersimpan di server"
**Penyebab Paling Umum**: Role user bukan Admin/Guru

**Solusi**:
1. Buka `test-sync-permission.html` untuk cek role Anda
2. Jika role bukan Admin/Guru:
   - Logout dari akun saat ini
   - Login dengan akun Admin atau Guru
   - Coba tambah/import santri lagi
3. Jika Anda seharusnya Admin/Guru, minta admin mengubah role Anda

### Problem: Tombol Sinkronisasi Tidak Bekerja
**Solusi**:
1. Pastikan Anda login sebagai **Admin** atau **Guru**
2. Cek koneksi internet
3. Buka Console (F12) untuk melihat error

### Problem: Data Tetap Tidak Sinkron Setelah Sinkronisasi
**Solusi**:
1. Cek apakah ada error di Console (F12)
2. Pastikan konfigurasi Supabase benar di `js/settings.js`
3. Coba logout dan login kembali

### Problem: "Supabase tidak terkonfigurasi"
**Solusi**:
1. Buka `js/settings.js`
2. Pastikan `SUPABASE_URL` dan `SUPABASE_ANON_KEY` sudah diisi
3. Jangan gunakan nilai default `'YOUR_SUPABASE_URL'`

## 📝 Checklist Verifikasi

Setelah perbaikan, pastikan:
- [ ] Jumlah data lokal = jumlah data Supabase
- [ ] Tidak ada santri yang hanya ada di lokal
- [ ] Tidak ada santri yang hanya ada di Supabase
- [ ] Tambah santri baru langsung muncul di kedua tempat
- [ ] Data konsisten di semua device

## 🎓 Tips

1. **Rutin cek sinkronisasi** setelah menambah banyak santri
2. **Gunakan tool diagnosa** sebelum dan sesudah import Excel
3. **Backup data** sebelum melakukan sinkronisasi manual
4. **Pastikan koneksi stabil** saat menambah data penting

---

**File Terkait**:
- `diagnose-tambah-santri.html` - Tool diagnosa
- `FIX-TAMBAH-SANTRI-SYNC.md` - Dokumentasi teknis
- `js/forms.js` - File yang sudah diperbaiki
