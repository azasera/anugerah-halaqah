// Settings and Configuration Module

const poinRules = {
    tepatWaktuLancarTarget: 2,      // Tepat waktu, lancar, capai target
    tepatWaktuTidakLancarTarget: 1, // Tepat waktu, tidak lancar (max 3 salah), capai target
    tepatWaktuLancarTidakTarget: 0, // Tepat waktu, lancar, tidak capai target
    tidakTepatWaktu: 0,             // Tidak tepat waktu (apapun kondisinya)
    tidakSetor: -1                  // Tidak setor sama sekali
};

const defaultSesiHalaqah = [
    {
        id: 1,
        name: "Sesi 1",
        startTime: "07:00",
        endTime: "09:00",
        active: true
    },
    {
        id: 2,
        name: "Sesi 2",
        startTime: "13:00",
        endTime: "15:00",
        active: true
    },
    {
        id: 3,
        name: "Sesi 3",
        startTime: "15:30",
        endTime: "17:30",
        active: true
    }
];

const appSettings = {
    lembaga: {
        MTA: {
            name: "MTA",
            barisPerHalaman: 15,
            targetBaris: 15,
            sesiHalaqah: JSON.parse(JSON.stringify(defaultSesiHalaqah))
        },
        SDITA_1: {
            name: "SDITA Kelas 1",
            barisPerHalaman: 5,
            targetBaris: 5,
            sesiHalaqah: JSON.parse(JSON.stringify(defaultSesiHalaqah))
        },
        SDITA_2: {
            name: "SDITA Kelas 2",
            barisPerHalaman: 7,
            targetBaris: 7,
            sesiHalaqah: JSON.parse(JSON.stringify(defaultSesiHalaqah))
        },
        SDITA_3: {
            name: "SDITA Kelas 3",
            barisPerHalaman: 10,
            targetBaris: 10,
            sesiHalaqah: JSON.parse(JSON.stringify(defaultSesiHalaqah))
        },
        SDITA_4: {
            name: "SDITA Kelas 4",
            barisPerHalaman: 12,
            targetBaris: 12,
            sesiHalaqah: JSON.parse(JSON.stringify(defaultSesiHalaqah))
        },
        SDITA_5: {
            name: "SDITA Kelas 5",
            barisPerHalaman: 15,
            targetBaris: 15,
            sesiHalaqah: JSON.parse(JSON.stringify(defaultSesiHalaqah))
        },
        SDITA_6: {
            name: "SDITA Kelas 6",
            barisPerHalaman: 15,
            targetBaris: 15,
            sesiHalaqah: JSON.parse(JSON.stringify(defaultSesiHalaqah))
        },
        SMPITA: {
            name: "SMPITA",
            barisPerHalaman: 10,
            targetBaris: 10,
            sesiHalaqah: JSON.parse(JSON.stringify(defaultSesiHalaqah))
        },
        SMAITA: {
            name: "SMAITA",
            barisPerHalaman: 10,
            targetBaris: 10,
            sesiHalaqah: JSON.parse(JSON.stringify(defaultSesiHalaqah))
        }
    },
    /** Libur sekolah global: { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' } — semua lembaga dianggap libur */
    schoolBreak: null
};

// Helper to apply settings with migration logic
function applySettings(savedSettings) {
    // Migration logic: Ensure every lembaga has sesiHalaqah
    // We iterate over appSettings.lembaga (the source of truth for keys)
    // and merge from savedSettings where available.
    if (appSettings.lembaga) {
        Object.keys(appSettings.lembaga).forEach(key => {
            const savedLembaga = savedSettings.lembaga ? savedSettings.lembaga[key] : null;

            if (savedLembaga) {
                // Ensure sesiHalaqah exists in saved data before merging
                if (!savedLembaga.sesiHalaqah) {
                    // Use old global sesiHalaqah if available, or default
                    const sourceSesi = savedSettings.sesiHalaqah || defaultSesiHalaqah;
                    savedLembaga.sesiHalaqah = JSON.parse(JSON.stringify(sourceSesi));
                }

                // Ensure holidays array exists
                if (!savedLembaga.holidays) {
                    savedLembaga.holidays = [];
                }

                // Merge saved properties into appSettings
                // This preserves properties in appSettings that are missing in savedSettings (new features)
                // And overwrites properties that exist in savedSettings (user preferences)
                Object.assign(appSettings.lembaga[key], savedLembaga);
            }
        });
    }

    if (savedSettings.schoolBreak !== undefined) {
        appSettings.schoolBreak = savedSettings.schoolBreak;
    }
}

