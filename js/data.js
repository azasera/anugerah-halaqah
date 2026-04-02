// Data Management Module
const dashboardData = {
    halaqahs: [],
    students: [],
    stats: {
        totalStudents: 0,
        totalHalaqahs: 0,
        totalPoints: 0,
        avgPointsPerStudent: 0
    },
    tilawah: []
};

// Local Storage Management
const StorageManager = {
    save() {
        localStorage.setItem('halaqahData', JSON.stringify(dashboardData));
        if (typeof window !== 'undefined' && window.hasPendingLocalChanges) {
            localStorage.setItem('hasPendingLocalChanges', 'true');
        } else {
            localStorage.removeItem('hasPendingLocalChanges');
        }
    },

    load() {
        const saved = localStorage.getItem('halaqahData');
        if (!saved) return;
        try {
            const data = JSON.parse(saved);
            // Jangan Object.assign — jika key `students`/`halaqahs` tidak ada di JSON lama,
            // array lama di memori tidak pernah terhapus dan "hapus semua" tampak gagal.
            dashboardData.students = Array.isArray(data.students) ? data.students : [];
            dashboardData.halaqahs = Array.isArray(data.halaqahs) ? data.halaqahs : [];
            dashboardData.tilawah = Array.isArray(data.tilawah) ? data.tilawah : [];
            if (data.stats && typeof data.stats === 'object') {
                dashboardData.stats = {
                    totalStudents: Number(data.stats.totalStudents) || 0,
                    totalHalaqahs: Number(data.stats.totalHalaqahs) || 0,
                    totalPoints: Number(data.stats.totalPoints) || 0,
                    avgPointsPerStudent: data.stats.avgPointsPerStudent ?? '0'
                };
            }

            // Restore pending changes flag
            if (typeof window !== 'undefined') {
                window.hasPendingLocalChanges = localStorage.getItem('hasPendingLocalChanges') === 'true';
            }
        } catch (e) {
            console.error('StorageManager.load failed:', e);
        }
    },

    clear() {
        localStorage.removeItem('halaqahData');
    }
};

/**
 * Baru hapus semua data: load() kadang masih membaca halaqahData lama dari disk (race/tab lain),
 * lalu initSupabase melewati fetch — data lama tetap di memori. Paksa kosong selama flag aktif.
 */
/** Selama flag ini ada, muat ulang dari Supabase diblokir (hindari data "muncul lagi" setelah hapus). Hapus flag saat tambah/import santri. */
function enforcePostDeleteLocalState() {
    if (!localStorage.getItem('_deleteJustDone')) return;

    dashboardData.students = [];
    dashboardData.halaqahs = [];
    dashboardData.tilawah = [];
    dashboardData.stats = {
        totalStudents: 0,
        totalHalaqahs: 0,
        totalPoints: 0,
        avgPointsPerStudent: '0'
    };
    try {
        localStorage.setItem('halaqahData', JSON.stringify(dashboardData));
    } catch (e) {
        console.warn('enforcePostDeleteLocalState: gagal simpan', e);
    }
    if (typeof window !== 'undefined') {
        window.hasPendingLocalChanges = false;
    }
}

/**
 * Normalisasi alias lembaga ke key kanonik:
 * SD/SDITA -> SDITA, SMP/SMPITA -> SMPITA, SMA/SMAITA -> SMAITA, MTA -> MTA
 */
function normalizeLembagaKey(lembagaRaw) {
    const raw = String(lembagaRaw || '').trim().toUpperCase();
    if (!raw) return '';
    if (raw === 'SD' || raw === 'SDITA') return 'SDITA';
    if (raw === 'SMP' || raw === 'SMPITA') return 'SMPITA';
    if (raw === 'SMA' || raw === 'SMAITA') return 'SMAITA';
    if (raw === 'MTA' || raw.startsWith('MTA')) return 'MTA';
    return raw;
}

/**
 * Pintar mendeteksi lembaga dari halaqah atau kelas jika kolom lembaga kosong.
 * Digunakan untuk filter dan ranking agar konsisten di slider/dashboard.
 */
