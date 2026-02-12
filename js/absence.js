// Absence Tracking Module - Track students who don't submit

let lastAbsenceRender = 0;
const ABSENCE_RENDER_COOLDOWN = 5000; // Only re-render every 5 seconds

function renderAbsenceTracker(force = false) {
    const container = document.getElementById('absensiContainer');
    if (!container) return;
    
    // Prevent frequent re-renders to avoid flickering
    const now = Date.now();
    if (!force && (now - lastAbsenceRender) < ABSENCE_RENDER_COOLDOWN) {
        return;
    }
    lastAbsenceRender = now;
    
    const content = `
        <div class="glass rounded-3xl p-8 border border-slate-200 shadow-sm">
            <div class="flex items-center justify-between mb-6">
                <h3 class="font-display font-bold text-2xl text-slate-800 flex items-center gap-2">
                    <span class="w-2 h-8 bg-red-500 rounded-full"></span>
                    📋 Tracking Ketidakhadiran
                </h3>
            </div>
            
            <div class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div class="flex items-center gap-2 text-red-700 mb-2">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="font-bold text-sm">Tidak Setor = -1 Poin</span>
                </div>
                <p class="text-sm text-red-600">Santri yang tidak setor sama sekali akan mendapat pengurangan 1 poin.</p>
            </div>
            
            <div class="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                ${dashboardData.students.map(student => {
                    const today = new Date().toDateString();
                    const hasSetoranToday = student.setoran?.some(s => 
                        new Date(s.date).toDateString() === today
                    );
                    
                    return `
                        <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                            <div class="flex items-center gap-3">
                                <input type="checkbox" 
                                    id="absent_${student.id}" 
                                    ${hasSetoranToday ? 'disabled' : ''}
                                    class="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500">
                                <label for="absent_${student.id}" class="cursor-pointer">
                                    <div class="font-bold text-slate-800">${student.name}</div>
                                    <div class="text-xs text-slate-500">Halaqah ${student.halaqah}</div>
                                </label>
                            </div>
                            <div>
                                ${hasSetoranToday 
                                    ? '<span class="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold">✅ Sudah Setor</span>'
                                    : '<span class="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full font-bold">❌ Belum Setor</span>'
                                }
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div class="flex gap-3 mt-6 pt-4 border-t border-slate-200">
                ${(typeof currentProfile !== 'undefined' && currentProfile && (currentProfile.role === 'admin' || currentProfile.role === 'guru')) ? `
                <button onclick="applyAbsencePenalty()" 
                    class="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors">
                    Terapkan Pengurangan Poin
                </button>
                ` : ''}
            </div>
        </div>
    `;
    
    container.innerHTML = content;
}

function showAbsenceTracker() {
    // For backward compatibility - scroll to section and force render
    scrollToSection('absensi');
    renderAbsenceTracker(true);
}

function applyAbsencePenalty() {
    const checkboxes = document.querySelectorAll('[id^="absent_"]:checked');
    let count = 0;
    
    checkboxes.forEach(checkbox => {
        const studentId = parseInt(checkbox.id.replace('absent_', ''));
        const student = dashboardData.students.find(s => s.id === studentId);
        
        if (student) {
            // Add absence record
            if (!student.setoran) student.setoran = [];
            
            student.setoran.push({
                id: Date.now() + Math.floor(Math.random() * 1000),
                date: new Date().toISOString(),
                lembaga: student.lembaga || 'MTA',
                sesi: 'Tidak Hadir',
                baris: 0,
                halaman: 0,
                kelancaran: 'tidak_hadir',
                kesalahan: 0,
                tepatWaktu: false,
                capaiTarget: false,
                poin: poinRules.tidakSetor,
                status: 'Tidak Setor',
                note: 'Tidak hadir/tidak setor',
                timestamp: new Date().toLocaleString('id-ID')
            });
            
            student.total_points += poinRules.tidakSetor;
            student.streak = 0; // Reset streak
            count++;
        }
    });
    
    if (count > 0) {
        recalculateRankings();
        StorageManager.save();
        if (window.autoSync) autoSync();
        refreshAllData();
        showNotification(`⚠️ ${count} santri mendapat pengurangan poin karena tidak setor`);
    } else {
        showNotification('Tidak ada santri yang dipilih');
    }
}

// Make functions globally accessible
window.renderAbsenceTracker = renderAbsenceTracker;
window.showAbsenceTracker = showAbsenceTracker;
window.applyAbsencePenalty = applyAbsencePenalty;
