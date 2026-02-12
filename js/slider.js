// Ranking Slider Module - Auto-sliding carousel for rankings

let currentSlide = 0;
let autoPlayInterval = null;
let isAutoPlaying = true;

const slides = [
    {
        id: 'top-santri',
        title: '🏆 Top 10 Santri Terbaik',
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
        title: '🔥 Santri dengan Streak Terpanjang',
        type: 'streak'
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
                <div class="relative h-full p-8 md:p-12 flex flex-col">
                    <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">${slide.title}</h2>
                    <div id="slide-content-${index}" class="flex-1 overflow-y-auto custom-scrollbar">
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
            <button onclick="goToSlide(${index})" class="w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50'}" aria-label="Go to slide ${index + 1}"></button>
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
        }
    });
}

function renderTopSantri(container) {
    const topStudents = dashboardData.students.slice(0, 10);
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-16">
            ${topStudents.map((student, index) => {
                const medals = ['🥇', '🥈', '🥉'];
                const medal = index < 3 ? medals[index] : '';
                const bgClass = index < 3 ? 'bg-white/20' : 'bg-white/10';
                
                return `
                    <div class="${bgClass} backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/25 transition-all">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-xl bg-white/30 flex items-center justify-center text-white font-bold text-xl">
                                ${medal || '#' + (index + 1)}
                            </div>
                            <div class="flex-1">
                                <div class="font-bold text-white text-lg">${student.name}</div>
                                <div class="text-white/80 text-sm">Halaqah ${student.halaqah}</div>
                            </div>
                            <div class="text-right">
                                <div class="text-2xl font-bold text-white">${student.total_points}</div>
                                <div class="text-white/80 text-xs">poin</div>
                            </div>
                        </div>
                        <div class="mt-3 flex items-center gap-4 text-white/90 text-sm">
                            <div class="flex items-center gap-1">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                </svg>
                                ${student.total_hafalan || 0} Hal
                            </div>
                            <div class="flex items-center gap-1">
                                🔥 ${student.streak} hari
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderBestHalaqahToday(container) {
    // Get today's date
    const today = new Date().toDateString();
    
    // Calculate today's points for each halaqah
    const halaqahTodayPoints = dashboardData.halaqahs.map(halaqah => {
        const halaqahName = halaqah.name.replace('Halaqah ', '');
        
        // Get students in this halaqah
        const studentsInHalaqah = dashboardData.students.filter(s => s.halaqah === halaqahName);
        
        // Calculate today's total points
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
    const topMembers = dashboardData.students
        .filter(s => s.halaqah === topHalaqah.name.replace('Halaqah ', ''))
        .slice(0, 8);
    
    container.innerHTML = `
        <div class="pb-16">
            <!-- Best Halaqah Card -->
            <div class="bg-gradient-to-br from-yellow-400/30 to-orange-500/30 backdrop-blur-sm rounded-3xl p-6 border-2 border-yellow-300/50 mb-6">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-4xl">
                        👑
                    </div>
                    <div class="flex-1">
                        <div class="text-yellow-100 text-sm font-bold mb-1">HALAQAH TERBAIK HARI INI</div>
                        <div class="text-white text-3xl font-bold">${topHalaqah.name}</div>
                        <div class="text-white/90 text-sm mt-1">${topHalaqah.members} Anggota • ${topHalaqah.todaySubmissions} Setoran Hari Ini</div>
                    </div>
                    <div class="text-right">
                        <div class="text-5xl font-bold text-white">${topHalaqah.todayPoints}</div>
                        <div class="text-white/80 text-sm">poin hari ini</div>
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-3 mt-4">
                    <div class="bg-white/20 rounded-xl p-3 text-center">
                        <div class="text-2xl font-bold text-white">${topHalaqah.todayAverage}</div>
                        <div class="text-white/80 text-xs">Rata-rata</div>
                    </div>
                    <div class="bg-white/20 rounded-xl p-3 text-center">
                        <div class="text-2xl font-bold text-white">${topHalaqah.points}</div>
                        <div class="text-white/80 text-xs">Total Poin</div>
                    </div>
                    <div class="bg-white/20 rounded-xl p-3 text-center">
                        <div class="text-2xl font-bold text-white">#${topHalaqah.rank}</div>
                        <div class="text-white/80 text-xs">Ranking</div>
                    </div>
                </div>
            </div>
            
            <!-- Top Members -->
            <div class="text-white text-lg font-bold mb-3">Anggota Terbaik:</div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${topMembers.map((student, index) => `
                    <div class="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/15 transition-all">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold">
                                #${index + 1}
                            </div>
                            <div class="flex-1">
                                <div class="font-bold text-white">${student.name}</div>
                                <div class="text-white/80 text-sm">${student.total_points} poin • 🔥 ${student.streak} hari</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <!-- Other Top Halaqahs Today -->
            <div class="text-white text-lg font-bold mb-3 mt-6">Ranking Halaqah Hari Ini:</div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${halaqahTodayPoints.slice(1, 5).map((halaqah, index) => `
                    <div class="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold">
                                #${index + 2}
                            </div>
                            <div class="flex-1">
                                <div class="font-bold text-white">${halaqah.name}</div>
                                <div class="text-white/80 text-sm">${halaqah.todaySubmissions} setoran</div>
                            </div>
                            <div class="text-right">
                                <div class="text-xl font-bold text-white">${halaqah.todayPoints}</div>
                                <div class="text-white/80 text-xs">poin</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderTopHalaqah(container) {
    const topHalaqahs = dashboardData.halaqahs.slice(0, 8);
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-16">
            ${topHalaqahs.map((halaqah, index) => {
                const medals = ['🥇', '🥈', '🥉'];
                const medal = index < 3 ? medals[index] : '';
                const bgClass = index < 3 ? 'bg-white/20' : 'bg-white/10';
                
                return `
                    <div class="${bgClass} backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/25 transition-all">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-xl bg-white/30 flex items-center justify-center text-white font-bold text-xl">
                                ${medal || '#' + (index + 1)}
                            </div>
                            <div class="flex-1">
                                <div class="font-bold text-white text-lg">${halaqah.name}</div>
                                <div class="text-white/80 text-sm">${halaqah.members} Anggota</div>
                            </div>
                            <div class="text-right">
                                <div class="text-2xl font-bold text-white">${halaqah.points}</div>
                                <div class="text-white/80 text-xs">poin</div>
                            </div>
                        </div>
                        <div class="mt-3 flex items-center justify-between text-white/90 text-sm">
                            <div>Rata-rata: ${halaqah.avgPoints} poin</div>
                            <div class="px-2 py-1 rounded-full bg-white/20 text-xs font-bold">${halaqah.status}</div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderStreakLeaders(container) {
    const streakLeaders = [...dashboardData.students]
        .sort((a, b) => b.streak - a.streak)
        .slice(0, 10);
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-16">
            ${streakLeaders.map((student, index) => {
                const bgClass = index < 3 ? 'bg-white/20' : 'bg-white/10';
                
                return `
                    <div class="${bgClass} backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/25 transition-all">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-2xl">
                                🔥
                            </div>
                            <div class="flex-1">
                                <div class="font-bold text-white text-lg">${student.name}</div>
                                <div class="text-white/80 text-sm">Halaqah ${student.halaqah}</div>
                            </div>
                            <div class="text-right">
                                <div class="text-3xl font-bold text-orange-300">${student.streak}</div>
                                <div class="text-white/80 text-xs">hari beruntun</div>
                            </div>
                        </div>
                        <div class="mt-3 text-white/90 text-sm">
                            Total Poin: <span class="font-bold">${student.total_points}</span> • 
                            Hafalan: <span class="font-bold">${student.total_hafalan || 0} Hal</span>
                        </div>
                    </div>
                `;
            }).join('')}
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
    
    // Update dots
    const dotsContainer = document.getElementById('sliderDots');
    if (dotsContainer) {
        dotsContainer.innerHTML = slides.map((_, index) => `
            <button onclick="goToSlide(${index})" class="w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50'}" aria-label="Go to slide ${index + 1}"></button>
        `).join('');
    }
}

function startAutoPlay() {
    if (autoPlayInterval) return;
    
    isAutoPlaying = true;
    autoPlayInterval = setInterval(() => {
        nextSlide();
    }, 5000); // Change slide every 5 seconds
    
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

// Initialize slider
function initSlider() {
    renderSlider();
    startAutoPlay();
}

// Export functions
window.renderSlider = renderSlider;
window.initSlider = initSlider;
window.nextSlide = nextSlide;
window.previousSlide = previousSlide;
window.goToSlide = goToSlide;
window.toggleAutoPlay = toggleAutoPlay;
