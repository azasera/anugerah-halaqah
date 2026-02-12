# 🤖 Panduan Auto Kalkulasi Poin

## Deskripsi
Sistem otomatis untuk menghitung dan menerapkan poin berdasarkan aturan yang telah ditetapkan.

## Aturan Poin

### ✅ Poin Positif (Otomatis saat Input Setoran)
- **+2 Poin**: Tepat waktu + Lancar + Capai target
- **+1 Poin**: Tepat waktu + Tidak lancar (max 3 salah) + Capai target
- **0 Poin**: Kondisi lain yang tidak memenuhi kriteria

### ❌ Poin Negatif (Otomatis di Akhir Hari)
- **-1 Poin**: Santri yang tidak setoran sama sekali

## Cara Kerja

### 1. Kalkulasi Otomatis Saat Setoran
Ketika guru input setoran, sistem otomatis menghitung poin berdasarkan:
- Ketepatan waktu (sesuai sesi aktif)
- Kelancaran (lancar/tidak lancar)
- Pencapaian target (jumlah baris sesuai lembaga)

### 2. Penalty Otomatis untuk Tidak Setoran
Sistem akan otomatis mengurangi -1 poin untuk santri yang tidak setoran dengan cara:

**Auto-Check (Otomatis)**
- Berjalan setiap 1 jam sekali
- Hanya eksekusi jika sudah melewati 30 menit setelah sesi terakhir
- Penalty hanya diterapkan 1x per hari per santri
- Streak akan reset ke 0

**Manual Trigger (Admin)**
- Admin bisa trigger manual kapan saja
- Akses melalui: Admin Panel → Tab "⚡ Auto Poin"
- Klik "📊 Lihat Laporan Detail" untuk melihat daftar santri
- Klik "⚠️ Terapkan Penalty" untuk eksekusi

## Fitur Admin Panel

### Tab Auto Poin
Lokasi: **Pengaturan Admin → ⚡ Auto Poin**

**Statistik Real-time:**
- Jumlah santri yang sudah setoran
- Jumlah santri yang belum setoran

**Aksi:**
- 📊 Lihat Laporan Detail: Menampilkan daftar lengkap santri yang belum setoran
- 🔄 Refresh Data: Update statistik terbaru

### Laporan Detail
Modal yang menampilkan:
- Total santri sudah setoran (hijau)
- Total santri belum setoran (merah)
- Daftar nama santri yang belum setoran
- Tombol untuk terapkan penalty

## Aturan Penting

### ✅ Yang Dilakukan Sistem
- Hitung poin otomatis saat input setoran
- Kurangi poin otomatis untuk yang tidak setoran
- Reset streak jika tidak setoran
- Simpan history penalty di record setoran

### ❌ Yang TIDAK Bisa Dilakukan
- Penalty tidak bisa dibatalkan (sesuai aturan sistem)
- Tidak ada input susulan
- Tidak ada koreksi manual poin
- Penalty hanya 1x per hari (tidak dobel)

## Keamanan

### Validasi
- Penalty hanya diterapkan jika belum ada penalty hari itu
- Cek tanggal untuk memastikan tidak dobel
- Auto-sync ke Supabase untuk konsistensi data

### Akses
- Hanya Admin yang bisa trigger manual
- Guru tidak bisa akses fitur auto-poin
- Parent/Ortu hanya bisa lihat hasil

## Technical Details

### File Terkait
- `js/auto-poin.js` - Module utama auto kalkulasi
- `js/admin.js` - UI admin panel
- `js/setoran.js` - Kalkulasi poin saat input setoran

### Fungsi Utama
```javascript
// Check santri yang belum setoran
AutoPoin.getStudentsWithoutSetoranToday()

// Terapkan penalty
AutoPoin.applyNoSetoranPenalty()

// Manual trigger
manualApplyPenalties()

// Tampilkan laporan
showPenaltyReport()
```

### Auto-Initialize
Module auto-poin akan otomatis initialize saat page load dan mulai auto-check setiap 1 jam.

## FAQ

**Q: Kapan penalty diterapkan?**
A: Otomatis 30 menit setelah sesi terakhir selesai, atau manual oleh admin.

**Q: Apakah penalty bisa dibatalkan?**
A: Tidak, sesuai aturan sistem tidak ada koreksi manual.

**Q: Bagaimana jika santri setoran setelah penalty?**
A: Penalty tetap ada, setoran baru akan dapat poin sesuai aturan (+2, +1, atau 0).

**Q: Apakah penalty bisa diterapkan 2x dalam sehari?**
A: Tidak, sistem akan cek dan skip jika sudah ada penalty hari itu.

**Q: Bagaimana dengan streak?**
A: Streak akan reset ke 0 jika tidak setoran (dapat penalty).

## Monitoring

### Log Console
Sistem akan log aktivitas di console:
- ✅ Penalty applied
- ⏭️ Penalty already applied (skip)
- 🔍 Running auto-penalty check
- ⏰ Not end of day yet (skip)

### Notifikasi
- Notifikasi muncul saat penalty berhasil diterapkan
- Menampilkan jumlah santri yang terkena penalty

---

**Catatan**: Sistem ini dirancang untuk berjalan otomatis tanpa intervensi manual. Admin hanya perlu monitor dan trigger manual jika diperlukan.
