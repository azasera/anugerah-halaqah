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
    }
};

// Load settings from localStorage
function loadSettings() {
    const saved = localStorage.getItem('appSettings');
    if (saved) {
        const savedSettings = JSON.parse(saved);

        // Migration logic: Ensure every lembaga has sesiHalaqah
        if (savedSettings.lembaga) {
            Object.keys(savedSettings.lembaga).forEach(key => {
                if (!savedSettings.lembaga[key].sesiHalaqah) {
                    // Use old global sesiHalaqah if available, or default
                    // IMPORTANT: Must use deep copy to prevent shared references between lembagas
                    const sourceSesi = savedSettings.sesiHalaqah || defaultSesiHalaqah;
                    savedSettings.lembaga[key].sesiHalaqah = JSON.parse(JSON.stringify(sourceSesi));
                }

                // Ensure holidays array exists
                if (!savedSettings.lembaga[key].holidays) {
                    savedSettings.lembaga[key].holidays = [];
                }
            });
        }

        // Remove old global sesiHalaqah if it exists to clean up
        delete savedSettings.sesiHalaqah;

        Object.assign(appSettings, savedSettings);
    }
}

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('appSettings', JSON.stringify(appSettings));
}

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

// Check if today is a holiday for specific lembaga
function isHoliday(lembagaKey) {
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
