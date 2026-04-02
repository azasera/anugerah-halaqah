// UI Rendering Module
//
function formatHafalan(value) {
    const n = Number(value);
    if (Number.isNaN(n) || n <= 0) return '0';
    const fixed = n.toFixed(2);
    return fixed.replace(/\.?0+$/, '');
}

function getHafalanProgressPercent(value, targetJuz = 30) {
    const n = Number(value);
    const target = Number(targetJuz) || 30;
    if (Number.isNaN(n) || n <= 0) return 0;
    const percent = (n / target) * 100;
    if (percent < 0) return 0;
    if (percent > 100) return 100;
    return Math.round(percent);
}

function getTargetHafalanJuz(student) {
    if (!student) return 30;

    const lembaga = (student.lembaga || 'MTA').toUpperCase();
    const kelasRaw = (student.kelas || '').toString().toLowerCase();
    const match = kelasRaw.match(/\d+/);
    const kelasNum = match ? parseInt(match[0], 10) : null;

    if (lembaga === 'SDITA') {
        if (kelasNum === 1) return 0.55;
        if (kelasNum === 2) return 1.3;
        if (kelasNum === 3) return 2.15;
        if (kelasNum === 4) return 3.3;
        if (kelasNum === 5) return 4.45;
        if (kelasNum === 6) return 5;
        return 5;
    }

    if (lembaga === 'SMPITA') {
        if (kelasNum === 7) return 1.5;
        if (kelasNum === 8) return 3.5;
        if (kelasNum === 9) return 5;
        return 5;
    }

    if (lembaga === 'SMAITA') {
        const kategoriStr = String(student.kategori || '').toLowerCase();
        const statusStr = String(student.status || '').toLowerCase();
        const kategoriHasAlumni = kategoriStr.includes('alumni');
        const kategoriHasNon = kategoriStr.includes('non') || kategoriStr.includes('bukan');
        const statusHasAlumni = statusStr.includes('alumni');
        const statusHasNon = statusStr.includes('non') || statusStr.includes('bukan');
        const isAlumni = student.is_alumni === true ||
            ((kategoriHasAlumni || statusHasAlumni) && !(kategoriHasNon || statusHasNon));

        if (kelasNum === 10) return isAlumni ? 6.5 : 1.5;
        if (kelasNum === 11) return isAlumni ? 8.5 : 3.5;
        if (kelasNum === 12) return isAlumni ? 10 : 5;
        return isAlumni ? 10 : 5;
    }

    return 30;
}

let currentSort = 'rank';
let currentHalaqahFilter = 'all';
let currentLembagaFilter = 'all';
let currentGenderFilter = 'all';

function generateStatsHTML() {
    let stats = calculateStats();

    // REMOVED: Filter by Lembaga for Parents - Now parents can see full statistics
    // Parents can now see complete overview of all students and halaqahs
    
    return `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="glass rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div class="text-slate-500 text-xs font-bold uppercase mb-1">Total Santri</div>
                <div class="text-2xl font-bold text-slate-800">${stats.totalStudents}</div>
            </div>
            <div class="glass rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div class="text-slate-500 text-xs font-bold uppercase mb-1">Total Halaqah</div>
                <div class="text-2xl font-bold text-slate-800">${stats.totalHalaqahs}</div>
            </div>
            <div class="glass rounded-2xl p-4 border border-emerald-200 bg-emerald-50/50 shadow-sm hover:shadow-md transition-shadow">
                <div class="text-emerald-600 text-xs font-bold uppercase mb-1">Total Poin</div>
                <div class="text-2xl font-bold text-emerald-700">${stats.totalPoints}</div>
            </div>
            <div class="glass rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div class="text-slate-500 text-xs font-bold uppercase mb-1">Rata-rata</div>
                <div class="text-2xl font-bold text-slate-800">${stats.avgPointsPerStudent}</div>
            </div>
        </div>
    `;
}

function renderStats() {
    const container = document.getElementById('statsContainer');
    if (!container) return;

    container.innerHTML = generateStatsHTML();
}

