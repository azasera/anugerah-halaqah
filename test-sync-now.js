// TEST SYNC NOW - Paste di Console
// Script ini akan test apakah sync sudah bekerja dengan benar

console.log('🔍 === TEST SYNC FUNCTION ===\n');

// 1. Check if function exists
console.log('1. Cek fungsi sync:');
console.log('   syncStudentsToSupabase:', typeof window.syncStudentsToSupabase);

if (typeof window.syncStudentsToSupabase !== 'function') {
    console.error('❌ CRITICAL: Function tidak ditemukan!');
    console.log('\n📋 Solusi:');
    console.log('   1. Hard refresh: Ctrl+Shift+R');
    console.log('   2. Cek Console untuk error merah saat page load');
    console.log('   3. Cek Network tab - pastikan js/supabase.js ter-load (status 200)');
    console.log('\n⛔ Test dibatalkan karena function tidak ada');
} else {
    console.log('   ✅ Function ditemukan!\n');
    
    // 2. Check prerequisites
    console.log('2. Cek prerequisites:');
    console.log('   - Supabase client:', typeof window.supabaseClient !== 'undefined' ? '✅' : '❌');
    console.log('   - Dashboard data:', typeof window.dashboardData !== 'undefined' ? '✅' : '❌');
    console.log('   - Students count:', window.dashboardData?.students?.length || 0);
    console.log('   - Current profile:', window.currentProfile ? '✅' : '❌');
    console.log('   - Profile role:', window.currentProfile?.role || 'N/A');
    console.log('   - Online:', navigator.onLine ? '✅' : '❌');
    
    // 3. Check if can sync
    const canSync = window.supabaseClient && 
                    window.dashboardData?.students?.length > 0 &&
                    window.currentProfile &&
                    (window.currentProfile.role === 'admin' || window.currentProfile.role === 'guru') &&
                    navigator.onLine;
    
    console.log('\n3. Status sync:');
    if (canSync) {
        console.log('   ✅ Semua syarat terpenuhi, bisa sync!\n');
        
        // 4. Test sync
        console.log('4. Testing sync...');
        window.syncStudentsToSupabase()
            .then(result => {
                console.log('\n📊 Hasil sync:', result);
                
                if (result.status === 'success') {
                    console.log('   ✅ SYNC BERHASIL!');
                    console.log('   📈 Jumlah santri tersinkron:', result.count);
                    console.log('\n🎉 SELESAI! Sekarang coba tambah santri baru.');
                } else if (result.status === 'skipped_permission') {
                    console.log('   ⚠️ Sync dilewati: Tidak ada permission');
                    console.log('   💡 Pastikan Anda login sebagai Admin atau Guru');
                } else if (result.status === 'skipped_offline') {
                    console.log('   ⚠️ Sync dilewati: Offline');
                } else if (result.status === 'skipped_empty') {
                    console.log('   ⚠️ Sync dilewati: Data kosong atau belum ter-load');
                } else {
                    console.log('   ℹ️ Status:', result.status);
                }
            })
            .catch(error => {
                console.error('\n❌ SYNC ERROR:', error);
                console.log('\n📋 Troubleshooting:');
                console.log('   1. Cek error message di atas');
                console.log('   2. Cek konfigurasi Supabase di js/settings.js');
                console.log('   3. Cek koneksi internet');
                console.log('   4. Coba logout dan login kembali');
            });
    } else {
        console.log('   ❌ Tidak bisa sync, ada syarat yang tidak terpenuhi\n');
        
        console.log('📋 Checklist:');
        if (!window.supabaseClient) {
            console.log('   ❌ Supabase client tidak ada');
            console.log('      → Cek js/settings.js, pastikan SUPABASE_URL dan KEY sudah diisi');
        }
        if (!window.dashboardData?.students?.length) {
            console.log('   ❌ Data santri kosong atau belum ter-load');
            console.log('      → Tunggu beberapa detik atau refresh halaman');
        }
        if (!window.currentProfile) {
            console.log('   ❌ Profile tidak ditemukan');
            console.log('      → Coba jalankan: window.currentProfile = JSON.parse(localStorage.getItem("currentProfile"));');
        } else if (window.currentProfile.role !== 'admin' && window.currentProfile.role !== 'guru') {
            console.log('   ❌ Role tidak sesuai (current:', window.currentProfile.role + ')');
            console.log('      → Login dengan akun Admin atau Guru');
        }
        if (!navigator.onLine) {
            console.log('   ❌ Offline');
            console.log('      → Cek koneksi internet');
        }
    }
}

console.log('\n=== END TEST ===');
