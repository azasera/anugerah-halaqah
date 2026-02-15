// Script untuk menghapus poin negatif (penalty) dan memperbaiki data
// Jalankan script ini di Console browser jika ingin menghapus semua penalty

(function() {
    console.log('🔧 Memulai perbaikan poin negatif...');
    
    let removedCount = 0;
    let studentsFixed = 0;
    
    // 1. Iterasi semua santri
    dashboardData.students.forEach(student => {
        if (!student.setoran || student.setoran.length === 0) return;
        
        const initialCount = student.setoran.length;
        
        // Filter out negative points (penalties)
        // Keep only positive points or legitimate zero points
        // Remove 'Tidak Setor' or poin < 0
        const cleanSetoran = student.setoran.filter(s => {
            const isPenalty = s.poin < 0 || s.status === 'Tidak Setor' || s.isAutoPenalty === true;
            return !isPenalty;
        });
        
        const removed = initialCount - cleanSetoran.length;
        
        if (removed > 0) {
            student.setoran = cleanSetoran;
            removedCount += removed;
            studentsFixed++;
            
            // Recalculate total points
            student.total_points = cleanSetoran.reduce((sum, s) => sum + (Number(s.poin) || 0), 0);
            
            // Reset streak if needed (optional, logic depends on requirements)
            // For now, let's keep streak as is, or recalculate based on remaining setoran
            // Simple recalc:
            student.streak = 0; // Reset streak to be safe, or leave it. 
            // Better to leave streak recalculation to a separate logic or just let it be.
            // But if they had penalties, their streak was likely reset to 0 anyway.
            
            console.log(`✅ Fixed ${student.name}: Removed ${removed} penalties. New Points: ${student.total_points}`);
        }
    });
    
    if (removedCount > 0) {
        // 2. Recalculate rankings and stats
        if (typeof recalculateRankings === 'function') {
            recalculateRankings();
        }
        
        // 3. Save to localStorage
        StorageManager.save();
        
        // 4. Sync to Supabase if online
        if (typeof syncStudentsToSupabase === 'function' && navigator.onLine) {
            console.log('☁️ Syncing clean data to Supabase...');
            syncStudentsToSupabase();
        }
        
        // 5. Refresh UI
        if (typeof refreshAllData === 'function') {
            refreshAllData();
        }
        
        const msg = `✅ BERHASIL!\n\nMenghapus ${removedCount} data penalty dari ${studentsFixed} santri.\nSemua poin negatif telah dihapus.`;
        console.log(msg);
        alert(msg);
    } else {
        const msg = '✅ Tidak ditemukan poin negatif. Data sudah bersih.';
        console.log(msg);
        alert(msg);
    }
})();
