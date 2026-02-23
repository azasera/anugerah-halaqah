// Check Supabase Errors
// Paste di Console untuk cek error di js/supabase.js

console.log('=== CHECK SUPABASE ERRORS ===\n');

// 1. Check if file is loaded
console.log('1. Checking if supabase.js is loaded...');
console.log('   - window.supabaseClient:', typeof window.supabaseClient);
console.log('   - window.SUPABASE_URL:', typeof window.SUPABASE_URL);

// 2. Check if functions are exported
console.log('\n2. Checking exported functions:');
const expectedFunctions = [
    'syncStudentsToSupabase',
    'syncHalaqahsToSupabase',
    'autoSync',
    'loadStudentsFromSupabase',
    'loadHalaqahsFromSupabase'
];

expectedFunctions.forEach(fn => {
    const exists = typeof window[fn] !== 'undefined';
    console.log(`   ${exists ? '✅' : '❌'} ${fn}: ${typeof window[fn]}`);
});

// 3. If functions are missing, check for errors
if (typeof window.syncStudentsToSupabase === 'undefined') {
    console.log('\n3. ❌ FUNCTIONS MISSING!');
    console.log('   Kemungkinan ada error saat file di-load.');
    console.log('   Cek Console untuk error berwarna merah saat page load.');
    console.log('\n   Scroll ke atas di Console dan cari error yang menyebut:');
    console.log('   - "supabase"');
    console.log('   - "Uncaught"');
    console.log('   - "SyntaxError"');
    console.log('   - "ReferenceError"');
} else {
    console.log('\n3. ✅ ALL FUNCTIONS AVAILABLE!');
    console.log('   File loaded successfully.');
    console.log('\n   Masalah mungkin di tempat lain. Coba:');
    console.log('   1. Refresh halaman (F5)');
    console.log('   2. Coba tambah santri lagi');
    console.log('   3. Jika masih gagal, jalankan debug-sync-console.js');
}

// 4. Try to call the function if it exists
if (typeof window.syncStudentsToSupabase === 'function') {
    console.log('\n4. Testing syncStudentsToSupabase...');
    
    // Check prerequisites
    const hasProfile = typeof window.currentProfile !== 'undefined' && window.currentProfile;
    const hasData = typeof window.dashboardData !== 'undefined' && window.dashboardData;
    const isOnline = navigator.onLine;
    
    console.log('   Prerequisites:');
    console.log('   - Profile:', hasProfile ? '✅' : '❌');
    console.log('   - Data:', hasData ? '✅' : '❌');
    console.log('   - Online:', isOnline ? '✅' : '❌');
    
    if (hasProfile && hasData && isOnline) {
        console.log('\n   Running test sync...');
        window.syncStudentsToSupabase().then(result => {
            console.log('   Result:', result);
            if (result.status === 'success') {
                console.log('   ✅ SYNC WORKS!');
            } else {
                console.log('   ⚠️ Sync returned:', result.status);
            }
        }).catch(err => {
            console.error('   ❌ Sync error:', err);
        });
    } else {
        console.log('\n   ⚠️ Cannot test - missing prerequisites');
        if (!hasProfile) {
            console.log('   Fix: Load profile first');
            console.log('   window.currentProfile = JSON.parse(localStorage.getItem("currentProfile"));');
        }
    }
}

console.log('\n=== END CHECK ===');
