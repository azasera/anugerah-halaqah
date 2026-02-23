// Debug Sync Console
// Paste script ini di Console browser (F12) saat di dashboard.html untuk debug masalah sync

console.log('=== DEBUG SYNC PERMISSION ===');

// 0. Check if supabase.js is loaded
console.log('\n0. CHECK FILE LOADING:');
console.log('   - js/supabase.js loaded?', typeof window.supabaseClient !== 'undefined');
console.log('   - js/data.js loaded?', typeof window.dashboardData !== 'undefined');
console.log('   - js/auth.js loaded?', typeof window.handleLogin !== 'undefined');

// List all window functions related to sync
console.log('\n   Available sync functions:');
const syncFunctions = Object.keys(window).filter(key => key.toLowerCase().includes('sync'));
syncFunctions.forEach(fn => {
    console.log('   -', fn, ':', typeof window[fn]);
});

// 1. Check current profile
console.log('\n1. CURRENT PROFILE:');
if (window.currentProfile) {
    console.log('✅ Profile found:', window.currentProfile);
    console.log('   - Name:', window.currentProfile.name);
    console.log('   - Email:', window.currentProfile.email);
    console.log('   - Role:', window.currentProfile.role);
    
    if (window.currentProfile.role === 'admin' || window.currentProfile.role === 'guru') {
        console.log('   ✅ Role OK - Bisa sync ke Supabase');
    } else {
        console.log('   ❌ Role TIDAK OK - Tidak bisa sync (role:', window.currentProfile.role + ')');
    }
} else {
    console.log('❌ No profile found in window.currentProfile');
    
    // Try localStorage
    const storedProfile = localStorage.getItem('currentProfile');
    if (storedProfile) {
        console.log('   Found in localStorage:', JSON.parse(storedProfile));
        console.log('   TIP: Run this to load it:');
        console.log('   window.currentProfile = JSON.parse(localStorage.getItem("currentProfile"));');
    } else {
        console.log('   Not found in localStorage either');
    }
}

// 2. Check Supabase config
console.log('\n2. SUPABASE CONFIG:');
if (window.supabaseClient) {
    console.log('✅ Supabase client exists');
    console.log('   - URL:', window.SUPABASE_URL);
    
    if (window.SUPABASE_URL && window.SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
        console.log('   ✅ Supabase configured');
    } else {
        console.log('   ❌ Supabase NOT configured (using default URL)');
    }
} else {
    console.log('❌ Supabase client NOT found');
    console.log('   Check if js/supabase.js loaded correctly');
    console.log('   Check Console for errors during page load');
}

// 3. Check online status
console.log('\n3. ONLINE STATUS:');
console.log(navigator.onLine ? '✅ Online' : '❌ Offline');

// 4. Check sync functions
console.log('\n4. SYNC FUNCTIONS:');
console.log('   - autoSync:', typeof window.autoSync);
console.log('   - syncStudentsToSupabase:', typeof window.syncStudentsToSupabase);
console.log('   - syncHalaqahsToSupabase:', typeof window.syncHalaqahsToSupabase);

if (typeof window.syncStudentsToSupabase === 'undefined') {
    console.log('\n   ❌ CRITICAL: syncStudentsToSupabase NOT FOUND!');
    console.log('   Possible causes:');
    console.log('   1. js/supabase.js failed to load (check Network tab)');
    console.log('   2. JavaScript error in supabase.js (check Console for errors)');
    console.log('   3. File path wrong or file missing');
    console.log('\n   TIP: Check browser Console for errors when page loads');
}

// 5. Check data
console.log('\n5. DATA:');
if (window.dashboardData && window.dashboardData.students) {
    console.log('✅ dashboardData.students exists');
    console.log('   - Total students:', window.dashboardData.students.length);
} else {
    console.log('❌ dashboardData.students NOT found');
}

// 6. Test sync
console.log('\n6. TEST SYNC:');

if (typeof window.syncStudentsToSupabase === 'function') {
    console.log('Running syncStudentsToSupabase()...');
    
    window.syncStudentsToSupabase().then(result => {
        console.log('Sync result:', result);
        
        if (result.status === 'success') {
            console.log('✅ SYNC BERHASIL!');
        } else if (result.status === 'skipped_permission') {
            console.log('❌ SYNC GAGAL: Tidak ada permission');
            console.log('   Penyebab: Role bukan admin/guru atau currentProfile tidak terdeteksi');
            console.log('   Solusi: Pastikan window.currentProfile.role = "admin" atau "guru"');
        } else if (result.status === 'skipped_offline') {
            console.log('❌ SYNC GAGAL: Offline');
        } else {
            console.log('⚠️ Status:', result.status);
        }
    }).catch(err => {
        console.error('❌ SYNC ERROR:', err);
    });
} else {
    console.log('❌ syncStudentsToSupabase function NOT found');
    console.log('\n   CRITICAL ERROR: Cannot test sync because function is missing!');
    console.log('   Please check:');
    console.log('   1. Open Network tab (F12) and refresh page');
    console.log('   2. Check if js/supabase.js loads successfully (status 200)');
    console.log('   3. Check Console tab for JavaScript errors');
    console.log('   4. Verify js/supabase.js file exists and is not corrupted');
}

console.log('\n=== END DEBUG ===');
console.log('\nCara menggunakan hasil debug:');
console.log('1. Jika "syncStudentsToSupabase NOT found" -> Cek Network tab, pastikan js/supabase.js ter-load');
console.log('2. Jika "No profile found" -> Coba refresh halaman atau login ulang');
console.log('3. Jika "Role TIDAK OK" -> Login dengan akun admin/guru');
console.log('4. Jika "Supabase NOT configured" -> Cek js/settings.js');
console.log('5. Jika "Offline" -> Cek koneksi internet');