function renderBestHalaqah() {
    const container = document.getElementById('bestHalaqahBanner');
    if (!container) return;

    // Get best halaqah (rank 1)
    let bestHalaqah = dashboardData.halaqahs.find(h => h.rank === 1);

    // REMOVED: Filter by Lembaga for Parents - Now parents can see best halaqah overall

    if (!bestHalaqah) {
        // No halaqah data, hide banner
        container.style.display = 'none';
        return;
    }

    const isLoggedIn = typeof currentProfile !== 'undefined' && currentProfile;
    const live = typeof getLiveHalaqahStats === 'function'
        ? getLiveHalaqahStats(bestHalaqah)
        : { members: bestHalaqah.members, points: bestHalaqah.points, avgPoints: bestHalaqah.avgPoints };
    const membersChip = isLoggedIn
        ? `<span class="bg-emerald-800/30 border border-emerald-700/30 px-3 py-1 rounded-full">
                        ${live.members} Anggota
                    </span>`
        : '';

    container.style.display = 'block';
    container.innerHTML = `
        <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div class="text-center md:text-left space-y-4">
                <span class="inline-flex items-center px-4 py-1.5 rounded-full bg-accent-gold/10 border border-accent-gold/20 text-accent-gold text-xs font-bold uppercase tracking-widest">
                    🏆 Pencapaian Hari Ini
                </span>
                <h2 class="font-display font-extrabold text-4xl md:text-6xl tracking-tight text-white">
                    Halaqah Terbaik
                </h2>
                <div class="flex flex-col md:flex-row items-center gap-4">
                    <span class="text-accent-gold font-display font-black text-3xl md:text-5xl drop-shadow-lg">
                        ${bestHalaqah.name}
                    </span>
                </div>
                <div class="flex items-center gap-4 text-sm text-emerald-100">
                    <span class="bg-emerald-800/30 border border-emerald-700/30 px-3 py-1 rounded-full">
                        ${live.points} Poin
                    </span>
                    ${membersChip}
                    <span class="bg-emerald-800/30 border border-emerald-700/30 px-3 py-1 rounded-full">
                        Rata-rata: ${live.avgPoints} poin
                    </span>
                </div>
            </div>
            <div class="animate-float">
                <div class="relative">
                    <div class="absolute inset-0 bg-accent-gold blur-3xl opacity-20"></div>
                    <svg class="w-32 h-32 md:w-48 md:h-48 text-accent-gold drop-shadow-2xl" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                    </svg>
                </div>
            </div>
        </div>
    `;
}