/** Hari ini dalam rentang libur sekolah (global). */
function isSchoolBreakActive() {
    const sb = appSettings.schoolBreak;
    if (!sb || !sb.start || !sb.end) return false;
    const today = new Date().toISOString().split('T')[0];
    return today >= sb.start && today <= sb.end;
}

// Load settings from localStorage first, then Supabase
async function loadSettings() {
    // 1. Load from localStorage (Instant)
    try {
        const saved = localStorage.getItem('appSettings');
        if (saved) {
            const savedSettings = JSON.parse(saved);
            applySettings(savedSettings);
        }
    } catch (e) {
        console.error('Failed to load local settings:', e);
    }

    // 2. Load from Supabase (Async)
    if (window.supabaseClient) {
        try {
            console.log('🔄 Loading settings from Supabase...');
            const { data, error } = await window.supabaseClient
                .from('app_settings')
                .select('value')
                .eq('key', 'global')
                .single();

            if (error) {
                if (error.code !== 'PGRST116') { // Ignore "Row not found" error
                    console.error('Failed to fetch settings from Supabase:', error);
                }
            } else if (data && data.value) {
                console.log('✅ Settings loaded from Supabase');
                applySettings(data.value);
                // Update localStorage to match remote
                localStorage.setItem('appSettings', JSON.stringify(appSettings));
                
                // If we are on admin page, refresh UI
                if (typeof renderAdminSettings === 'function' && document.getElementById('settingsContainer')) {
                    renderAdminSettings();
                }
            }
        } catch (e) {
            console.error('Error syncing settings:', e);
        }
    }
}

// Save settings to localStorage AND Supabase
async function saveSettings() {
    try {
        // 1. Save to localStorage
        localStorage.setItem('appSettings', JSON.stringify(appSettings));
        
        // 2. Save to Supabase
        if (window.supabaseClient) {
            // Debounce save to prevent spamming
            if (window.saveSettingsTimeout) clearTimeout(window.saveSettingsTimeout);
            
            window.saveSettingsTimeout = setTimeout(async () => {
                try {
                    const { error } = await window.supabaseClient
                        .from('app_settings')
                        .upsert({ 
                            key: 'global', 
                            value: appSettings,
                            updated_at: new Date().toISOString()
                        });
                        
                    if (error) {
                        console.error('Failed to save settings to Supabase:', error);
                        if (typeof showNotification === 'function') {
                            showNotification('⚠️ Disimpan lokal, gagal sync cloud: ' + error.message, 'warning');
                        }
                    } else {
                        console.log('✅ Settings saved to Supabase');
                    }
                } catch (e) {
                    console.error('Error saving to Supabase:', e);
                }
            }, 1000); // 1 second debounce
        }
        
    } catch (e) {
        console.error('Failed to save settings:', e);
        if (typeof showNotification === 'function') {
            showNotification('❌ Gagal menyimpan pengaturan: ' + e.message, 'error');
        }
    }
}

