# 🔥 Penjelasan: Hari Beruntun

## Apa itu Hari Beruntun?

**Hari Beruntun** = Berapa hari **berturut-turut** santri setor tanpa putus.

---

## ✅ Otomatis Terhitung!

Sistem akan **otomatis menghitung** hari beruntun setiap kali ada input setoran:

### Cara Kerja:
1. **Setor hari ini** → Sistem cek: apakah kemarin juga setor?
2. **Jika kemarin setor** → Hari beruntun +1
3. **Jika kemarin tidak setor** → Hari beruntun reset ke 1
4. **Jika tidak setor 1 hari** → Hari beruntun reset ke 0

### Tidak Perlu Input Manual!
- ✅ Otomatis dihitung dari database
- ✅ Tidak bisa dimanipulasi
- ✅ Akurat dan real-time
- ✅ Update setiap kali input setoran

---

## 📊 Contoh Kasus:

### Contoh 1: Santri Konsisten
```
Senin    : Setor ✅ → Hari Beruntun: 1
Selasa   : Setor ✅ → Hari Beruntun: 2
Rabu     : Setor ✅ → Hari Beruntun: 3
Kamis    : Setor ✅ → Hari Beruntun: 4
Jumat    : Setor ✅ → Hari Beruntun: 5
```
**Hasil: 🔥 5 hari beruntun**

---

### Contoh 2: Santri Putus di Tengah
```
Senin    : Setor ✅ → Hari Beruntun: 1
Selasa   : Setor ✅ → Hari Beruntun: 2
Rabu     : TIDAK SETOR ❌ → Hari Beruntun: 0
Kamis    : Setor ✅ → Hari Beruntun: 1 (mulai lagi)
Jumat    : Setor ✅ → Hari Beruntun: 2
```
**Hasil: 🔥 2 hari beruntun** (karena putus di Rabu)

---

### Contoh 3: Santri Baru Mulai
```
Senin    : Tidak ada data
Selasa   : Tidak ada data
Rabu     : Setor ✅ (pertama kali) → Hari Beruntun: 1
Kamis    : Setor ✅ → Hari Beruntun: 2
Jumat    : Setor ✅ → Hari Beruntun: 3
```
**Hasil: 🔥 3 hari beruntun**

---

## 🎯 Manfaat Hari Beruntun:

### 1. Motivasi Santri
- Santri akan berusaha **tidak putus** hari beruntunnya
- Seperti game, bikin ketagihan untuk terus konsisten
- "Wah hari beruntun saya sudah 30 hari, jangan sampai putus!"

### 2. Ukur Konsistensi
- Bukan hanya lihat total poin
- Tapi juga **seberapa konsisten** santri setor
- Santri dengan hari beruntun tinggi = santri yang disiplin

### 3. Kompetisi Sehat
- Bisa bikin leaderboard "Hari Beruntun Terpanjang"
- Santri berlomba siapa yang paling konsisten
- Lebih fair karena tidak bergantung pada kemampuan hafalan

---

## 📈 Perbandingan Santri:

| Santri | Total Poin | Hari Beruntun | Analisis |
|--------|------------|---------------|----------|
| Ahmad | 100 | 🔥 50 hari | Konsisten banget! |
| Budi | 100 | 🔥 10 hari | Poin sama, tapi sering bolos |
| Citra | 80 | 🔥 40 hari | Poin lebih rendah, tapi rajin |

**Kesimpulan:** Ahmad paling bagus karena poin tinggi DAN konsisten!

---

## 🔧 Di Form Edit Santri:

Field "Hari Beruntun" adalah **READ-ONLY** (tidak bisa diedit):

```
┌─────────────────────────────────┐
│ Hari Beruntun                   │
│ ┌─────────────────────────────┐ │
│ │      🔥 15                   │ │
│ └─────────────────────────────┘ │
│ 💡 Dihitung otomatis dari       │
│    history setoran berturut-turut│
└─────────────────────────────────┘
```

**Kenapa tidak bisa diedit?**
- ✅ Mencegah manipulasi data
- ✅ Menjaga integritas sistem
- ✅ Nilai harus dari perhitungan real

---

## 🎮 Seperti Aplikasi Populer:

Konsep yang sama dengan:
- **Duolingo** - Streak belajar bahasa
- **GitHub** - Contribution streak
- **Snapchat** - Snap streak
- **Strava** - Running streak

Terbukti sangat efektif untuk membangun kebiasaan! 💪

---

## ❓ FAQ:

### Q: Bagaimana jika santri sakit dan tidak bisa setor?
**A:** Hari beruntun akan reset. Ini memang kelemahan sistem streak, tapi bisa diatasi dengan:
- Fitur "Freeze" (bekukan streak saat sakit) - bisa ditambahkan nanti
- Atau tetap input setoran dengan poin 0 untuk maintain streak

### Q: Apakah hari libur dihitung?
**A:** Ya, sistem menghitung semua hari. Jika ingin skip hari libur, perlu logika tambahan.

### Q: Bagaimana cara reset streak manual?
**A:** Tidak bisa reset manual. Streak hanya bisa reset dengan:
1. Tidak setor 1 hari
2. Atau hapus data setoran dari database (admin only)

### Q: Apakah streak dihitung per halaqah atau per santri?
**A:** Per santri. Setiap santri punya streak sendiri.

---

**Status:** ✅ OTOMATIS
**Last Updated:** 12 Feb 2026
**Version:** 2.0
