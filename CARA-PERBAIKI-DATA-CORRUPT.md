# 🔧 Cara Memperbaiki Data Corrupt

## Masalah yang Anda Alami

✅ **Sudah Diperbaiki:**
- Auto-penalty system yang berjalan berulang kali → SUDAH DIMATIKAN
- Modal yang bisa ditutup dengan klik luar → SUDAH DIPERBAIKI
- Error `getCurrentUser is not defined` → SUDAH DIPERBAIKI
- Error sync Supabase `total_hafalan` → SUDAH DIPERBAIKI

❌ **Masih Perlu Diperbaiki:**
- **Poin negatif (-281)** padahal belum ada aktivitas
- **Data corrupt** karena auto-penalty yang sudah berjalan sebelumnya
- **Tab "Hapus Data" kosong** (tapi ini tidak masalah, ada solusi lain)

---

## 🎯 Solusi Tercepat (3 Langkah)

### Langkah 1: Buka File Diagnosa
1. Buka file `diagnose-data.html` di browser
2. Lihat hasil diagnosa otomatis
3. Catat masalah yang ditemukan

### Langkah 2: Pilih Solusi
Berdasarkan hasil diagnosa, pilih salah satu:

**A. Jika data students ada tapi poin negatif:**
→ Gunakan **Script Reset Poin** (lihat di bawah)

**B. Jika data students kosong/null:**
→ Gunakan **Script Hapus Cache** (lihat di bawah)

**C. Jika ingin mulai dari awal:**
→ Gunakan **Script Hapus Semua** (lihat di bawah)

### Langkah 3: Jalankan Script
1. Buka `index.html` di browser
2. Tekan **F12** untuk buka Console
3. Copy-paste script yang dipilih
4. Tekan **Enter**
5. Ikuti instruksi
6. Halaman akan reload otomatis

---

## 📋 Script Solusi

### Script A: Reset Poin ke 0 ⭐ RECOMMENDED

**Kapan digunakan:** Data santri ada, tapi poin negatif atau tidak wajar

**Apa yang terjadi:**
- Data santri tetap ada (nama, NISN, halaqah, kelas, dll)
- Poin, streak, dan setoran di-reset ke 0
- Ranking di-recalculate
- Data sync ke Supabase

**Script:**
```javascript
(function() {
    try {
        const data = localStorage.getItem('halaqahData');
        if (!data) {
            alert('❌ Tidak ada data di localStorage');
            return;
        }
        
        const parsed = JSON.parse(data);
        console.log('📊 Data sebelum reset:', parsed);
        
        if (!parsed.students || parsed.students.length === 0) {
            alert('⚠️ Data students kosong atau corrupt\n\nGunakan Script B (Hapus Cache) sebagai gantinya.');
            console.log('Struktur data:', parsed);
            return;
        }
        
        console.log(`🔄 Mereset ${parsed.students.length} santri...`);
        
        // Reset semua poin
        parsed.students.forEach(student => {
            student.total_points = 0;
            student.streak = 0;
            student.setoran = [];
            student.lastSetoranDate = '';
            if (student.total_hafalan !== undefined) student.total_hafalan = 0;
        });
        
        // Recalculate rankings
        parsed.students.sort((a, b) => b.total_points - a.total_points);
        parsed.students.forEach((student, index) => {
            student.overall_ranking = index + 1;
            student.daily_ranking = index + 1;
        });
        
        // Update halaqah stats
        if (parsed.halaqahs && Array.isArray(parsed.halaqahs)) {
            parsed.halaqahs.forEach(halaqah => {
                const halaqahName = halaqah.name.replace('Halaqah ', '');
                const members = parsed.students.filter(s => s.halaqah === halaqahName);
                halaqah.members = members.length;
                halaqah.points = 0;
                halaqah.avgPoints = 0;
            });
            
            parsed.halaqahs.sort((a, b) => b.points - a.points);
            parsed.halaqahs.forEach((halaqah, index) => {
                halaqah.rank = index + 1;
            });
        }
        
        // Update stats
        if (parsed.stats) {
            parsed.stats.totalPoints = 0;
            parsed.stats.avgPointsPerStudent = 0;
        }
        
        // Save back to localStorage
        localStorage.setItem('halaqahData', JSON.stringify(parsed));
        
        console.log('✅ Data berhasil di-reset!');
        console.log('📊 Data setelah reset:', parsed);
        
        alert(`✅ BERHASIL!\n\nReset ${parsed.students.length} santri\nSemua poin di-reset ke 0\n\nHalaman akan reload dalam 2 detik...`);
        
        // Auto reload
        setTimeout(() => {
            window.location.reload();
        }, 2000);
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('❌ Error: ' + error.message + '\n\nLihat Console untuk detail.');
    }
})();
```

---

### Script B: Hapus Cache & Reload

**Kapan digunakan:** Data students kosong, atau ingin reload dari Supabase

**Apa yang terjadi:**
- Hapus semua cache lokal
- Reload halaman
- Data akan dimuat ulang dari Supabase
- Jika data di Supabase juga corrupt, gunakan Script A setelah reload

**Script:**
```javascript
(function() {
    if (confirm('🗑️ Hapus cache lokal dan reload dari Supabase?\n\nData lokal akan dihapus, tapi data di Supabase tetap aman.')) {
        console.log('🗑️ Menghapus cache...');
        
        localStorage.removeItem('halaqahData');
        localStorage.removeItem('lastSync');
        localStorage.removeItem('userSantriRelationships');
        
        console.log('✅ Cache dihapus!');
        alert('✅ Cache dihapus!\n\nHalaman akan reload...');
        
        setTimeout(() => {
            window.location.reload(true);
        }, 1000);
    }
})();
```

