# 🔍 Cara Debug Masalah Sync Permission

## 🎯 Tujuan
Mengidentifikasi kenapa data tidak tersinkron ke Supabase meskipun sudah login sebagai Admin.

## 📋 Langkah-langkah Debug

### Metode 1: Menggunakan Console Browser (PALING MUDAH)

1. **Buka dashboard.html** di browser
2. **Tekan F12** untuk membuka Developer Tools
3. **Klik tab "Console"**
4. **Copy-paste** seluruh isi file `debug-sync-console.js` ke Console
5. **Tekan Enter**
6. **Lihat hasil debug** yang muncul

### Apa yang Akan Dicek:

```
=== DEBUG SYNC PERMISSION ===

1. CURRENT PROFILE:
   ✅/❌ Apakah profile terdeteksi?
   - Name, Email, Role

2. SUPABASE CONFIG:
   ✅/❌ Apakah Supabase terkonfigurasi?

3. ONLINE STATUS:
   ✅/❌ Apakah ada koneksi internet?

4. SYNC FUNCTIONS:
   ✅/❌ Apakah fungsi sync tersedia?

5. DATA:
   ✅/❌ Apakah data santri ada?

6. TEST SYNC:
   ✅/❌ Hasil test sinkronisasi langsung
```

## 🔍 Interpretasi Hasil

### Skenario A: "No profile found"
**Artinya**: Profile tidak terdeteksi meskipun sudah login

**Penyebab**:
- Session belum ter-load sempurna
- Profile tidak tersimpan di `window.currentProfile`

**Solusi**:
1. Refresh halaman (F5)
2. Jika masih gagal, logout dan login ulang
3. Cek apakah ada error di Console saat login

### Skenario B: "Role TIDAK OK"
**Artinya**: Profile terdeteksi tapi role bukan admin/guru

**Penyebab**:
- Role di database bukan "admin" atau "guru"
- Typo di role (misalnya "Admin" dengan huruf besar)

**Solusi**:
1. Buka menu "Manajemen User"
2. Edit user Anda
3. Pastikan role = "admin" (huruf kecil semua)
4. Logout dan login ulang

### Skenario C: "Supabase NOT configured"
**Artinya**: Konfigurasi Supabase salah atau belum diisi

**Penyebab**:
- File `js/settings.js` belum dikonfigurasi
- Masih menggunakan nilai default

**Solusi**:
1. Buka `js/settings.js`
2. Cari `SUPABASE_URL` dan `SUPABASE_ANON_KEY`
3. Isi dengan nilai yang benar dari Supabase dashboard
4. Refresh halaman

### Skenario D: "SYNC GAGAL: Tidak ada permission"
**Artinya**: Fungsi sync berjalan tapi ditolak karena permission

**Penyebab**:
- `window.currentProfile` tidak terdeteksi saat fungsi sync dipanggil
- Profile ter-load terlambat

**Solusi**:
1. Pastikan profile sudah ter-load sebelum tambah santri
2. Tunggu beberapa detik setelah login
3. Refresh halaman sebelum tambah santri

## 🛠️ Metode 2: Menggunakan test-sync-permission.html

1. Buka `test-sync-permission.html`
2. Lihat status yang ditampilkan
3. Klik "Test Sync Sekarang"
4. Lihat hasil test

**Catatan**: File ini mungkin tidak bisa membaca profile dengan benar karena context berbeda. Gunakan Metode 1 (Console) untuk hasil lebih akurat.

## 🔧 Fix Manual Jika Profile Tidak Terdeteksi

Jika profile tidak terdeteksi di `window.currentProfile`, coba set manual di Console:

```javascript
// 1. Cek localStorage
const storedProfile = localStorage.getItem('currentProfile');
console.log('Stored profile:', storedProfile);

// 2. Set manual ke window
if (storedProfile) {
    window.currentProfile = JSON.parse(storedProfile);
    console.log('Profile set to window:', window.currentProfile);
}

// 3. Test sync lagi
syncStudentsToSupabase().then(result => {
    console.log('Sync result:', result);
});
```

## 📊 Checklist Troubleshooting

Pastikan semua ini ✅:
- [ ] Login sebagai Admin (cek di profil/pengaturan)
- [ ] `window.currentProfile` terdeteksi (cek di Console)
- [ ] `window.currentProfile.role` = "admin" atau "guru"
- [ ] Supabase terkonfigurasi (cek `js/settings.js`)
- [ ] Koneksi internet aktif
- [ ] Tidak ada error di Console saat login

## 🎯 Solusi Paling Umum

Berdasarkan pengalaman, masalah paling sering adalah:

1. **Profile tidak ter-load sempurna**
   - Solusi: Refresh halaman atau logout-login ulang

2. **Role typo** (misalnya "Admin" bukan "admin")
   - Solusi: Edit role di database, pastikan huruf kecil semua

3. **Supabase tidak terkonfigurasi**
   - Solusi: Isi `SUPABASE_URL` dan `SUPABASE_ANON_KEY` di `js/settings.js`

## 📞 Jika Masih Gagal

1. Screenshot hasil debug dari Console
2. Screenshot profil user (menu Pengaturan)
3. Cek file `js/settings.js` untuk konfigurasi Supabase
4. Dokumentasikan error message yang muncul

---

**File Terkait**:
- `debug-sync-console.js` - Script debug untuk Console
- `test-sync-permission.html` - Tool test permission (alternatif)
- `SOLUSI-CEPAT-SYNC-GAGAL.md` - Panduan troubleshooting umum
