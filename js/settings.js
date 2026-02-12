// Settings and Configuration Module

const poinRules = {
    tepatWaktuLancarTarget: 2,      // Tepat waktu, lancar, capai target
    tepatWaktuTidakLancarTarget: 1, // Tepat waktu, tidak lancar (max 3 salah), capai target
    tepatWaktuLancarTidakTarget: 0, // Tepat waktu, lancar, tidak capai target
    tidakTepatWaktu: 0,             // Tidak tepat waktu (apapun kondisinya)
    tidakSetor: -1                  // Tidak setor sama sekali
};

const appSettings = {
    lembaga: {
        MTA: {
            name: "MTA",
            barisPerHalaman: 15,
            targetBaris: 15,
            poinPerTarget: 10
        },
        SDITA_1: {
            name: "SDITA Kelas 1",
            barisPerHalaman: 5,
            targetBaris: 5,
            poinPerTarget: 10
        },
        SDITA_2: {
            name: "SDITA Kelas 2",
            barisPerHalaman: 7,
            targetBaris: 7,
            poinPerTarget: 10
        },
        SDITA_3: {
            name: "SDITA Kelas 3",
            barisPerHalaman: 10,
            targetBaris: 10,
            poinPerTarget: 10
        },
        SDITA_4: {
            name: "SDITA Kelas 4",
            barisPerHalaman: 12,
            targetBaris: 12,
            poinPerTarget: 10
        },
        SDITA_5: {
            name: "SDITA Kelas 5",
            barisPerHalaman: 15,
            targetBaris: 15,
            poinPerTarget: 10
        },
        SDITA_6: {
            name: "SDITA Kelas 6",
            barisPerHalaman: 15,
            targetBaris: 15,
            poinPerTarget: 10
        },
        SMPITA: {
            name: "SMPITA",
            barisPerHalaman: 10,
            targetBaris: 10,
            poinPerTarget: 10
        },
        SMAITA: {
            name: "SMAITA",
            barisPerHalaman: 10,
            targetBaris: 10,
            poinPerTarget: 10
        }
    },
    sesiHalaqah: [
        {
            id: 1,
            name: "Sesi 1 - Pagi",
            startTime: "07:00",
            endTime: "09:00",
            active: true
        },
        {
            id: 2,
            name: "Sesi 2 - Siang",
            startTime: "13:00",
            endTime: "15:00",
            active: true
        },
        {
            id: 3,
            name: "Sesi 3 - Sore",
            startTime: "15:30",
            endTime: "17:30",
            active: true
        }
    ]
};

// Load settings from localStorage
function loadSettings() {
    const saved = localStorage.getItem('appSettings');
    if (saved) {
        const savedSettings = JSON.parse(saved);
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

// Calculate poin based on baris and target
function calculatePoinFromBaris(baris, lembagaKey) {
    const lembaga = appSettings.lembaga[lembagaKey];
    if (!lembaga) return 0;
    
    const targetsMet = Math.floor(baris / lembaga.targetBaris);
    return targetsMet * lembaga.poinPerTarget;
}

// Check if current time is within any active session
function getCurrentSession() {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    for (const sesi of appSettings.sesiHalaqah) {
        if (!sesi.active) continue;
        
        if (currentTime >= sesi.startTime && currentTime <= sesi.endTime) {
            return sesi;
        }
    }
    
    return null;
}

// Check if time is within specific session
function isTimeInSession(time, sesiId) {
    const sesi = appSettings.sesiHalaqah.find(s => s.id === sesiId);
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