---

### Script C: Hapus SEMUA Data ⚠️ HATI-HATI!

**Kapan digunakan:** Ingin mulai dari awal, reset total

**Apa yang terjadi:**
- Hapus SEMUA data lokal
- Data di Supabase juga akan terhapus saat sync
- Tidak bisa dikembalikan!
- Harus input data dari awal

**Script:**
```javascript
(function() {
    if (!confirm('⚠️ PERINGATAN KERAS!\n\nAnda akan menghapus SEMUA data santri dan halaqah.\nData TIDAK BISA dikembalikan!\n\nYakin 100%?')) {
        return;
    }
    
    const confirmation = prompt('Ketik "HAPUS SEMUA" (tanpa tanda kutip) untuk konfirmasi:');
    if (confirmation !== 'HAPUS SEMUA') {
        alert('❌ Dibatalkan');
        return;
    }
    
    console.log('🗑️ Menghapus SEMUA data...');
    
    localStorage.removeItem('halaqahData');
    localStorage.removeItem('lastSync');
    localStorage.removeItem('userSantriRelationships');
    
    console.log('✅ SEMUA data dihapus!');
    alert('✅ SEMUA data dihapus!\n\nHalaman akan reload...');
    
    setTimeout(() => {
        window.location.reload(true);
    }, 1000);
})();
```

---

## 🎓 Cara Menggunakan Script

### Metode 1: Via Console (Recommended)

1. **Buka `index.html`** di browser (Chrome/Edge/Firefox)

2. **Buka Developer Console:**
   - Tekan **F12**, atau
   - Klik kanan → Inspect → Tab "Console"

3. **Copy script** yang sesuai dari atas

4. **Paste di Console:**
   - Klik di area Console
   - Tekan **Ctrl+V** (atau klik kanan → Paste)

5. **Tekan Enter**

6. **Ikuti instruksi** yang muncul

7. **Tunggu reload otomatis**

### Metode 2: Via File HTML

1. Buka `reset-manual.html` di browser
2. Klik tombol yang sesuai
3. Ikuti instruksi
4. Buka `index.html` untuk melihat hasil

---

## 🔍 Troubleshooting

### ❓ Script tidak jalan / tidak ada respon

**Solusi:**
1. Pastikan Console terbuka (F12)
2. Lihat apakah ada error merah di Console
3. Reload halaman dulu, baru jalankan script
4. Pastikan copy script lengkap (dari `(function()` sampai `})();`)

### ❓ Muncul error "Unexpected token"

**Solusi:**
- Script tidak ter-copy lengkap
- Copy ulang dari awal sampai akhir
- Pastikan tidak ada karakter tambahan

### ❓ Data masih negatif setelah reset

**Solusi:**
1. Cek apakah script berhasil (lihat Console)
2. Coba reload halaman manual (F5)
3. Cek localStorage: `localStorage.getItem('halaqahData')`
4. Jika masih negatif, jalankan Script A lagi

### ❓ Tab "Hapus Data" masih kosong

**Solusi:**
- Tidak masalah! Gunakan script Console di atas
- Script Console lebih reliable
- Setelah reset, tab akan berfungsi normal

### ❓ Data hilang setelah reload

**Solusi:**
- Kemungkinan data di Supabase juga kosong
- Login sebagai admin
- Import data dari Excel, atau
- Tambah data manual

---

## 📊 Verifikasi Hasil

Setelah reset, cek:

1. **Total Poin:** Harus 0 atau positif
2. **Jumlah Santri:** Harus sesuai (29 santri)
3. **Ranking:** Harus urut dari 1
4. **Console:** Tidak ada error merah

Cara cek di Console:
```javascript
// Cek data
const data = JSON.parse(localStorage.getItem('halaqahData'));
console.log('Total Santri:', data.students.length);
console.log('Total Poin:', data.students.reduce((sum, s) => sum + s.total_points, 0));
console.log('Poin Negatif:', data.students.filter(s => s.total_points < 0).length);
```

---

## 💾 Backup Data (Opsional)

Sebelum reset, backup data dulu:

### Via Console:
```javascript
// Backup ke file
const data = localStorage.getItem('halaqahData');
const blob = new Blob([data], {type: 'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'backup-' + new Date().toISOString().split('T')[0] + '.json';
a.click();
```

### Via UI:
1. Buka menu Admin
2. Tab "Import/Export"
3. Klik "Export Excel"

---

## ✅ Checklist Setelah Reset

- [ ] Poin semua santri = 0 atau positif
- [ ] Jumlah santri sesuai
- [ ] Tidak ada error di Console
- [ ] Data sync ke Supabase (tunggu 5-10 detik)
- [ ] Tab "Hapus Data" berfungsi
- [ ] Auto-penalty masih mati (tidak jalan otomatis)

---

## 📞 Jika Masih Bermasalah

Jika semua script di atas tidak berhasil:

1. **Screenshot error** di Console
2. **Jalankan diagnosa:**
   ```javascript
   const data = JSON.parse(localStorage.getItem('halaqahData'));
   console.log('Struktur:', Object.keys(data));
   console.log('Students:', data.students ? data.students.length : 'null');
   console.log('Sample:', data.students ? data.students[0] : 'null');
   ```
3. **Copy hasil** dari Console
4. **Kirim ke developer** untuk analisa lebih lanjut

---

## 🎉 Selesai!

Setelah reset berhasil:
- Data sudah bersih
- Poin sudah normal
- Siap digunakan untuk tracking setoran
- Auto-penalty sudah mati (aman!)

**Selamat menggunakan aplikasi! 🚀**
