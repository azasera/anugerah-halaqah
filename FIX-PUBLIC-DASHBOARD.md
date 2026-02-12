# FIX: Public Dashboard After Logout

## MASALAH
Setelah logout, dashboard publik tidak muncul. User tidak bisa melihat dashboard tanpa login.

## PENYEBAB
1. Fungsi `checkAuth()` memiliki logika duplikat/konflik
2. Fungsi `showLoginPage()` tidak di-export ke window object
3. Fungsi `showPublicUI()` tidak dipanggil dengan benar saat tidak ada session

## SOLUSI YANG DITERAPKAN

### 1. Perbaikan `checkAuth()` di `js/auth.js`
- Menghapus logika duplikat
- Memastikan `showPublicUI()` dipanggil saat:
  - Tidak ada Supabase client
  - Tidak ada session (setelah logout)
- Set `currentUser` dan `currentProfile` ke `null` untuk mode publik

### 2. Perbaikan `updateUIBasedOnRole()` di `js/auth.js`
- Menghapus logika guest mode dari fungsi ini
- Fungsi ini sekarang hanya handle user yang sudah login
- Mode publik sepenuhnya ditangani oleh `showPublicUI()`

### 3. Perbaikan `showPublicUI()` di `js/auth.js`
- Menyembunyikan fitur admin/sensitive:
  - Admin settings
  - Delete buttons
  - Import/Export
  - User management (sidebar & burger menu)
  - Settings (sidebar & burger menu)
- Menambahkan tombol "Login Petugas" di header
- Menambahkan badge "Mode Dashboard Publik" di sidebar dengan styling yang lebih menarik

### 4. Export Functions
- Menambahkan `window.showLoginPage` ke exports
- Menambahkan `window.showPublicUI` ke exports
- Menghapus duplicate exports

## CARA KERJA SEKARANG

### Saat Pertama Kali Buka App (Tanpa Login)
1. `initApp()` dipanggil
2. `checkAuth()` dipanggil
3. Tidak ada session → `showPublicUI()` dipanggil
4. Dashboard publik ditampilkan dengan:
   - Statistik real-time
   - Ranking halaqah
   - Ranking santri
   - Tombol "Login Petugas" di header & sidebar
   - Badge "Mode Dashboard Publik" di sidebar

### Saat Login
1. User klik "Login Petugas"
2. `showLoginPage()` dipanggil
3. User input credentials
4. Setelah login berhasil → `showApp()` → reload page
5. `checkAuth()` detect session → `updateUIBasedOnRole()` dipanggil
6. UI disesuaikan dengan role (admin/guru/ortu)

### Saat Logout
1. User klik "Logout"
2. `logout()` dipanggil
3. Session dihapus dari Supabase
4. Page reload
5. `checkAuth()` tidak detect session → `showPublicUI()` dipanggil
6. Dashboard publik ditampilkan kembali

## FITUR YANG TERSEMBUNYI DI MODE PUBLIK
- ❌ Admin Settings
- ❌ Delete buttons (halaqah, santri)
- ❌ Import/Export Excel
- ❌ User Management
- ❌ Settings menu
- ✅ View statistics (read-only)
- ✅ View rankings (read-only)
- ✅ Real-time updates dari Supabase

## TESTING

### Test 1: Buka App Tanpa Login
1. Buka browser baru (incognito)
2. Akses aplikasi
3. ✅ Dashboard publik harus muncul
4. ✅ Tombol "Login Petugas" harus ada di header & sidebar
5. ✅ Badge "Mode Dashboard Publik" harus ada di sidebar
6. ✅ Tidak ada menu Admin/Settings/Users

### Test 2: Login → Logout
1. Klik "Login Petugas"
2. Login dengan credentials
3. ✅ Dashboard dengan fitur lengkap muncul
4. Klik "Logout"
5. ✅ Dashboard publik muncul kembali
6. ✅ Tidak ada menu Admin/Settings/Users

### Test 3: Refresh Page Saat Mode Publik
1. Buka dashboard publik
2. Refresh page (F5)
3. ✅ Dashboard publik tetap muncul
4. ✅ Data tetap ter-load dari Supabase

## FILE YANG DIUBAH
- `js/auth.js` - Perbaikan checkAuth(), updateUIBasedOnRole(), showPublicUI(), exports

## STATUS
✅ SELESAI - Public dashboard sekarang berfungsi dengan baik setelah logout
