# 🔍 Cara Cek Filter Guru

## 📋 Langkah-Langkah

### Step 1: Login sebagai Guru
```
1. Buka dashboard.html
2. Login dengan akun guru
3. Pastikan sudah masuk ke dashboard
```

### Step 2: Buka Console
```
1. Tekan F12 (atau Ctrl+Shift+I)
2. Klik tab "Console"
3. Console akan terbuka di bawah atau samping
```

### Step 3: Load Script Check
```
1. Copy script ini:
```

```javascript
(function checkGuruFilter() {
    console.clear();
    console.log('%c=== GURU FILTER CHECK ===', 'color: blue; font-size: 16px; font-weight: bold');
    console.log('');
    
    // 1. Cek user info
    console.log('%c1. USER INFO:', 'color: green; font-weight: bold');
    console.log('   Name:', currentProfile?.full_name || currentProfile?.name || 'N/A');
    console.log('   Role:', currentProfile?.role || 'N/A');
    console.log('');
    
    // 2. Cek halaqah yang diajar
    console.log('%c2. HALAQAH YANG DIAJAR:', 'color: green; font-weight: bold');
    const guruName = (currentProfile?.full_name || currentProfile?.name || '')
        .toLowerCase()
        .replace(/^(ustadz|ust|u\.)\s*/i, '')
        .trim();
    console.log('   Processed name:', guruName);
    
    const taughtHalaqahs = dashboardData.halaqahs.filter(h => {
        const hGuru = (h.guru || '').toLowerCase().replace(/^(ustadz|ust|u\.)\s*/i, '').trim();
        return hGuru === guruName || hGuru.includes(guruName) || guruName.includes(hGuru);
    });
    
    console.log('   Halaqah yang cocok:', taughtHalaqahs.length);
    taughtHalaqahs.forEach(h => {
        console.log('   -', h.name, '| Guru:', h.guru);
    });
    console.log('');
    
    // 3. Cek santri yang seharusnya terlihat
    console.log('%c3. SANTRI YANG SEHARUSNYA TERLIHAT:', 'color: green; font-weight: bold');
    const halaqahNames = taughtHalaqahs.map(h => h.name.replace(/^Halaqah\s+/i, '').trim());
    const expectedStudents = dashboardData.students.filter(s => 
        halaqahNames.includes(s.halaqah)
    );
    console.log('   Jumlah:', expectedStudents.length);
    console.log('');
    
    // 4. Cek santri yang benar-benar terlihat
    console.log('%c4. SANTRI YANG BENAR-BENAR TERLIHAT:', 'color: green; font-weight: bold');
    const actualStudents = getStudentsForCurrentUser();
    console.log('   Jumlah:', actualStudents.length);
    console.log('');
    
    // 5. Kesimpulan
    console.log('%c5. KESIMPULAN:', 'color: green; font-weight: bold');
    if (expectedStudents.length === actualStudents.length) {
        console.log('%c   ✅ FILTER BEKERJA DENGAN BAIK', 'color: green; font-weight: bold');
    } else {
        console.log('%c   ❌ FILTER TIDAK BEKERJA', 'color: red; font-weight: bold');
        console.log('   Expected:', expectedStudents.length);
        console.log('   Actual:', actualStudents.length);
        console.log('   Difference:', Math.abs(expectedStudents.length - actualStudents.length));
    }
    console.log('');
    
    // 6. Detail santri
    console.log('%c6. DETAIL SANTRI (10 pertama):', 'color: green; font-weight: bold');
    actualStudents.slice(0, 10).forEach((s, i) => {
        console.log(`   ${i+1}. ${s.name} - Halaqah ${s.halaqah}`);
    });
    if (actualStudents.length > 10) {
        console.log(`   ... dan ${actualStudents.length - 10} santri lainnya`);
    }
    console.log('');
    
    // 7. Tabel
    console.log('%c7. TABEL PERBANDINGAN:', 'color: green; font-weight: bold');
    console.table({
        'Expected Students': expectedStudents.length,
        'Actual Students': actualStudents.length,
        'Difference': Math.abs(expectedStudents.length - actualStudents.length),
        'Filter Status': expectedStudents.length === actualStudents.length ? '✅ OK' : '❌ ERROR'
    });
    
    return {
        guruName,
        taughtHalaqahs,
        expectedStudents,
        actualStudents,
        filterWorking: expectedStudents.length === actualStudents.length
    };
})();
```

