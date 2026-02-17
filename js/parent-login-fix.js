// Parent Login Fix - Auto-load script
// This script ensures parent-child link works correctly

console.log('🔧 Parent Login Fix loaded');

// Override refreshUserChildLink with retry mechanism
(function() {
    const originalRefresh = window.refreshUserChildLink;
    
    window.refreshUserChildLink = async function(retryCount = 0, maxRetries = 10) {
        console.log(`🔍 [FIX] refreshUserChildLink called (attempt ${retryCount + 1}/${maxRetries + 1})`);
        
        if (!window.currentUser || !window.currentProfile || window.currentProfile.role !== 'ortu') {
            window.currentUserChild = null;
            return;
        }

        const nikOrNisn = window.currentUser.email.split('@')[0].trim();
        console.log('[FIX] Looking for student with NIK/NISN:', nikOrNisn);
        console.log('[FIX] Students available:', dashboardData.students.length);

        const dataLoaded = Array.isArray(dashboardData.students) && dashboardData.students.length > 0;
        
        if (!dataLoaded && retryCount < maxRetries) {
            console.log('[FIX] ⏳ Data belum dimuat, menunggu 300ms...');
            await new Promise(resolve => setTimeout(resolve, 300));
            return window.refreshUserChildLink(retryCount + 1, maxRetries);
        }

        let student = null;
        if (dataLoaded) {
            student = dashboardData.students.find(s =>
                (s.nik && String(s.nik).trim() === nikOrNisn) ||
                (s.nisn && String(s.nisn).trim() === nikOrNisn)
            );
        }

        if (student) {
            window.currentUserChild = student;
            console.log('[FIX] ✅ Parent linked to student:', student.name);
            
            // Auto-refresh UI - both mutabaah and santri list
            setTimeout(() => {
                console.log('[FIX] 🔄 Auto-refreshing UI...');
                
                if (typeof renderSantri === 'function') {
                    console.log('[FIX] 📋 Rendering santri list...');
                    renderSantri();
                }
                
                if (typeof refreshAllData === 'function') {
                    console.log('[FIX] 🔄 Refreshing all data...');
                    refreshAllData();
                }
                
                // Force re-render after a short delay to ensure data is ready
                setTimeout(() => {
                    if (typeof renderSantri === 'function') {
                        console.log('[FIX] 🔄 Second render for santri list...');
                        renderSantri();
                    }
                }, 1000);
            }, 500);
            
            return student;
        } else {
            console.warn('[FIX] ❌ No matching student found for ID:', nikOrNisn);
            console.log('[FIX] Available students:', dashboardData.students.map(s => ({
                name: s.name,
                nik: s.nik,
                nisn: s.nisn
            })));
            window.currentUserChild = null;
            return null;
        }
    };
    
    console.log('✅ refreshUserChildLink overridden with fix');
})();

// Monitor tab/section changes and refresh santri list
(function() {
    const originalScrollToSection = window.scrollToSection;
    if (originalScrollToSection) {
        window.scrollToSection = function(section, subSection) {
            // Call original function
            originalScrollToSection(section, subSection);
            
            // If switching to ranking/santri section and user is parent, refresh
            if ((section === 'ranking' || section === 'home') && window.currentProfile?.role === 'ortu') {
                setTimeout(() => {
                    console.log('[FIX] 🔄 Section changed to', section, '- refreshing santri list...');
                    if (typeof renderSantri === 'function') {
                        renderSantri();
                    }
                }, 300);
            }
        };
        console.log('✅ scrollToSection overridden to auto-refresh santri list');
    }
})();

// Override renderSantri for parent to force show currentUserChild
(function() {
    // Wait for renderSantri to be defined
    const checkAndOverride = () => {
        if (typeof window.renderSantri !== 'function') {
            setTimeout(checkAndOverride, 100);
            return;
        }
        
        console.log('[FIX] Overriding renderSantri for parent support...');
        
        const originalRenderSantri = window.renderSantri;
        
        window.renderSantri = function(searchTerm = "") {
            console.log('[FIX] renderSantri called - Role:', window.currentProfile?.role);
            
            // ONLY override for parent, not for guru or admin
            if (window.currentProfile?.role === 'ortu' && window.currentUserChild) {
                console.log('[FIX] 👨‍👩‍👧 Parent mode - showing currentUserChild:', window.currentUserChild.name);
                
                const container = document.getElementById('santriTableBody');
                if (!container) return;
                
                container.innerHTML = "";
                
                const student = window.currentUserChild;
                const isTop = student.overall_ranking <= 3;
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
                
                console.log('[FIX] ✅ Rendered 1 row for parent');
                return;
            }
            
            // For guru and admin, use original function
            console.log('[FIX] Using original renderSantri for role:', window.currentProfile?.role);
            if (originalRenderSantri) {
                originalRenderSantri(searchTerm);
            }
        };
        
        console.log('✅ renderSantri overridden for parent support');
    };
    
    checkAndOverride();
})();

// Auto-run on page load if parent is logged in
window.addEventListener('load', function() {
    setTimeout(function() {
        if (window.currentProfile && window.currentProfile.role === 'ortu') {
            console.log('[FIX] 🔗 Parent detected on page load, refreshing link...');
            window.refreshUserChildLink().then(() => {
                console.log('[FIX] ✅ Auto-refresh completed');
            });
        }
    }, 2000); // Wait 2 seconds for data to load
});

// Also run after Supabase init
const originalInitSupabase = window.initSupabase;
if (originalInitSupabase) {
    window.initSupabase = async function() {
        const result = await originalInitSupabase();
        
        // After Supabase init, refresh parent link
        if (window.currentProfile && window.currentProfile.role === 'ortu') {
            console.log('[FIX] 🔗 Refreshing parent link after Supabase init...');
            await window.refreshUserChildLink();
        }
        
        return result;
    };
}

console.log('✅ Parent Login Fix initialized');
