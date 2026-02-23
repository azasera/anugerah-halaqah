// DEBUG IMPORT SYNC - Paste di Console SEBELUM import
// Script ini akan monitor kenapa sync di-skip saat import

console.log('🔍 === DEBUG IMPORT SYNC ===\n');

// 1. Check current state
console.log('1. Status saat ini:');
console.log('   - syncStudentsToSupabase:', typeof window.syncStudentsToSupabase);
console.log('   - dashboardData:', typeof dashboardData);
console.log('   - dashboardData.students:', dashboardData?.students?.length || 0);
console.log('   - currentProfile:', window.currentProfile ? '✅' : '❌');
console.log('   - Profile role:', window.currentProfile?.role || 'N/A');
console.log('   - Online:', navigator.onLine ? '✅' : '❌');
console.log('   - syncInProgress:', window.syncInProgress ? '✅' : '❌');

// 2. Wrap syncStudentsToSupabase to log calls
if (typeof window.syncStudentsToSupabase === 'function') {
    const originalSync = window.syncStudentsToSupabase;
    
    window.syncStudentsToSupabase = async function() {
        console.log('\n🔄 [DEBUG] syncStudentsToSupabase CALLED');
        console.log('   - Time:', new Date().toISOString());
        console.log('   - Students count:', dashboardData?.students?.length || 0);
        console.log('   - Profile:', window.currentProfile);
        console.log('   - Online:', navigator.onLine);
        console.log('   - syncInProgress:', window.syncInProgress);
        
        const result = await originalSync();
        
        console.log('\n📊 [DEBUG] syncStudentsToSupabase RESULT:', result);
        
        if (result.status === 'skipped_permission') {
            console.error('❌ SYNC SKIPPED: No permission');
            console.log('   Reason: currentProfile is', window.currentProfile);
            console.log('   Role:', window.currentProfile?.role);
            console.log('   Expected: admin or guru');
        } else if (result.status === 'skipped_empty') {
            console.error('❌ SYNC SKIPPED: Data empty');
            console.log('   dashboardData:', typeof dashboardData);
            console.log('   dashboardData.students:', dashboardData?.students?.length);
        } else if (result.status === 'skipped_offline') {
            console.error('❌ SYNC SKIPPED: Offline');
        } else if (result.status === 'skipped_in_progress') {
            console.error('❌ SYNC SKIPPED: Already in progress');
        } else if (result.status === 'success') {
            console.log('✅ SYNC SUCCESS!');
            console.log('   Count:', result.count);
        }
        
        return result;
    };
    
    console.log('\n✅ Wrapper installed!');
    console.log('Sekarang coba import santri, dan lihat log di Console.');
} else {
    console.error('\n❌ syncStudentsToSupabase NOT FOUND!');
    console.log('Fungsi tidak tersedia, tidak bisa debug.');
}

console.log('\n=== END DEBUG ===');
