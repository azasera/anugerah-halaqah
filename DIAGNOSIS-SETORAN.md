# 🔍 Diagnosis: Data Tidak Bertambah Saat Setoran Baru

## Tanggal: 2026-02-17

## Masalah yang Ditemukan

### 1. ⚠️ KONFLIK ANTARA DUA SISTEM SETORAN

Ada **DUA sistem setoran** yang berbeda yang berjalan bersamaan:

#### A. Sistem Lama (`js/setoran.js`)
- Menyimpan data setoran di field `student.setoran[]` (array)
- Menghitung poin langsung di `handleSetoran()`
- Update `total_points` dan `total_hafalan` langsung
- Simpan ke localStorage dan sync ke Supabase

#### B. Sistem Baru (`js/setoran-integration.js` + `js/setoran-harian.js`)
- Menggunakan tabel `setoran_harian` di Supabase
- Form baru dengan checkbox (Tepat Waktu, Lancar, Capai Target)
- Fungsi `showSetoranFormV2()` dan `submitSetoranV2()`
- Menghitung poin dengan logika berbeda

**MASALAH:** Kedua sistem ini bisa saling bertabrakan!

---

### 2. 🔄 MASALAH SINKRONISASI DATA

#### A. Race Condition di `loadStudentsFromSupabase()`
```javascript
// Line 218-322 di supabase.js
async function loadStudentsFromSupabase() {
    // ... load data dari Supabase
    dashboardData.students = data.map(s => {
        // ... mapping data
        total_hafalan: parseFloat(s.total_hafalan) || 0
    });
}
```

**MASALAH:** 
- Jika data di-load dari Supabase SETELAH setoran disimpan ke localStorage
- Data lokal akan **DITIMPA** dengan data lama dari Supabase
- Ini menyebabkan data setoran baru "hilang"

#### B. Sync Delay
```javascript
// Line 51-180 di supabase.js
async function syncStudentsToSupabase() {
    // ... ada delay 500ms antar chunk
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // ... ada delay 2000ms sebelum clear flag
    setTimeout(() => {
        window.syncInProgress = false;
    }, 2000);
}
```

**MASALAH:**
- Delay ini bisa menyebabkan data belum tersimpan saat user refresh
- Flag `syncInProgress` mencegah sync berulang, tapi bisa block sync yang valid

---

### 3. 📊 MASALAH PERHITUNGAN POIN

#### A. Logika Poin Berbeda di Dua Sistem

**Sistem Lama (setoran.js):**
```javascript
// Line 155-175
if (isOnTime) {
    if (isLancar && targetsMet) {
        poin = poinRules.tepatWaktuLancarTarget; // +2
    } else if (isTidakLancar && targetsMet) {
        poin = poinRules.tepatWaktuTidakLancarTarget; // +1
    } else if (isLancar && !targetsMet) {
        poin = poinRules.tepatWaktuLancarTidakTarget; // 0
    }
} else {
    poin = poinRules.tidakTepatWaktu; // 0
}
```

**Sistem Baru (setoran-integration.js):**
```javascript
// Line 234-260
if (tepatWaktu && lancar && capaiTarget) {
    poin = 2;
} else if (tepatWaktu && !lancar && capaiTarget) {
    poin = 1;
} else if (tepatWaktu && lancar && !capaiTarget) {
    poin = 0;
} else if (!tepatWaktu && lancar && capaiTarget) {
    poin = 0;
} else {
    poin = 0;
}
```

**MASALAH:** Logika berbeda bisa menghasilkan poin yang tidak konsisten!

---

### 4. 🔴 MASALAH AUTO-PENALTY

```javascript
// Line 1-3 di auto-poin.js
function initAutoPenaltyCheck() {
    // COMPLETELY DISABLED: Auto-penalty check to prevent duplicate penalties
    console.log('🛑 Auto-penalty check is PERMANENTLY DISABLED.');
}
```

**MASALAH:** Auto-penalty dimatikan, tapi fungsi `applyNoSetoranPenalty()` masih ada dan bisa dipanggil manual.

---

### 5. 🗄️ MASALAH REALTIME SUBSCRIPTION

```javascript
// Line 533-630 di supabase.js
function setupRealtimeSubscriptions() {
    // ... subscribe ke perubahan students
    .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, payload => {
        // ... reload data
        loadStudentsFromSupabase().then(() => {
            if (typeof refreshAllData === 'function') refreshAllData();
        });
    })
}
```

**MASALAH:**
- Setiap perubahan di Supabase trigger reload SEMUA data
- Ini bisa overwrite data lokal yang belum tersync
- Bisa menyebabkan "data hilang" jika timing tidak tepat

---

## 🎯 Rekomendasi Perbaikan

### PRIORITAS TINGGI:

1. **Pilih SATU sistem setoran** - Hapus atau disable salah satu
   - Jika pakai sistem baru: Redirect semua call ke `showSetoranFormV2()`
   - Jika pakai sistem lama: Hapus file `setoran-integration.js` dan `setoran-harian.js`

2. **Fix Race Condition:**
   - Tambah flag `isLoadingFromSupabase` untuk prevent overwrite
   - Jangan load dari Supabase jika ada perubahan lokal yang belum tersync

3. **Perbaiki Sync Flow:**
   ```javascript
   // Urutan yang benar:
   1. Simpan ke localStorage (instant)
   2. Update UI (instant)
   3. Sync ke Supabase (background)
   4. Jangan reload dari Supabase setelah sync sendiri
   ```

4. **Disable Realtime untuk User Sendiri:**
   - Jangan reload data jika perubahan berasal dari user yang sama
   - Hanya reload jika perubahan dari user lain

### PRIORITAS SEDANG:

5. **Unifikasi Logika Poin:**
   - Buat satu fungsi `calculatePoin()` yang dipakai semua sistem
   - Pastikan rules konsisten

6. **Tambah Logging:**
   - Log setiap kali data disimpan
   - Log setiap kali data di-load
   - Ini akan membantu debug masalah timing

### PRIORITAS RENDAH:

7. **Optimasi Sync:**
   - Kurangi delay antar chunk
   - Gunakan batch update yang lebih efisien

8. **Cleanup Auto-Penalty:**
   - Hapus kode yang tidak dipakai
   - Atau implement dengan benar jika masih diperlukan

---

## 🧪 Cara Test

1. Buka browser console (F12)
2. Input setoran baru
3. Perhatikan log:
   - Apakah data tersimpan ke localStorage?
   - Apakah sync ke Supabase berhasil?
   - Apakah ada reload dari Supabase yang overwrite data?
4. Refresh halaman
5. Cek apakah data masih ada

---

## 📝 Catatan Tambahan

- File `debug-hafalan.html` sudah ada untuk debug masalah ini
- Gunakan tool tersebut untuk compare data localStorage vs Supabase
- Pastikan user yang input setoran punya role `guru` atau `admin`