function renderHalaqahRankings() {
    const container = document.getElementById('halaqahRankings');
    if (!container) return;

    container.innerHTML = "";

    // Check if user is logged in
    const isLoggedIn = typeof currentProfile !== 'undefined' && currentProfile;

    const searchEl = document.getElementById('halaqahSearch');
    const rawQ = searchEl && searchEl.value ? String(searchEl.value).trim() : '';
    const q = rawQ.toLowerCase();

    // Deduplication lokal: jika ada nama sama, ambil id terbesar (terakhir masuk)
    const _nameMap = new Map();
    dashboardData.halaqahs.forEach(h => {
        const key = (h.name || '').trim().toLowerCase();
        const existing = _nameMap.get(key);
        if (!existing || Number(h.id) > Number(existing.id)) {
            _nameMap.set(key, h);
        }
    });
    const _dedupedHalaqahs = Array.from(_nameMap.values());

    // For public view, only show top 3
    let halaqahsToShow = isLoggedIn ? [..._dedupedHalaqahs] : _dedupedHalaqahs.slice(0, 3);

    // Apply role-based visibility restrictions for Guru/Ortu
    if (isLoggedIn && typeof currentProfile !== 'undefined' && currentProfile) {
        if (currentProfile.role === 'guru') {
             const guruName = (currentProfile.full_name || currentProfile.name || '').toLowerCase().replace(/^(ustadz|ust|u\.)\s*/i, '').trim();
             halaqahsToShow = halaqahsToShow.filter(h => {
                  if (!h || !h.guru) return false;
                  const hGuru = (h.guru || '').toLowerCase().replace(/^(ustadz|ust|u\.)\s*/i, '').trim();
                  return hGuru === guruName || hGuru.includes(guruName) || guruName.includes(hGuru);
             });
        } else if (currentProfile.role === 'ortu') {
             if (typeof getStudentsForCurrentUser === 'function') {
                 const allowedStudents = getStudentsForCurrentUser();
                 const allowedHalaqahNames = allowedStudents.map(s => String(s.halaqah || '').trim().toLowerCase());
                 halaqahsToShow = halaqahsToShow.filter(h => {
                     const hName = String(h.name || '').replace(/^Halaqah\s+/i, '').trim().toLowerCase();
                     const hNameFull = String(h.name || '').trim().toLowerCase();
                     return allowedHalaqahNames.includes(hName) || allowedHalaqahNames.includes(hNameFull);
                 });
             }
        }
    }

    if (q) {
        halaqahsToShow = halaqahsToShow.filter((h) => {
            const name = (h.name || '').toLowerCase();
            const guru = (h.guru || '').toLowerCase();
            const kelas = (h.kelas || '').toLowerCase();
            return name.includes(q) || guru.includes(q) || kelas.includes(q);
        });
    }

    if (halaqahsToShow.length === 0) {
        container.innerHTML = `
            <div class="glass rounded-2xl p-10 border border-slate-200 text-center">
                <svg class="w-14 h-14 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <p class="font-bold text-slate-700">${rawQ ? 'Tidak ada halaqah yang cocok' : 'Belum ada data halaqah'}</p>
                ${rawQ ? '<p class="text-sm text-slate-500 mt-1">Coba kata kunci lain atau kosongkan pencarian.</p>' : ''}
            </div>
        `;
        return;
    }

    halaqahsToShow.forEach((halaqah) => {
        const live = typeof getLiveHalaqahStats === 'function'
            ? getLiveHalaqahStats(halaqah)
            : { members: halaqah.members, points: halaqah.points, avgPoints: halaqah.avgPoints };

        const isTop = halaqah.rank === 1;
        const borderColor = isTop ? 'border-accent-gold' : 'border-slate-300';
        const bgColor = isTop ? 'bg-accent-gold/10' : 'bg-slate-100';
        const textColor = isTop ? 'text-accent-gold' : 'text-slate-500';

        let statusClass = 'bg-slate-100 text-slate-500';
        if (halaqah.status === 'NAIK') statusClass = 'bg-green-100 text-green-700';
        if (halaqah.status === 'STABIL') statusClass = 'bg-green-100 text-green-700';

        const card = document.createElement('div');
        card.className = `rank-card glass rounded-2xl p-5 border-l-4 ${borderColor} relative overflow-hidden cursor-pointer`;
        card.onclick = () => showHalaqahDetail(halaqah);

        card.innerHTML = `
            ${isTop ? `<div class="absolute top-0 right-0 p-2">
                <span class="text-[60px] font-black text-slate-100/50 absolute -top-4 -right-2">${halaqah.rank}</span>
            </div>` : ''}
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center ${textColor} font-bold text-xl relative z-10">
                    #${halaqah.rank}
                </div>
                <div class="flex-1 relative z-10">
                    <h4 class="font-bold text-slate-800">${halaqah.name}</h4>
                    <p class="text-sm text-slate-500">${live.points} Poin${isLoggedIn ? ` • ${live.members} Anggota` : ''}</p>
                </div>
                <div class="text-right relative z-10">
                    <span class="inline-block px-2 py-1 rounded-md ${statusClass} text-[10px] font-bold">${halaqah.status}</span>
                </div>
            </div>
            <div class="mt-3 pt-3 border-t border-slate-200 relative z-10">
                <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-500">Rata-rata per santri</span>
                    <span class="font-bold text-primary-600">${live.avgPoints} poin</span>
                </div>
            </div>
        `;

        container.appendChild(card);
    });

    // Add "View All" button for public users (hide saat sedang filter)
    if (!isLoggedIn && dashboardData.halaqahs.length > 3 && !rawQ) {
        const viewAllCard = document.createElement('div');
        viewAllCard.className = 'glass rounded-2xl p-5 border-2 border-dashed border-primary-300 hover:border-primary-500 transition-colors cursor-pointer';
        viewAllCard.onclick = () => {
            showNotification('🔒 Login untuk melihat semua halaqah', 'info');
            setTimeout(() => window.location.href = 'login.html', 1500);
        };
        viewAllCard.innerHTML = `
            <div class="flex flex-col items-center justify-center text-center py-4">
                <svg class="w-8 h-8 text-primary-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                <div class="font-bold text-primary-600">Lihat Semua Halaqah</div>
                <div class="text-xs text-slate-500 mt-1">Login untuk akses lengkap</div>
            </div>
        `;
        container.appendChild(viewAllCard);
    }
}