function detectStudentLembaga(s) {
    if (!s) return '';
    let sLembaga = normalizeLembagaKey(s.lembaga || '');
    if (sLembaga) return sLembaga;

    const sKelas = (s.kelas || '').toString().toLowerCase();
    const sHalaqah = (s.halaqah || '').toString().toLowerCase();

    // 1. Detect from halaqah name
    const h = sHalaqah;
    if (h.includes('sdita')) sLembaga = 'SDITA';
    else if (h.includes('smpita')) sLembaga = 'SMPITA';
    else if (h.includes('smaita') || h.includes('sma')) sLembaga = 'SMAITA';
    else if (h.includes('mta')) sLembaga = 'MTA';
    else {
        // Detect by grade numbers in halaqah name
        const matchH = h.match(/\b(10|11|12)[abcde]?\b/i);
        if (matchH) sLembaga = 'SMAITA';
        else if (h.match(/\b(7|8|9)[abcde]?\b/i)) sLembaga = 'SMPITA';
        else if (h.match(/\b(1|2|3|4|5|6)[abcde]?\b/i)) sLembaga = 'SDITA';
    }

    // 2. Detect from kelas
    if (!sLembaga) {
        const k = sKelas;
        if (k.includes('sdita')) sLembaga = 'SDITA';
        else if (k.includes('smpita')) sLembaga = 'SMPITA';
        else if (k.includes('smaita') || k.includes('sma')) sLembaga = 'SMAITA';
        else if (k.includes('mta')) sLembaga = 'MTA';
        else {
            // Detect by grade numbers
            const matchK = k.match(/\b(10|11|12)\b/);
            if (matchK) sLembaga = 'SMAITA';
            else if (k.match(/\b(7|8|9)\b/)) sLembaga = 'SMPITA';
            else if (k.match(/\b(1|2|3|4|5|6)\b/)) sLembaga = 'SDITA';
        }
    }

    // Kosong = MTA
    return normalizeLembagaKey(sLembaga) || 'MTA';
}

