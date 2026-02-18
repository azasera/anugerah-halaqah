# 🔍 Cara Debug Ziyadah - Step by Step

## ⚠️ PENTING: Hard Refresh Browser

Sebelum testing, pastikan file JavaScript sudah ter-reload:

1. **Tekan Ctrl + Shift + Delete** (atau Cmd + Shift + Delete di Mac)
2. Pilih "Cached images and files"
3. Klik "Clear data"
4. **ATAU** tekan **Ctrl + F5** untuk hard refresh

## 📋 Langkah Testing:

### 1. Buka Console Browser
- Tekan **F12**
- Klik tab **Console**
- Klik icon 🗑️ (Clear console) untuk membersihkan log lama

### 2. Buka Mutaba'ah
- Klik menu "📖 Mutaba'ah Quran"
- Pilih santri "Jingga"

### 3. Cek Data Awal
Jalankan command ini di Console:

```javascript
const jingga = dashboardData.students.find(s => s.name.includes('Jingga'));
console.log('=== DATA AWAL ===');
console.log('Nama:', jingga.name);
console.log('Setoran array:', jingga.setoran);
console.log('Jumlah setoran:', jingga.setoran ? jingga.setoran.length : 0);
```

### 4. Input Setoran
- Klik tombol "➕ Ziyadah"
- Isi form:
  - **Jumlah Baris**: 15
  - **Kelancaran**: Lancar
  - **Kesalahan**: 0
- **JANGAN KLIK SIMPAN DULU!**

### 5. Cek Form Data
Jalankan command ini di Console (saat form masih terbuka):

```javascript
const barisInput = document.getElementById('quick-baris');
console.log('=== CEK FORM ===');
console.log('Field baris ditemukan?', barisInput !== null);
console.log('Nilai baris:', barisInput ? barisInput.value : 'TIDAK ADA');
```

### 6. Klik Simpan
- Klik tombol "💾 Simpan"
- **Perhatikan Console!** Seharusnya muncul log:

```
[DEBUG] Saving setoran - baris: 15 halaman: 1
[DEBUG] Setoran saved: {id: "set_...", date: "...", baris: 15, ...}
[DEBUG] Total setoran for student: 1
[DEBUG Ziyadah] Student: Jingga
[DEBUG Ziyadah] Today: ...
[DEBUG Ziyadah] Today baris count: 15
```

### 7. Cek Data Setelah Simpan
Jalankan command ini di Console:

```javascript
const jingga = dashboardData.students.find(s => s.name.includes('Jingga'));
console.log('=== DATA SETELAH SIMPAN ===');
console.log('Jumlah setoran:', jingga.setoran ? jingga.setoran.length : 0);
console.log('Data setoran:', jingga.setoran);

// Hitung manual
const today = new Date().toDateString();
const todaySetoran = (jingga.setoran || []).filter(s => 
    new Date(s.date).toDateString() === today
);
console.log('Setoran hari ini:', todaySetoran);
console.log('Total baris hari ini:', todaySetoran.reduce((sum, s) => sum + (s.baris || 0), 0));
```

## ❓ Jika Tidak Ada Log Debug:

### Kemungkinan 1: File Belum Ter-reload
**Solusi:**
1. Tutup semua tab dashboard
2. Clear cache browser (Ctrl + Shift + Delete)
3. Buka dashboard lagi
4. Cek versi file di Console:

```javascript
// Cek apakah fungsi sudah ter-update
console.log(handleQuickSetoranDetail.toString().includes('[DEBUG]'));
// Seharusnya return: true
```

### Kemungkinan 2: Field `baris` Tidak Ada
**Cek:**
```javascript
const barisInput = document.getElementById('quick-baris');
console.log('Field baris:', barisInput);
```

Jika `null`, berarti form yang dibuka bukan form yang benar.

### Kemungkinan 3: Fungsi Lain yang Dipanggil
**Cek:**
```javascript
// Lihat semua event listener di tombol Simpan
const form = document.querySelector('form');
console.log('Form action:', form ? form.onsubmit : 'TIDAK ADA');
```

## 🆘 Jika Masih Gagal:

Kirim screenshot dari:
1. Console log setelah klik Simpan
2. Hasil dari command cek data awal
3. Hasil dari command cek form data
4. Hasil dari command cek data setelah simpan

Atau copy-paste semua output Console ke sini.
