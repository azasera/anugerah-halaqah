# ⚡ Quick Fix: Nama Halaqah Berbeda

## 🎯 Fix Cepat (1 Menit)

### 1️⃣ Buka Console
```
Tekan: F12
Tab: Console
```

### 2️⃣ Copy-Paste Script Ini
```javascript
async function quickFix() {
    StorageManager.save();
    await syncHalaqahsToSupabase();
    await syncStudentsToSupabase();
    await new Promise(r => setTimeout(r, 3000));
    await loadHalaqahsFromSupabase();
    await loadStudentsFromSupabase();
    refreshAllData();
    console.log('✅ Done! Refresh halaman (F5)');
}
quickFix();
```

### 3️⃣ Tunggu & Refresh
```
Tunggu: Hingga muncul "✅ Done!"
Tekan: F5 (refresh)
```

---

## ✅ Hasil yang Diharapkan

| Sebelum | Sesudah |
|---------|---------|
| Nama tidak berubah | ✅ Nama berubah |
| Santri hilang | ✅ Santri tetap ada |
| Data tidak sinkron | ✅ Data sinkron |

---

## ❌ Jika Masih Bermasalah

### Cek Data:
```javascript
// Lihat nama halaqah
console.log(dashboardData.halaqahs.map(h => h.name));
```

### Force Sync Lagi:
```javascript
// Sync manual
await syncHalaqahsToSupabase();
await syncStudentsToSupabase();
```

### Update Manual:
```javascript
// Ganti nama halaqah di santri
const oldName = "Nama Lama";
const newName = "Nama Baru";

dashboardData.students.forEach(s => {
    if (s.halaqah === oldName) {
        s.halaqah = newName;
    }
});

StorageManager.save();
syncStudentsToSupabase();
```

---

## 📞 Bantuan

Lihat: `FIX-NAMA-HALAQAH-BEDA.md` untuk panduan lengkap
