# ⚡ Quick Fix: Guru Melihat Semua Santri

## 🎯 Diagnosa Cepat (2 Menit)

### 1️⃣ Login sebagai Guru
```
Buka: dashboard.html
Login: Akun Guru
```

### 2️⃣ Buka Debug Tool
```
Buka: debug-guru-filter.html
Klik: Semua tombol
```

### 3️⃣ Cek Matching
Lihat tabel "Matching Guru dengan Halaqah":
- ✅ YES = OK, ada matching
- ❌ NO = Masalah di sini!

---

## ✅ Solusi Cepat

### Jika Tidak Ada Matching (❌ NO):

**Opsi A: Ubah Nama di Profile**
```
1. Login sebagai Admin
2. Menu Users → Cari guru
3. Edit → Ubah Full Name
4. Samakan dengan nama di halaqah
5. Simpan
```

**Opsi B: Ubah Nama di Halaqah**
```
1. Login sebagai Admin
2. Menu Halaqah → Pilih halaqah
3. Edit → Ubah field Guru
4. Samakan dengan nama di profile
5. Simpan
```

**Opsi C: Assign Manual**
```
1. Login sebagai Admin
2. Menu Users → Cari guru
3. Klik "Assign Santri"
4. Pilih santri
5. Simpan
```

---

## 📊 Verifikasi

Setelah fix:
- [ ] Login sebagai Guru
- [ ] Hanya melihat santri dari halaqah yang diajar
- [ ] Tidak melihat santri dari halaqah lain

---

## 📞 Bantuan

Jika masih bermasalah, lihat: `FIX-GURU-FILTER.md`
