# ✅ PERBAIKAN SELESAI - Instruksi Test (UPDATED)

## ⚠️ MASALAH BARU: Data Hilang Setelah Refresh

Jika Anda mengalami:
- Import santri berhasil
- Data tersimpan lokal
- Setelah refresh, data hilang (jumlah kembali)

**→ Lihat file: DEBUG-IMPORT-SEKARANG.md**

File tersebut berisi langkah debug untuk menemukan kenapa sync di-skip saat import.

---

## 🔧 Yang Sudah Diperbaiki

1. ✅ File `js/supabase.js` - Fungsi sync sekarang menggunakan `dashboardData` global yang benar
2. ✅ File `js/data.js` - `dashboardData` sekarang di-export ke `window` untuk debugging
3. ✅ Race condition diperbaiki - tidak akan error lagi saat data belum ter-load

## 🚀 Cara Test Perbaikan

### 1. Hard Refresh (WAJIB!)
**Tekan Ctrl+Shift+R** untuk reload semua file yang sudah diperbaiki

**PENTING**: Tunggu sampai halaman load sempurna (lihat data santri muncul di dashboard)

### 2. Test Sync Function
Buka Console (F12), paste:

```javascript
fetch('test-sync-now.js').then(r => r.text()).then(script => eval(script));
```

**Hasil yang diharapkan**:
```
✅ Function ditemukan!
✅ Semua syarat terpenuhi, bisa sync!
✅ SYNC BERHASIL!
📈 Jumlah santri tersinkron: 1000
```

### 3. Debug Import (PENTING!)

Jika data hilang setelah refresh, ikuti langkah di **DEBUG-IMPORT-SEKARANG.md**:

1. Install debug wrapper
2. Coba import 2-3 santri
3. Lihat log di Console
4. Screenshot hasil dan kirim

### 4. Tambah Santri Manual (Alternative Test)

Coba tambah 1 santri manual (bukan import):
- Klik "Tambah Santri"
- Isi form
- Simpan
- Refresh halaman
- Cek apakah santri masih ada

Jika santri manual hilang juga → Masalah di sync function
Jika santri manual tetap ada → Masalah di import function

### 5. Verifikasi
Buka `diagnose-tambah-santri.html` untuk cek:
- Jumlah lokal = jumlah Supabase → ✅ BERHASIL!

## 🐛 Jika Masih Ada Masalah

### Problem: "Dashboard data: ❌"

Ini berarti script test dijalankan terlalu cepat sebelum data ter-load.

**Solusi**: Tunggu 5-10 detik setelah hard refresh, lalu jalankan test lagi.

### Problem: "Function tidak ditemukan"

**Solusi**:
1. Cek tab Console untuk error merah saat page load
2. Cek tab Network - cari "supabase.js", pastikan status 200
3. Screenshot error dan kirim

### Problem: "Role tidak sesuai"

**Solusi**:
1. Logout dari akun saat ini
2. Login dengan akun Admin atau Guru
3. Ulangi dari step 1

### Problem: Data hilang setelah refresh

**Solusi**: Ikuti langkah di **DEBUG-IMPORT-SEKARANG.md**

## 📋 Troubleshooting Lengkap

Lihat file **COBA-INI-SEKARANG.md** untuk troubleshooting lengkap.

Atau screenshot:
1. Hasil dari test-sync-now.js
2. Error di Console (jika ada)
3. Tab Network - status supabase.js dan data.js

---

**Mulai test sekarang dengan hard refresh!**
