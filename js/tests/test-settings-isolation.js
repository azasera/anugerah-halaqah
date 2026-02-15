
// Mock environment
const localStorageMock = {
    store: {},
    getItem: function(key) { return this.store[key] || null; },
    setItem: function(key, value) { this.store[key] = value.toString(); },
    removeItem: function(key) { delete this.store[key]; }
};

global.localStorage = localStorageMock;

// Mock data
const defaultSesiHalaqah = [
    { id: 1, name: "Sesi 1", startTime: "07:00", endTime: "09:00", active: true }
];

const appSettings = {
    lembaga: {
        MTA: { name: "MTA" },
        SDITA_1: { name: "SDITA 1" }
    }
};

// Function under test (copied from settings.js with minor adjustments for context)
function loadSettings() {
    const saved = localStorage.getItem('appSettings');
    if (saved) {
        const savedSettings = JSON.parse(saved);
        
        if (savedSettings.lembaga) {
            Object.keys(savedSettings.lembaga).forEach(key => {
                if (!savedSettings.lembaga[key].sesiHalaqah) {
                    // FIX APPLIED HERE:
                    const sourceSesi = savedSettings.sesiHalaqah || defaultSesiHalaqah;
                    savedSettings.lembaga[key].sesiHalaqah = JSON.parse(JSON.stringify(sourceSesi));
                }
            });
        }
        
        delete savedSettings.sesiHalaqah;
        Object.assign(appSettings, savedSettings);
    }
}

// Test Case 1: Migration from global settings
console.log('Test 1: Migration from global settings');

// Setup legacy state in localStorage
const legacyState = {
    sesiHalaqah: [{ id: 1, name: "Global Sesi", startTime: "08:00", endTime: "10:00", active: true }],
    lembaga: {
        MTA: { name: "MTA" }, // No sesiHalaqah
        SDITA_1: { name: "SDITA 1" } // No sesiHalaqah
    }
};

localStorage.setItem('appSettings', JSON.stringify(legacyState));

// Run loadSettings
loadSettings();

// Verify isolation
const mtaSesi = appSettings.lembaga.MTA.sesiHalaqah;
const sditaSesi = appSettings.lembaga.SDITA_1.sesiHalaqah;

console.log('MTA Sesi exists:', !!mtaSesi);
console.log('SDITA Sesi exists:', !!sditaSesi);

// Modify MTA
mtaSesi[0].name = "Modified MTA Sesi";

console.log('MTA Name:', mtaSesi[0].name);
console.log('SDITA Name:', sditaSesi[0].name);

if (mtaSesi[0].name !== sditaSesi[0].name) {
    console.log('✅ PASS: Sesi objects are isolated');
} else {
    console.error('❌ FAIL: Sesi objects are shared!');
}

// Verify values match legacy
if (sditaSesi[0].name === "Global Sesi") {
    console.log('✅ PASS: Default value preserved correctly');
} else {
    console.error('❌ FAIL: Default value incorrect');
}