function initHalaqahSearchHandler() {
    const el = document.getElementById('halaqahSearch');
    if (!el || el.dataset.bound === '1') return;
    el.dataset.bound = '1';
    const run = () => renderHalaqahRankings();
    el.addEventListener('input', run);
    el.addEventListener('search', run);
}

function renderSantri(searchTerm = "") {
    const container = document.getElementById('santriTableBody');
    if (!container) return;

    container.innerHTML = "";

    console.log('🎨 [renderSantri] Starting render...');
    console.log('Search term:', searchTerm);
    console.log('Current halaqah filter:', currentHalaqahFilter);
    console.log('Current lembaga filter:', currentLembagaFilter);
    console.log('Current gender filter:', currentGenderFilter);

    let filtered = filterStudents(searchTerm, currentHalaqahFilter, currentLembagaFilter, currentGenderFilter);
    console.log('After filterStudents:', filtered.length);

    // REMOVED: Lembaga filter for parents - they can now see all students
    // REMOVED: User-santri relationship filter for parents - they can now see full rankings
    
    // Check if user is logged in
    const isLoggedIn = typeof currentProfile !== 'undefined' && currentProfile;
    console.log('Is logged in:', isLoggedIn, 'Role:', currentProfile?.role);

    // Filter based on user-santri relationships (ONLY for guru, not for ortu)
    if (isLoggedIn && currentProfile.role === 'guru') {
        console.log('🔍 Filtering by user-santri relationships (guru only)...');
        if (typeof getStudentsForCurrentUser === 'function') {
            const userStudents = getStudentsForCurrentUser();
            console.log('User students:', userStudents.length);
            const userStudentIds = userStudents.map(s => String(s.id));
            console.log('User student IDs:', userStudentIds);
            filtered = filtered.filter(s => userStudentIds.includes(String(s.id)));
            console.log('After user-santri filter:', filtered.length);
        }
    }

    // For public view (not logged in), only show top 3
    if (!isLoggedIn) {
        filtered = filtered.slice(0, 3);
    }

    filtered = sortStudents(filtered, currentSort);

    if (filtered.length === 0) {
        let message = 'Tidak ada data ditemukan';

        // Removed special message for parents - they see all data now

        container.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center">
                    <div class="text-slate-400">
                        <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p class="text-lg font-semibold">${message}</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach((student) => {
        const isTop = student.overall_ranking <= 3;
        const targetJuz = getTargetHafalanJuz(student);
        const hafalanPercent = getHafalanProgressPercent(student.total_hafalan, targetJuz);
        const kategoriStr = String(student.kategori || '').toLowerCase();
        const statusStr = String(student.status || '').toLowerCase();
        const kategoriHasAlumni = kategoriStr.includes('alumni');
        const kategoriHasNon = kategoriStr.includes('non') || kategoriStr.includes('bukan');
        const statusHasAlumni = statusStr.includes('alumni');
        const statusHasNon = statusStr.includes('non') || statusStr.includes('bukan');
        const isAlumni = student.is_alumni === true ||
            ((kategoriHasAlumni || statusHasAlumni) && !(kategoriHasNon || statusHasNon));
        const alumniInline = isAlumni ? ' · <span class="text-amber-600 font-semibold">Alumni</span>' : '';
        
        let rawGender = (student.jenis_kelamin || '').toUpperCase().trim();
        let genderLabel = '';
        if (rawGender.includes('IKHWAN') || rawGender.includes('L') || rawGender.includes('PUTRA') || rawGender === 'LAKI-LAKI') genderLabel = 'L';
        else if (rawGender.includes('AKHWAT') || rawGender.includes('P') || rawGender.includes('PUTRI') || rawGender === 'PEREMPUAN') genderLabel = 'P';
        const genderInline = genderLabel ? ` · <span class="text-indigo-600 font-bold">${genderLabel}</span>` : '';

        const row = document.createElement('tr');
        row.className = "hover:bg-slate-50/80 transition-colors group cursor-pointer";
        row.onclick = () => showStudentDetail(student);

        let rankBadge = '';
        if (student.overall_ranking === 1) rankBadge = '🥇';
        else if (student.overall_ranking === 2) rankBadge = '🥈';
        else if (student.overall_ranking === 3) rankBadge = '🥉';

        row.innerHTML = `
            <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                    <span class="font-display font-bold ${isTop ? 'text-primary-600' : 'text-slate-400'}">#${student.overall_ranking}</span>
                    <span>${rankBadge}</span>
                </div>
            </td>
            <td class="px-6 py-4">
                <div>
                    <div class="font-bold text-slate-800 group-hover:text-primary-600 transition-colors">${student.name}</div>
                    <div class="text-xs text-slate-500 mt-0.5">
                        ${student.halaqah}${student.kelas ? ' · ' + student.kelas : ''}${genderInline}${alumniInline}
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-700 font-bold text-sm">
                    ${student.total_points} poin
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="flex flex-col gap-1 text-slate-700 font-semibold">
                    <div class="inline-flex items-center gap-1">
                        <svg class="w-4 h-4 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>${formatHafalan(student.total_hafalan)} Juz</span>
                    </div>
                    <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div class="h-full bg-emerald-400 rounded-full" style="width: ${hafalanPercent}%;"></div>
                    </div>
                    <div class="text-[11px] text-slate-500">
                        ${hafalanPercent}% dari ${targetJuz} Juz
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 text-center">
                <span class="text-sm font-semibold text-slate-600">Posisi ${student.daily_ranking}</span>
            </td>
            <td class="px-6 py-4">
                <div class="flex items-center gap-1">
                    <span class="text-lg">🔥</span>
                    <span class="text-sm font-bold text-orange-600">${student.streak}</span>
                </div>
            </td>
            <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                    ${student.achievements.map(a => `<span class="text-lg">${a}</span>`).join('')}
                    <span class="h-2 w-2 rounded-full bg-green-500 inline-block ml-2"></span>
                </div>
            </td>
        `;
        container.appendChild(row);
    });

    // Add "View All" row for public users
    if (!isLoggedIn && dashboardData.students.length > 3) {
        const viewAllRow = document.createElement('tr');
        viewAllRow.className = 'bg-primary-50 hover:bg-primary-100 transition-colors cursor-pointer';
        viewAllRow.onclick = () => {
            showNotification('🔒 Login untuk melihat semua santri', 'info');
            setTimeout(() => window.location.href = 'login.html', 1500);
        };
        viewAllRow.innerHTML = `
            <td colspan="6" class="px-6 py-4 text-center">
                <div class="flex items-center justify-center gap-2 text-primary-600 font-bold">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                    <span>Lihat Semua Santri (${dashboardData.students.length} total)</span>
                </div>
            </td>
        `;
        container.appendChild(viewAllRow);
    }
}

// Fungsi konversi tanggal Masehi ke Hijriah menggunakan API Aladhan
async function toHijri(date) {
    try {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const dateStr = `${day}-${month}-${year}`;
        
        const response = await fetch(`https://api.aladhan.com/v1/gToH/${dateStr}`);
        const result = await response.json();
        
        if (result && result.code === 200 && result.data && result.data.hijri) {
            const hijri = result.data.hijri;
            return `${hijri.day} ${hijri.month.en} ${hijri.year}`;
        }
        
        // Fallback ke Intl API jika API gagal
        return new Intl.DateTimeFormat('id-ID-u-ca-islamic', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    } catch (error) {
        // Fallback ke Intl API jika terjadi error
        try {
            return new Intl.DateTimeFormat('id-ID-u-ca-islamic', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }).format(date);
        } catch (e) {
            console.error('Hijri conversion error:', e);
            return '';
        }
    }
}

function updateAppPeriodeDisplay() {
    const periodeEls = document.querySelectorAll('.app-periode');
    const periodeText = window.appSettings?.periode || '';
    periodeEls.forEach(el => {
        el.textContent = periodeText;
        if (!periodeText) {
            el.parentElement.classList.add('hidden');
        } else {
            el.parentElement.classList.remove('hidden');
        }
    });

    // Handle string formatting for different layouts
    const periodeContainers = document.querySelectorAll('.app-periode-container');
    periodeContainers.forEach(container => {
        if (!periodeText) {
            container.classList.add('hidden');
            container.style.display = 'none';
        } else {
            container.classList.remove('hidden');
            container.style.display = 'inline-flex';
            const textNode = container.querySelector('.app-periode-text');
            if(textNode) textNode.textContent = periodeText;
        }
    });
}
window.updateAppPeriodeDisplay = updateAppPeriodeDisplay;

async function updateDateTime() {
    const now = new Date();
    const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit' };

    const dateEl = document.getElementById('currentDate');
    const timeEl = document.getElementById('currentTime');
    const sidebarDateEl = document.getElementById('sidebarDate');
    const sidebarTimeEl = document.getElementById('sidebarTime');

    const dateStr = now.toLocaleDateString('id-ID', optionsDate);
    const timeStr = now.toLocaleTimeString('id-ID', optionsTime) + " WIB";
    
    // Tambahkan tanggal Hijriah menggunakan API Aladhan
    const hijriStr = await toHijri(now) + ' H';

    if (dateEl) dateEl.textContent = dateStr;
    if (timeEl) timeEl.textContent = timeStr;
    if (sidebarDateEl) {
        sidebarDateEl.innerHTML = `
            <div>${dateStr}</div>
            <div class="text-xs text-primary-600 mt-1">${hijriStr}</div>
        `;
    }
    if (sidebarTimeEl) sidebarTimeEl.textContent = timeStr;
}

function initAnimations() {
    const elements = document.querySelectorAll('.rank-card, section');
    elements.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, i * 100);
    });
}




