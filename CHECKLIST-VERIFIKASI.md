# ✅ Checklist Verifikasi Perbaikan

## Sebelum Test

- [ ] Backup data (export dari dashboard jika ada)
- [ ] Buka Console browser (F12)
- [ ] Login sebagai Guru atau Admin
- [ ] Pastikan koneksi internet stabil

## Test Dasar

### 1. Input Setoran Baru
- [ ] Buka dashboard.html
- [ ] Pilih santri
- [ ] Klik "Input Setoran"
- [ ] Isi form setoran
- [ ] Klik "Simpan"
- [ ] Lihat notifikasi "✅ Setoran berhasil disimpan"
- [ ] Cek di console: `✅ Saved to localStorage`
- [ ] Cek di console: `✅ Synced to Supabase`

### 2. Verifikasi Data Tersimpan
- [ ] Refresh halaman (F5)
- [ ] Cek data santri masih ada
- [ ] Cek total poin bertambah
- [ ] Cek total hafalan bertambah (jika ada)
- [ ] Cek riwayat setoran muncul

### 3. Test Sinkronisasi
- [ ] Buka `debug-hafalan.html`
- [ ] Klik "Cek LocalStorage"
- [ ] Cek data ada dan benar
- [ ] Klik "Cek Supabase"
- [ ] Cek data ada dan benar
- [ ] Klik "Bandingkan"
- [ ] Pastikan tidak ada perbedaan

## Test Lanjutan

### 4. Test Race Condition
- [ ] Input setoran baru
- [ ] Jangan tunggu sync selesai
- [ ] Langsung refresh halaman
- [ ] Data harus tetap ada
- [ ] Cek console: `⏭️ Skipping load - pending local changes`

### 5. Test Offline Mode
- [ ] Matikan koneksi internet
- [ ] Input setoran baru
- [ ] Lihat notifikasi berhasil
- [ ] Nyalakan koneksi
- [ ] Tunggu 30 detik
- [ ] Cek console: `🔄 Retrying sync for pending changes...`
- [ ] Cek console: `✅ Retry sync successful`

### 6. Test Multiple Setoran
- [ ] Input 3-5 setoran berturut-turut
- [ ] Tunggu semua sync selesai
- [ ] Refresh halaman
- [ ] Semua data harus ada

## Test Sistem

### 7. Test dengan Tool
- [ ] Buka `test-setoran-fix.html`
- [ ] Klik "Test Flags" - semua harus ✅
- [ ] Klik "Test Functions" - semua harus ✅
- [ ] Klik "Test Race Condition" - tidak ada error
- [ ] Klik "Test Sync Flow" - semua harus ✅
- [ ] Klik "Start Monitoring" - lihat log realtime

### 8. Verifikasi Console Logs
Pastikan log berikut muncul:
- [ ] `✅ Setoran sync fix loaded`
- [ ] `💾 Saving setoran: {...}`
- [ ] `✅ Saved to localStorage`
- [ ] `☁️ Syncing to Supabase...`
- [ ] `✅ Synced to Supabase`
- [ ] `✅ Sync complete, cleared pending flag`

## Verifikasi Poin

### 9. Test Perhitungan Poin
- [ ] Tepat Waktu + Lancar + Target = +2 poin
- [ ] Tepat Waktu + Tidak Lancar + Target = +1 poin
- [ ] Tepat Waktu + Lancar + Tidak Target = 0 poin
- [ ] Tidak Tepat Waktu = 0 poin
- [ ] Tidak Setor = -1 poin (jika ada)

### 10. Test Total Hafalan
- [ ] Input setoran dengan baris tertentu
- [ ] Cek konversi ke halaman benar
- [ ] Cek total_hafalan bertambah
- [ ] Cek tidak ada floating point error

## Troubleshooting

### Jika Ada Masalah:

#### Data Hilang Setelah Refresh
1. [ ] Cek console untuk error
2. [ ] Jalankan: `localStorage.getItem('halaqahData')`
3. [ ] Jika null, cek apakah `StorageManager.save()` dipanggil
4. [ ] Cek apakah ada error saat save

#### Sync Gagal
1. [ ] Cek koneksi internet
2. [ ] Cek role user: `console.log(currentProfile)`
3. [ ] Harus `role: 'guru'` atau `role: 'admin'`
4. [ ] Cek kredensial Supabase

#### Data Berbeda di LocalStorage vs Supabase
1. [ ] Buka `debug-hafalan.html`
2. [ ] Klik "Bandingkan"
3. [ ] Jika ada perbedaan, klik "Force Sync"

#### Poin Tidak Bertambah
1. [ ] Cek logika perhitungan di console
2. [ ] Cek kondisi setoran memenuhi syarat
3. [ ] Cek `poinRules` di `js/settings.js`

## Hasil Akhir

### Semua Test Harus:
- [ ] ✅ Tidak ada error di console
- [ ] ✅ Data tersimpan di localStorage
- [ ] ✅ Data tersync ke Supabase
- [ ] ✅ Data tidak hilang setelah refresh
- [ ] ✅ Poin dihitung dengan benar
- [ ] ✅ Total hafalan bertambah
- [ ] ✅ Riwayat setoran muncul

### Jika Semua ✅:
🎉 **SISTEM BERJALAN DENGAN BAIK!**

### Jika Ada ❌:
📞 Lihat dokumentasi troubleshooting di `SOLUSI-DATA-TIDAK-BERTAMBAH.md`

---

## Catatan Penting

1. **Jangan hapus localStorage** saat ada pending changes
2. **Tunggu sync selesai** sebelum refresh (lihat console)
3. **Cek console** untuk monitoring
4. **Gunakan debug tools** untuk troubleshooting
5. **Pastikan role Guru/Admin** untuk input setoran

---

## Dokumentasi Lengkap

- `DIAGNOSIS-SETORAN.md` - Analisis masalah
- `SOLUSI-DATA-TIDAK-BERTAMBAH.md` - Panduan lengkap
- `RINGKASAN-PERBAIKAN.md` - Ringkasan singkat
- `test-setoran-fix.html` - Tool testing
- `debug-hafalan.html` - Tool debugging

---

**Tanggal Verifikasi:** _________________

**Verified By:** _________________

**Status:** [ ] PASS  [ ] FAIL

**Catatan:** _________________
