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
                <div class="relative h-full p-6 md:p-8 flex flex-col">
                    <h2 class="text-2xl md:text-3xl font-bold text-white mb-4">${slide.title}</h2>
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
    const topStudent = dashboardData.students[0];
    const second = dashboardData.students[1];
    const third = dashboardData.students[2];
    
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full px-4">
            <!-- Champion -->
            <div class="text-center mb-6">
                <div class="inline-block p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-3 shadow-2xl">
                    <div class="text-5xl">🥇</div>
                </div>
                <div class="text-white/80 text-xs mb-1">SANTRI TERBAIK</div>
                <div class="text-4xl md:text-5xl font-bold text-white mb-1">${topStudent.name}</div>
                <div class="text-lg text-white/90 mb-3">Halaqah ${topStudent.halaqah}</div>
                <div class="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-white/30">
                    <div class="text-5xl font-bold text-white">${topStudent.total_points}</div>
                    <div class="text-white/80 text-base">Total Poin</div>
                </div>
            </div>
            
            <!-- Runner-ups -->
            <div class="grid grid-cols-2 gap-4 max-w-2xl w-full">
                <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center">
                    <div class="text-3xl mb-1">🥈</div>
                    <div class="text-lg font-bold text-white mb-1">${second.name}</div>
                    <div class="text-white/80 text-xs mb-2">Halaqah ${second.halaqah}</div>
                    <div class="text-2xl font-bold text-white">${second.total_points}</div>
                    <div class="text-white/70 text-xs">poin</div>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center">
                    <div class="text-3xl mb-1">🥉</div>
                    <div class="text-lg font-bold text-white mb-1">${third.name}</div>
                    <div class="text-white/80 text-xs mb-2">Halaqah ${third.halaqah}</div>
                    <div class="text-2xl font-bold text-white">${third.total_points}</div>
                    <div class="text-white/70 text-xs">poin</div>
                </div>
            </div>
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
    const second = halaqahTodayPoints[1];
    const third = halaqahTodayPoints[2];
    
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full px-4">
            <!-- Champion -->
            <div class="text-center mb-6">
                <div class="inline-block p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-3 shadow-2xl">
                    <div class="text-5xl">👑</div>
                </div>
                <div class="text-yellow-100 text-xs mb-1 font-bold">HALAQAH TERBAIK HARI INI</div>
                <div class="text-4xl md:text-5xl font-bold text-white mb-1">${topHalaqah.name}</div>
                <div class="text-lg text-white/90 mb-3">${topHalaqah.members} Anggota • ${topHalaqah.todaySubmissions} Setoran</div>
                <div class="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-white/30">
                    <div class="text-5xl font-bold text-white">${topHalaqah.todayPoints}</div>
                    <div class="text-white/80 text-base">Poin Hari Ini</div>
                </div>
            </div>
            
            <!-- Runner-ups -->
            <div class="grid grid-cols-2 gap-4 max-w-2xl w-full">
                <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center">
                    <div class="text-3xl mb-1">🥈</div>
                    <div class="text-lg font-bold text-white mb-1">${second.name}</div>
                    <div class="text-white/80 text-xs mb-2">${second.todaySubmissions} setoran</div>
                    <div class="text-2xl font-bold text-white">${second.todayPoints}</div>
                    <div class="text-white/70 text-xs">poin hari ini</div>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center">
                    <div class="text-3xl mb-1">🥉</div>
                    <div class="text-lg font-bold text-white mb-1">${third.name}</div>
                    <div class="text-white/80 text-xs mb-2">${third.todaySubmissions} setoran</div>
                    <div class="text-2xl font-bold text-white">${third.todayPoints}</div>
                    <div class="text-white/70 text-xs">poin hari ini</div>
                </div>
            </div>
        </div>
    `;
}

function renderTopHalaqah(container) {
    const topHalaqah = dashboardData.halaqahs[0];
    const second = dashboardData.halaqahs[1];
    const third = dashboardData.halaqahs[2];
    
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full px-4">
            <!-- Champion -->
            <div class="text-center mb-6">
                <div class="inline-block p-4 bg-gradient-to-br from-green-400 to-teal-500 rounded-full mb-3 shadow-2xl">
                    <div class="text-5xl">🏅</div>
                </div>
                <div class="text-white/80 text-xs mb-1">HALAQAH TERBAIK</div>
                <div class="text-4xl md:text-5xl font-bold text-white mb-1">${topHalaqah.name}</div>
                <div class="text-lg text-white/90 mb-3">${topHalaqah.members} Anggota • ${topHalaqah.status}</div>
                <div class="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-white/30">
                    <div class="text-5xl font-bold text-white">${topHalaqah.points}</div>
                    <div class="text-white/80 text-base">Total Poin</div>
                </div>
            </div>
            
            <!-- Runner-ups -->
            <div class="grid grid-cols-2 gap-4 max-w-2xl w-full">
                <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center">
                    <div class="text-3xl mb-1">🥈</div>
                    <div class="text-lg font-bold text-white mb-1">${second.name}</div>
                    <div class="text-white/80 text-xs mb-2">${second.members} anggota</div>
                    <div class="text-2xl font-bold text-white">${second.points}</div>
                    <div class="text-white/70 text-xs">poin</div>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center">
                    <div class="text-3xl mb-1">🥉</div>
                    <div class="text-lg font-bold text-white mb-1">${third.name}</div>
                    <div class="text-white/80 text-xs mb-2">${third.members} anggota</div>
                    <div class="text-2xl font-bold text-white">${third.points}</div>
                    <div class="text-white/70 text-xs">poin</div>
                </div>
            </div>
        </div>
    `;
}

function renderStreakLeaders(container) {
    const topStreak = [...dashboardData.students]
        .sort((a, b) => b.streak - a.streak)[0];
    const second = [...dashboardData.students]
        .sort((a, b) => b.streak - a.streak)[1];
    const third = [...dashboardData.students]
        .sort((a, b) => b.streak - a.streak)[2];
    
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full px-4">
            <!-- Champion -->
            <div class="text-center mb-6">
                <div class="inline-block p-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mb-3 shadow-2xl">
                    <div class="text-5xl">🔥</div>
                </div>
                <div class="text-white/80 text-xs mb-1">STREAK TERPANJANG</div>
                <div class="text-4xl md:text-5xl font-bold text-white mb-1">${topStreak.name}</div>
                <div class="text-lg text-white/90 mb-3">Halaqah ${topStreak.halaqah}</div>
                <div class="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-white/30">
                    <div class="text-5xl font-bold text-orange-300">${topStreak.streak}</div>
                    <div class="text-white/80 text-base">Hari Beruntun</div>
                </div>
            </div>
            
            <!-- Runner-ups -->
            <div class="grid grid-cols-2 gap-4 max-w-2xl w-full">
                <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center">
                    <div class="text-3xl mb-1">🥈</div>
                    <div class="text-lg font-bold text-white mb-1">${second.name}</div>
                    <div class="text-white/80 text-xs mb-2">Halaqah ${second.halaqah}</div>
                    <div class="text-2xl font-bold text-orange-300">${second.streak}</div>
                    <div class="text-white/70 text-xs">hari beruntun</div>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center">
                    <div class="text-3xl mb-1">🥉</div>
                    <div class="text-lg font-bold text-white mb-1">${third.name}</div>
                    <div class="text-white/80 text-xs mb-2">Halaqah ${third.halaqah}</div>
                    <div class="text-2xl font-bold text-orange-300">${third.streak}</div>
                    <div class="text-white/70 text-xs">hari beruntun</div>
                </div>
            </div>
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