function escapeSelectOptionAttr(val) {
    return String(val).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

/** Santri yang nama halaqah-nya setara (normalisasi label). */
function getStudentsInSameHalaqahName(halaqahRaw) {
    const key = typeof normalizeHalaqahLabel === 'function'
        ? normalizeHalaqahLabel(halaqahRaw)
        : String(halaqahRaw || '').trim().toLowerCase();
    return dashboardData.students.filter((s) => {
        const sk = typeof normalizeHalaqahLabel === 'function'
            ? normalizeHalaqahLabel(s.halaqah)
            : String(s.halaqah || '').trim().toLowerCase();
        return sk === key;
    });
}

/**
 * Opsi dropdown Halaqah: jika lembaga = Semua → semua halaqah dari data master (seperti sebelumnya).
 * Jika lembaga dipilih → hanya kelompok halaqah yang seluruh santri-nya di lembaga itu
 * (menghindari nama halaqah dipakai bersama lembaga lain — guru "nyasar").
 */
function getHalaqahFilterDropdownRows() {
    const user = (typeof window.currentProfile !== 'undefined' && window.currentProfile) ? window.currentProfile : null;
    const isGuru = user && user.role === 'guru';
    let guruName = '';

    if (isGuru) {
        guruName = (user.full_name || user.name || '')
            .toLowerCase()
            .replace(/^(ustadz|ust|u\.)\s*/i, '')
            .trim();
    }

    // 1. Jika lembaga = 'all', gunakan semua halaqah (tapi tetap filter jika role = guru)
    if (currentLembagaFilter === 'all') {
        let list = [...dashboardData.halaqahs];
        if (isGuru && guruName) {
            list = list.filter(h => {
                if (!h || !h.guru) return false;
                const hGuru = String(h.guru).toLowerCase().replace(/^(ustadz|ust|u\.)\s*/i, '').trim();
                return hGuru === guruName || hGuru.includes(guruName) || guruName.includes(hGuru);
            });
        }
        return list.map((h) => {
            const shortName = h.name.replace(/^Halaqah\s+/i, '').trim();
            const guruLabel = h.guru ? ` — ${h.guru}` : '';
            return { value: shortName, label: `${shortName}${guruLabel}` };
        }).sort((a, b) => a.label.localeCompare(b.label, 'id'));
    }

    // 2. Jika lembaga dipilih, gunakan filter ketat (Strict Filter)
    // Hanya tampilkan halaqah yang SELURUH santrinya berada di lembaga tersebut
    const studentsInLem = filterStudents('', 'all', currentLembagaFilter);
    const inLemIds = new Set(studentsInLem.map((s) => String(s.id)));
    
    const halaqahMap = new Map();
    const seenNorm = new Set();

    // Loop santri yang ada di lembaga terpilih
    for (const s of studentsInLem) {
        const rawHalaqah = (s.halaqah || '').trim();
        if (!rawHalaqah) continue;

        const normKey = typeof normalizeHalaqahLabel === 'function'
            ? normalizeHalaqahLabel(rawHalaqah)
            : rawHalaqah.toLowerCase();
            
        if (seenNorm.has(normKey)) continue;

        // Cek apakah SELURUH santri di halaqah ini (berdasarkan nama) ada di lembaga ini
        const allStudentsInHalaqah = typeof getStudentsInSameHalaqahName === 'function'
            ? getStudentsInSameHalaqahName(rawHalaqah)
            : dashboardData.students.filter(st => (st.halaqah || '').trim().toLowerCase() === rawHalaqah.toLowerCase());
            
        const isStrictlyInLembaga = allStudentsInHalaqah.length > 0 && 
                                   allStudentsInHalaqah.every(st => inLemIds.has(String(st.id)));

        if (!isStrictlyInLembaga) continue;

        // Jika user adalah GURU, cek apakah ini halaqah miliknya
        if (isGuru && guruName) {
            const hRec = dashboardData.halaqahs.find(h => 
                (typeof normalizeHalaqahLabel === 'function' ? normalizeHalaqahLabel(h.name) : h.name.toLowerCase()) === normKey
            );
            if (hRec && hRec.guru) {
                const hGuru = String(hRec.guru).toLowerCase().replace(/^(ustadz|ust|u\.)\s*/i, '').trim();
                const isMyHalaqah = hGuru === guruName || hGuru.includes(guruName) || guruName.includes(hGuru);
                if (!isMyHalaqah) continue;
            } else {
                continue;
            }
        }

        seenNorm.add(normKey);
        const shortLabel = rawHalaqah.replace(/^Halaqah\s+/i, '').trim() || rawHalaqah;
        
        // Cari data guru untuk label
        const hRec = dashboardData.halaqahs.find(h => 
            (typeof normalizeHalaqahLabel === 'function' ? normalizeHalaqahLabel(h.name) : h.name.toLowerCase()) === normKey
        );
        const guruLabel = hRec && hRec.guru ? ` — ${hRec.guru}` : '';
        
        halaqahMap.set(rawHalaqah, {
            value: shortLabel,
            label: `${shortLabel}${guruLabel}`
        });
    }

    return [...halaqahMap.values()].sort((a, b) => a.label.localeCompare(b.label, 'id'));
}

function sanitizeHalaqahFilterAfterLembagaChange() {
    if (currentHalaqahFilter === 'all') return;
    const rows = getHalaqahFilterDropdownRows();
    const valid = new Set(rows.map((r) => r.value));
    if (!valid.has(currentHalaqahFilter)) {
        currentHalaqahFilter = 'all';
    }
}

function renderFilters() {
    const container = document.getElementById('filterContainer');
    if (!container) return;

    sanitizeHalaqahFilterAfterLembagaChange();

    const halaqahRows = getHalaqahFilterDropdownRows();
    const lembagas = ['Semua Lembaga', ...Object.keys(appSettings.lembaga).map(key => appSettings.lembaga[key].name)];

    const halaqahOptionsHtml = [
        `<option value="all" ${currentHalaqahFilter === 'all' ? 'selected' : ''}>Semua Halaqah</option>`,
        ...halaqahRows.map((r) => {
            const sel = currentHalaqahFilter === r.value ? 'selected' : '';
            return `<option value="${escapeSelectOptionAttr(r.value)}" ${sel}>${r.label.replace(/</g, '&lt;')}</option>`;
        })
    ].join('');

    container.innerHTML = `
        <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <div class="relative flex-shrink-0">
                <select onchange="setFilter('halaqah', this.value)" 
                    class="appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium shadow-sm hover:border-primary-300 transition-colors cursor-pointer text-sm">
                    ${halaqahOptionsHtml}
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
            </div>

            <div class="relative flex-shrink-0">
                <select onchange="setFilter('lembaga', this.value)" 
                    class="appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium shadow-sm hover:border-primary-300 transition-colors cursor-pointer text-sm">
                    ${lembagas.map(l => {
        // Find key for value
        let key = 'all';
        if (l !== 'Semua Lembaga') {
            const found = Object.entries(appSettings.lembaga).find(([k, v]) => v.name === l);
            if (found) key = found[0];
        }
        return `<option value="${key}" ${currentLembagaFilter === key ? 'selected' : ''}>${l}</option>`;
    }).join('')}
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
            </div>

            <div class="relative flex-shrink-0">
                <select onchange="setFilter('gender', this.value)" 
                    class="appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium shadow-sm hover:border-primary-300 transition-colors cursor-pointer text-sm">
                    <option value="all" ${currentGenderFilter === 'all' ? 'selected' : ''}>Semua Kelamin</option>
                    <option value="L" ${currentGenderFilter === 'L' ? 'selected' : ''}>Ikhwan (L)</option>
                    <option value="P" ${currentGenderFilter === 'P' ? 'selected' : ''}>Akhwat (P)</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
            </div>
        </div>
    `;
}

function renderSortButtons() {
    const container = document.getElementById('sortContainer');
    if (!container) return;

    const sorts = [
        { value: 'rank', label: 'Peringkat', icon: '🏆' },
        { value: 'points', label: 'Poin', icon: '⭐' },
        { value: 'streak', label: 'Istiqomah', icon: '🔥' },
        { value: 'name', label: 'Nama', icon: '📝' }
    ];

    container.innerHTML = `
        <div class="flex gap-2">
            ${sorts.map(s => `
                <button 
                    onclick="setSort('${s.value}')" 
                    class="sort-btn px-3 py-2 rounded-lg text-xs font-semibold transition-all ${currentSort === s.value
            ? 'bg-accent-teal text-white'
            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
        }"
                    title="Urutkan berdasarkan ${s.label}"
                >
                    <span class="mr-1">${s.icon}</span>
                    ${s.label}
                </button>
            `).join('')}
        </div>
    `;
}

