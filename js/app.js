// Main Application Module

// View Switching Function - must be defined early for onclick handlers
function scrollToSection(section) {
    // Get target element first
    let targetElement;
    switch(section) {
        case 'home':
            targetElement = document.getElementById('home');
            break;
        case 'stats':
            targetElement = document.getElementById('stats');
            break;
        case 'halaqah':
            targetElement = document.getElementById('halaqah');
            break;
        case 'santri':
            targetElement = document.getElementById('santri');
            break;
        case 'poinRules':
            targetElement = document.getElementById('poinRules');
            break;
        case 'absensi':
            targetElement = document.getElementById('absensi');
            break;
        case 'settings':
            targetElement = document.getElementById('settings');
            break;
        case 'users':
            targetElement = document.getElementById('users');
            break;
        default:
            targetElement = document.getElementById(section);
            break;
    }
    
    // If target doesn't exist, do nothing
    if (!targetElement) return;
    
    // Use requestAnimationFrame for smooth transition
    requestAnimationFrame(() => {
        // Hide all sections first
        const sections = ['home', 'stats', 'halaqah', 'santri', 'poinRules', 'absensi', 'settings', 'users'];
        sections.forEach(s => {
            const element = document.getElementById(s);
            if (element) {
                element.classList.add('hidden');
            }
        });
        
        // Show/hide slider based on section
        const slider = document.getElementById('rankingSlider');
        if (slider) {
            if (section === 'settings' || section === 'users') {
                slider.classList.add('hidden');
            } else {
                slider.classList.remove('hidden');
            }
        }
        
        // Then show target in next frame
        requestAnimationFrame(() => {
            if (section === 'home') {
                // Home View: Show Stats/Banner + Rankings
                document.getElementById('home')?.classList.remove('hidden');
                
                const halaqah = document.getElementById('halaqah');
                if (halaqah) {
                    halaqah.classList.remove('hidden');
                    halaqah.classList.remove('lg:col-span-12');
                    halaqah.classList.add('lg:col-span-4');
                }
                
                const santri = document.getElementById('santri');
                if (santri) {
                    santri.classList.remove('hidden');
                    santri.classList.remove('lg:col-span-12');
                    santri.classList.add('lg:col-span-8');
                }
            } else {
                targetElement.classList.remove('hidden');
            }
            
            // Handle special cases
            switch(section) {
                case 'stats':
                    // Render stats to standalone container
                    if (typeof generateStatsHTML === 'function') {
                        const statsHtml = generateStatsHTML();
                        const standaloneContainer = document.getElementById('statsContainerStandalone');
                        if (standaloneContainer) {
                            standaloneContainer.innerHTML = statsHtml;
                        }
                    }
                    break;
                case 'halaqah':
                    // Make it full width when standalone
                    if (section !== 'home') {
                        targetElement.classList.remove('lg:col-span-4');
                        targetElement.classList.add('lg:col-span-12');
                    }
                    break;
                case 'santri':
                    // Make it full width when standalone
                    if (section !== 'home') {
                        targetElement.classList.remove('lg:col-span-8');
                        targetElement.classList.add('lg:col-span-12');
                    }
                    break;
                case 'absensi':
                    // Force render absence tracker when switching to this view
                    if (typeof renderAbsenceTracker === 'function') {
                        renderAbsenceTracker(true);
                    }
                    break;
                case 'settings':
                    // Force render admin settings when switching to this view
                    if (typeof renderAdminSettings === 'function') {
                        renderAdminSettings(true);
                    }
                    break;
                case 'users':
                    // Force render user management when switching to this view
                    if (typeof renderUserManagement === 'function') {
                        renderUserManagement();
                    }
                    break;
            }
            
            // Update active nav item (mobile)
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector(`[data-section="${section}"]`)?.classList.add('active');
            
            // Update active sidebar item (desktop)
            document.querySelectorAll('.sidebar-menu-item').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector(`[data-sidebar-section="${section}"]`)?.classList.add('active');
            
            // Scroll to top of main content
            window.scrollTo({ top: 0, behavior: 'instant' });
        });
    });
}

// Export immediately so onclick handlers can use it
window.scrollToSection = scrollToSection;

function initSearchHandler() {
    const searchInput = document.getElementById('santriSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderSantri(e.target.value, currentFilter);
        });
    }
}

function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // ESC to close modal
        if (e.key === 'Escape') {
            closeModal();
        }
        
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('santriSearch')?.focus();
        }
    });
}

function initApp() {
    // PUBLIC MODE: App works without authentication
    // Login only required for input/edit/delete actions
    
    checkAuth().then(() => {
        // Initialize Supabase (optional, works without it)
        initSupabase().then(() => {
            // Refresh parent-child link with fresh data
            if (typeof refreshUserChildLink === 'function') refreshUserChildLink();

            // Render all components
            try {
                if (typeof initSlider === 'function') initSlider();
                if (typeof renderStats === 'function') renderStats();
                if (typeof renderHalaqahRankings === 'function') renderHalaqahRankings();
                if (typeof renderFilters === 'function') renderFilters();
                if (typeof renderSortButtons === 'function') renderSortButtons();
                if (typeof renderSantri === 'function') renderSantri();
                if (typeof renderAbsenceWidget === 'function') renderAbsenceWidget();
            } catch (error) {
                console.error('Error rendering main components:', error);
            }
            
            // Show home section by default
            scrollToSection('home');
            
            // Setup event handlers
            if (typeof initSearchHandler === 'function') initSearchHandler();
            if (typeof initKeyboardShortcuts === 'function') initKeyboardShortcuts();
            
            // Start clock
            setInterval(updateDateTime, 1000);
            updateDateTime();
            
            // Auto-save to localStorage as backup
            setInterval(() => {
                StorageManager.save();
            }, 60000);

        }).catch(error => {
            console.error('Supabase init error:', error);
            // Even if Supabase fails, render app with local data
             try {
                if (typeof initSlider === 'function') initSlider();
                if (typeof renderStats === 'function') renderStats();
                if (typeof renderHalaqahRankings === 'function') renderHalaqahRankings();
                if (typeof renderFilters === 'function') renderFilters();
                if (typeof renderSortButtons === 'function') renderSortButtons();
                if (typeof renderSantri === 'function') renderSantri();
                if (typeof renderAbsenceWidget === 'function') renderAbsenceWidget();
                
                scrollToSection('home');
            } catch (e) {
                console.error('Error rendering offline app:', e);
            }
        });
    }).catch(error => {
        console.error('Auth check error:', error);
        // Continue anyway - public mode
        console.log('Continuing in public mode');
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}


function toggleFABMenu() {
    const menu = document.getElementById('fabMenu');
    const button = document.getElementById('fabButton');
    
    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        button.style.transform = 'rotate(45deg)';
    } else {
        menu.classList.add('hidden');
        button.style.transform = 'rotate(0deg)';
    }
}

window.toggleFABMenu = toggleFABMenu;


function showQuickActions() {
    const modal = document.getElementById('quickActionsModal');
    modal.classList.remove('hidden');
}

function closeQuickActions() {
    const modal = document.getElementById('quickActionsModal');
    modal.classList.add('hidden');
}

window.showQuickActions = showQuickActions;
window.closeQuickActions = closeQuickActions;
