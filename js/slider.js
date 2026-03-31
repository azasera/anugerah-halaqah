// Ranking Slider Module - Auto-sliding carousel for rankings
//
function formatHafalan(value) {
    const n = Number(value);
    if (Number.isNaN(n) || n <= 0) return '0';
    const fixed = n.toFixed(2);
    return fixed.replace(/\.?0+$/, '');
}

let currentSlide = 0;
let autoPlayInterval = null;
let isAutoPlaying = true;

const slides = [
    {
        id: 'top-santri',
        title: '🏆 Top 3 Santri Terbaik',
        type: 'santri'
    },
    {
        id: 'best-halaqah-today',
        title: '⭐ Halaqah Terbaik Hari Ini',
        type: 'best-halaqah-today'
    },
    {
        id: 'top-halaqah',
        title: '🏅 Ranking Halaqah',
        type: 'halaqah'
    },
    {
        id: 'streak-leaders',
        title: '🔥 Santri Paling Istiqomah',
        type: 'streak'
    },
    {
        id: 'hafalan-leaders',
        title: '📖 Top Hafalan per Lembaga',
        type: 'hafalan'
    },
    {
        id: 'tilawah-sdita',
        title: '📗 Ranking Tilawah SDITA',
        type: 'tilawah-lembaga',
        lembaga: 'SDITA'
    },
    {
        id: 'tilawah-smpita',
        title: '📘 Ranking Tilawah SMPITA',
        type: 'tilawah-lembaga',
        lembaga: 'SMPITA'
    },
    {
        id: 'tilawah-smaita',
        title: '📙 Ranking Tilawah SMAITA',
        type: 'tilawah-lembaga',
        lembaga: 'SMAITA'
    },
    {
        id: 'tilawah-mta',
        title: '📕 Ranking Tilawah MTA',
        type: 'tilawah-lembaga',
        lembaga: 'MTA'
    }
];