function setFilter(type, value) {
    if (type === 'halaqah') {
        currentHalaqahFilter = value;
    } else if (type === 'lembaga') {
        currentLembagaFilter = value;
        sanitizeHalaqahFilterAfterLembagaChange();
    } else if (type === 'gender') {
        currentGenderFilter = value;
    }

    renderFilters();
    const searchTerm = document.getElementById('santriSearch')?.value || '';
    renderSantri(searchTerm);
}

function setSort(sort) {
    currentSort = sort;
    renderSortButtons();
    const searchTerm = document.getElementById('santriSearch')?.value || '';
    renderSantri(searchTerm);
}

// Make functions globally accessible
window.setFilter = setFilter;
window.setSort = setSort;
window.generateStatsHTML = generateStatsHTML;
window.initHalaqahSearchHandler = initHalaqahSearchHandler;

// Fungsi untuk menampilkan notifikasi
function showNotification(message, type = 'success') {
    // Buat elemen notifikasi
    const notification = document.createElement('div');

    // Tentukan warna berdasarkan tipe
    let bgColor = 'bg-slate-800';
    let icon = '✅';

    if (type === 'success') {
        bgColor = 'bg-green-600';
        icon = '✅';
    } else if (type === 'error') {
        bgColor = 'bg-red-600';
        icon = '❌';
    } else if (type === 'warning') {
        bgColor = 'bg-amber-500';
        icon = '⚠️';
    } else if (type === 'info') {
        bgColor = 'bg-blue-600';
        icon = 'ℹ️';
    }

    notification.className = `fixed top-24 right-4 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl text-white shadow-2xl transform transition-all duration-500 translate-x-full ${bgColor}`;
    notification.innerHTML = `
        <span class="text-xl">${icon}</span>
        <span class="font-bold">${message}</span>
    `;

    // Tambahkan ke body
    document.body.appendChild(notification);

    // Animasi masuk
    requestAnimationFrame(() => {
        notification.classList.remove('translate-x-full');
    });

    // Hapus setelah 3 detik
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

window.showNotification = showNotification;
