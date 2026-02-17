# ⚡ Quick Start - Test Perbaikan Setoran

## 🎯 Test Cepat (5 Menit)

### 1️⃣ Buka Dashboard
```
Buka: dashboard.html
Login: Guru/Admin
Tekan: F12 (buka Console)
```

### 2️⃣ Cek Script Loaded
Ketik di console:
```javascript
console.log('Fix:', typeof window.hasPendingLocalChanges !== 'undefined');
```
Harus muncul: `Fix: true`

### 3️⃣ Input Setoran
```
1. Pilih santri
2. Klik "Input Setoran"
3. Isi form
4. Klik "Simpan"
```

### 4️⃣ Cek Console
Harus muncul:
```
✅ Saved to localStorage
✅ Synced to Supabase
```

### 5️⃣ Test Refresh
```
1. Tunggu 3 detik
2. Tekan F5
3. Data harus tetap ada
```

---

## ✅ Hasil yang Diharapkan

| Test | Hasil |
|------|-------|
| Script loaded | ✅ Fix: true |
| Data tersimpan | ✅ Saved to localStorage |
| Data tersync | ✅ Synced to Supabase |
| Data persist | ✅ Tidak hilang setelah refresh |
| Poin bertambah | ✅ Total poin naik |

---

## ❌ Jika Ada Masalah

### Data Hilang?
```javascript
// Cek localStorage
localStorage.getItem('halaqahData')
```

### Sync Gagal?
```javascript
// Cek role
console.log(currentProfile.role)
// Harus: 'guru' atau 'admin'
```

### Poin Tidak Bertambah?
```
Cek kondisi:
- Tepat Waktu + Lancar + Target = +2
- Tepat Waktu + Tidak Lancar + Target = +1
- Lainnya = 0
```

---

## 🔧 Tools

| Tool | Fungsi |
|------|--------|
| `debug-hafalan.html` | Compare localStorage vs Supabase |
| `test-setoran-fix.html` | Test sistem fix |
| Console (F12) | Monitor realtime |

---

## 📚 Dokumentasi Lengkap

- `CARA-TEST-PERBAIKAN.md` - Panduan lengkap test
- `SOLUSI-DATA-TIDAK-BERTAMBAH.md` - Solusi detail
- `CHECKLIST-VERIFIKASI.md` - Checklist lengkap

---

**Butuh bantuan? Lihat `CARA-TEST-PERBAIKAN.md`**
