// Fix: Sync Function Missing
// Paste script ini di Console jika syncStudentsToSupabase tidak ditemukan

console.log('=== FIX: SYNC FUNCTION MISSING ===\n');

// Step 1: Check if supabase.js is loaded
console.log('Step 1: Checking if js/supabase.js is loaded...');

if (typeof window.supabaseClient === 'undefined') {
    console.error('❌ CRITICAL: js/supabase.js NOT LOADED!');
    console.log('\nSolusi:');
    console.log('1. Buka tab Network (F12)');
    console.log('2. Refresh halaman (F5)');
    console.log('3. Cari file "supabase.js" di list');
    console.log('4. Jika status bukan 200 (OK), ada masalah dengan file');
    console.log('5. Jika file tidak muncul, cek path di dashboard.html');
    console.log('\nSetelah diperbaiki, refresh halaman dan coba lagi.');
} else {
    console.log('✅ Supabase client exists - js/supabase.js loaded');
    
    // Step 2: Check if function exists
    console.log('\nStep 2: Checking if syncStudentsToSupabase exists...');
    
    if (typeof window.syncStudentsToSupabase === 'undefined') {
        console.error('❌ Function NOT exported to window');
        console.log('\nKemungkinan penyebab:');
        console.log('1. Ada error di js/supabase.js yang mencegah export');
        console.log('2. Baris export tidak dijalankan');
        console.log('\nCek Console untuk error saat page load...');
        
        // Try to manually reload the script
        console.log('\n🔧 Attempting to reload js/supabase.js...');
        
        const script = document.createElement('script');
        script.src = 'js/supabase.js?v=' + Date.now();
        script.onload = function() {
            console.log('✅ Script reloaded');
            
            if (typeof window.syncStudentsToSupabase !== 'undefined') {
                console.log('✅ syncStudentsToSupabase NOW AVAILABLE!');
                console.log('\nSekarang coba tambah santri lagi atau jalankan:');
                console.log('window.syncStudentsToSupabase()');
            } else {
                console.error('❌ Still not available after reload');
                console.log('Ada error di file js/supabase.js');
                console.log('Cek Console untuk error message');
            }
        };
        script.onerror = function() {
            console.error('❌ Failed to reload script');
            console.log('File js/supabase.js tidak bisa di-load');
            console.log('Pastikan file ada dan path benar');
        };
        
        document.head.appendChild(script);
        
    } else {
        console.log('✅ syncStudentsToSupabase EXISTS!');
        console.log('\nFunction is available. Masalah mungkin di tempat lain.');
        console.log('Jalankan debug-sync-console.js untuk cek masalah lain.');
    }
}

console.log('\n=== END FIX ===');
