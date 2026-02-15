# 🚀 Solusi Cepat - Perbaiki Data Corrupt

## 🎯 Masalah Anda
- Poin negatif (-281) padahal belum ada aktivitas
- Tab "Hapus Data" kosong/tidak muncul
- Data corrupt karena auto-penalty

## ✅ Solusi Tercepat (Copy-Paste ke Console)

### 1️⃣ Buka Console
- Buka `index.html` di browser
- Tekan **F12**
- Pilih tab **Console**

### 2️⃣ Copy Script Ini

```javascript
(function() {
    try {
        const data = localStorage.getItem('halaqahData');
        if (!data) {
            alert('❌ Tidak ada data');
            return;
        }
        
        const parsed = JSON.parse(data);
        
        if (!parsed.students || parsed.students.length === 0) {
            alert('⚠️ Data kosong. Gunakan: localStorage.clear(); lalu reload');
            return;
        }
        
        // Reset semua poin ke 0
        parsed.students.forEach(s => {
            s.total_points = 0;
            s.streak = 0;
            s.setoran = [];
            s.lastSetoranDate = '';
        });
        
        // Recalculate
        parsed.students.sort((a, b) => b.total_points - a.total_points);
        parsed.students.forEach((s, i) => {
            s.overall_ranking = i + 1;
            s.daily_ranking = i + 1;
        });
        
        if (parsed.halaqahs) {
            parsed.halaqahs.forEach(h => {
                h.points = 0;
                h.avgPoints = 0;
            });
        }
        
        if (parsed.stats) {
            parsed.stats.totalPoints = 0;
            parsed.stats.avgPointsPerStudent = 0;
        }
        
        localStorage.setItem('halaqahData', JSON.stringify(parsed));
        
        alert(`✅ Reset ${parsed.students.length} santri!\n\nReload dalam 2 detik...`);
        
        setTimeout(() => window.location.reload(), 2000);
        
    } catch (error) {
        alert('❌ Error: ' + error.message);
    }
})();
```

### 3️⃣ Paste & Enter
- Paste script di Console
- Tekan **Enter**
- Tunggu reload otomatis

## 📁 File Bantuan

1. **diagnose-data.html** → Cek kondisi data
2. **reset-manual.html** → Reset via UI
3. **CARA-PERBAIKI-DATA-CORRUPT.md** → Panduan lengkap
4. **SOLUSI-RESET-DATA.md** → Semua script solusi

## 🆘 Jika Gagal

Gunakan script ini untuk hapus semua dan mulai dari awal:

```javascript
localStorage.clear();
alert('✅ Semua data dihapus! Reload...');
location.reload();
```

## ✅ Hasil yang Diharapkan

Setelah reset:
- Total Poin: 0
- Semua santri: Poin 0
- Tidak ada poin negatif
- Ranking: 1, 2, 3, dst (semua sama karena poin 0)

## 🎉 Selesai!

Data sudah bersih dan siap digunakan!
