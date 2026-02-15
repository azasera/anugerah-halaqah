# Solusi Reset Data Corrupt

## Masalah
- Poin negatif (-281) padahal belum ada aktivitas
- Tab "Hapus Data" kosong/tidak muncul
- Data corrupt karena auto-penalty yang berjalan berulang kali

## Solusi Langsung (Copy-Paste ke Console)

### Opsi 1: Reset Semua Poin ke 0 (Recommended)
```javascript
// Reset semua poin ke 0, data santri tetap ada
(function() {
    try {
        const data = localStorage.getItem('halaqahData');
        if (!data) {
            alert('❌ Tidak ada data di localStorage');
            return;
        }
        
        const parsed = JSON.parse(data);
        console.log('Data sebelum reset:', parsed);
        
        if (!parsed.students || parsed.students.length === 0) {
            alert('⚠️ Data students kosong atau corrupt');
            console.log('Struktur data:', parsed);
            return;
        }
        
        // Reset semua poin
        parsed.students.forEach(student => {
            student.total_points = 0;
            student.streak = 0;
            student.setoran = [];
            student.lastSetoranDate = '';
            if (student.total_hafalan) student.total_hafalan = 0;
        });
        
        // Recalculate rankings
        parsed.students.sort((a, b) => b.total_points - a.total_points);
        parsed.students.forEach((student, index) => {
            student.overall_ranking = index + 1;
            student.daily_ranking = index + 1;
        });
        
        // Update halaqah stats
        if (parsed.halaqahs) {
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
        console.log('Data setelah reset:', parsed);
        alert(`✅ Berhasil reset ${parsed.students.length} santri!\n\nSemua poin di-reset ke 0.\n\nReload halaman untuk melihat hasil.`);
        
        // Auto reload
        setTimeout(() => {
            window.location.reload();
        }, 2000);
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('❌ Error: ' + error.message);
    }
})();
```

### Opsi 2: Hapus Cache & Reload dari Supabase
```javascript
// Hapus cache lokal, reload dari server
(function() {
    if (confirm('Hapus cache lokal dan reload dari Supabase?')) {
        localStorage.removeItem('halaqahData');
        localStorage.removeItem('lastSync');
        localStorage.removeItem('userSantriRelationships');
        
        alert('✅ Cache dihapus! Reload halaman...');
        window.location.reload(true);
    }
})();
```

### Opsi 3: Hapus SEMUA Data (Hati-hati!)
```javascript
// HAPUS SEMUA DATA - TIDAK BISA DIKEMBALIKAN!
(function() {
    if (!confirm('⚠️ PERINGATAN!\n\nAnda akan menghapus SEMUA data.\nData TIDAK BISA dikembalikan!\n\nLanjutkan?')) {
        return;
    }
    
    const confirmation = prompt('Ketik "HAPUS" (huruf besar) untuk konfirmasi:');
    if (confirmation !== 'HAPUS') {
        alert('❌ Dibatalkan');
        return;
    }
    
    localStorage.removeItem('halaqahData');
    localStorage.removeItem('lastSync');
    localStorage.removeItem('userSantriRelationships');
    
    alert('✅ SEMUA data dihapus!\n\nReload halaman untuk mulai dari awal.');
    window.location.reload(true);
})();
```

## Cara Menggunakan

1. **Buka file `index.html` di browser**
2. **Buka Console** (tekan F12, pilih tab Console)
3. **Copy salah satu script di atas**
4. **Paste di Console dan tekan Enter**
5. **Ikuti instruksi yang muncul**
6. **Halaman akan reload otomatis**

## Penjelasan Opsi

### Opsi 1: Reset Poin ke 0 ✅ RECOMMENDED
- Data santri tetap ada (nama, NISN, halaqah, dll)
- Hanya poin, streak, dan setoran yang di-reset
- Ranking di-recalculate
- Paling aman untuk memperbaiki data corrupt

### Opsi 2: Hapus Cache
- Hapus data lokal
- Reload dari Supabase
- Bagus jika data di Supabase masih benar
- Jika data di Supabase juga corrupt, gunakan Opsi 1

### Opsi 3: Hapus Semua
- Hapus total semua data
- Mulai dari awal
- Hanya gunakan jika ingin reset total

## Troubleshooting

### Jika script tidak jalan:
1. Pastikan file `index.html` sudah dibuka di browser
2. Pastikan Console terbuka (F12)
3. Pastikan tidak ada error di Console sebelum run script
4. Coba reload halaman dulu, baru run script

### Jika data masih corrupt setelah reset:
1. Gunakan Opsi 3 (Hapus Semua)
2. Reload halaman
3. Import data baru dari Excel atau tambah manual

### Jika tab "Hapus Data" masih kosong:
- Tidak masalah, gunakan script console di atas
- Script console lebih reliable daripada UI
- Setelah reset, tab akan berfungsi normal

## Catatan Penting

⚠️ **Backup Data Dulu!**
Sebelum reset, export data ke Excel dulu jika perlu:
1. Buka menu Admin
2. Pilih tab "Import/Export"
3. Klik "Export Excel"

⚠️ **Auto-Penalty Sudah Dimatikan**
Auto-penalty system sudah dinonaktifkan, jadi masalah ini tidak akan terulang.

⚠️ **Sync ke Supabase**
Setelah reset lokal, data akan otomatis sync ke Supabase dalam beberapa detik.
