# 🧪 Cara Test Perbaikan Setoran

## ⚠️ PENTING: Urutan Test yang Benar

Test harus dilakukan dengan urutan yang tepat agar semua fungsi tersedia.

---

## 📝 Langkah-Langkah Test

### Step 1: Buka Dashboard

1. Buka file `dashboard.html` di browser
2. Login sebagai **Guru** atau **Admin**
3. Buka Console browser (tekan F12)
4. Pastikan tidak ada error di console

### Step 2: Verifikasi Script Loaded

Di console, ketik dan jalankan:

```javascript
console.log('Fix loaded:', typeof window.hasPendingLocalChanges !== 'undefined');
console.log('Flags:', {
    hasPendingLocalChanges: window.hasPendingLocalChanges,
    syncInProgress: window.syncInProgress,
    isLoadingFromSupabase: window.isLoadingFromSupabase
});
```

**Hasil yang diharapkan:**
```
Fix loaded: true
Flags: {
    hasPendingLocalChanges: false,
    syncInProgress: false,
    isLoadingFromSupabase: false
}
```

### Step 3: Test Input Setoran

1. Pilih santri dari daftar
2. Klik tombol "Input Setoran" atau "📖"
3. Isi form setoran:
   - Pilih lembaga
   - Isi jumlah baris
   - Pilih kelancaran
   - Klik "Simpan"

4. **Perhatikan console**, harus muncul:
```
💾 Saving setoran: {...}
📊 Updated student: {...}
✅ Saved to localStorage
☁️ Syncing to Supabase...
✅ Synced to Supabase
✅ Sync complete, cleared pending flag
```

5. **Perhatikan UI:**
   - Notifikasi "✅ Setoran berhasil disimpan"
   - Total poin bertambah
   - Total hafalan bertambah (jika ada)

### Step 4: Test Persistence (Data Tidak Hilang)

1. Setelah input setoran, tunggu 3 detik
2. Refresh halaman (F5)
3. **Cek data santri:**
   - Total poin harus sama dengan sebelum refresh
   - Total hafalan harus sama
   - Riwayat setoran harus ada

### Step 5: Test Race Condition Protection

1. Input setoran baru
2. **LANGSUNG** refresh halaman (jangan tunggu sync selesai)
3. Cek console, harus muncul:
```
⏭️ Skipping load - pending local changes
```
4. Tunggu beberapa detik
5. Data harus tetap ada dan benar

### Step 6: Verifikasi dengan Debug Tool

1. Buka `debug-hafalan.html` di tab baru
2. Klik "Cek LocalStorage" - harus ada data
3. Klik "Cek Supabase" - harus ada data
4. Klik "Bandingkan" - harus tidak ada perbedaan

---

## 🔍 Test Lanjutan (Opsional)

### Test Multiple Setoran

1. Input 3-5 setoran berturut-turut untuk santri berbeda
2. Tunggu semua sync selesai (cek console)
3. Refresh halaman
4. Semua data harus ada

### Test Offline Mode

1. Buka dashboard.html
2. Matikan koneksi internet (Airplane mode atau disconnect WiFi)
3. Input setoran baru
4. Harus muncul notifikasi berhasil
5. Nyalakan koneksi kembali
6. Tunggu 30 detik
7. Cek console:
```
🔄 Retrying sync for pending changes...
✅ Retry sync successful
```

### Test dengan Tool

1. Buka dashboard.html terlebih dahulu
2. Buka `test-setoran-fix.html` di tab baru
3. Klik "Test Flags" - semua harus ✅ PASS
4. Klik "Test Functions" - semua harus ✅ exists
5. Klik "Test Race Condition" - tidak ada error
6. Klik "Test Sync Flow" - cek hasilnya

---

## ✅ Kriteria Sukses

Test dianggap **BERHASIL** jika:

1. ✅ Tidak ada error di console
2. ✅ Data tersimpan di localStorage
3. ✅ Data tersync ke Supabase
4. ✅ Data tidak hilang setelah refresh
5. ✅ Poin dihitung dengan benar
6. ✅ Total hafalan bertambah
7. ✅ Riwayat setoran muncul
8. ✅ Race condition protection bekerja

---

## ❌ Troubleshooting

### Masalah: "Fix loaded: false"

**Penyebab:** Script `fix-setoran-sync.js` tidak dimuat

**Solusi:**
1. Cek file `dashboard.html` baris 701-702
2. Pastikan ada: `<script src="js/fix-setoran-sync.js"></script>`
3. Refresh halaman dengan Ctrl+F5 (hard refresh)

### Masalah: "Supabase: not connected"

**Penyebab:** Koneksi Supabase belum tersedia

**Solusi:**
1. Cek kredensial Supabase di `js/supabase.js`
2. Cek koneksi internet
3. Cek console untuk error Supabase

### Masalah: Data hilang setelah refresh

**Penyebab:** Sync belum selesai atau localStorage tidak tersimpan

**Solusi:**
1. Tunggu hingga muncul "✅ Synced to Supabase" di console
2. Cek localStorage: `localStorage.getItem('halaqahData')`
3. Jika null, ada masalah di `StorageManager.save()`

### Masalah: Poin tidak bertambah

**Penyebab:** Kondisi setoran tidak memenuhi syarat poin

**Solusi:**
1. Cek logika poin di console
2. Pastikan kondisi:
   - Tepat Waktu + Lancar + Target = +2
   - Tepat Waktu + Tidak Lancar + Target = +1
   - Lainnya = 0
3. Cek `poinRules` di `js/settings.js`

---

## 📊 Monitoring Console

### Log Normal (Sehat):
```
✅ Setoran sync fix loaded
💾 Saving setoran: {...}
✅ Saved to localStorage
☁️ Syncing to Supabase...
✅ Synced to Supabase
✅ Sync complete, cleared pending flag
```

### Log Protection (Normal):
```
⏭️ Skipping load - pending local changes
⏭️ Skipping realtime update - pending local changes
```

### Log Retry (Normal):
```
🔄 Retrying sync for pending changes...
✅ Retry sync successful
```

### Log Error (Perlu Perhatian):
```
❌ Sync error: ...
❌ Retry sync failed: ...
⛔ Akses ditolak: ...
```

---

## 📞 Bantuan Lebih Lanjut

Jika masih ada masalah setelah mengikuti panduan ini:

1. Screenshot console dengan semua error
2. Jalankan command debug:
```javascript
console.log('Dashboard Data:', dashboardData);
console.log('Current Profile:', currentProfile);
console.log('Pending Changes:', window.hasPendingLocalChanges);
console.log('Sync In Progress:', window.syncInProgress);
console.log('Students Count:', dashboardData.students.length);
```
3. Screenshot hasil dari `debug-hafalan.html`
4. Lihat dokumentasi lengkap di `SOLUSI-DATA-TIDAK-BERTAMBAH.md`

---

## 📚 Dokumentasi Terkait

- `DIAGNOSIS-SETORAN.md` - Analisis masalah
- `SOLUSI-DATA-TIDAK-BERTAMBAH.md` - Panduan lengkap
- `RINGKASAN-PERBAIKAN.md` - Ringkasan singkat
- `CHECKLIST-VERIFIKASI.md` - Checklist lengkap
- `test-setoran-fix.html` - Tool testing
- `debug-hafalan.html` - Tool debugging

---

**Selamat Testing! 🚀**