```
2. Paste di console
3. Tekan Enter
```

### Step 4: Lihat Hasil

Anda akan melihat output seperti ini:

**Jika Filter Bekerja:**
```
=== GURU FILTER CHECK ===

1. USER INFO:
   Name: Naufal Hudiya
   Role: guru

2. HALAQAH YANG DIAJAR:
   Processed name: naufal hudiya
   Halaqah yang cocok: 1
   - Halaqah Naufal Hudiya | Guru: Naufal Hudiya

3. SANTRI YANG SEHARUSNYA TERLIHAT:
   Jumlah: 10

4. SANTRI YANG BENAR-BENAR TERLIHAT:
   Jumlah: 10

5. KESIMPULAN:
   ✅ FILTER BEKERJA DENGAN BAIK

6. DETAIL SANTRI (10 pertama):
   1. Budi - Halaqah Naufal Hudiya
   2. Siti - Halaqah Naufal Hudiya
   ...

7. TABEL PERBANDINGAN:
┌─────────────────────┬────────┐
│ Expected Students   │ 10     │
│ Actual Students     │ 10     │
│ Difference          │ 0      │
│ Filter Status       │ ✅ OK  │
└─────────────────────┴────────┘
```

**Jika Filter TIDAK Bekerja:**
```
=== GURU FILTER CHECK ===

1. USER INFO:
   Name: Naufal Hudiya
   Role: guru

2. HALAQAH YANG DIAJAR:
   Processed name: naufal hudiya
   Halaqah yang cocok: 1
   - Halaqah Naufal Hudiya | Guru: Naufal Hudiya

3. SANTRI YANG SEHARUSNYA TERLIHAT:
   Jumlah: 10

4. SANTRI YANG BENAR-BENAR TERLIHAT:
   Jumlah: 50  ← MASALAH!

5. KESIMPULAN:
   ❌ FILTER TIDAK BEKERJA
   Expected: 10
   Actual: 50
   Difference: 40

6. DETAIL SANTRI (10 pertama):
   1. Budi - Halaqah Naufal Hudiya
   2. Siti - Halaqah Alim Aswari  ← Seharusnya tidak terlihat!
   3. Ahmad - Halaqah Harziki     ← Seharusnya tidak terlihat!
   ...
```

---

## 🔧 Jika Filter Tidak Bekerja

### Fix 1: Cek Nama Guru di Halaqah

```javascript
// Lihat semua halaqah dan guru
console.table(dashboardData.halaqahs.map(h => ({
    'Nama Halaqah': h.name,
    'Guru': h.guru
})));
```

**Pastikan:**
- Nama guru di halaqah cocok dengan nama di profile
- Tidak ada typo
- Format konsisten

### Fix 2: Force Refresh Filter

```javascript
// Force refresh dengan filter
if (typeof renderSantri === 'function') {
    renderSantri();
    console.log('✅ Filter refreshed');
}
```

### Fix 3: Cek Apakah Filter Dijalankan

```javascript
// Cek log filter di console
// Seharusnya ada log:
// 🔍 Filtering by user-santri relationships (guru only)...
// User students: X
// After user-santri filter: X
```

Jika tidak ada log tersebut, berarti filter tidak dijalankan.

---

## 📸 Screenshot Hasil

Setelah menjalankan script, **screenshot hasil di console** dan kirim ke saya untuk analisis lebih lanjut.

Yang penting di-screenshot:
1. Section "1. USER INFO"
2. Section "2. HALAQAH YANG DIAJAR"
3. Section "5. KESIMPULAN"
4. Section "7. TABEL PERBANDINGAN"

---

## 📞 Bantuan

Jika masih bingung atau butuh bantuan:
1. Screenshot hasil check
2. Screenshot daftar santri yang terlihat di dashboard
3. Kirim ke saya untuk analisis

---

## 📝 Catatan

- Script ini **tidak mengubah data**, hanya mengecek
- Aman untuk dijalankan kapan saja
- Bisa dijalankan berulang kali
- Hasil akan di-clear setiap kali dijalankan
