# 🔧 Fix: Guru Melihat Semua Santri

## 📋 Masalah

Guru login tapi melihat santri dari **semua halaqah**, padahal seharusnya hanya melihat santri dari **halaqah yang diajar**.

---

## 🔍 Penyebab Umum

### 1. Nama Guru Tidak Cocok

Nama guru di **profile user** tidak cocok dengan nama guru di **data halaqah**.

**Contoh:**
- Profile: `Ustadz Ahmad Fauzi`
- Halaqah: `Ahmad` atau `Ust. Ahmad`

Sistem tidak bisa matching karena format berbeda.

### 2. Tidak Ada Halaqah yang Diajar

Guru tidak terdaftar sebagai pengajar di halaqah manapun.

### 3. Data Halaqah Kosong

Field `guru` di data halaqah kosong atau tidak terisi.

---

## 🧪 Cara Diagnosa

### Step 1: Buka Debug Tool

1. Login sebagai **Guru**
2. Buka `debug-guru-filter.html`
3. Klik semua tombol untuk cek:
   - Info user login
   - Daftar halaqah & guru
   - Matching guru dengan halaqah
   - Santri yang seharusnya terlihat

### Step 2: Cek Console

Buka Console (F12) dan cari log:

```
🔍 Filtering by user-santri relationships (guru only)...
User students: X
After user-santri filter: X
```

**Jika "After user-santri filter: 0"** → Tidak ada matching!

### Step 3: Cek Matching

Di debug tool, lihat tabel "Matching Guru dengan Halaqah":
- ✅ YES = Ada matching
- ❌ NO = Tidak ada matching

---

## ✅ Solusi

### Solusi 1: Perbaiki Nama Guru di Profile

**Cara:**
1. Login sebagai **Admin**
2. Buka menu **Users**
3. Cari user guru yang bermasalah
4. Klik **Edit**
5. Ubah **Full Name** agar cocok dengan nama di halaqah
6. Simpan

**Tips:**
- Gunakan nama yang sama persis
- Atau gunakan nama pendek yang unik
- Contoh: Jika di halaqah `Ahmad`, maka di profile juga `Ahmad`

### Solusi 2: Perbaiki Nama Guru di Halaqah

**Cara:**
1. Login sebagai **Admin**
2. Buka menu **Halaqah**
3. Klik halaqah yang ingin diedit
4. Ubah field **Guru** agar cocok dengan nama di profile
5. Simpan

### Solusi 3: Assign Manual (Jika Nama Tidak Bisa Disamakan)

**Cara:**
1. Login sebagai **Admin**
2. Buka menu **Users**
3. Cari user guru
4. Klik **Assign Santri**
5. Pilih santri yang ingin di-assign
6. Simpan

---

## 🎯 Cara Kerja Filter

### Logika Matching:

```javascript
// 1. Ambil nama guru dari profile
const guruName = "Ahmad Fauzi"
  .toLowerCase()                    // "ahmad fauzi"
  .replace(/^(ustadz|ust|u\.)\s*/i, '') // Hapus prefix
  .trim();                          // "ahmad fauzi"

// 2. Cek setiap halaqah
halaqahs.forEach(h => {
  const hGuru = h.guru
    .toLowerCase()
    .replace(/^(ustadz|ust|u\.)\s*/i, '')
    .trim();
  
  // 3. Cek exact match
  if (hGuru === guruName) {
    // ✅ Match!
  }
  
  // 4. Jika tidak exact, cek partial match
  if (hGuru.includes(guruName) || guruName.includes(hGuru)) {
    // ✅ Match!
  }
});
```

### Contoh Matching:

| Profile | Halaqah | Match? | Type |
|---------|---------|--------|------|
| Ahmad Fauzi | Ahmad Fauzi | ✅ YES | Exact |
| Ustadz Ahmad | Ahmad | ✅ YES | Partial |
| Ahmad | Ust. Ahmad Fauzi | ✅ YES | Partial |
| Ahmad | Budi | ❌ NO | - |

---

## 🔧 Troubleshooting

### Masalah: Matching tapi tetap melihat semua santri

**Penyebab:** Filter tidak dijalankan di UI

**Solusi:**
1. Cek file `js/ui.js` baris 195-207
2. Pastikan ada kode:
```javascript
if (isLoggedIn && currentProfile.role === 'guru') {
    if (typeof getStudentsForCurrentUser === 'function') {
        const userStudents = getStudentsForCurrentUser();
        const userStudentIds = userStudents.map(s => String(s.id));
        filtered = filtered.filter(s => userStudentIds.includes(String(s.id)));
    }
}
```
3. Refresh halaman dengan Ctrl+F5

### Masalah: Tidak ada santri yang terlihat

**Penyebab:** Matching terlalu ketat atau tidak ada santri di halaqah

**Solusi:**
1. Cek apakah ada santri di halaqah yang diajar
2. Cek field `halaqah` di data santri cocok dengan nama halaqah
3. Gunakan assign manual jika perlu

### Masalah: Function tidak ditemukan

**Penyebab:** File `js/user-santri.js` tidak dimuat

**Solusi:**
1. Cek file `dashboard.html`
2. Pastikan ada: `<script src="js/user-santri.js"></script>`
3. Refresh dengan Ctrl+F5

---

## 📊 Verifikasi

### Checklist Setelah Fix:

- [ ] Login sebagai Guru
- [ ] Buka dashboard
- [ ] Cek console: `After user-santri filter: X` (X > 0)
- [ ] Hanya melihat santri dari halaqah yang diajar
- [ ] Tidak melihat santri dari halaqah lain
- [ ] Bisa input setoran untuk santri yang terlihat

### Test dengan Debug Tool:

- [ ] Buka `debug-guru-filter.html`
- [ ] Cek "Matching Guru dengan Halaqah" → Ada ✅ YES
- [ ] Cek "Santri yang Seharusnya Terlihat" → Ada data
- [ ] Jumlah santri sesuai dengan halaqah yang diajar

---

## 📝 Catatan Penting

1. **Admin** selalu melihat **semua santri** (tidak difilter)
2. **Orang Tua** juga melihat **semua santri** untuk ranking
3. **Guru** hanya melihat santri dari **halaqah yang diajar**
4. Matching **case-insensitive** (tidak peduli huruf besar/kecil)
5. Prefix **Ustadz/Ust/U.** otomatis dihapus saat matching

---

## 🎉 Kesimpulan

Filter guru sudah ada dan bekerja dengan baik. Masalah biasanya karena:
1. Nama tidak cocok
2. Data halaqah tidak lengkap
3. Tidak ada santri di halaqah

Gunakan `debug-guru-filter.html` untuk diagnosa dan perbaiki data sesuai solusi di atas.
