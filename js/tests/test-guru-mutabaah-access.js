const dashboardData = {
    halaqahs: [
        { id: 1, name: 'Halaqah Naufal Hudiya', guru: 'Naufal Hudiya' },
        { id: 2, name: 'Halaqah Alim Aswari', guru: 'Alim Aswari' }
    ],
    students: [
        { id: 1, name: 'Santri A', halaqah: 'Naufal Hudiya', total_points: 100, overall_ranking: 1 },
        { id: 2, name: 'Santri B', halaqah: 'Naufal Hudiya', total_points: 90, overall_ranking: 2 },
        { id: 3, name: 'Santri C', halaqah: 'Alim Aswari', total_points: 95, overall_ranking: 3 },
        { id: 4, name: 'Santri D', halaqah: 'Alim Aswari', total_points: 80, overall_ranking: 4 }
    ]
};

let currentProfile = {
    id: 101,
    full_name: 'Naufal Hudiya',
    role: 'guru'
};

function getStudentsForCurrentUser() {
    const user = currentProfile;
    if (!user || user.role === 'admin') {
        return dashboardData.students;
    }
    if (user.role === 'guru') {
        const rawName = user.full_name || user.name || '';
        const guruName = String(rawName).toLowerCase().replace(/^(ustadz|ust|u\.)\s*/i, '').trim();
        const taughtHalaqahs = dashboardData.halaqahs.filter(h => {
            if (!h || !h.guru) return false;
            const hGuru = String(h.guru).toLowerCase().replace(/^(ustadz|ust|u\.)\s*/i, '').trim();
            return hGuru === guruName || hGuru.includes(guruName) || guruName.includes(hGuru);
        });
        const taughtNames = taughtHalaqahs.map(h => {
            const name = h && h.name ? String(h.name) : '';
            return name.replace(/^Halaqah\s+/i, '').trim();
        });
        return dashboardData.students.filter(s => taughtNames.includes(String(s.halaqah)));
    }
    return dashboardData.students;
}

function getMutabaahSelectableStudentsForRole(role) {
    if (role === 'guru') {
        return getStudentsForCurrentUser();
    }
    return dashboardData.students;
}

function runTest(title, fn) {
    try {
        fn();
        console.log(`✅ ${title}`);
    } catch (e) {
        console.error(`❌ ${title}:`, e.message);
    }
}

runTest('Guru hanya melihat santri dari halaqahnya sendiri', () => {
    const guruStudents = getStudentsForCurrentUser();
    if (guruStudents.length === 0) {
        throw new Error('Guru tidak memiliki santri terfilter');
    }
    const invalid = guruStudents.filter(s => s.halaqah !== 'Naufal Hudiya');
    if (invalid.length > 0) {
        throw new Error('Guru melihat santri dari halaqah lain');
    }
});

runTest('Data peringkat hanya menampilkan santri relevan', () => {
    const ranking = dashboardData.students.slice().sort((a, b) => b.total_points - a.total_points);
    const guruStudents = getStudentsForCurrentUser();
    const guruIds = new Set(guruStudents.map(s => s.id));
    const filteredRanking = ranking.filter(s => guruIds.has(s.id));
    if (filteredRanking.length !== guruStudents.length) {
        throw new Error('Panjang ranking guru tidak sama dengan daftar santri guru');
    }
    const invalid = filteredRanking.filter(s => s.halaqah !== 'Naufal Hudiya');
    if (invalid.length > 0) {
        throw new Error('Ranking mengandung santri dari halaqah lain');
    }
});

runTest('Tidak ada data leak santri halaqah lain', () => {
    const guruStudents = getMutabaahSelectableStudentsForRole('guru');
    const leaked = guruStudents.filter(s => s.halaqah !== 'Naufal Hudiya');
    if (leaked.length > 0) {
        throw new Error('Mutabaah menampilkan santri dari halaqah lain');
    }
});