function renderSlider() {
    const container = document.getElementById('sliderContainer');
    if (!container) {
        console.error('❌ sliderContainer not found!');
        return;
    }
    
    console.log('🚀 [Slider] Rendering slider with', slides.length, 'slides');
    
    container.innerHTML = slides.map((slide, index) => {
        const isActive = index === currentSlide;
        return `
            <div id="slide-${index}" class="absolute inset-0 transition-all duration-500 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
                <div class="absolute inset-0 bg-black/10"></div>
                <div class="relative h-full p-4 md:p-6 flex flex-col">
                    <div class="flex items-center justify-between mb-2">
                        <h2 class="text-lg md:text-xl font-bold text-white uppercase tracking-wider">${slide.title}</h2>
                        <div class="text-[10px] text-white/40 font-mono">${index + 1}/${slides.length}</div>
                    </div>
                    <div id="slide-content-${index}" class="flex-1 overflow-y-auto min-h-0">
                        <div class="flex items-center justify-center h-full text-white/30 text-xs italic">Memuat data...</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Render dots
    const dotsContainer = document.getElementById('sliderDots');
    if (dotsContainer) {
        dotsContainer.innerHTML = slides.map((_, index) => `
            <button onclick="goToSlide(${index})" class="w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-slate-700 w-8' : 'bg-slate-400'}" aria-label="Go to slide ${index + 1}"></button>
        `).join('');
    }

    // Render content for each slide
    renderSlideContent();
}

function renderSlideContent() {
    console.log('📦 [Slider] Populating content for', slides.length, 'slides');
    slides.forEach((slide, index) => {
        const contentContainer = document.getElementById(`slide-content-${index}`);
        if (!contentContainer) {
            console.warn(`⚠️ [Slider] Slide content container ${index} not found!`);
            return;
        }
        
        try {
            if (slide.type === 'santri') {
                renderTopSantri(contentContainer);
            } else if (slide.type === 'best-halaqah-today') {
                renderBestHalaqahToday(contentContainer);
            } else if (slide.type === 'halaqah') {
                renderTopHalaqah(contentContainer);
            } else if (slide.type === 'streak') {
                renderStreakLeaders(contentContainer);
            } else if (slide.type === 'hafalan') {
                renderHafalanLeaders(contentContainer);
            } else if (slide.type === 'tilawah-lembaga') {
                renderTilawahLembaga(contentContainer, slide.lembaga);
            }
        } catch (error) {
            console.error(`❌ [Slider] Error rendering slide ${index} (${slide.type}):`, error);
            contentContainer.innerHTML = `<div class="flex items-center justify-center h-full text-red-300 text-xs text-center p-4">⚠️ Gagal memuat data: ${error.message}</div>`;
        }
    });
}

function renderTopSantri(container) {
    const topStudent = dashboardData.students[0];
    const second = dashboardData.students[1];
    const third = dashboardData.students[2];

    if (!topStudent) return;

    container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full px-2">
            <!-- Champion -->
            <div class="text-center mb-3">
                <div class="inline-block p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-2 shadow-2xl">
                    <div class="text-3xl">🥇</div>
                </div>
                <div class="text-white/80 text-xs mb-1">SANTRI TERBAIK</div>
                <div class="text-2xl md:text-3xl font-bold text-white mb-1">${topStudent.name}</div>
                <div class="text-sm text-white/90 mb-2">Halaqah ${topStudent.halaqah}</div>
                <div class="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                    <div class="text-3xl font-bold text-white">${topStudent.total_points}</div>
                    <div class="text-white/80 text-xs">Total Poin</div>
                </div>
            </div>
            
            <!-- Runner-ups -->
            <div class="grid grid-cols-2 gap-2 max-w-md w-full">
                ${second ? `
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/20 text-center">
                    <div class="text-xl mb-1">🥈</div>
                    <div class="text-sm font-bold text-white mb-1">${second.name}</div>
                    <div class="text-white/80 text-xs mb-1">Halaqah ${second.halaqah}</div>
                    <div class="text-lg font-bold text-white">${second.total_points}</div>
                    <div class="text-white/70 text-xs">poin</div>
                </div>
                ` : ''}
                ${third ? `
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/20 text-center">
                    <div class="text-xl mb-1">🥉</div>
                    <div class="text-sm font-bold text-white mb-1">${third.name}</div>
                    <div class="text-white/80 text-xs mb-1">Halaqah ${third.halaqah}</div>
                    <div class="text-lg font-bold text-white">${third.total_points}</div>
                    <div class="text-white/70 text-xs">poin</div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

function renderBestHalaqahToday(container) {
    const today = new Date().toDateString();
    const halaqahTodayPoints = dashboardData.halaqahs.map(halaqah => {
        const studentsInHalaqah = typeof getStudentsByHalaqah === 'function'
            ? getStudentsByHalaqah(halaqah.name)
            : dashboardData.students.filter(s => s.halaqah === halaqah.name.replace('Halaqah ', ''));
        let todayPoints = 0;
        let todaySubmissions = 0;

        studentsInHalaqah.forEach(student => {
            if (student.setoran) {
                student.setoran.forEach(s => {
                    if (new Date(s.date).toDateString() === today) {
                        todayPoints += s.poin || 0;
                        todaySubmissions++;
                    }
                });
            }
        });

        return {
            ...halaqah,
            members: studentsInHalaqah.length,
            todayPoints,
            todaySubmissions,
            todayAverage: studentsInHalaqah.length > 0 ? (todayPoints / studentsInHalaqah.length).toFixed(1) : 0
        };
    }).sort((a, b) => b.todayPoints - a.todayPoints);

    const topHalaqah = halaqahTodayPoints[0];
    const second = halaqahTodayPoints[1];
    const third = halaqahTodayPoints[2];

    if (!topHalaqah) return;

    const isLoggedIn = typeof currentProfile !== 'undefined' && currentProfile;
    const memberCount = typeof topHalaqah.members === 'number' ? topHalaqah.members : 0;
    const membersTodayText = isLoggedIn ? `${memberCount} Anggota • ` : '';

    container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full px-2">
            <!-- Champion -->
            <div class="text-center mb-3">
                <div class="inline-block p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-2 shadow-2xl">
                    <div class="text-3xl">👑</div>
                </div>
                <div class="text-yellow-100 text-xs mb-1 font-bold">HALAQAH TERBAIK HARI INI</div>
                <div class="text-2xl md:text-3xl font-bold text-white mb-1">${topHalaqah.name}</div>
                <div class="text-sm text-white/90 mb-2">${membersTodayText}${topHalaqah.todaySubmissions} Setoran</div>
                <div class="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                    <div class="text-3xl font-bold text-white">${topHalaqah.todayPoints}</div>
                    <div class="text-white/80 text-xs">Poin Hari Ini</div>
                </div>
            </div>
            
            <!-- Runner-ups -->
            <div class="grid grid-cols-2 gap-2 max-w-md w-full">
                ${second ? `
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/20 text-center">
                    <div class="text-xl mb-1">🥈</div>
                    <div class="text-sm font-bold text-white mb-1">${second.name}</div>
                    <div class="text-white/80 text-xs mb-1">${second.todaySubmissions} setoran</div>
                    <div class="text-lg font-bold text-white">${second.todayPoints}</div>
                    <div class="text-white/70 text-xs">poin hari ini</div>
                </div>
                ` : ''}
                ${third ? `
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/20 text-center">
                    <div class="text-xl mb-1">🥉</div>
                    <div class="text-sm font-bold text-white mb-1">${third.name}</div>
                    <div class="text-white/80 text-xs mb-1">${third.todaySubmissions} setoran</div>
                    <div class="text-lg font-bold text-white">${third.todayPoints}</div>
                    <div class="text-white/70 text-xs">poin hari ini</div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

function renderTopHalaqah(container) {
    const topHalaqah = dashboardData.halaqahs[0];
    const second = dashboardData.halaqahs[1];
    const third = dashboardData.halaqahs[2];

    if (!topHalaqah) return;

    const isLoggedIn = typeof currentProfile !== 'undefined' && currentProfile;
    const liveTop = typeof getLiveHalaqahStats === 'function' ? getLiveHalaqahStats(topHalaqah) : { members: topHalaqah.members };
    const liveSecond = second && typeof getLiveHalaqahStats === 'function' ? getLiveHalaqahStats(second) : { members: second?.members };
    const liveThird = third && typeof getLiveHalaqahStats === 'function' ? getLiveHalaqahStats(third) : { members: third?.members };

    container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full px-2">
            <!-- Champion -->
            <div class="text-center mb-3">
                <div class="inline-block p-2 bg-gradient-to-br from-green-400 to-teal-500 rounded-full mb-2 shadow-2xl">
                    <div class="text-3xl">🏅</div>
                </div>
                <div class="text-white/80 text-xs mb-1">HALAQAH TERBAIK</div>
                <div class="text-2xl md:text-3xl font-bold text-white mb-1">${topHalaqah.name}</div>
                <div class="text-sm text-white/90 mb-2">${isLoggedIn ? `${liveTop.members} Anggota • ` : ''}${topHalaqah.status || ''}</div>
                <div class="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                    <div class="text-3xl font-bold text-white">${liveTop.points != null ? liveTop.points : topHalaqah.points}</div>
                    <div class="text-white/80 text-xs">Total Poin</div>
                </div>
            </div>
            
            <!-- Runner-ups -->
            <div class="grid grid-cols-2 gap-2 max-w-md w-full">
                ${second ? `
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/20 text-center">
                    <div class="text-xl mb-1">🥈</div>
                    <div class="text-sm font-bold text-white mb-1">${second.name}</div>
                    <div class="text-white/80 text-xs mb-1">${isLoggedIn ? `${liveSecond.members} anggota` : ''}</div>
                    <div class="text-lg font-bold text-white">${liveSecond.points != null ? liveSecond.points : second.points}</div>
                    <div class="text-white/70 text-xs">poin</div>
                </div>
                ` : ''}
                ${third ? `
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/20 text-center">
                    <div class="text-xl mb-1">🥉</div>
                    <div class="text-sm font-bold text-white mb-1">${third.name}</div>
                    <div class="text-white/80 text-xs mb-1">${isLoggedIn ? `${liveThird.members} anggota` : ''}</div>
                    <div class="text-lg font-bold text-white">${liveThird.points != null ? liveThird.points : third.points}</div>
                    <div class="text-white/70 text-xs">poin</div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

function renderStreakLeaders(container) {
    // CHANGED: Parents can now see all students in streak leaders, not just their child
    const students = dashboardData.students;

    if (!students || students.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-white/60">
                <div class="text-4xl mb-2">🔥</div>
                <div class="font-bold">Belum ada data istiqomah</div>
            </div>
        `;
        return;
    }

    const sorted = [...students].sort((a, b) => (b.streak || 0) - (a.streak || 0));
    const topStreak = sorted[0];
    const second = sorted[1];
    const third = sorted[2];

    if (!topStreak) return;

    container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full px-2">
            <!-- Champion -->
            <div class="text-center mb-3">
                <div class="inline-block p-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mb-2 shadow-2xl">
                    <div class="text-3xl">🔥</div>
                </div>
                <div class="text-white/80 text-xs mb-1">PALING ISTIQOMAH</div>
                <div class="text-2xl md:text-3xl font-bold text-white mb-1">${topStreak.name}</div>
                <div class="text-sm text-white/90 mb-2">Halaqah ${topStreak.halaqah}</div>
                <div class="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                    <div class="text-3xl font-bold text-orange-300">${topStreak.streak}</div>
                    <div class="text-white/80 text-xs">Hari Istiqomah</div>
                </div>
            </div>
            
            <!-- Runner-ups -->
            <div class="grid grid-cols-2 gap-2 max-w-md w-full">
                ${second ? `
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/20 text-center">
                    <div class="text-xl mb-1">🥈</div>
                    <div class="text-sm font-bold text-white mb-1">${second.name}</div>
                    <div class="text-white/80 text-xs mb-1">Halaqah ${second.halaqah}</div>
                    <div class="text-lg font-bold text-orange-300">${second.streak}</div>
                    <div class="text-white/70 text-xs">hari istiqomah</div>
                </div>
                ` : ''}
                ${third ? `
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/20 text-center">
                    <div class="text-xl mb-1">🥉</div>
                    <div class="text-sm font-bold text-white mb-1">${third.name}</div>
                    <div class="text-white/80 text-xs mb-1">Halaqah ${third.halaqah}</div>
                    <div class="text-lg font-bold text-orange-300">${third.streak}</div>
                    <div class="text-white/70 text-xs">hari istiqomah</div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

function renderHafalanLeaders(container) {
    const lembagas = ['MTA', 'SDITA', 'SMPITA', 'SMAITA'];

    const content = lembagas.map(lembaga => {
        const top3 = dashboardData.students
            .filter(s => s.lembaga === lembaga)
            .sort((a, b) => (Number(b.total_hafalan) || 0) - (Number(a.total_hafalan) || 0))
            .slice(0, 3);

        if (top3.length === 0) return '';

        return `
            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 md:p-3 border border-white/20">
                <div class="text-[11px] md:text-xs font-bold text-yellow-300 mb-1.5 md:mb-2 uppercase tracking-wider border-b border-white/10 pb-1">${lembaga}</div>
                <div class="space-y-1">
                    ${top3.map((s, idx) => `
                        <div class="flex items-center justify-between gap-1.5 md:gap-2">
                            <div class="flex items-center gap-1.5 md:gap-2 min-w-0 flex-1">
                                <span class="text-[10px] font-bold text-white/50 flex-shrink-0">${idx + 1}</span>
                                <span class="text-[11px] md:text-xs font-bold text-white truncate">${s.name}</span>
                            </div>
                            <span class="text-[10px] md:text-[11px] font-bold text-emerald-400 whitespace-nowrap flex-shrink-0">${formatHafalan(s.total_hafalan)} Juz</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 h-full">
            ${content || '<div class="col-span-full text-center text-white/50 text-sm">Belum ada data hafalan</div>'}
        </div>
    `;
}

function renderTilawahLembaga(container, lembaga) {
    if (!dashboardData.students || dashboardData.students.length === 0) {
        container.innerHTML = `<div class="flex items-center justify-center h-full text-white/30 text-xs italic">Menunggu data santri...</div>`;
        return;
    }

    console.log(`📊 [Slider] Checking tilawah for ${lembaga}`);
    const students = dashboardData.students
        .filter(s => {
            const l = (typeof window.detectStudentLembaga === 'function')
                ? window.detectStudentLembaga(s)
                : ((typeof window.normalizeLembagaKey === 'function')
                    ? window.normalizeLembagaKey(s.lembaga || '')
                    : (s.lembaga || ''));
            return l === lembaga;
        })
        .map(s => {
            // Priority 1: Summary column from DB (total_tilawah_hal)
            // Priority 2: Calculate from historical tilawah entries
            const history = (dashboardData.tilawah || [])
                .filter(t => String(t.studentId) === String(s.id));
            
            const calcTotal = history
                .flatMap(t => Object.values(t.entries || {}))
                .reduce((sum, e) => sum + (e.jumlahHal || e.hal || 0), 0);
            
            const totalHal = Number(s.total_tilawah_hal || 0) || calcTotal;
            
            return { ...s, totalHal };
        })
        .filter(s => s.totalHal > 0)
        .sort((a, b) => b.totalHal - a.totalHal)
        .slice(0, 5);

    console.log(`📊 [Slider] Found ${students.length} students with tilawah in ${lembaga}`);

    if (students.length === 0) {
        container.innerHTML = `<div class="flex items-center justify-center h-full text-white/50 text-sm">Belum ada data tilawah ${lembaga}</div>`;
        return;
    }

    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
    const rows = students.map((s, i) => {
        const { khatam, sisa, pct } = typeof getTilawahKhatamInfo === 'function'
            ? getTilawahKhatamInfo(s.totalHal)
            : { khatam: Math.floor(s.totalHal / 604), sisa: s.totalHal % 604, pct: Math.round((s.totalHal % 604) / 604 * 100) };
        const label = khatam > 0 ? `${khatam}x Khatam + ${sisa} hal` : `${sisa} / 604 hal`;
        return `
            <div class="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div class="text-2xl flex-shrink-0">${medals[i]}</div>
                <div class="flex-1 min-w-0">
                    <div class="font-bold text-white text-sm truncate">${s.name}</div>
                    <div class="text-white/60 text-[10px]">${s.halaqah || ''}</div>
                    <div class="mt-1 w-full bg-white/20 rounded-full h-1.5">
                        <div class="bg-yellow-300 h-1.5 rounded-full" style="width:${pct}%"></div>
                    </div>
                </div>
                <div class="text-right flex-shrink-0">
                    ${khatam > 0 ? `<div class="text-yellow-300 font-black text-xs">🏆${khatam}x</div>` : ''}
                    <div class="text-white/80 text-[10px] font-bold">${label}</div>
                </div>
            </div>`;
    }).join('');

    container.innerHTML = `<div class="space-y-2">${rows}</div>`;
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlider();
}

function previousSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateSlider();
}

function goToSlide(index) {
    currentSlide = index;
    updateSlider();
}

function updateSlider() {
    slides.forEach((_, index) => {
        const slide = document.getElementById(`slide-${index}`);
        if (slide) {
            if (index === currentSlide) {
                slide.classList.remove('opacity-0', 'translate-x-full', '-translate-x-full');
                slide.classList.add('opacity-100', 'translate-x-0');
            } else if (index < currentSlide) {
                slide.classList.remove('opacity-100', 'translate-x-0', 'translate-x-full');
                slide.classList.add('opacity-0', '-translate-x-full');
            } else {
                slide.classList.remove('opacity-100', 'translate-x-0', '-translate-x-full');
                slide.classList.add('opacity-0', 'translate-x-full');
            }
        }
    });

    const dotsContainer = document.getElementById('sliderDots');
    if (dotsContainer) {
        dotsContainer.innerHTML = slides.map((_, index) => `
            <button onclick="goToSlide(${index})" class="w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-slate-700 w-8' : 'bg-slate-400'}" aria-label="Go to slide ${index + 1}"></button>
        `).join('');
    }
}

function startAutoPlay() {
    if (autoPlayInterval) return;
    isAutoPlaying = true;
    autoPlayInterval = setInterval(() => {
        nextSlide();
    }, 5000);
    updateAutoPlayButton();
}

function stopAutoPlay() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }
    isAutoPlaying = false;
    updateAutoPlayButton();
}

function toggleAutoPlay() {
    if (isAutoPlaying) {
        stopAutoPlay();
    } else {
        startAutoPlay();
    }
}

function updateAutoPlayButton() {
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    const autoPlayText = document.getElementById('autoPlayText');

    if (isAutoPlaying) {
        playIcon?.classList.add('hidden');
        pauseIcon?.classList.remove('hidden');
        if (autoPlayText) autoPlayText.textContent = 'Auto';
    } else {
        playIcon?.classList.remove('hidden');
        pauseIcon?.classList.add('hidden');
        if (autoPlayText) autoPlayText.textContent = 'Manual';
    }
}

function initSlider() {
    renderSlider();
    startAutoPlay();
}

window.renderSlider = renderSlider;
window.initSlider = initSlider;
window.nextSlide = nextSlide;
window.previousSlide = previousSlide;
window.goToSlide = goToSlide;
window.toggleAutoPlay = toggleAutoPlay;
