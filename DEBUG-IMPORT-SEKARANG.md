# 🐛 DEBUG IMPORT SYNC - Kenapa Data Hilang Setelah Refresh?

## 🎯 Masalah

Anda import 42 santri → Data tersimpan lokal → Setelah refresh, data hilang (kembali ke jumlah sebelumnya)

**Penyebab**: Data tidak tersinkron ke Supabase saat import.

## 🔍 Langkah Debug

### 1. Hard Refresh
**Tekan Ctrl+Shift+R** untuk memastikan file terbaru ter-load

### 2. Install Debug Wrapper
Buka Console (F12), paste script ini:

```javascript
fetch('debug-import-sync.js').then(r => r.text()).then(script => eval(script));
```

Script ini akan:
- ✅ Cek status fungsi sync
- ✅ Monitor setiap kali sync dipanggil
- ✅ Log kenapa sync di-skip (jika di-skip)
- ✅ Tampilkan hasil sync

### 3. Coba Import Lagi
1. Buka menu Import Excel atau Import SD API
2. Pilih beberapa santri (tidak perlu banyak, 2-3 saja untuk test)
3. Klik "Import Terpilih"
4. **PERHATIKAN Console** - akan ada log detail

### 4. Analisa Hasil

**Jika muncul**:
```
❌ SYNC SKIPPED: No permission
   Role: undefined
```
→ **Masalah**: Profile tidak ter-load atau role bukan admin/guru

**Solusi**:
```javascript
// Load profile manual
window.currentProfile = JSON.parse(localStorage.getItem('currentProfile'));
console.log('Profile loaded:', window.currentProfile);
```
Lalu refresh dan coba import lagi.

---

**Jika muncul**:
```
❌ SYNC SKIPPED: Data empty
   dashboardData.students: 0
```
→ **Masalah**: dashboardData belum ter-load saat sync dipanggil

**Solusi**: Ini race condition, tunggu beberapa detik setelah page load, lalu coba import.

---

**Jika muncul**:
```
✅ SYNC SUCCESS!
   Count: 1002
```
→ **BERHASIL!** Data sudah tersinkron. Coba refresh untuk verifikasi.

---

**Jika TIDAK ADA LOG sama sekali**:
→ **Masalah**: Fungsi sync tidak dipanggil sama sekali

**Solusi**: Ada error di kode import. Cek Console untuk error merah.

## 📸 Screenshot yang Dibutuhkan

Jika masih gagal, screenshot:
1. ✅ Output dari debug-import-sync.js (sebelum import)
2. ✅ Log di Console saat import (termasuk "🔄 [DEBUG] syncStudentsToSupabase CALLED")
3. ✅ Hasil sync ("📊 [DEBUG] syncStudentsToSupabase RESULT")
4. ✅ Error merah (jika ada)

## 🎯 Expected Flow

Flow yang benar:
```
1. User klik "Import Terpilih"
2. Data ditambahkan ke dashboardData.students
3. 🔄 syncStudentsToSupabase() dipanggil
4. ✅ Sync berhasil (status: success)
5. Notifikasi: "Data berhasil tersimpan permanen"
6. Refresh → Data masih ada
```

Flow yang salah (current):
```
1. User klik "Import Terpilih"
2. Data ditambahkan ke dashboardData.students
3. 🔄 syncStudentsToSupabase() dipanggil
4. ❌ Sync di-skip (status: skipped_permission/skipped_empty)
5. Notifikasi: "Data tersimpan lokal"
6. Refresh → Data hilang (load dari Supabase yang kosong)
```

---

**Mulai dari Langkah 1 sekarang!**
