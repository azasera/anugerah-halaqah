// Fix Halaqah Name Mismatch
// Run this in browser console to fix nama halaqah yang tidak sinkron

async function fixHalaqahNameMismatch() {
    console.log('🔧 Starting Halaqah Name Mismatch Fix...\n');
    
    // Step 1: Check current data
    console.log('Step 1: Checking current data...');
    console.log('Halaqahs in localStorage:', dashboardData.halaqahs.length);
    
    dashboardData.halaqahs.forEach((h, index) => {
        console.log(`  ${index + 1}. ${h.name} (ID: ${h.id})`);
    });
    
    // Step 2: Force save to localStorage
    console.log('\nStep 2: Saving to localStorage...');
    StorageManager.save();
    console.log('✅ Saved to localStorage');
    
    // Step 3: Sync to Supabase
    console.log('\nStep 3: Syncing to Supabase...');
    
    if (typeof syncHalaqahsToSupabase === 'function') {
        try {
            await syncHalaqahsToSupabase();
            console.log('✅ Synced halaqahs to Supabase');
        } catch (error) {
            console.error('❌ Error syncing halaqahs:', error);
        }
    } else {
        console.warn('⚠️ syncHalaqahsToSupabase function not found');
    }
    
    // Step 4: Sync students (because halaqah name changed)
    console.log('\nStep 4: Syncing students...');
    
    if (typeof syncStudentsToSupabase === 'function') {
        try {
            await syncStudentsToSupabase();
            console.log('✅ Synced students to Supabase');
        } catch (error) {
            console.error('❌ Error syncing students:', error);
        }
    } else {
        console.warn('⚠️ syncStudentsToSupabase function not found');
    }
    
    // Step 5: Wait a bit for sync to complete
    console.log('\nStep 5: Waiting for sync to complete...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 6: Reload data from Supabase
    console.log('\nStep 6: Reloading data from Supabase...');
    
    if (typeof loadHalaqahsFromSupabase === 'function') {
        try {
            await loadHalaqahsFromSupabase();
            console.log('✅ Reloaded halaqahs from Supabase');
        } catch (error) {
            console.error('❌ Error loading halaqahs:', error);
        }
    }
    
    if (typeof loadStudentsFromSupabase === 'function') {
        try {
            await loadStudentsFromSupabase();
            console.log('✅ Reloaded students from Supabase');
        } catch (error) {
            console.error('❌ Error loading students:', error);
        }
    }
    
    // Step 7: Refresh UI
    console.log('\nStep 7: Refreshing UI...');
    if (typeof refreshAllData === 'function') {
        refreshAllData();
        console.log('✅ UI refreshed');
    }
    
    // Step 8: Verify
    console.log('\n✅ Fix completed!');
    console.log('\nCurrent halaqahs:');
    dashboardData.halaqahs.forEach((h, index) => {
        console.log(`  ${index + 1}. ${h.name} (ID: ${h.id})`);
    });
    
    console.log('\n📝 Next steps:');
    console.log('1. Refresh halaman (F5)');
    console.log('2. Cek apakah nama halaqah sudah benar');
    console.log('3. Jika masih salah, jalankan script ini lagi');
}

// Run the fix
fixHalaqahNameMismatch();
