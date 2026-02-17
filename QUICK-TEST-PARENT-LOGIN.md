# Quick Test: Login Orang Tua

## 🧪 Cara Test Perbaikan

### Persiapan:
1. Pastikan ada data santri di database dengan NIK/NISN yang diketahui
2. Buka browser dan buka Developer Console (F12)
3. Perhatikan log di console untuk melihat proses

### Test Case 1: Login dengan NIK
```
Username: [NIK_SANTRI]
Password: [TANGGAL_LAHIR_DDMMYYYY]
```

Contoh:
```
Username: 12345
Password: 01012010
```

### Test Case 2: Login dengan NISN
```
Username: [NISN_SANTRI]
Password: [TANGGAL_LAHIR_DDMMYYYY]
```

### Yang Harus Terlihat di Console:

#### 1. Saat Login:
```
[DEBUG] Attempting ID login for: 12345 -> 12345@sekolah.id
🔍 refreshUserChildLink called (attempt 1/11)
Looking for student with NIK/NISN: 12345
Students available: 0
⏳ Data belum dimuat, menunggu 300ms sebelum retry...
```

#### 2. Setelah Retry:
```
🔍 refreshUserChildLink called (attempt 2/11)
Students available: 0
⏳ Data belum dimuat, menunggu 300ms sebelum retry...
```

#### 3. Setelah Data Dimuat:
```
☁️ Memuat data santri...
[LOAD] Loaded 50 students from Supabase
🔗 Refreshing parent-child link after data load...
🔍 refreshUserChildLink called (attempt 1/11)
Looking for student with NIK/NISN: 12345
Students available: 50
✅ Parent linked to student: Ahmad Santoso
🔄 Refreshing UI to show child data...
```

#### 4. Di Dashboard:
- ✅ Nama anak tampil di tabel santri
- ✅ Data poin, ranking, streak tampil
- ✅ Hanya data anak yang tampil (tidak ada santri lain)

### Jika Gagal:

#### Pesan Error yang Mungkin Muncul:
```
❌ Parent logged in but no matching student found for ID: 12345
Available students: [{ name: 'Ahmad', nik: '54321', nisn: '67890' }, ...]
```

#### Solusi:
1. Periksa apakah NIK/NISN di database sesuai dengan yang digunakan untuk login
2. Periksa format tanggal lahir (harus DDMMYYYY)
3. Periksa apakah data santri sudah dimuat dari Supabase

### Debug Commands (di Console):

```javascript
// Cek current user
console.log('Current User:', window.currentUser);
console.log('Current Profile:', window.currentProfile);
console.log('Current User Child:', window.currentUserChild);

// Cek data santri
console.log('Total Students:', dashboardData.students.length);
console.log('Students:', dashboardData.students.map(s => ({ name: s.name, nik: s.nik, nisn: s.nisn })));

// Manual refresh link
window.refreshUserChildLink();

// Manual refresh UI
renderSantri();
```

## ✅ Kriteria Sukses

Test dianggap berhasil jika:
1. ✅ Login berhasil tanpa error
2. ✅ Console menampilkan log "✅ Parent linked to student: [NAMA_ANAK]"
3. ✅ Dashboard menampilkan data anak
4. ✅ Hanya data anak yang tampil (tidak ada santri lain)
5. ✅ Poin, ranking, dan streak tampil dengan benar

## 🐛 Troubleshooting

### Masalah: Data tidak tampil setelah login
**Solusi:**
1. Buka Console (F12)
2. Jalankan: `window.refreshUserChildLink()`
3. Jalankan: `renderSantri()`

### Masalah: "No matching student found"
**Solusi:**
1. Periksa NIK/NISN di database
2. Pastikan format sama persis (tidak ada spasi)
3. Cek dengan: `console.log(dashboardData.students.map(s => s.nik))`

### Masalah: "Data belum dimuat" terus menerus
**Solusi:**
1. Periksa koneksi internet
2. Periksa Supabase connection
3. Cek dengan: `console.log(dashboardData.students.length)`

## 📞 Bantuan

Jika masih ada masalah:
1. Screenshot console log
2. Screenshot dashboard
3. Catat NIK/NISN yang digunakan
4. Hubungi developer dengan informasi di atas
