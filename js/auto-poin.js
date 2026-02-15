// Auto Point Calculation Module
// Automatically calculate points based on rules:
// - Santri yang tidak setoran: -1 poin
// - Santri yang setoran: poin sudah dihitung di handleSetoran

// Check if student has submitted setoran today
function hasSetoranToday(student) {
    if (!student.setoran || student.setoran.length === 0) return false;

    const today = new Date().toDateString();
    return student.setoran.some(s => {
        const setoranDate = new Date(s.date).toDateString();
        return setoranDate === today;
    });
}

// Get all students who haven't submitted setoran today
function getStudentsWithoutSetoranToday() {
    return dashboardData.students.filter(student => {
        const lembagaKey = student.lembaga || 'MTA';
        if (typeof isHoliday === 'function' && isHoliday(lembagaKey)) {
            return false; // Skip students on holiday
        }
        return !hasSetoranToday(student);
    });
}

// Apply -1 point penalty for students who didn't submit setoran
async function applyNoSetoranPenalty() {
    const studentsWithoutSetoran = getStudentsWithoutSetoranToday();

    if (studentsWithoutSetoran.length === 0) {
        console.log('✅ All students have submitted setoran today');
        return { success: true, count: 0, students: [] };
    }

    const today = new Date().toISOString().split('T')[0];
    const penaltyRecords = [];

    for (const student of studentsWithoutSetoran) {
        // Check if day has ended for this student's lembaga
        const lembagaKey = student.lembaga || 'MTA';
        if (!isEndOfDay(lembagaKey)) {
            continue;
        }

        // Check if penalty already applied today
        const alreadyPenalized = student.setoran?.some(s => {
            const setoranDate = new Date(s.date).toISOString().split('T')[0];
            return setoranDate === today && s.poin === -1 && s.status === 'Tidak Setor';
        });

        if (alreadyPenalized) {
            console.log(`⏭️ Penalty already applied for ${student.name}`);
            continue;
        }

        // Create penalty record
        const penaltyRecord = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            date: new Date().toISOString(),
            lembaga: '-',
            sesi: '-',
            baris: 0,
            halaman: 0,
            kelancaran: '-',
            kesalahan: 0,
            tepatWaktu: false,
            capaiTarget: false,
            poin: -1,
            status: 'Tidak Setor',
            note: 'Auto-penalty: Tidak ada setoran hari ini',
            timestamp: new Date().toLocaleString('id-ID'),
            isAutoPenalty: true
        };

        // Add penalty to student record
        if (!student.setoran) student.setoran = [];
        student.setoran.push(penaltyRecord);
        student.total_points += -1; // Subtract 1 point
        student.lastActivity = 'Tidak setor';

        // Reset streak
        student.streak = 0;

        penaltyRecords.push({
            studentId: student.id,
            studentName: student.name,
            halaqah: student.halaqah,
            penalty: -1
        });

        console.log(`❌ Applied -1 penalty to ${student.name}`);

        // Sync to Supabase if available
        if (window.supabaseClient) {
            try {
                const halaqah = dashboardData.halaqahs.find(h =>
                    h.name === `Halaqah ${student.halaqah}` || h.name === student.halaqah
                );

                if (halaqah) {
                    await window.SetoranHarian.create(
                        student.id,
                        halaqah.id,
                        -1,
                        'Auto-penalty: Tidak ada setoran hari ini'
                    );
                }
            } catch (error) {
                console.error(`Error syncing penalty for ${student.name}:`, error);
            }
        }
    }

    if (penaltyRecords.length > 0) {
        recalculateRankings();
        StorageManager.save();

        // Sync to Supabase
        if (typeof syncStudentsToSupabase === 'function') {
            syncStudentsToSupabase().catch(err => console.error('Auto-sync error:', err));
        }

        refreshAllData();
    }

    return {
        success: true,
        count: penaltyRecords.length,
        students: penaltyRecords
    };
}

// Manual trigger for admin to apply penalties
async function manualApplyPenalties() {
    const result = await applyNoSetoranPenalty();

    if (result.count === 0) {
        showNotification('✅ Semua santri sudah setoran hari ini');
    } else {
        showNotification(`✅ Penalty -1 poin diterapkan ke ${result.count} santri`);
    }

    return result;
}

