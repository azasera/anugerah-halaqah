# ⚡ Quick Test: Rename Halaqah

## 🎯 Test Cepat (2 Menit)

### 1️⃣ Refresh Browser
```
Tekan: Ctrl+F5 (hard refresh)
Tujuan: Load file js/menu.js yang sudah diperbaiki
```

### 2️⃣ Login & Buka Console
```
Login: Admin
Tekan: F12 (buka Console)
```

### 3️⃣ Test Rename
```
1. Menu Halaqah
2. Pilih halaqah
3. Klik Edit
4. Ubah nama (contoh: A → B)
5. Klik Simpan
```

### 4️⃣ Cek Console
Harus muncul:
```
🔄 Updating halaqah: A → B
📝 Updating student halaqah references...
  ✅ Updated: [nama santri] → B
✅ Updated X students
```

### 5️⃣ Verifikasi
- [ ] Nama halaqah berubah
- [ ] Santri masih muncul
- [ ] Jumlah members sama

---

## ✅ Hasil yang Diharapkan

| Test | Sebelum Fix | Setelah Fix |
|------|-------------|-------------|
| Rename halaqah | ❌ Santri hilang | ✅ Santri tetap ada |
| Notifikasi | ✅ Muncul | ✅ Muncul |
| Nama berubah | ❌ Tidak | ✅ Ya |
| Console log | ❌ Tidak ada | ✅ Ada log update |

---

## ❌ Jika Masih Bermasalah

### Tidak ada log di console?
```
1. Ctrl+F5 (hard refresh)
2. Clear cache browser
3. Reload halaman
```

### Santri masih hilang?
```javascript
// Jalankan di console:
recalculateRankings();
StorageManager.save();
refreshAllData();
```

### Data tidak tersimpan?
```javascript
// Jalankan di console:
syncHalaqahsToSupabase();
syncStudentsToSupabase();
```

---

## 📞 Bantuan

Jika masih bermasalah, lihat: `FIX-RENAME-HALAQAH.md`
