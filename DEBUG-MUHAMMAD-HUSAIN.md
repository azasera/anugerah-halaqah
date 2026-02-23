# Debug Login Muhammad Husain

## Data Santri
- **Nama:** Muhammad Husain
- **NIK:** 1971022102090001
- **Tanggal Lahir:** 21-02-2009
- **Password Login:** 21022009 (format DDMMYYYY)

## Masalah
Tidak bisa login dengan NIK dan TTL

## Langkah Debug

### 1. Cek Format Data
✅ NIK harus 16 digit angka: `1971022102090001` (16 karakter)
✅ Password TTL harus 8 digit: `21022009` (DDMMYYYY)

### 2. Cek Data di Supabase

Buka Supabase Dashboard > SQL Editor, jalankan:

```sql
SELECT * FROM students 
WHERE nik = '1971022102090001' 
   OR nik = 1971022102090001;
```

**Hasil yang diharapkan:**
- Data santri ditemukan
- Field `nik` terisi: `1971022102090001`
- Field `tanggal_lahir` terisi: `2009-02-21` atau `21-02-2009`
- Field `name` terisi: `Muhammad Husain`

### 3. Cek Auth Users

Buka Supabase Dashboard > Authentication > Users

Cari email: `1971022102090001@sekolah.id`

**Kemungkinan:**
- ✅ **Ada:** Akun sudah terdaftar, cek password
- ❌ **Tidak ada:** Akun belum terdaftar, perlu register

### 4. Test Login Manual

Buka file: `test-muhammad-husain-login.html`

Atau jalankan di Console (F12):

```javascript
async function testLogin() {
    const nik = '1971022102090001';
    const password = '21022009';
    const email = nik + '@sekolah.id';
    
    const { data, error } = await window.supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });
    
    if (error) {
        console.error('❌ Login failed:', error.message);
    } else {
        console.log('✅ Login berhasil!', data.user);
    }
}

testLogin();
```

## Kemungkinan Masalah & Solusi

### ❌ Masalah 1: Data Santri Tidak Ada di Database

**Cek:**
```sql
SELECT * FROM students WHERE nik = '1971022102090001';
```

**Solusi:**
```sql
INSERT INTO students (name, nik, tanggal_lahir, lembaga, halaqah)
VALUES (
    'Muhammad Husain',
    '1971022102090001',
    '2009-02-21',
    'MTA',
    'Naufal Alim Harziki'
);
```

### ❌ Masalah 2: NIK Tidak Match (Typo)

**Cek semua kemungkinan:**
```sql
SELECT nik, name FROM students 
WHERE name ILIKE '%muhammad%husain%';
```

**Solusi:** Update NIK yang benar
```sql
UPDATE students 
SET nik = '1971022102090001'
WHERE name = 'Muhammad Husain';
```

### ❌ Masalah 3: Tanggal Lahir Kosong atau Salah Format

**Cek:**
```sql
SELECT name, nik, tanggal_lahir FROM students 
WHERE nik = '1971022102090001';
```

**Solusi:**
```sql
UPDATE students 
SET tanggal_lahir = '2009-02-21'
WHERE nik = '1971022102090001';
```

### ❌ Masalah 4: Akun Belum Terdaftar di Auth

**Cek:** Supabase Dashboard > Authentication > Users

**Solusi:** Auto-register saat login pertama kali

Sistem akan otomatis membuat akun jika:
1. Data santri ada di database
2. NIK dan password TTL match
3. Login pertama kali gagal karena akun belum ada

**Atau register manual:**
```sql
-- Di Supabase Dashboard > Authentication > Users
-- Klik "Add User"
-- Email: 1971022102090001@sekolah.id
-- Password: 21022009
-- User Metadata:
{
  "full_name": "Muhammad Husain",
  "role": "ortu"
}
```

### ❌ Masalah 5: Password Salah Format

**Format yang benar:** DDMMYYYY
- Tanggal lahir: 21 Februari 2009
- Password: `21022009`

**Bukan:**
- ❌ `2009-02-21`
- ❌ `21-02-2009`
- ❌ `21/02/2009`

### ❌ Masalah 6: Email Confirmation Required

Jika Supabase memerlukan email confirmation:

**Solusi:**
```sql
-- Di Supabase Dashboard > Authentication > Users
-- Klik user yang bersangkutan
-- Klik "Confirm Email"
```

Atau disable email confirmation:
- Supabase Dashboard > Authentication > Settings
- Disable "Enable email confirmations"

## Testing Tools

### 1. File HTML Test
Buka: `test-muhammad-husain-login.html`

### 2. Console Script
Load di Console: `fix-muhammad-husain-login.js`

```javascript
// Di Console (F12)
const script = document.createElement('script');
script.src = 'fix-muhammad-husain-login.js';
document.head.appendChild(script);
```

### 3. Dashboard Test
1. Buka `dashboard.html`
2. Klik tombol Login
3. Masukkan:
   - NIK: `1971022102090001`
   - Password: `21022009`
4. Cek Console (F12) untuk error

## Checklist Verifikasi

- [ ] Data santri ada di tabel `students`
- [ ] NIK match: `1971022102090001`
- [ ] Tanggal lahir terisi: `2009-02-21`
- [ ] Password format benar: `21022009` (DDMMYYYY)
- [ ] Email di auth: `1971022102090001@sekolah.id`
- [ ] Email confirmed (jika required)
- [ ] Role user: `ortu`

## Quick Fix Script

Jalankan di Console (F12) saat di dashboard:

```javascript
async function quickFixMuhammadHusain() {
    const nik = '1971022102090001';
    const password = '21022009';
    const email = nik + '@sekolah.id';
    
    console.log('🔍 Checking student data...');
    
    // 1. Cek data santri
    const { data: student, error: studentError } = await window.supabaseClient
        .from('students')
        .select('*')
        .or(`nik.eq."${nik}",nik.eq.${nik}`)
        .maybeSingle();
    
    if (studentError) {
        console.error('❌ Error:', studentError.message);
        return;
    }
    
    if (!student) {
        console.error('❌ Student not found');
        console.log('💡 Tambahkan data santri di Supabase');
        return;
    }
    
    console.log('✅ Student found:', student.name);
    
    // 2. Test login
    console.log('🔐 Testing login...');
    const { data: authData, error: authError } = await window.supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });
    
    if (authError) {
        console.error('❌ Login failed:', authError.message);
        
        if (authError.message.includes('Invalid login credentials')) {
            console.log('💡 Trying auto-register...');
            
            const { data: signUpData, error: signUpError } = await window.supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: student.name,
                        role: 'ortu'
                    }
                }
            });
            
            if (signUpError) {
                console.error('❌ Register failed:', signUpError.message);
            } else {
                console.log('✅ Register berhasil! Silakan login lagi');
            }
        }
    } else {
        console.log('✅ Login berhasil!');
        window.location.reload();
    }
}

quickFixMuhammadHusain();
```

## Kontak Support

Jika masih gagal setelah semua langkah di atas:
1. Screenshot error di Console (F12)
2. Screenshot hasil query SQL
3. Screenshot Authentication Users di Supabase
4. Kirim ke developer
