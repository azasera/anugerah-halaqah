// Data Management Module
const dashboardData = {
    halaqahs: [],
    students: [],
    stats: {
        totalStudents: 0,
        totalHalaqahs: 0,
        totalPoints: 0,
        avgPointsPerStudent: 0
    }
};

// Local Storage Management
const StorageManager = {
    save() {
        localStorage.setItem('halaqahData', JSON.stringify(dashboardData));
    },
    
    load() {
        const saved = localStorage.getItem('halaqahData');
        if (saved) {
            const data = JSON.parse(saved);
            Object.assign(dashboardData, data);
        }
    },
    
    clear() {
        localStorage.removeItem('halaqahData');
    }
};

// Data filtering and sorting functions
function filterStudents(searchTerm, halaqahFilter = 'all', lembagaFilter = 'all') {
    let filtered = dashboardData.students;
    
    if (searchTerm) {
        filtered = filtered.filter(s => 
            s.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    if (halaqahFilter !== 'all') {
        filtered = filtered.filter(s => s.halaqah === halaqahFilter);
    }

    if (lembagaFilter !== 'all') {
        filtered = filtered.filter(s => s.lembaga === lembagaFilter);
    }
    
    return filtered;
}

function sortStudents(students, sortBy = 'rank') {
    const sorted = [...students];
    
    switch(sortBy) {
        case 'rank':
            return sorted.sort((a, b) => a.overall_ranking - b.overall_ranking);
        case 'points':
            return sorted.sort((a, b) => b.total_points - a.total_points);
        case 'streak':
            return sorted.sort((a, b) => b.streak - a.streak);
        case 'name':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        default:
            return sorted;
    }
}

function getTopHalaqah() {
    return dashboardData.halaqahs[0];
}

function getStudentsByHalaqah(halaqahName) {
    return dashboardData.students.filter(s => s.halaqah === halaqahName);
}

function calculateStats() {
    const stats = {
        totalStudents: dashboardData.students.length,
        totalHalaqahs: dashboardData.halaqahs.length,
        totalPoints: dashboardData.students.reduce((sum, s) => sum + s.total_points, 0),
        avgPointsPerStudent: 0
    };
    
    // Prevent NaN when no students
    if (stats.totalStudents > 0) {
        stats.avgPointsPerStudent = (stats.totalPoints / stats.totalStudents).toFixed(1);
    } else {
        stats.avgPointsPerStudent = 0;
    }
    
    dashboardData.stats = stats;
    
    return stats;
}

// Initialize data
StorageManager.load();
calculateStats();


function recalculateRankings() {
    // Sort students by points
    dashboardData.students.sort((a, b) => b.total_points - a.total_points);
    
    // Update rankings
    dashboardData.students.forEach((student, index) => {
        student.overall_ranking = index + 1;
        student.daily_ranking = index + 1;
    });
    
    // Recalculate halaqah stats
    dashboardData.halaqahs.forEach(halaqah => {
        const halaqahName = halaqah.name.replace('Halaqah ', '');
        const members = dashboardData.students.filter(s => s.halaqah === halaqahName);
        
        halaqah.members = members.length;
        halaqah.points = members.reduce((sum, m) => sum + m.total_points, 0);
        halaqah.avgPoints = halaqah.members > 0 ? (halaqah.points / halaqah.members).toFixed(1) : 0;
    });
    
    // Sort halaqahs by points
    dashboardData.halaqahs.sort((a, b) => b.points - a.points);
    
    // Update halaqah rankings
    dashboardData.halaqahs.forEach((halaqah, index) => {
        halaqah.rank = index + 1;
    });
    
    calculateStats();
    
    // Sync to Supabase
    if (window.autoSync) {
        autoSync();
    }
}

function refreshAllData() {
    renderStats();
    renderBestHalaqah();
    renderHalaqahRankings();
    renderFilters();
    renderSantri();
    // Don't re-render absence tracker to prevent flickering
    // It will be rendered once on init
}

window.recalculateRankings = recalculateRankings;
window.refreshAllData = refreshAllData;
