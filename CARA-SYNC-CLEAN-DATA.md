# 🔄 Cara Sync & Clean Data

## Masalah

Data di Local (1057 santri) berbeda dengan data di Supabase (1000 santri).
Ini menyebabkan:
- Santri yang dihapus masih tampil
- Data tidak konsisten
- Ranking tidak akurat

## Solusi: Gunakan Tool Sync & Clean

### 1. Buka Tool

```
sync-clean-data.html
```

### 2. Analyze Data (WAJIB PERTAMA)

Klik tombol **"🔍 Analyze Data"** untuk melihat:
- Berapa santri di Local
- Berapa santri di Supabase
- Santri yang hanya ada di Local (orphan)
- Santri yang hanya ada di Supabase (missing)

### 3. Pilih Aksi yang Sesuai

#### Opsi A: Force Supabase as Source (RECOMMENDED)
**Gunakan jika:** Anda yakin data di Supabase adalah yang benar

Klik **"🔨 Force: Supabase as Source"**

Ini akan:
1. Hapus SEMUA data lokal
2. Download ulang dari Supabase
3. Data lokal yang tidak ada di Supabase akan HILANG

**Hasil:** Local = Supabase (1000 santri)

#### Opsi B: Remove Orphan Data
**Gunakan jika:** Anda ingin hapus data yang hanya ada di local

Klik **"🗑️ Remove Orphan Data"**

Ini akan:
1. Cek ID santri di Supabase
2. Hapus santri di local yang tidak ada di Supabase
3. Simpan data yang sudah dibersihkan

**Hasil:** Local hanya berisi santri yang ada di Supabase

#### Opsi C: Sync Supabase → Local
**Gunakan jika:** Anda ingin update data lokal dari Supabase (tanpa hapus)

Klik **"⬇️ Sync Supabase → Local"**

Ini akan:
1. Download data dari Supabase
2. Merge dengan data lokal
3. Update data yang sudah ada

#### Opsi D: Sync Local → Supabase
**Gunakan jika:** Anda ingin upload data lokal ke Supabase

Klik **"⬆️ Sync Local → Supabase"**

Ini akan:
1. Upload data lokal ke Supabase
2. Update data yang sudah ada di Supabase

**HATI-HATI:** Ini bisa membuat data di Supabase bertambah!

#### Opsi E: Clear Local Storage
**Gunakan jika:** Semua opsi di atas gagal

Klik **"💣 Clear Local Storage"**

Ini akan:
1. Hapus SEMUA data lokal
2. Reload page
3. Download ulang dari Supabase

## Rekomendasi

Untuk kasus Anda (Local 1057, Supabase 1000):

### Langkah 1: Analyze
```
Klik "Analyze Data"
```

### Langkah 2: Lihat Hasil
- Jika ada 57 santri "Only in Local" → Ini adalah orphan data
- Jika santri yang dihapus ada di list "Only in Local" → Berarti belum terhapus dari local

### Langkah 3: Pilih Solusi

**Jika data di Supabase benar:**
```
Klik "Force: Supabase as Source"
```

**Jika ingin hapus orphan saja:**
```
Klik "Remove Orphan Data"
```

### Langkah 4: Verifikasi
```
Klik "Analyze Data" lagi
```

Seharusnya:
- Local: 1000 santri
- Supabase: 1000 santri
- Difference: 0 santri
- Status: ✅ Data is in sync!

## Troubleshooting

### Masalah: Setelah sync, data masih berbeda
**Solusi:** Gunakan "Force: Supabase as Source"

### Masalah: Data hilang setelah sync
**Solusi:** Data yang hilang adalah orphan data (tidak ada di Supabase)

### Masalah: Error saat sync
**Solusi:** 
1. Check koneksi internet
2. Check Supabase connection
3. Gunakan "Clear Local Storage" dan reload

### Masalah: Santri yang dihapus masih tampil
**Solusi:**
1. Gunakan "Remove Orphan Data"
2. Atau "Force: Supabase as Source"

## Setelah Sync

1. **Refresh dashboard.html**
2. **Check data:**
   - Buka dashboard
   - Lihat daftar santri
   - Pastikan santri yang dihapus sudah tidak ada
3. **Test delete lagi:**
   - Hapus santri
   - Santri seharusnya langsung hilang

## File yang Dibuat

1. ✅ `sync-clean-data.html` - Tool sync & clean
2. ✅ `CARA-SYNC-CLEAN-DATA.md` - Dokumentasi ini

## Kesimpulan

Masalah "santri yang dihapus masih tampil" disebabkan oleh data yang tidak sinkron antara Local dan Supabase.

Solusi terbaik:
1. Gunakan tool `sync-clean-data.html`
2. Klik "Analyze Data"
3. Klik "Force: Supabase as Source" atau "Remove Orphan Data"
4. Verifikasi dengan "Analyze Data" lagi

Setelah itu, fungsi delete akan berfungsi normal.
