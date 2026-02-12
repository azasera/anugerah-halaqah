# ⚡ Quick Start: Setoran Harian

## 🎯 3 Langkah Mudah

### 1️⃣ Jalankan SQL Migration (Sekali Saja)
```
1. Buka Supabase Dashboard
2. SQL Editor → New Query
3. Copy-paste isi file: supabase-migration-setoran-harian.sql
4. Klik Run
5. ✅ Done!
```

### 2️⃣ Refresh Browser
```
Tekan: Ctrl + Shift + R
```

### 3️⃣ Mulai Input Setoran
```
1. Klik kartu santri
2. Klik tombol HIJAU 📗
3. Centang kondisi:
   ☑️ Tepat Waktu?
   ☑️ Lancar?
   ☑️ Capai Target?
   ☑️ Tidak Setor? (jika tidak setor)
4. Poin otomatis terhitung! 🎯
5. Klik Simpan 💾
```

---

## 🎯 Sistem Poin Otomatis

Form baru menggunakan **checkbox** untuk kondisi, poin **otomatis terhitung**:

### ✅ Kondisi yang Dicek:
1. **Tepat Waktu?** - Sesuai jadwal sesi
2. **Lancar?** - Tidak ada salah atau max 3 salah
3. **Capai Target?** - Sesuai target lembaga
4. **Tidak Setor?** - Tidak setor sama sekali

### 🧮 Rumus Poin:

| Tepat Waktu | Lancar | Target | Poin | Emoji |
|-------------|--------|--------|------|-------|
| ✅ | ✅ | ✅ | **+2** | 🌟 |
| ✅ | ❌ | ✅ | **+1** | 👍 |
| ✅ | ✅ | ❌ | **0** | 😐 |
| ❌ | ✅ | ✅ | **0** | 😐 |
| ❌ | ❌ | ❌ | **0** | 😐 |
| **Tidak Setor** | - | - | **-1** | ❌ |

### 💡 Keuntungan:
- ✅ **Tidak ada kesalahan input** - Poin otomatis sesuai aturan
- ✅ **Lebih cepat** - Tinggal centang kondisi
- ✅ **Transparan** - User tahu kenapa dapat poin tertentu
- ✅ **Konsisten** - Semua guru input dengan aturan sama

---

## 🔍 Lihat History

```
1. Klik kartu santri
2. Klik tombol KUNING 🕐
3. Lihat riwayat lengkap
```

---

## 📺 TV Mode

```
Buka: tv.html
Auto-rotate 3 slides:
- Slide 1: Ranking Halaqah
- Slide 2: Halaqah Terbaik
- Slide 3: Top 3 Santri
```

---

## ❓ Troubleshooting

### Form tidak muncul?
→ Refresh: `Ctrl+Shift+R`

### Error di Console?
→ Cek apakah SQL migration sudah dijalankan

### Data tidak tersimpan?
→ Pastikan sudah login sebagai Guru/Admin

### Poin tidak muncul?
→ Centang minimal 1 kondisi untuk melihat preview poin

---

## 📱 Fitur Baru v2.0

✅ **Checkbox kondisi** - Lebih intuitif
✅ **Poin auto-calculate** - Sesuai aturan
✅ **Preview real-time** - Lihat poin sebelum simpan
✅ **Color coding** - Hijau/Kuning/Abu/Merah
✅ **Emoji indicator** - Visual feedback
✅ **History 5 terakhir** - Langsung terlihat
✅ **Mobile-friendly** - Touch-optimized
✅ **Animasi smooth** - Better UX

---

**Ready to go!** 🚀
**Version:** 2.0 - Smart Auto-Calculate
