# 🔍 Solusi: Alumni SMA Tidak Tampil

## Masalah
Alumni SMA yang sebelumnya tampil, sekarang tidak tampil lagi di dashboard.

## Kemungkinan Penyebab

### 1. Data Alumni Hilang dari localStorage
- Import Excel tanpa kolom "Alumni/Non Alumni" bisa menghapus status alumni
- Data di localStorage tidak sinkron dengan Supabase

### 2. Data Alumni Hilang dari Supabase
- Sync gagal atau data tertimpa saat import
- Field `is_alumni` atau `kategori` berubah menjadi kosong

### 3. Logika Alumni Berubah
- Kode deteksi alumni ada di `js/ui.js` line 305-312
- Alumni terdeteksi jika:
  - `is_alumni === true` ATAU
  - `kategori` mengandung "alumni" (tanpa "non" atau "bukan") ATAU
  - `status` mengandung "alumni" (tanpa "non" atau "bukan")

## Langkah Debugging

### Step 1: Cek Data dengan Debug Tool
Buka file: `debug-alumni-sma.html`

1. **Cek localStorage**: Klik tombol "1. Cek localStorage"
   - Lihat berapa alumni SMA yang ada
   - Periksa field `is_alumni`, `kategori`, `status`

2. **Cek Supabase**: Klik tombol "2. Cek Supabase"
   - Lihat berapa alumni SMA di database
   - Bandingkan dengan localStorage

3. **Test Logic**: Klik tombol "3. Test Alumni Logic"
   - Verifikasi logika deteksi alumni bekerja dengan benar

4. **Bandingkan**: Klik tombol "4. Bandingkan Data"
   - Lihat perbedaan antara localStorage dan Supabase

### Step 2: Identifikasi Masalah

#### Jika alumni ada di Supabase tapi tidak di localStorage:
```
⚠️ Data tidak sinkron!
Solusi: Refresh data dari Supabase
```

#### Jika alumni ada di localStorage tapi tidak di Supabase:
```
⚠️ Sync gagal!
Solusi: Sync ulang ke Supabase
```

#### Jika alumni tidak ada di keduanya:
```
❌ Data hilang!
Solusi: Restore dari backup atau input manual
```

## Solusi

### Solusi 1: Refresh Data dari Supabase
Jika data alumni masih ada di Supabase:

1. Buka dashboard
2. Klik menu "Pengaturan" (⚙️)
3. Scroll ke bawah, klik "Refresh Data dari Server"
4. Tunggu proses selesai
5. Cek apakah alumni SMA sudah muncul

### Solusi 2: Perbaiki Status Alumni Manual
Jika data alumni hilang, tambahkan kembali:

1. Buka dashboard
2. Cari santri alumni SMA yang hilang
3. Klik nama santri untuk buka detail
4. Edit data:
   - Set `is_alumni` = true
   - Atau isi `kategori` = "Alumni SMA"
5. Simpan perubahan

### Solusi 3: Import Ulang dengan Kolom Alumni
Jika banyak alumni yang hilang:

1. Siapkan Excel dengan kolom "Alumni/Non Alumni"
2. Isi dengan "Alumni" untuk santri alumni
3. Import Excel ke dashboard
4. Status alumni akan ter-update otomatis

### Solusi 4: Restore dari Backup
Jika ada backup data sebelumnya:

1. Buka Supabase Dashboard
2. Restore tabel `students` dari backup
3. Refresh data di aplikasi

## Pencegahan

### 1. Selalu Sertakan Kolom Alumni saat Import
Format Excel harus punya kolom:
```
| Nama | Halaqah | Lembaga | Kelas | Alumni/Non Alumni |
|------|---------|---------|-------|-------------------|
| ...  | ...     | SMA     | XII   | Alumni            |
```

### 2. Backup Data Berkala
- Export data ke Excel setiap minggu
- Simpan backup di Google Drive atau cloud storage

### 3. Verifikasi Setelah Import
Setelah import Excel:
1. Cek jumlah total santri
2. Cek jumlah alumni SMA
3. Pastikan tidak ada data yang hilang

## Kode Terkait

### Deteksi Alumni (js/ui.js line 305-312)
```javascript
const isAlumni = student.is_alumni === true ||
    ((kategoriHasAlumni || statusHasAlumni) && !(kategoriHasNon || statusHasNon));
```

### Import Alumni (js/excel.js line 1370-1380)
```javascript
let isAlumni = false;
let kategori = '';
if (rawAlumni) {
    const lower = rawAlumni.toLowerCase();
    const hasAlumni = lower.includes('alumni');
    const hasNon = lower.includes('non') || lower.includes('bukan');
    if (hasAlumni && !hasNon) {
        isAlumni = true;
    }
    kategori = rawAlumni;
}
```

### Update Alumni (js/excel.js line 1721-1722)
```javascript
if (typeof s.is_alumni === 'boolean') existing.is_alumni = s.is_alumni;
if (s.kategori) existing.kategori = s.kategori;
```

## Catatan Penting

⚠️ **PENTING**: Saat import Excel tanpa kolom "Alumni/Non Alumni", status alumni TIDAK akan berubah (tetap seperti data lama). Namun jika kolom ada tapi kosong, status bisa hilang!

✅ **BEST PRACTICE**: Selalu sertakan kolom "Alumni/Non Alumni" dengan nilai yang jelas:
- "Alumni" untuk alumni
- "Non Alumni" atau "Aktif" untuk santri aktif
- Jangan biarkan kosong!
