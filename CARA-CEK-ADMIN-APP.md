# 🔍 Cara Cek Admin App

## Masalah yang Mungkin Terjadi

Admin app mungkin tidak berfungsi karena:

1. **Profile tidak ter-load** - `window.currentProfile` undefined
2. **Role bukan admin** - Role adalah 'guru' atau 'ortu' 
3. **Autentikasi gagal** - Login tidak berhasil
4. **JavaScript error** - Ada error di console

## Tool untuk Cek Admin

### 1. Buka Tool Check Admin

```
check-admin-profile.html
```

### 2. Klik "Check Profile"

Tool akan mengecek:
- ✅ `window.currentProfile` ada atau tidak
- ✅ Role adalah 'admin' atau bukan
- ✅ Data tersimpan di localStorage
- ✅ `window.currentUser` ada atau tidak

### 3. Lihat Hasil

**Jika Profile OK:**
- ✅ Profile Loaded
- ✅ Admin Access
- Role: admin

**Jika Profile Bermasalah:**
- ❌ No Profile
- ❌ No Access
- Role: undefined/guru/ortu

## Solusi Berdasarkan Masalah

### Masalah 1: Profile Tidak Ada

**Solusi A: Load from Storage**
```
Klik "Load from Storage"
```

**Solusi B: Create Admin Profile**
```
Klik "Create Admin Profile"
```

### Masalah 2: Role Bukan Admin

**Cek role saat ini:**
- Buka Console (F12)
- Ketik: `console.log(window.currentProfile.role)`

**Ubah role ke admin:**
```javascript
window.currentProfile.role = 'admin';
localStorage.setItem('currentProfile', JSON.stringify(window.currentProfile));
```

### Masalah 3: Profile Ada Tapi Admin Settings Tidak Bisa Dibuka

**Test admin access:**
```
Klik "Test Admin Access"
```

**Manual fix:**
```javascript
// Buka Console (F12)
window.currentProfile = {
    id: 'admin-' + Date.now(),
    email: 'admin@anugrah.com',
    name: 'Administrator',
    role: 'admin',
    lembaga: 'MTA'
};

localStorage.setItem('currentProfile', JSON.stringify(window.currentProfile));
```

## Cara Akses Admin Settings

### 1. Pastikan Profile Admin

```javascript
// Check di Console (F12)
console.log('Profile:', window.currentProfile);
console.log('Role:', window.currentProfile?.role);
```

### 2. Buka Admin Settings

**Via Sidebar (Desktop):**
- Klik ⚙️ "Pengaturan" di sidebar kiri

**Via Console (Manual):**
```javascript
showAdminSettings();
```

### 3. Jika Masih Error "Akses Ditolak"

**Force override:**
```javascript
// Buka Console (F12)
window.currentProfile = {
    role: 'admin',
    name: 'Administrator',
    email: 'admin@anugrah.com'
};

// Langsung buka admin
showAdminSettings();
```

## Verifikasi Admin Berfungsi

### 1. Cek Tab Admin

Setelah buka admin settings, harus ada tab:
- ✅ Kelola Santri
- ✅ Data Induk  
- ✅ Kelola Halaqah
- ✅ Auto Poin
- ✅ Import/Export
- ✅ Sesi Halaqah
- ✅ Lembaga
- ✅ Hapus Data

### 2. Test Fungsi Admin

**Test hapus santri:**
- Pergi ke tab "Kelola Santri"
- Klik tombol hapus (🗑️) pada santri
- Seharusnya muncul konfirmasi

**Test edit santri:**
- Klik tombol edit (✏️) pada santri
- Seharusnya muncul form edit

### 3. Cek Permission

```javascript
// Di Console (F12)
console.log('Current Profile:', window.currentProfile);
console.log('Is Admin:', window.currentProfile?.role === 'admin');
```

## Troubleshooting

### Error: "currentProfile is not defined"

**Solusi:**
```javascript
window.currentProfile = {
    role: 'admin',
    name: 'Administrator',
    email: 'admin@anugrah.com'
};
```

### Error: "showAdminSettings is not a function"

**Penyebab:** File `js/admin.js` tidak ter-load

**Solusi:**
1. Refresh page (Ctrl+R)
2. Cek Console untuk error JavaScript
3. Pastikan file `js/admin.js` ada

### Admin Settings Kosong/Tidak Muncul

**Solusi:**
1. Cek `dashboardData.students` ada data
2. Cek `dashboardData.halaqahs` ada data
3. Refresh data:
   ```javascript
   refreshAllData();
   ```

### Button Admin Tidak Muncul

**Penyebab:** Role bukan admin

**Solusi:**
```javascript
window.currentProfile.role = 'admin';
localStorage.setItem('currentProfile', JSON.stringify(window.currentProfile));
location.reload();
```

## File yang Dibuat

1. ✅ `check-admin-profile.html` - Tool cek admin profile
2. ✅ `CARA-CEK-ADMIN-APP.md` - Dokumentasi ini

## Kesimpulan

Masalah admin app biasanya karena:
1. Profile tidak ter-load → Gunakan tool check admin
2. Role bukan admin → Set role ke 'admin'
3. JavaScript error → Cek Console dan refresh

Gunakan tool `check-admin-profile.html` untuk diagnosis cepat dan solusi otomatis.