// Data filtering and sorting functions
function filterStudents(searchTerm, halaqahFilter = 'all', lembagaFilter = 'all', genderFilter = 'all') {
    let filtered = dashboardData.students;

    // Enforce role-based data restriction for Guru and Ortu
    if (typeof currentProfile !== 'undefined' && currentProfile && 
       (currentProfile.role === 'guru' || currentProfile.role === 'ortu')) {
        if (typeof getStudentsForCurrentUser === 'function') {
            const restricted = getStudentsForCurrentUser();
            // If getStudentsForCurrentUser returns empty (meaning no matched students/halaqah), 
            // we should strictly return empty, not fallback to all.
            filtered = restricted;
        }
    }

    if (searchTerm) {
        filtered = filtered.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    if (halaqahFilter !== 'all') {
        filtered = filtered.filter(s => s.halaqah === halaqahFilter);
    }

    if (lembagaFilter !== 'all') {
        // Handle filter khusus SDITA_1, SDITA_2, etc. (jika ada dropdown khusus tingkat)
        if (lembagaFilter.startsWith('SDITA_')) {
             const parts = lembagaFilter.split('_');
             const kelasTarget = parts.length > 1 ? parseInt(parts[1], 10) : null;
             filtered = filtered.filter(s => {
                 if (detectStudentLembaga(s) !== 'SDITA') return false;
                 if (!kelasTarget || Number.isNaN(kelasTarget)) return true;
                 const sKelas = (s.kelas || '').toString().toLowerCase();
                 const match = sKelas.match(/\d+/);
                 return (match ? parseInt(match[0], 10) : null) === kelasTarget;
             });
        } else {
             const key = normalizeLembagaKey(lembagaFilter);
             filtered = filtered.filter(s => detectStudentLembaga(s) === key);
        }
    }

    if (genderFilter !== 'all') {
        filtered = filtered.filter(s => {
            let sg = (s.jenis_kelamin || '').toUpperCase().trim();
            if (sg.includes('IKHWAN') || sg.includes('L') || sg.includes('PUTRA') || sg === 'LAKI-LAKI') sg = 'L';
            else if (sg.includes('AKHWAT') || sg.includes('P') || sg.includes('PUTRI') || sg === 'PEREMPUAN') sg = 'P';
            return sg === genderFilter;
        });
    }

    return filtered;
}

function sortStudents(students, sortBy = 'rank') {
    const sorted = [...students];

    switch (sortBy) {
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

/** Samakan "Halaqah 5A", "5A", "halaqah 5a" untuk hitung anggota & filter. */
function normalizeHalaqahLabel(name) {
    if (!name) return '';
    return String(name)
        .replace(/^Halaqah\s+/i, '')
        .replace(/^(Ustadz|Ustadzah|Ust\.?|U\.)\s+/i, '')
        .trim()
        .toLowerCase();
}

function getStudentsByHalaqah(halaqahName) {
    const key = normalizeHalaqahLabel(halaqahName);
    return dashboardData.students.filter(s => normalizeHalaqahLabel(s.halaqah) === key);
}

/** Anggota/poin/rata-rata dari santri aktual — jangan percaya halaqah.members dari DB jika tidak sinkron. */
function getLiveHalaqahStats(halaqah) {
    if (!halaqah) return { members: 0, points: 0, avgPoints: '0' };
    const members = typeof getStudentsByHalaqah === 'function'
        ? getStudentsByHalaqah(halaqah.name)
        : [];
    const points = members.reduce((sum, m) => sum + (Number(m.total_points) || 0), 0);
    const n = members.length;
    return {
        members: n,
        points,
        avgPoints: n > 0 ? (points / n).toFixed(1) : '0'
    };
}

/** Nama singkat seperti di form: "5A" dari "Halaqah 5A". */
function shortHalaqahNameFromRecord(h) {
    return String(h?.name || '').replace(/^Halaqah\s+/i, '').trim();
}

/** Cari baris halaqah dari nilai santri (singkat/panjang/format bebas). */
function findHalaqahForStudent(student) {
    const label = typeof student === 'object' && student != null ? student.halaqah : student;
    const key = normalizeHalaqahLabel(label);
    if (!key || key === 'tidak ada') return null;
    return dashboardData.halaqahs.find(h => normalizeHalaqahLabel(h.name) === key) || null;
}

/**
 * Samakan field santri ke nama singkat yang sama dengan opsi form; santri tanpa halaqah valid → "Tidak Ada".
 * Menghindari anggota 0/1/2 tidak konsisten karena format string berbeda di DB/import.
 */
function reconcileStudentHalaqahReferences() {
    if (!Array.isArray(dashboardData.students)) return;

    if (!dashboardData.halaqahs.length) {
        dashboardData.students.forEach(s => {
            const k = normalizeHalaqahLabel(s.halaqah);
            if (k && k !== 'tidak ada') s.halaqah = 'Tidak Ada';
        });
        return;
    }

    dashboardData.students.forEach(s => {
        const raw = s.halaqah;
        const k = normalizeHalaqahLabel(raw);
        if (!k || k === 'tidak ada') return;

        const h = dashboardData.halaqahs.find(hx => normalizeHalaqahLabel(hx.name) === k);
        if (h) {
            const short = shortHalaqahNameFromRecord(h);
            if (String(raw) !== String(short)) s.halaqah = short;
        } else {
            s.halaqah = 'Tidak Ada';
        }
    });
}

function calculateStats() {
    const stats = {
        totalStudents: dashboardData.students.length,
        totalHalaqahs: dashboardData.halaqahs.length,
        totalPoints: dashboardData.students.reduce((sum, s) => {
            const points = Number(s.total_points) || 0;
            return sum + points;
        }, 0),
        avgPointsPerStudent: 0
    };

    // Prevent NaN when no students
    if (stats.totalStudents > 0) {
        stats.avgPointsPerStudent = (stats.totalPoints / stats.totalStudents).toFixed(1);
    } else {
        stats.avgPointsPerStudent = '0';
    }

    dashboardData.stats = stats;

    return stats;
}

// Initialize data
StorageManager.load();
enforcePostDeleteLocalState();
recalculateRankings();

function recalculateRankings() {
    reconcileStudentHalaqahReferences();

    // Group students by Lembaga and Jenis Kelamin for partitioned rankings
    const groups = {};
    
    // Default fallback array for students to avoid NaN errors
    dashboardData.students.forEach(student => {
        student.overall_ranking = 0;
        student.daily_ranking = 0;
        
        let lembaga = detectStudentLembaga(student) || 'MTA';
        let gender = (student.jenis_kelamin || '').toUpperCase().trim();
        if (gender.includes('IKHWAN') || gender.includes('L') || gender.includes('PUTRA') || gender === 'LAKI-LAKI') {
            gender = 'L';
        } else if (gender.includes('AKHWAT') || gender.includes('P') || gender.includes('PUTRI') || gender === 'PEREMPUAN') {
            gender = 'P';
        } else {
            gender = 'UNKNOWN'; // Unassigned fallback
        }
        
        const key = `${lembaga}_${gender}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(student);
    });

    // Rank separately within each group based on total points
    Object.values(groups).forEach(group => {
        group.sort((a, b) => b.total_points - a.total_points);
        group.forEach((student, index) => {
            student.overall_ranking = index + 1;
            student.daily_ranking = index + 1; // Assuming daily_ranking defaults to overall
        });
    });

    // Sort the entire list globally for rendering order, but preserve their partitioned rank
    dashboardData.students.sort((a, b) => {
        if (a.overall_ranking !== b.overall_ranking) {
            return a.overall_ranking - b.overall_ranking;
        }
        return b.total_points - a.total_points;
    });

    // Recalculate halaqah stats (anggota dari santri aktual, bukan kolom members dari DB)
    dashboardData.halaqahs.forEach(halaqah => {
        const members = getStudentsByHalaqah(halaqah.name);

        halaqah.members = members.length;
        // FIX: Ensure total_points is a number, default to 0 if undefined/null/NaN
        halaqah.points = members.reduce((sum, m) => {
            const points = Number(m.total_points) || 0;
            return sum + points;
        }, 0);
        halaqah.avgPoints = halaqah.members > 0 ? (halaqah.points / halaqah.members).toFixed(1) : '0';
    });

    // Sort halaqahs by points
    dashboardData.halaqahs.sort((a, b) => b.points - a.points);

    // Update halaqah rankings
    dashboardData.halaqahs.forEach((halaqah, index) => {
        halaqah.rank = index + 1;
    });

    calculateStats();

    // FIX: Jangan panggil autoSync di sini — ini menyebabkan data yang sedang dihapus
    // ter-upload kembali ke Supabase. autoSync dipanggil via setInterval dan secara
    // eksplisit oleh fungsi yang memang mau sync.
    // (Baris autoSync() dihapus dari sini)
}

function refreshAllData() {
    if (typeof recalculateRankings === 'function') {
        recalculateRankings();
    }

    // Guard: Check if render functions exist before calling
    if (typeof renderStats === 'function') {
        renderStats();
    }

    if (typeof renderBestHalaqah === 'function') {
        renderBestHalaqah();
    }

    if (typeof renderHalaqahRankings === 'function') {
        renderHalaqahRankings();
    }

    if (typeof renderFilters === 'function') {
        renderFilters();
    }

    if (typeof renderSantri === 'function') {
        renderSantri();
    }

    if (typeof renderSlider === 'function') {
        renderSlider();
    }

    // Refresh Mutaba'ah Dashboard if visible
    if (typeof renderMutabaahDashboard === 'function') {
        const mutabaahSection = document.getElementById('mutabaah');
        if (mutabaahSection && !mutabaahSection.classList.contains('hidden')) {
            renderMutabaahDashboard();
        }
    }

    // Refresh admin settings if visible (to update inline tabs)
    const settingsContainer = document.getElementById('settingsContainer');
    if (settingsContainer && settingsContainer.innerHTML.trim() !== '') {
        // Only re-render if it's already rendered
        if (typeof renderAdminSettings === 'function') {
            renderAdminSettings();
        }
    }

    // Render absence widget on dashboard
    if (typeof renderAbsenceWidget === 'function') {
        renderAbsenceWidget();
    }

    // Render tilawah dashboard if visible
    const tilawahContainer = document.getElementById('tilawahContainer');
    if (tilawahContainer && tilawahContainer.innerHTML.trim() !== '') {
        if (typeof renderTilawahDashboard === 'function') {
            renderTilawahDashboard();
        }
    }

    // Don't re-render absence tracker to prevent flickering
    // It will be rendered once on init
}

window.recalculateRankings = recalculateRankings;
window.refreshAllData = refreshAllData;
window.enforcePostDeleteLocalState = enforcePostDeleteLocalState;
window.normalizeLembagaKey = normalizeLembagaKey;
window.detectStudentLembaga = detectStudentLembaga;
window.clearPostDeleteRemoteBlock = function () {
    localStorage.removeItem('_deleteJustDone');
};
window.dashboardData = dashboardData; // Export for debugging and external access
