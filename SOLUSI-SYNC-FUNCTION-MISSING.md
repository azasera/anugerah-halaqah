# 🔧 Solusi: syncStudentsToSupabase Function NOT Found

## 🎯 Masalah
Fungsi `syncStudentsToSupabase` tidak ditemukan di `window`, sehingga data tidak bisa disinkronkan ke Supabase.

## 🔍 Penyebab

### 1. File js/supabase.js Tidak Ter-load
- File tidak ada atau path salah
- Error 404 saat load file
- File corrupt atau tidak lengkap

### 2. JavaScript Error di supabase.js
- Ada syntax error yang mencegah eksekusi
- Error di baris sebelum export
- Dependency tidak ter-load (misalnya Supabase client library)

### 3. Export Tidak Dijalankan
- Kode export tidak tercapai karena error sebelumnya
- Conditional yang mencegah export

## ✅ Solusi Step-by-Step

### Langkah 1: Cek Apakah File Ter-load

1. **Buka Developer Tools** (F12)
2. **Klik tab "Network"**
3. **Refresh halaman** (F5)
4. **Cari file "supabase.js"** di list
5. **Cek status**:
   - ✅ Status 200 = File ter-load dengan baik
   - ❌ Status 404 = File tidak ditemukan
   - ❌ Status 500 = Server error

**Jika Status 404**:
- Cek apakah file `js/supabase.js` ada di folder
- Cek path di `dashboard.html` (seharusnya `<script src="js/supabase.js?v=6"></script>`)

### Langkah 2: Cek JavaScript Errors

1. **Klik tab "Console"** di Developer Tools
2. **Refresh halaman** (F5)
3. **Lihat apakah ada error** berwarna merah
4. **Perhatikan error dari file supabase.js**

**Contoh Error yang Mungkin Muncul**:
```
Uncaught ReferenceError: supabase is not defined
Uncaught SyntaxError: Unexpected token
Uncaught TypeError: Cannot read property 'from' of undefined
```

**Solusi**:
- Screenshot error dan dokumentasikan
- Cek baris yang error di file supabase.js
- Pastikan library Supabase ter-load sebelum supabase.js

### Langkah 3: Reload Script Manual

Jika file ada tapi function tidak ter-export, coba reload manual:

1. **Paste script ini di Console**:

```javascript
// Reload js/supabase.js
const script = document.createElement('script');
script.src = 'js/supabase.js?v=' + Date.now();
script.onload = function() {
    console.log('✅ Script reloaded');
    if (typeof window.syncStudentsToSupabase !== 'undefined') {
        console.log('✅ Function now available!');
    } else {
        console.log('❌ Still not available - check for errors');
    }
};
document.head.appendChild(script);
```

2. **Tunggu beberapa detik**
3. **Cek apakah function sudah tersedia**:

```javascript
typeof window.syncStudentsToSupabase
// Seharusnya return: "function"
```

### Langkah 4: Cek Urutan Loading Script

Pastikan script di-load dalam urutan yang benar di `dashboard.html`:

```html
<!-- Harus dalam urutan ini: -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/settings.js"></script>
<script src="js/data.js?v=6"></script>
<script src="js/supabase.js?v=6"></script>  <!-- Setelah settings.js -->
<script src="js/auth.js"></script>
```

**Jika urutan salah**:
- `supabase.js` harus setelah `settings.js` (butuh SUPABASE_URL)
- `supabase.js` harus setelah Supabase library dari CDN

### Langkah 5: Verifikasi Export di supabase.js

Buka file `js/supabase.js` dan cari baris ini di bagian akhir:

```javascript
// Export functions
window.syncStudentsToSupabase = syncStudentsToSupabase;
window.syncHalaqahsToSupabase = syncHalaqahsToSupabase;
window.autoSync = autoSync;
```

**Pastikan**:
- Baris ini ada dan tidak di-comment
- Tidak ada error sebelum baris ini
- Function `syncStudentsToSupabase` sudah didefinisikan sebelumnya

## 🔧 Quick Fix Script

Gunakan file `fix-sync-function-missing.js`:

1. **Copy isi file** `fix-sync-function-missing.js`
2. **Paste di Console** browser (F12)
3. **Tekan Enter**
4. **Ikuti instruksi** yang muncul

Script akan:
- Cek apakah supabase.js ter-load
- Cek apakah function ter-export
- Coba reload script jika perlu
- Berikan solusi spesifik

## 🚨 Jika Masih Gagal

### Opsi A: Cek File Integrity

1. Buka `js/supabase.js` di editor
2. Scroll ke bagian akhir file
3. Pastikan ada baris export:
   ```javascript
   window.syncStudentsToSupabase = syncStudentsToSupabase;
   ```
4. Jika tidak ada, file mungkin corrupt atau terpotong

### Opsi B: Cek Browser Cache

1. **Hard refresh**: Ctrl+Shift+R (Windows) atau Cmd+Shift+R (Mac)
2. Atau **Clear cache**:
   - F12 → Network tab
   - Klik kanan → Clear browser cache
   - Refresh halaman

### Opsi C: Cek Supabase Library

Pastikan library Supabase ter-load:

```javascript
// Paste di Console:
typeof window.supabase
// Seharusnya return: "object"
```

Jika `undefined`, berarti CDN Supabase tidak ter-load. Cek:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

## 📊 Checklist Troubleshooting

- [ ] File js/supabase.js ada di folder
- [ ] File ter-load dengan status 200 (cek Network tab)
- [ ] Tidak ada error di Console saat page load
- [ ] Supabase library dari CDN ter-load
- [ ] Script di-load dalam urutan yang benar
- [ ] Baris export ada di akhir supabase.js
- [ ] Browser cache sudah di-clear

## 💡 Workaround Sementara

Jika masih gagal, gunakan workaround ini untuk sync manual:

```javascript
// Paste di Console setelah tambah santri:
if (window.dashboardData && window.supabaseClient) {
    const students = window.dashboardData.students.map(s => ({
        id: parseInt(s.id),
        name: s.name,
        halaqah: s.halaqah,
        nisn: s.nisn || '',
        nik: s.nik || '',
        total_points: parseInt(s.total_points) || 0,
        // ... field lainnya
    }));
    
    window.supabaseClient
        .from('students')
        .upsert(students, { onConflict: 'id' })
        .then(({ data, error }) => {
            if (error) {
                console.error('Sync error:', error);
            } else {
                console.log('✅ Sync berhasil!');
            }
        });
}
```

---

**File Terkait**:
- `fix-sync-function-missing.js` - Script auto-fix
- `debug-sync-console.js` - Script debug lengkap
- `INSTRUKSI-DEBUG-SEKARANG.md` - Panduan debug
