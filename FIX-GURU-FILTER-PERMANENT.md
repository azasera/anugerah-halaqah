# ✅ Fix Permanent: Guru Filter

## 📋 Masalah yang Diperbaiki

Guru melihat **50 santri** dari semua halaqah, padahal seharusnya hanya melihat **10 santri** dari halaqah yang diajar.

### Penyebab:

Fungsi `getStudentsForCurrentUser()` di file `js/user-santri.js` menggunakan logika yang salah untuk guru:
- Menggunakan `getSantriIdsForCurrentUser()` yang mengembalikan ID dari tabel relationships
- Tapi untuk guru, seharusnya filter langsung berdasarkan **nama halaqah**

---

## ✅ Perbaikan yang Sudah Dilakukan

File `js/user-santri.js` sudah diperbaiki dengan menambahkan **special handling untuk guru**:

### Sebelum (Salah):
```javascript
function getStudentsForCurrentUser() {
    // ...
    
    // Get santri IDs for this user
    const santriIds = getSantriIdsForCurrentUser();
    
    // Filter students
    const filtered = dashboardData.students.filter(s => santriIds.includes(s.id));
    
    return filtered;
}
```

### Setelah (Benar):
```javascript
function getStudentsForCurrentUser() {
    // ...
    
    // SPECIAL HANDLING FOR GURU
    if (user.role === 'guru') {
        const guruName = (user.full_name || user.name || '')
            .toLowerCase()
            .replace(/^(ustadz|ust|u\.)\s*/i, '')
            .trim();
        
        // Find halaqahs taught by this guru
        const taughtHalaqahs = dashboardData.halaqahs.filter(h => {
            const hGuru = (h.guru || '').toLowerCase().replace(/^(ustadz|ust|u\.)\s*/i, '').trim();
            return hGuru === guruName || hGuru.includes(guruName) || guruName.includes(hGuru);
        });
        
        // Get halaqah names
        const halaqahNames = taughtHalaqahs.map(h => h.name.replace(/^Halaqah\s+/i, '').trim());
        
        // Filter students by halaqah
        const filtered = dashboardData.students.filter(s => halaqahNames.includes(s.halaqah));
        
        return filtered;
    }
    
    // For other roles: use relationships
    const santriIds = getSantriIdsForCurrentUser();
    const filtered = dashboardData.students.filter(s => santriIds.includes(s.id));
    return filtered;
}
```

---

## 🧪 Cara Test

### Step 1: Refresh Halaman
```
1. Tekan Ctrl+F5 (hard refresh)
2. Tujuan: Load file js/user-santri.js yang sudah diperbaiki
```

### Step 2: Login sebagai Guru
```
1. Login dengan akun guru
2. Buka dashboard
```

### Step 3: Cek Jumlah Santri
```
1. Lihat daftar santri di dashboard
2. Seharusnya hanya melihat santri dari halaqah yang diajar
```

### Step 4: Verifikasi di Console
```
1. Buka Console (F12)
2. Jalankan script check:
```

```javascript
// Quick check
console.log('Total students:', dashboardData.students.length);
console.log('Filtered students:', getStudentsForCurrentUser().length);
console.log('Expected:', 10); // Sesuaikan dengan jumlah santri di halaqah Anda
```

### Step 5: Cek Console Logs
Seharusnya muncul log seperti ini:
```
🔍 [getStudentsForCurrentUser] User: Naufal Hudiya Role: guru
👨‍🏫 Guru - filtering by halaqah...
   Guru name (processed): naufal hudiya
   ✅ Match: Halaqah Naufal Hudiya | Guru: Naufal Hudiya
   Taught halaqahs: 1
   Halaqah names: ["Naufal Hudiya"]
   ✅ Filtered students: 10
```

---

## ✅ Hasil yang Diharapkan

| Sebelum Fix | Setelah Fix |
|-------------|-------------|
| Melihat 50 santri | ✅ Melihat 10 santri |
| Dari semua halaqah | ✅ Hanya dari halaqah yang diajar |
| Filter tidak bekerja | ✅ Filter bekerja |

---

## 🔧 Troubleshooting

### Masalah: Setelah refresh masih melihat 50 santri

**Penyebab:** File belum terupdate atau cache browser

**Solusi:**
1. Hard refresh: **Ctrl+F5** (Windows) atau **Cmd+Shift+R** (Mac)
2. Clear cache browser
3. Cek apakah file `js/user-santri.js` sudah terupdate
4. Cek console untuk log filter

### Masalah: Tidak melihat santri sama sekali (0 santri)

**Penyebab:** Nama guru tidak cocok dengan nama di halaqah

**Solusi:**
1. Cek nama guru di profile
2. Cek nama guru di data halaqah
3. Pastikan nama cocok (case-insensitive, prefix diabaikan)
4. Gunakan debug tool untuk cek matching

### Masalah: Console log tidak muncul

**Penyebab:** File lama masih di-cache

**Solusi:**
1. Hard refresh: Ctrl+F5
2. Atau disable cache di DevTools:
   - Buka DevTools (F12)
   - Klik Settings (⚙️)
   - Centang "Disable cache (while DevTools is open)"
   - Refresh halaman

---

## 📊 Monitoring

### Console Logs yang Normal:

```
🔍 [getStudentsForCurrentUser] User: Naufal Hudiya Role: guru
👨‍🏫 Guru - filtering by halaqah...
   Guru name (processed): naufal hudiya
   ✅ Match: Halaqah Naufal Hudiya | Guru: Naufal Hudiya
   Taught halaqahs: 1
   Halaqah names: ["Naufal Hudiya"]
   ✅ Filtered students: 10
```

### Console Logs Bermasalah:

**Tidak ada matching:**
```
🔍 [getStudentsForCurrentUser] User: Naufal Hudiya Role: guru
👨‍🏫 Guru - filtering by halaqah...
   Guru name (processed): naufal hudiya
   Taught halaqahs: 0  ← MASALAH!
   ⚠️ No halaqahs found for this guru
```

**Solusi:** Perbaiki nama guru di data halaqah

---

## 📝 Catatan Penting

1. **Fix ini permanent** - Tidak perlu jalankan script lagi setelah refresh
2. **Hanya untuk guru** - Admin tetap melihat semua santri
3. **Orang tua** tetap melihat semua santri (untuk ranking)
4. **Matching case-insensitive** - "Naufal" cocok dengan "naufal"
5. **Prefix diabaikan** - "Ustadz Naufal" cocok dengan "Naufal"

---

## 🎯 Dampak Perbaikan

### Sebelum Fix:
```
Guru login → Melihat 50 santri → Bingung
```

### Setelah Fix:
```
Guru login → Melihat 10 santri → Hanya dari halaqah yang diajar ✅
```

---

## 🎉 Kesimpulan

Filter guru sudah diperbaiki secara permanent di file `js/user-santri.js`. Setelah refresh halaman, guru hanya akan melihat santri dari halaqah yang diajar.

---

## 📚 File Terkait

- `js/user-santri.js` - File yang diperbaiki
- `js/ui.js` - File yang memanggil filter
- `FIX-GURU-FILTER.md` - Dokumentasi masalah awal
- `QUICK-FIX-GURU.md` - Quick guide
