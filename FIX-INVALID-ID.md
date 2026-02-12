# Fix Invalid ID Error (Decimal ID)

## 🔴 Error yang Muncul
```
Error syncing students: invalid input syntax for type bigint: "1770816840840.3281"
Error syncing halaqahs: invalid input syntax for type bigint: "1770816840840.3574"
```

## 🔍 Penyebab
ID yang digenerate menggunakan `Date.now() + Math.random()` menghasilkan angka desimal, tapi Supabase mengharapkan integer (bigint).

## ✅ Solusi

### Step 1: Fix Kode (Sudah Diperbaiki)
File yang sudah diperbaiki:
- ✅ `js/excel.js` - ID generation saat import Excel
- ✅ `js/absence.js` - ID generation saat input setoran

Perubahan: `Math.random()` → `Math.floor(Math.random() * 1000)`

### Step 2: Bersihkan Data yang Sudah Ada

Ada 2 cara:

#### Cara 1: Hapus localStorage dan Mulai Fresh (RECOMMENDED)

1. Buka aplikasi di browser
2. Tekan **F12** (Developer Tools)
3. Klik tab **Console**
4. Ketik dan Enter:
   ```javascript
   localStorage.clear()
   ```
5. Refresh halaman (F5)
6. Data akan reload dari Supabase (yang valid)

#### Cara 2: Fix ID yang Ada (Jika Tidak Ingin Kehilangan Data Lokal)

1. Buka aplikasi di browser
2. Tekan **F12** (Developer Tools)
3. Klik tab **Console**
4. Copy semua isi file `fix-invalid-ids.js`
5. Paste ke Console dan Enter
6. Tunggu pesan "✅ Fixed X invalid IDs"
7. Refresh halaman (F5)

### Step 3: Verifikasi

Setelah refresh, cek Console:
- ✅ Tidak ada error "invalid input syntax for type bigint"
- ✅ Data sync berhasil ke Supabase
- ✅ Aplikasi berjalan normal

## 🎯 Pencegahan

Setelah fix ini, ID yang digenerate akan selalu integer:
- `Date.now()` → `1770816840840` (integer)
- `Date.now() + Math.floor(Math.random() * 1000)` → `1770816840840` + `0-999` = integer

## 💡 Catatan

Error ini muncul setelah import Excel atau input setoran. Sekarang sudah diperbaiki, jadi tidak akan muncul lagi di masa depan.

## 🆘 Jika Masih Error

Jalankan SQL ini di Supabase untuk lihat data yang bermasalah:

```sql
-- Cek students dengan ID desimal (tidak akan ada karena bigint tidak bisa simpan desimal)
SELECT id, name FROM students WHERE id::text LIKE '%.%';

-- Cek halaqahs dengan ID desimal
SELECT id, name FROM halaqahs WHERE id::text LIKE '%.%';
```

Jika ada data, hapus manual:
```sql
DELETE FROM students WHERE id = 1770816840840;
DELETE FROM halaqahs WHERE id = 1770816840840;
```

Lalu refresh aplikasi.
