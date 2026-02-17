# Quick Fix - Jalankan di Console

Jika data anak tidak tampil setelah login, buka Console (F12) dan jalankan perintah berikut:

## 1. Debug - Lihat Status Saat Ini

```javascript
// Copy-paste semua baris ini ke console
console.log('Current User:', window.currentUser);
console.log('Current Profile:', window.currentProfile);
console.log('Current User Child:', window.currentUserChild);
console.log('Total Students:', dashboardData.students.length);
console.log('NIK/NISN dari email:', window.currentUser?.email?.split('@')[0]);
```

## 2. Cari Student yang Cocok

```javascript
// Cari student berdasarkan NIK/NISN dari email login
const nikOrNisn = window.currentUser.email.split('@')[0].trim();
const matched = dashboardData.students.find(s =>
    (s.nik && String(s.nik).trim() === nikOrNisn) ||
    (s.nisn && String(s.nisn).trim() === nikOrNisn)
);
console.log('Matched student:', matched);
```

## 3. Manual Fix - Set Child dan Refresh

```javascript
// Jika matched student ditemukan, set sebagai currentUserChild
if (matched) {
    window.currentUserChild = matched;
    console.log('✅ Set currentUserChild:', matched.name);
    
    // Refresh UI
    renderSantri();
    console.log('✅ UI refreshed');
} else {
    console.log('❌ No matching student found');
    console.log('Available NIKs:', dashboardData.students.map(s => s.nik));
    console.log('Available NISNs:', dashboardData.students.map(s => s.nisn));
}
```

## 4. Atau Gunakan Fungsi Refresh

```javascript
// Panggil fungsi refresh dengan retry
window.refreshUserChildLink().then(() => {
    console.log('✅ Refresh completed');
    renderSantri();
});
```

## 5. Debug Lengkap (Load Script)

```javascript
// Load debug script
const script = document.createElement('script');
script.src = 'debug-parent-login.js';
document.head.appendChild(script);
```

## Atau Copy-Paste Script Lengkap Ini:

```javascript
(async function() {
    console.log('🔧 Starting manual fix...');
    
    // Check current state
    console.log('Current User:', window.currentUser?.email);
    console.log('Current Profile:', window.currentProfile?.full_name, window.currentProfile?.role);
    console.log('Current User Child:', window.currentUserChild?.name);
    console.log('Total Students:', dashboardData.students.length);
    
    if (!window.currentUser || !window.currentProfile) {
        console.error('❌ Not logged in!');
        return;
    }
    
    if (window.currentProfile.role !== 'ortu') {
        console.log('ℹ️ Not a parent account');
        return;
    }
    
    // Find matching student
    const nikOrNisn = window.currentUser.email.split('@')[0].trim();
    console.log('🔍 Looking for student with NIK/NISN:', nikOrNisn);
    
    const matched = dashboardData.students.find(s =>
        (s.nik && String(s.nik).trim() === nikOrNisn) ||
        (s.nisn && String(s.nisn).trim() === nikOrNisn)
    );
    
    if (matched) {
        console.log('✅ Found student:', matched.name);
        window.currentUserChild = matched;
        
        // Refresh UI
        if (typeof renderSantri === 'function') {
            renderSantri();
            console.log('✅ UI refreshed - data should now be visible');
        }
        
        // Also refresh other components
        if (typeof refreshAllData === 'function') {
            refreshAllData();
        }
    } else {
        console.error('❌ No student found with NIK/NISN:', nikOrNisn);
        console.log('Available students:');
        dashboardData.students.forEach(s => {
            console.log(`  - ${s.name} (NIK: ${s.nik}, NISN: ${s.nisn})`);
        });
    }
})();
```

## Jika Masih Tidak Tampil

Cek apakah NIK/NISN di database sama persis dengan yang digunakan untuk login:

```javascript
// Lihat semua NIK dan NISN
console.table(dashboardData.students.map(s => ({
    Nama: s.name,
    NIK: s.nik,
    NISN: s.nisn
})));
```

## Permanent Fix

Setelah berhasil dengan manual fix, logout dan login kembali untuk memastikan fix otomatis berfungsi.
