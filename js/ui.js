// UI Rendering Module

let currentSort = 'rank';
let currentHalaqahFilter = 'all';
let currentLembagaFilter = 'all';

function generateStatsHTML() {
    const stats = calculateStats();
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
    const bestHalaqah = dashboardData.halaqahs.find(h => h.rank === 1);
    
    if (!bestHalaqah) {
        // No halaqah data, hide banner
        container.style.display = 'none';
        return;
    }
    
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
                        ${bestHalaqah.points} Poin
                    </span>
                    <span class="bg-emerald-800/30 border border-emerald-700/30 px-3 py-1 rounded-full">
                        ${bestHalaqah.members} Anggota
                    </span>
                    <span class="bg-emerald-800/30 border border-emerald-700/30 px-3 py-1 rounded-full">
                        Rata-rata: ${bestHalaqah.avgPoints} poin
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
    
    // For public view, only show top 3
    const halaqahsToShow = isLoggedIn ? dashboardData.halaqahs : dashboardData.halaqahs.slice(0, 3);

    halaqahsToShow.forEach((halaqah) => {
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
                    <p class="text-sm text-slate-500">${halaqah.points} Poin • ${halaqah.members} Anggota</p>
                </div>
                <div class="text-right relative z-10">
                    <span class="inline-block px-2 py-1 rounded-md ${statusClass} text-[10px] font-bold">${halaqah.status}</span>
                </div>
            </div>
            <div class="mt-3 pt-3 border-t border-slate-200 relative z-10">
                <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-500">Rata-rata per santri</span>
                    <span class="font-bold text-primary-600">${halaqah.avgPoints} poin</span>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    // Add "View All" button for public users
    if (!isLoggedIn && dashboardData.halaqahs.length > 3) {
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

function renderSantri(searchTerm = "") {
    const container = document.getElementById('santriTableBody');
    if (!container) return;
    
    container.innerHTML = "";

    let filtered = filterStudents(searchTerm, currentHalaqahFilter, currentLembagaFilter);
    
    // Check if user is logged in
    const isLoggedIn = typeof currentProfile !== 'undefined' && currentProfile;

    // Filter based on user-santri relationships
    if (isLoggedIn && (currentProfile.role === 'guru' || currentProfile.role === 'parent')) {
        // Get santri for current user from user-santri relationships
        if (typeof getStudentsForCurrentUser === 'function') {
            const userStudents = getStudentsForCurrentUser();
            const userStudentIds = userStudents.map(s => s.id);
            filtered = filtered.filter(s => userStudentIds.includes(s.id));
        }
    }
    
    // For public view (not logged in), only show top 3
    if (!isLoggedIn) {
        filtered = filtered.slice(0, 3);
    }

    filtered = sortStudents(filtered, currentSort);

    if (filtered.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center">
                    <div class="text-slate-400">
                        <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p class="text-lg font-semibold">Tidak ada data ditemukan</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach((student) => {
        const isTop = student.overall_ranking <= 3;
        const row = document.createElement('tr');
        row.className = "hover:bg-slate-50/80 transition-colors group cursor-pointer";
        row.onclick = () => showStudentDetail(student);
        
        let rankBadge = '';
        if(student.overall_ranking === 1) rankBadge = '🥇';
        else if(student.overall_ranking === 2) rankBadge = '🥈';
        else if(student.overall_ranking === 3) rankBadge = '🥉';

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
                    <div class="text-xs text-slate-500 mt-0.5">${student.halaqah}</div>
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-700 font-bold text-sm">
                    ${student.total_points} poin
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="inline-flex items-center gap-1 text-slate-700 font-semibold">
                    <svg class="w-4 h-4 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    ${student.total_hafalan || 0} Hal
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

function updateDateTime() {
    const now = new Date();
    const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    
    const dateEl = document.getElementById('currentDate');
    const timeEl = document.getElementById('currentTime');
    const sidebarDateEl = document.getElementById('sidebarDate');
    const sidebarTimeEl = document.getElementById('sidebarTime');
    
    const dateStr = now.toLocaleDateString('id-ID', optionsDate);
    const timeStr = now.toLocaleTimeString('id-ID', optionsTime) + " WIB";
    
    if (dateEl) dateEl.textContent = dateStr;
    if (timeEl) timeEl.textContent = timeStr;
    if (sidebarDateEl) sidebarDateEl.textContent = dateStr;
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

function initSearchHandler() {
    const searchInput = document.getElementById('santriSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderSantri(e.target.value);
        });
    }
}


function renderFilters() {
    const container = document.getElementById('filterContainer');
    if (!container) return;
    
    const halaqahs = ['Semua Halaqah', ...dashboardData.halaqahs.map(h => h.name.replace('Halaqah ', ''))];
    const lembagas = ['Semua Lembaga', ...Object.keys(appSettings.lembaga).map(key => appSettings.lembaga[key].name)];
    
    container.innerHTML = `
        <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <div class="relative flex-shrink-0">
                <select onchange="setFilter('halaqah', this.value)" 
                    class="appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium shadow-sm hover:border-primary-300 transition-colors cursor-pointer text-sm">
                    ${halaqahs.map(h => {
                        const value = h === 'Semua Halaqah' ? 'all' : h;
                        return `<option value="${value}" ${currentHalaqahFilter === value ? 'selected' : ''}>${h}</option>`;
                    }).join('')}
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
        </div>
    `;
}

function renderSortButtons() {
    const container = document.getElementById('sortContainer');
    if (!container) return;
    
    const sorts = [
        { value: 'rank', label: 'Peringkat', icon: '🏆' },
        { value: 'points', label: 'Poin', icon: '⭐' },
        { value: 'streak', label: 'Hari Beruntun', icon: '🔥' },
        { value: 'name', label: 'Nama', icon: '📝' }
    ];
    
    container.innerHTML = `
        <div class="flex gap-2">
            ${sorts.map(s => `
                <button 
                    onclick="setSort('${s.value}')" 
                    class="sort-btn px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        currentSort === s.value 
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
