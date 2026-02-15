// Script untuk memperbaiki perhitungan poin halaqah
// Jalankan di Console browser

(function() {
    console.log('🔧 Memperbaiki perhitungan poin halaqah...');
    
    // 1. Pastikan semua total_points adalah number
    dashboardData.students.forEach(student => {
        if (typeof student.total_points !== 'number' || isNaN(student.total_points)) {
            console.log(`⚠️ Fixing ${student.name}: ${student.total_points} → 0`);
            student.total_points = 0;
        }
    });
    
    // 2. Recalculate halaqah points
    dashboardData.halaqahs.forEach(halaqah => {
        const halaqahName = halaqah.name.replace('Halaqah ', '');
        const members = dashboardData.students.filter(s => s.halaqah === halaqahName);
        
        const totalPoints = members.reduce((sum, m) => {
            const points = Number(m.total_points) || 0;
            return sum + points;
        }, 0);
        
        halaqah.members = members.length;
        halaqah.points = totalPoints;
        halaqah.avgPoints = members.length > 0 ? (totalPoints / members.length).toFixed(1) : '0';
        
        console.log(`📊 ${halaqah.name}:`);
        console.log(`   Anggota: ${halaqah.members}`);
        console.log(`   Total Poin: ${halaqah.points}`);
        console.log(`   Rata-rata: ${halaqah.avgPoints}`);
    });
    
    // 3. Sort and rank
    dashboardData.halaqahs.sort((a, b) => b.points - a.points);
    dashboardData.halaqahs.forEach((halaqah, index) => {
        halaqah.rank = index + 1;
    });
    
    // 4. Recalculate stats
    const totalPoints = dashboardData.students.reduce((sum, s) => sum + (Number(s.total_points) || 0), 0);
    dashboardData.stats.totalPoints = totalPoints;
    dashboardData.stats.avgPointsPerStudent = dashboardData.students.length > 0 
        ? (totalPoints / dashboardData.students.length).toFixed(1) 
        : '0';
    
    console.log('📊 Stats:');
    console.log(`   Total Poin: ${dashboardData.stats.totalPoints}`);
    console.log(`   Rata-rata: ${dashboardData.stats.avgPointsPerStudent}`);
    
    // 5. Save to localStorage
    StorageManager.save();
    
    console.log('✅ Data disimpan ke localStorage');
    
    // 6. Refresh UI
    if (typeof refreshAllData === 'function') {
        refreshAllData();
        console.log('✅ UI di-refresh');
    }
    
    alert('✅ Perhitungan poin halaqah sudah diperbaiki!\n\nSemua poin sekarang benar.');
})();