// Check if it's end of day (after last session)
function isEndOfDay(lembagaKey) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Get sessions for specific lembaga
    const settings = appSettings.lembaga[lembagaKey] || appSettings.lembaga['MTA'];
    const sessions = settings.sesiHalaqah || [];

    // Get last session end time
    const lastSession = sessions
        .filter(s => s.active)
        .sort((a, b) => {
            const aEnd = a.endTime.split(':').map(Number);
            const bEnd = b.endTime.split(':').map(Number);
            return (bEnd[0] * 60 + bEnd[1]) - (aEnd[0] * 60 + aEnd[1]);
        })[0];

    if (!lastSession) return false;

    const [endHour, endMinute] = lastSession.endTime.split(':').map(Number);
    const lastSessionEnd = endHour * 60 + endMinute;

    // End of day is 30 minutes after last session ends
    return currentTime >= (lastSessionEnd + 30);
}

// Auto-check and apply penalties (runs periodically)
async function autoCheckAndApplyPenalties() {
    console.log('🔍 Running auto-penalty check...');
    const result = await applyNoSetoranPenalty();

    if (result.count > 0) {
        console.log(`✅ Auto-applied penalties to ${result.count} students`);
    }
}

// Initialize auto-check (runs every hour)
function initAutoPenaltyCheck() {
    // COMPLETELY DISABLED: Auto-penalty check to prevent duplicate penalties
    console.log('🛑 Auto-penalty check is PERMANENTLY DISABLED.');
}

// Show penalty report
function showPenaltyReport() {
    const studentsWithoutSetoran = getStudentsWithoutSetoranToday();

    const content = `
        <div class="p-8">
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="font-display font-bold text-3xl text-slate-800 mb-2">📊 Laporan Setoran Hari Ini</h2>
                    <p class="text-slate-500">Santri yang belum setoran akan mendapat penalty -1 poin</p>
                </div>
                <button onclick="closeModal()" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div class="text-green-600 text-sm font-bold mb-1">Sudah Setoran</div>
                    <div class="text-3xl font-bold text-green-700">${dashboardData.students.length - studentsWithoutSetoran.length}</div>
                </div>
                <div class="bg-red-50 rounded-xl p-4 border border-red-200">
                    <div class="text-red-600 text-sm font-bold mb-1">Belum Setoran</div>
                    <div class="text-3xl font-bold text-red-700">${studentsWithoutSetoran.length}</div>
                </div>
            </div>
            
            ${studentsWithoutSetoran.length > 0 ? `
                <div class="mb-6">
                    <h3 class="font-bold text-lg text-slate-800 mb-3">Santri Belum Setoran:</h3>
                    <div class="space-y-2 max-h-96 overflow-y-auto">
                        ${studentsWithoutSetoran.map(s => `
                            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <div>
                                    <div class="font-bold text-slate-800">${s.name}</div>
                                    <div class="text-sm text-slate-500">Halaqah ${s.halaqah}</div>
                                </div>
                                <div class="text-red-600 font-bold">-1 poin</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                    <div class="flex items-start gap-3">
                        <svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                        </svg>
                        <div class="text-sm text-amber-800">
                            <div class="font-bold mb-1">Perhatian!</div>
                            <div>Klik tombol "Terapkan Penalty" untuk mengurangi poin santri yang belum setoran. Aksi ini tidak dapat dibatalkan.</div>
                        </div>
                    </div>
                </div>
                
                <div class="flex gap-3">
                    <button onclick="closeModal(); manualApplyPenalties()" 
                        class="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg">
                        ⚠️ Terapkan Penalty (-1 poin)
                    </button>
                    <button onclick="closeModal()" 
                        class="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                        Batal
                    </button>
                </div>
            ` : `
                <div class="text-center py-8">
                    <div class="text-6xl mb-4">🎉</div>
                    <div class="text-xl font-bold text-slate-800 mb-2">Semua Santri Sudah Setoran!</div>
                    <div class="text-slate-500">Tidak ada penalty yang perlu diterapkan hari ini</div>
                </div>
                
                <div class="flex justify-center pt-4">
                    <button onclick="closeModal()" 
                        class="px-8 py-3 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 transition-colors">
                        Tutup
                    </button>
                </div>
            `}
        </div>
    `;

    createModal(content, false);
}

// Export functions
window.AutoPoin = {
    hasSetoranToday,
    getStudentsWithoutSetoranToday,
    applyNoSetoranPenalty,
    manualApplyPenalties,
    isEndOfDay,
    autoCheckAndApplyPenalties,
    initAutoPenaltyCheck,
    showPenaltyReport
};

// Make functions globally accessible
window.manualApplyPenalties = manualApplyPenalties;
window.showPenaltyReport = showPenaltyReport;

// Auto-initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutoPenaltyCheck);
} else {
    initAutoPenaltyCheck();
}
