# 🔍 Debug Steps - Ziyadah Counter Issue

## Perbaikan yang Sudah Dilakukan:

### 1. ✅ js/modal.js - handleQuickSetoranDetail()
- Menambahkan penyimpanan data `baris` ke `student.setoran[]`
- Menambahkan console.log untuk tracking
- Menambahkan explicit refresh `renderMutabaahDashboard()`

### 2. ✅ js/data.js - refreshAllData()
- Menambahkan `renderMutabaahDashboard()` ke refresh cycle

### 3. ✅ js/tilawah.js - renderMutabaahDashboard()
- Menambahkan console.log untuk tracking perhitungan Ziyadah

## 🧪 Langkah Testing:

### Step 1: Buka Dashboard
1. Refresh halaman `dashboard.html` (Ctrl+F5 untuk hard refresh)
2. Login sebagai Guru/Admin
3. Buka Console Browser (F12 → Console tab)

### Step 2: Buka Mutaba'ah
1. Klik menu "📖 Mutaba'ah Quran"
2. Pilih santri "Jingga" (atau santri lain)
3. Perhatikan angka "Ziyadah" di header (seharusnya 0 baris jika belum ada setoran hari ini)

### Step 3: Input Setoran
1. Klik tombol "➕ Ziyadah"
2. Isi form:
   - **Jumlah Baris**: 15
   - **Kelancaran**: Lancar
   - **Kesalahan**: 0
3. Klik "💾 Simpan"

### Step 4: Cek Console Log
Setelah klik Simpan, di Console seharusnya muncul:

```
[DEBUG] Saving setoran - baris: 15 halaman: 1
[DEBUG] Setoran saved: {id: "set_...", date: "2024-...", baris: 15, ...}
[DEBUG] Total setoran for student: 1
[DEBUG Ziyadah] Student: Jingga
[DEBUG Ziyadah] Today: Wed Feb 18 2026
[DEBUG Ziyadah] Total setoran: 1
[DEBUG Ziyadah] Today setoran: 1
[DEBUG Ziyadah] Today baris count: 15
```

### Step 5: Verifikasi Tampilan
- Angka "Ziyadah" di header seharusnya berubah menjadi **"15 baris"**
- Status berubah dari "⌛ Belum Setoran" menjadi "✅ Sudah Setoran"

### Step 6: Test Increment
1. Klik lagi tombol "➕ Ziyadah"
2. Isi form dengan 10 baris
3. Klik "💾 Simpan"
4. Angka "Ziyadah" seharusnya berubah menjadi **"25 baris"**

## 🔍 Jika Masih Belum Berhasil:

### Debug Manual di Console:

```javascript
// 1. Cek data santri
const jingga = dashboardData.students.find(s => s.name.includes('Jingga'));
console.log('Santri:', jingga.name);
console.log('Setoran array:', jingga.setoran);

// 2. Cek setoran hari ini
const today = new Date().toDateString();
const todaySetoran = (jingga.setoran || []).filter(s => 
    new Date(s.date).toDateString() === today
);
console.log('Setoran hari ini:', todaySetoran);

// 3. Hitung total baris
const totalBaris = todaySetoran.reduce((sum, s) => sum + (s.baris || 0), 0);
console.log('Total baris hari ini:', totalBaris);

// 4. Manual refresh
renderMutabaahDashboard();
```

## ❓ Kemungkinan Masalah:

### A. Field `baris` tidak terisi
**Cek:** Apakah di console muncul `[DEBUG] Saving setoran - baris: 0`?
**Solusi:** Field input `quick-baris` mungkin tidak ada atau tidak terisi

### B. Data tidak tersimpan
**Cek:** Apakah `student.setoran` masih kosong setelah simpan?
**Solusi:** Cek apakah `StorageManager.save()` berjalan dengan benar

### C. Tanggal tidak match
**Cek:** Apakah format tanggal di `s.date` sama dengan `new Date().toDateString()`?
**Solusi:** Pastikan format tanggal konsisten

### D. Render tidak dipanggil
**Cek:** Apakah muncul log `[DEBUG Ziyadah]` setelah simpan?
**Solusi:** Pastikan `renderMutabaahDashboard()` dipanggil

## 📋 Checklist Verifikasi:

- [ ] Console log muncul saat simpan setoran
- [ ] Field `baris` terisi dengan benar (bukan 0)
- [ ] Data tersimpan ke `student.setoran[]`
- [ ] `renderMutabaahDashboard()` dipanggil setelah simpan
- [ ] Perhitungan Ziyadah berjalan (log muncul)
- [ ] Tampilan UI update dengan angka yang benar

## 🆘 Jika Semua Gagal:

Kirim screenshot dari:
1. Console log setelah klik Simpan
2. Hasil dari command: `console.log(dashboardData.students.find(s => s.name.includes('Jingga')).setoran)`
3. Tampilan UI Ziyadah yang tidak update
