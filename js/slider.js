// Ranking Slider Module - Auto-sliding carousel for rankings

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
    }
];

function renderSlider() {
    const container = document.getElementById('sliderContainer');
    if (!container) return;

    container.innerHTML = slides.map((slide, index) => {
        const isActive = index === currentSlide;
        return `
            <div id="slide-${index}" class="absolute inset-0 transition-all duration-500 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div class="absolute inset-0 bg-black/20"></div>
                <div class="relative h-full p-4 md:p-6 flex flex-col">
                    <h2 class="text-xl md:text-2xl font-bold text-white mb-3">${slide.title}</h2>
                    <div id="slide-content-${index}" class="flex-1">
                        <!-- Content populated dynamically -->
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
    slides.forEach((slide, index) => {
        const contentContainer = document.getElementById(`slide-content-${index}`);
        if (!contentContainer) return;

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
                    <div class="text-white/80 text-xs mb-1">${third.members || 'Halaqah ' + third.halaqah}</div>
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
        const halaqahName = halaqah.name.replace('Halaqah ', '');
        const studentsInHalaqah = dashboardData.students.filter(s => s.halaqah === halaqahName);
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
            todayPoints,
            todaySubmissions,
            todayAverage: studentsInHalaqah.length > 0 ? (todayPoints / studentsInHalaqah.length).toFixed(1) : 0
        };
    }).sort((a, b) => b.todayPoints - a.todayPoints);

    const topHalaqah = halaqahTodayPoints[0];
    const second = halaqahTodayPoints[1];
    const third = halaqahTodayPoints[2];

    if (!topHalaqah) return;

    container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full px-2">
            <!-- Champion -->
            <div class="text-center mb-3">
                <div class="inline-block p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-2 shadow-2xl">
                    <div class="text-3xl">👑</div>
                </div>
                <div class="text-yellow-100 text-xs mb-1 font-bold">HALAQAH TERBAIK HARI INI</div>
                <div class="text-2xl md:text-3xl font-bold text-white mb-1">${topHalaqah.name}</div>
                <div class="text-sm text-white/90 mb-2">${topHalaqah.members} Anggota • ${topHalaqah.todaySubmissions} Setoran</div>
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

    container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full px-2">
            <!-- Champion -->
            <div class="text-center mb-3">
                <div class="inline-block p-2 bg-gradient-to-br from-green-400 to-teal-500 rounded-full mb-2 shadow-2xl">
                    <div class="text-3xl">🏅</div>
                </div>
                <div class="text-white/80 text-xs mb-1">HALAQAH TERBAIK</div>
                <div class="text-2xl md:text-3xl font-bold text-white mb-1">${topHalaqah.name}</div>
                <div class="text-sm text-white/90 mb-2">${topHalaqah.members} Anggota • ${topHalaqah.status || ''}</div>
                <div class="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                    <div class="text-3xl font-bold text-white">${topHalaqah.points}</div>
                    <div class="text-white/80 text-xs">Total Poin</div>
                </div>
            </div>
            
            <!-- Runner-ups -->
            <div class="grid grid-cols-2 gap-2 max-w-md w-full">
                ${second ? `
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/20 text-center">
                    <div class="text-xl mb-1">🥈</div>
                    <div class="text-sm font-bold text-white mb-1">${second.name}</div>
                    <div class="text-white/80 text-xs mb-1">${second.members} anggota</div>
                    <div class="text-lg font-bold text-white">${second.points}</div>
                    <div class="text-white/70 text-xs">poin</div>
                </div>
                ` : ''}
                ${third ? `
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/20 text-center">
                    <div class="text-xl mb-1">🥉</div>
                    <div class="text-sm font-bold text-white mb-1">${third.name}</div>
                    <div class="text-white/80 text-xs mb-1">${third.members} anggota</div>
                    <div class="text-lg font-bold text-white">${third.points}</div>
                    <div class="text-white/70 text-xs">poin</div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

function renderStreakLeaders(container) {
    const students = (typeof getStudentsForCurrentUser === 'function')
        ? getStudentsForCurrentUser()
        : dashboardData.students;

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
            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div class="text-xs font-bold text-yellow-300 mb-2 uppercase tracking-wider border-b border-white/10 pb-1">${lembaga}</div>
                <div class="space-y-1">
                    ${top3.map((s, idx) => `
                        <div class="flex items-center justify-between gap-2">
                            <div class="flex items-center gap-2 min-w-0">
                                <span class="text-[10px] font-bold text-white/50">${idx + 1}</span>
                                <span class="text-xs font-bold text-white truncate">${s.name}</span>
                            </div>
                            <span class="text-[10px] font-bold text-emerald-400 whitespace-nowrap">${s.total_hafalan || 0} Hal</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 h-full items-center">
            ${content || '<div class="col-span-full text-center text-white/50 text-sm">Belum ada data hafalan</div>'}
        </div>
    `;
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