// Subscribe to settings changes
function initSettingsSubscription() {
    if (!window.supabaseClient) return;
    
    // Prevent multiple subscriptions
    if (window.settingsSubscription) return;

    console.log('📡 Subscribing to settings changes...');
    window.settingsSubscription = window.supabaseClient
        .channel('public:app_settings')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_settings', filter: 'key=eq.global' }, (payload) => {
            console.log('🔄 Remote settings updated:', payload);
            if (payload.new && payload.new.value) {
                applySettings(payload.new.value);
                localStorage.setItem('appSettings', JSON.stringify(appSettings));
                
                if (typeof showNotification === 'function') {
                    showNotification('⚙️ Pengaturan diperbarui dari server', 'info');
                }
                
                // Refresh Admin UI if open
                if (typeof renderAdminSettings === 'function' && document.getElementById('settingsContainer')) {
                    renderAdminSettings();
                }
            }
        })
        .subscribe();
}

// Initialize settings subscription after load
setTimeout(initSettingsSubscription, 5000);

// Calculate halaman from baris
function barisToHalaman(baris, lembagaKey) {
    const lembaga = appSettings.lembaga[lembagaKey];
    if (!lembaga) return 0;

    return (baris / lembaga.barisPerHalaman).toFixed(2);
}

// Calculate poin based on baris and target (DEPRECATED - not used anymore)
// Poin now calculated based on conditions: tepat waktu, lancar, capai target
function calculatePoinFromBaris(baris, lembagaKey) {
    console.warn('calculatePoinFromBaris is deprecated. Use condition-based poin calculation instead.');
    return 0;
}

// Check if today is a holiday for specific lembaga (termasuk libur sekolah global)
function isHoliday(lembagaKey) {
    if (isSchoolBreakActive()) return true;

    const today = new Date().toISOString().split('T')[0];
    const lembaga = appSettings.lembaga[lembagaKey];

    if (!lembaga || !lembaga.holidays) return false;

    return lembaga.holidays.includes(today);
}

// Check if current time is within any active session
function getCurrentSession(lembagaKey) {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Get sessions for specific lembaga, or fallback to MTA/Default
    let sessions = [];
    if (lembagaKey && appSettings.lembaga[lembagaKey] && appSettings.lembaga[lembagaKey].sesiHalaqah) {
        sessions = appSettings.lembaga[lembagaKey].sesiHalaqah;
    } else if (appSettings.lembaga['MTA'] && appSettings.lembaga['MTA'].sesiHalaqah) {
        sessions = appSettings.lembaga['MTA'].sesiHalaqah;
    } else {
        // Absolute fallback if everything is broken
        sessions = defaultSesiHalaqah;
    }

    for (const sesi of sessions) {
        if (!sesi.active) continue;

        if (currentTime >= sesi.startTime && currentTime <= sesi.endTime) {
            return sesi;
        }
    }

    return null;
}

// Check if time is within specific session
function isTimeInSession(time, sesiId, lembagaKey) {
    // Get sessions for specific lembaga
    let sessions = [];
    if (lembagaKey && appSettings.lembaga[lembagaKey] && appSettings.lembaga[lembagaKey].sesiHalaqah) {
        sessions = appSettings.lembaga[lembagaKey].sesiHalaqah;
    } else {
        // Fallback to searching in all lembagas? No, just return false or try MTA
        if (appSettings.lembaga['MTA']) {
            sessions = appSettings.lembaga['MTA'].sesiHalaqah;
        }
    }

    const sesi = sessions.find(s => s.id === sesiId);
    if (!sesi || !sesi.active) return false;

    return time >= sesi.startTime && time <= sesi.endTime;
}

// Initialize settings
loadSettings();

// Export functions
window.appSettings = appSettings;
window.poinRules = poinRules;
window.loadSettings = loadSettings;
window.saveSettings = saveSettings;
window.barisToHalaman = barisToHalaman;
window.calculatePoinFromBaris = calculatePoinFromBaris;
window.getCurrentSession = getCurrentSession;
window.isTimeInSession = isTimeInSession;
window.isHoliday = isHoliday;
window.isSchoolBreakActive = isSchoolBreakActive;
