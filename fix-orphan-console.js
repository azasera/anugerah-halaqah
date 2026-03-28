// FIX ORPHAN DATA - Jalankan di Console Browser
// Buka dashboard.html, tekan F12, paste script ini di Console

console.log('🔧 Starting Orphan Data Cleanup...');

// Step 1: Get Supabase data with retry
async function getSupabaseData(retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Attempt ${i + 1}/${retries}: Fetching from Supabase...`);
            
            const { data, error } = await window.supabaseClient
                .from('students')
                .select('id')
                .limit(2000);
            
            if (error) throw error;
            
            console.log('✅ Fetched', data.length, 'students from Supabase');
            return data;
        } catch (error) {
            console.error(`❌ Attempt ${i + 1} failed:`, error.message);
            if (i === retries - 1) throw error;
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

// Step 2: Remove orphan data
async function removeOrphanData() {
    try {
        console.log('='.repeat(50));
        console.log('🗑️ REMOVING ORPHAN DATA');
        console.log('='.repeat(50));
        
        // Get Supabase IDs
        const supabaseStudents = await getSupabaseData();
        const supabaseIds = new Set(supabaseStudents.map(s => parseInt(s.id)));
        
        console.log('Supabase has', supabaseIds.size, 'students');
        console.log('Local has', dashboardData.students.length, 'students');
        
        // Filter local data
        const beforeCount = dashboardData.students.length;
        const removed = [];
        
        dashboardData.students = dashboardData.students.filter(s => {
            const keep = supabaseIds.has(parseInt(s.id));
            if (!keep) {
                removed.push({ id: s.id, name: s.name, halaqah: s.halaqah });
            }
            return keep;
        });
        
        const afterCount = dashboardData.students.length;
        const removedCount = beforeCount - afterCount;
        
        console.log('='.repeat(50));
        console.log('📊 RESULTS:');
        console.log('Before:', beforeCount, 'students');
        console.log('After:', afterCount, 'students');
        console.log('Removed:', removedCount, 'students');
        console.log('='.repeat(50));
        
        if (removed.length > 0) {
            console.log('🗑️ Removed students:');
            removed.forEach((s, idx) => {
                console.log(`  ${idx + 1}. ID: ${s.id} - ${s.name} (${s.halaqah})`);
            });
        }
        
        // Save
        console.log('💾 Saving to localStorage...');
        StorageManager.save();
        
        console.log('🔄 Recalculating rankings...');
        recalculateRankings();
        
        console.log('🎨 Refreshing UI...');
        refreshAllData();
        
        console.log('='.repeat(50));
        console.log('✅ CLEANUP COMPLETED!');
        console.log('Local now has', dashboardData.students.length, 'students');
        console.log('='.repeat(50));
        
        return {
            before: beforeCount,
            after: afterCount,
            removed: removedCount,
            removedList: removed
        };
        
    } catch (error) {
        console.error('='.repeat(50));
        console.error('❌ CLEANUP FAILED!');
        console.error('Error:', error.message);
        console.error('='.repeat(50));
        throw error;
    }
}

// Run the cleanup
removeOrphanData().then(result => {
    console.log('✅ Done! Removed', result.removed, 'orphan students');
}).catch(error => {
    console.error('❌ Failed:', error.message);
});
