// Force Export Functions
// Paste di Console jika fungsi tidak ter-export

console.log('=== FORCE EXPORT FUNCTIONS ===\n');

// Check if supabase.js is loaded
if (typeof window.supabaseClient === 'undefined') {
    console.error('❌ supabase.js NOT loaded!');
    console.log('Refresh halaman dan coba lagi.');
} else {
    console.log('✅ supabase.js loaded\n');
    
    // Try to access functions from the module scope
    // Since functions are defined but not exported, we need to check if they exist
    
    console.log('Checking if functions exist...');
    
    if (typeof window.syncStudentsToSupabase === 'undefined') {
        console.log('❌ syncStudentsToSupabase NOT exported');
        console.log('\nKemungkinan penyebab:');
        console.log('1. Ada error sebelum baris export dijalankan');
        console.log('2. File tidak selesai di-load');
        console.log('\nSolusi:');
        console.log('1. Scroll ke atas di Console');
        console.log('2. Cari error berwarna merah');
        console.log('3. Screenshot error tersebut');
        console.log('\nAtau coba:');
        console.log('- Hard refresh: Ctrl+Shift+R');
        console.log('- Clear cache dan refresh');
    } else {
        console.log('✅ syncStudentsToSupabase EXISTS!');
        console.log('✅ Function is available and ready to use');
        console.log('\nSekarang coba tambah santri lagi.');
        console.log('Data seharusnya tersinkron ke Supabase.');
    }
}

console.log('\n=== END ===');
