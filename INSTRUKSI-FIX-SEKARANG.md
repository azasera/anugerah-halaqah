# 🚨 INSTRUKSI FIX - Data Anak Tidak Tampil

## Langkah 1: Buka Console

1. Di halaman aplikasi yang sudah login, tekan **F12**
2. Klik tab **Console**

## Langkah 2: Copy-Paste Script Ini ke Console

```javascript
(async function() {
    console.log('🔧 MANUAL FIX - Starting...');
    
    // Check current state
    console.log('Current User:', window.currentUser?.email);
    console.log('Current Profile:', window.currentProfile?.full_name, '(' + window.currentProfile?.role + ')');
    console.log('Current User Child:', window.currentUserChild?.name || 'NULL');
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
            console.log('✅ UI refreshed - CHECK YOUR SCREEN NOW!');
            alert('✅ Data anak berhasil ditampilkan! Cek dashboard Anda.');
        }
        
        // Also refresh other components
        if (typeof refreshAllData === 'function') {
            refreshAllData();
        }
    } else {
        console.error('❌ No student found with NIK/NISN:', nikOrNisn);
        console.log('📋 Available students:');
        dashboardData.students.forEach(s => {
            console.log(`  - ${s.name} (NIK: ${s.nik || 'N/A'}, NISN: ${s.nisn || 'N/A'})`);
        });
        alert('❌ Tidak menemukan santri dengan NIK/NISN: ' + nikOrNisn + '\n\nCek console untuk melihat daftar santri yang tersedia.');
    }
})();
```

## Langkah 3: Tekan Enter

Setelah paste script di atas, tekan **Enter**

## Hasil yang Diharapkan:

### Jika Berhasil:
- ✅ Console akan menampilkan: "✅ Found student: [NAMA_ANAK]"
- ✅ Console akan menampilkan: "✅ UI refreshed - CHECK YOUR SCREEN NOW!"
- ✅ Muncul alert: "✅ Data anak berhasil ditampilkan!"
- ✅ Dashboard akan menampilkan data anak

### Jika Gagal:
- ❌ Console akan menampilkan: "❌ No student found with NIK/NISN: [NIK]"
- ❌ Console akan menampilkan daftar semua santri dengan NIK/NISN mereka
- ❌ Muncul alert dengan pesan error

## Jika Gagal - Cek NIK/NISN

Jika script menampilkan "No student found", berarti NIK/NISN yang digunakan untuk login tidak cocok dengan data di database.

### Cara Cek:

1. Lihat di console, ada daftar semua santri dengan NIK/NISN mereka
2. Cari nama anak yang seharusnya tampil
3. Bandingkan NIK/NISN di database dengan yang digunakan untuk login

### Contoh:

Jika login dengan: `12345` (NIK)
Tapi di database NIK-nya: `123456` (ada angka 6 di belakang)

Maka tidak akan cocok!

## Solusi Jika NIK/NISN Tidak Cocok:

### Opsi 1: Login Ulang dengan NIK/NISN yang Benar
1. Logout
2. Login dengan NIK/NISN yang sesuai dengan data di database

### Opsi 2: Update NIK/NISN di Database
1. Login sebagai Admin
2. Edit data santri
3. Update NIK/NISN agar sesuai dengan yang digunakan orang tua untuk login

## Alternatif - Gunakan Test Page

Jika cara di atas tidak berhasil, buka file ini di browser:

```
test-parent-fix-live.html
```

Kemudian klik tombol:
1. **🔍 Run Debug** - untuk melihat status
2. **🔧 Manual Fix** - untuk fix otomatis

## Butuh Bantuan?

Jika masih tidak berhasil, kirim screenshot:
1. Console log (F12 > Console)
2. Dashboard yang tidak menampilkan data
3. Informasi NIK/NISN yang digunakan untuk login
