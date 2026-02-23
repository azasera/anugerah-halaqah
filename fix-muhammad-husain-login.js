// Script untuk debug dan fix login Muhammad Husain
// NIK: 1971022102090001
// TTL: 21-02-2009

console.log('=== DEBUG LOGIN MUHAMMAD HUSAIN ===');

const studentData = {
    name: 'Muhammad Husain',
    nik: '1971022102090001',
    tanggal_lahir: '21-02-2009', // atau '2009-02-21'
    ttl_password: '21022009'
};

// 1. Validasi Format
console.log('\n1. VALIDASI FORMAT:');
console.log('NIK:', studentData.nik);
console.log('NIK Length:', studentData.nik.length, studentData.nik.length === 16 ? '✅' : '❌');
console.log('NIK is numeric:', /^\d+$/.test(studentData.nik) ? '✅' : '❌');
console.log('TTL Password:', studentData.ttl_password);
console.log('TTL Length:', studentData.ttl_password.length, studentData.ttl_password.length === 8 ? '✅' : '❌');
console.log('TTL Format (DDMMYYYY):', /^\d{8}$/.test(studentData.ttl_password) ? '✅' : '❌');

// 2. Parse Tanggal Lahir
console.log('\n2. PARSE TANGGAL LAHIR:');
function parseTanggalLahir(ttl) {
    let day, month, year;
    
    if (ttl.includes('-')) {
        const parts = ttl.split('-');
        if (parts[0].length === 4) {
            // YYYY-MM-DD
            [year, month, day] = parts;
        } else {
            // DD-MM-YYYY
            [day, month, year] = parts;
        }
    } else if (ttl.includes('/')) {
        const parts = ttl.split('/');
        [day, month, year] = parts;
    }
    
    if (day && month && year) {
        day = day.toString().padStart(2, '0');
        month = month.toString().padStart(2, '0');
        year = year.toString();
        return `${day}${month}${year}`;
    }
    
    return null;
}

const parsedPassword = parseTanggalLahir(studentData.tanggal_lahir);
console.log('Parsed Password:', parsedPassword);
console.log('Match dengan input:', parsedPassword === studentData.ttl_password ? '✅' : '❌');

// 3. Email untuk Auth
const authEmail = `${studentData.nik}@sekolah.id`;
console.log('\n3. EMAIL AUTH:');
console.log('Email:', authEmail);

// 4. Cek di Supabase
console.log('\n4. CEK SUPABASE:');
console.log('Jalankan query ini di Supabase SQL Editor:');
console.log(`
SELECT * FROM students 
WHERE nik = '${studentData.nik}' 
   OR nik = ${studentData.nik};
`);

// 5. Cek di Auth
console.log('\n5. CEK AUTH.USERS:');
console.log('Buka Supabase Dashboard > Authentication > Users');
console.log('Cari email:', authEmail);

// 6. Kemungkinan Masalah
console.log('\n6. KEMUNGKINAN MASALAH:');
console.log('');
console.log('❌ MASALAH 1: Data santri tidak ada di tabel students');
console.log('   Solusi: Tambahkan data santri ke Supabase');
console.log('');
console.log('❌ MASALAH 2: NIK tidak match (typo atau format berbeda)');
console.log('   Solusi: Cek NIK di database, pastikan sama persis');
console.log('');
console.log('❌ MASALAH 3: Tanggal lahir tidak ada atau format salah');
console.log('   Solusi: Update tanggal_lahir di database');
console.log('');
console.log('❌ MASALAH 4: Akun belum terdaftar di auth.users');
console.log('   Solusi: Login pertama kali akan auto-register');
console.log('');
console.log('❌ MASALAH 5: Password TTL salah format');
console.log('   Solusi: Pastikan format DDMMYYYY (21022009)');

// 7. Auto-Fix Function
console.log('\n7. AUTO-FIX FUNCTION:');
console.log('Jalankan fungsi ini di console untuk test login:');
console.log(`
async function testLoginMuhammadHusain() {
    const nik = '${studentData.nik}';
    const password = '${studentData.ttl_password}';
    const email = nik + '@sekolah.id';
    
    console.log('Testing login...');
    console.log('Email:', email);
    console.log('Password:', password);
    
    if (!window.supabaseClient) {
        console.error('❌ Supabase client not initialized');
        return;
    }
    
    try {
        // 1. Cek data santri
        const { data: student, error: studentError } = await window.supabaseClient
            .from('students')
            .select('*')
            .or(\`nik.eq."\${nik}",nik.eq.\${nik}\`)
            .maybeSingle();
        
        if (studentError) {
            console.error('❌ Error querying student:', studentError);
            return;
        }
        
        if (!student) {
            console.error('❌ Student not found in database');
            console.log('💡 Tambahkan data santri terlebih dahulu');
            return;
        }
        
        console.log('✅ Student found:', student.name);
        console.log('Data:', student);
        
        // 2. Test login
        const { data: authData, error: authError } = await window.supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (authError) {
            console.error('❌ Login failed:', authError.message);
            
            if (authError.message.includes('Invalid login credentials')) {
                console.log('💡 Akun belum terdaftar, mencoba register...');
                
                // Auto-register
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
                    console.log('✅ Register berhasil!');
                    console.log('Silakan login lagi');
                }
            }
        } else {
            console.log('✅ Login berhasil!');
            console.log('User:', authData.user);
        }
    } catch (err) {
        console.error('❌ Exception:', err);
    }
}

// Jalankan test
testLoginMuhammadHusain();
`);

// 8. SQL untuk Insert/Update
console.log('\n8. SQL UNTUK INSERT/UPDATE:');
console.log('Jika data belum ada, jalankan SQL ini di Supabase:');
console.log(`
-- Insert data santri
INSERT INTO students (name, nik, tanggal_lahir, lembaga, halaqah)
VALUES (
    'Muhammad Husain',
    '${studentData.nik}',
    '2009-02-21',
    'MTA',
    'Naufal Alim Harziki'
)
ON CONFLICT (nik) DO UPDATE SET
    name = EXCLUDED.name,
    tanggal_lahir = EXCLUDED.tanggal_lahir;
`);

console.log('\n=== SELESAI ===');
console.log('Buka test-muhammad-husain-login.html untuk testing interaktif');
