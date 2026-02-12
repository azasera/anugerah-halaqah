// Absence Tracking Module - Track students who don't submit

let lastAbsenceRender = 0;
const ABSENCE_RENDER_COOLDOWN = 5000; // Only re-render every 5 seconds

// Render absence widget for dashboard
function renderAbsenceWidget() {
    const container = document.getElementById('absenceWidgetContainer');
    if (!container) return;
    
    const today = new Date().toDateString();
    
    // Count students by status
    let notSubmittedCount = 0;
    let submittedCount = 0;
    
    dashboardData.students.forEach(student => {
        const hasSetoranToday = student.setoran?.some(s => 
            new Date(s.date).toDateString() === today
        );
        
        if (hasSetoranToday) {
            submittedCount++;
        } else {
            notSubmittedCount++;
        }
    });
    
    const totalStudents = dashboardData.students.length;
    const percentage = totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0;
    
    // Only show widget if there are students who haven't submitted
    if (notSubmittedCount === 0) {
        container.innerHTML = '';
        return;
    }
    
    const content = `
        <div class="glass rounded-3xl p-6 border-2 ${notSubmittedCount > 0 ? 'border-red-200 bg-red-50/50' : 'border-green-200 bg-green-50/50'}">
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <div class="w-10 h-10 rounded-full ${notSubmittedCount > 0 ? 'bg-red-500' : 'bg-green-500'} flex items-center justify-center">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div>
                            <h3 class="font-bold text-lg text-slate-800">Tracking Kehadiran Hari Ini</h3>
                            <p class="text-sm text-slate-600">Pantau santri yang belum setor</p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-3 gap-3 mt-4">
                        <div class="bg-white rounded-xl p-3 border border-slate-200">
                            <div class="text-2xl font-bold ${percentage >= 80 ? 'text-green-600' : percentage >= 50 ? 'text-amber-600' : 'text-red-600'}">${percentage}%</div>
                            <div class="text-xs text-slate-600 font-semibold">Sudah Setor</div>
                        </div>
                        <div class="bg-white rounded-xl p-3 border border-green-200">
                            <div class="text-2xl font-bold text-green-600">${submittedCount}</div>
                            <div class="text-xs text-green-600 font-semibold">✅ Hadir</div>
                        </div>
                        <div class="bg-white rounded-xl p-3 border border-red-200">
                            <div class="text-2xl font-bold text-red-600">${notSubmittedCount}</div>
                            <div class="text-xs text-red-600 font-semibold">❌ Belum</div>
                        </div>
                    </div>
                </div>
                
                <div class="flex flex-col gap-2 w-full md:w-auto">
                    <button onclick="scrollToSection('absensi')" 
                        class="w-full md:w-auto px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg whitespace-nowrap">
                        📋 Lihat Detail
                    </button>
                    ${notSubmittedCount > 0 ? `
                    <div class="text-xs text-red-600 text-center md:text-right font-semibold">
                        ⚠️ ${notSubmittedCount} santri belum setor
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = content;
}

function renderAbsenceTracker(force = false) {
    const container = document.getElementById('absensiContainer');
    if (!container) return;
    
    // Prevent frequent re-renders to avoid flickering
    const now = Date.now();
    if (!force && (now - lastAbsenceRender) < ABSENCE_RENDER_COOLDOWN) {
        return;
    }
    lastAbsenceRender = now;
    
    const today = new Date().toDateString();
    
    // Separate students by status
    const studentsNotSubmitted = [];
    const studentsSubmitted = [];
    
    dashboardData.students.forEach(student => {
        const hasSetoranToday = student.setoran?.some(s => 
            new Date(s.date).toDateString() === today
        );
        
        if (hasSetoranToday) {
            studentsSubmitted.push(student);
        } else {
            studentsNotSubmitted.push(student);
        }
    });
    
    const totalStudents = dashboardData.students.length;
    const notSubmittedCount = studentsNotSubmitted.length;
    const submittedCount = studentsSubmitted.length;
    const percentage = totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0;
    
    const content = `
        <div class="glass rounded-3xl p-4 md:p-8 border border-slate-200 shadow-sm">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 class="font-display font-bold text-2xl text-slate-800 flex items-center gap-2">
                        <span class="w-2 h-8 bg-red-500 rounded-full"></span>
                        📋 Tracking Ketidakhadiran
                    </h3>
                    <p class="text-sm text-slate-500 mt-1">Pantau santri yang belum setor hari ini</p>
                </div>
                <div class="text-right">
                    <div class="text-3xl font-bold ${percentage >= 80 ? 'text-green-600' : percentage >= 50 ? 'text-amber-600' : 'text-red-600'}">${percentage}%</div>
                    <div class="text-xs text-slate-500">Sudah Setor</div>
                </div>
            </div>
            
            <!-- Statistics -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div class="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4">
                    <div class="text-2xl font-bold text-slate-700">${totalStudents}</div>
                    <div class="text-xs text-slate-600 font-semibold">Total Santri</div>
                </div>
                <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                    <div class="text-2xl font-bold text-green-700">${submittedCount}</div>
                    <div class="text-xs text-green-600 font-semibold">✅ Sudah Setor</div>
                </div>
                <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
                    <div class="text-2xl font-bold text-red-700">${notSubmittedCount}</div>
                    <div class="text-xs text-red-600 font-semibold">❌ Belum Setor</div>
                </div>
                <div class="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
                    <div class="text-2xl font-bold text-amber-700">-${notSubmittedCount}</div>
                    <div class="text-xs text-amber-600 font-semibold">Potensi Poin</div>
                </div>
            </div>
            
            <div class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div class="flex items-center gap-2 text-red-700 mb-2">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="font-bold text-sm">Tidak Setor = -1 Poin & Reset Streak</span>
                </div>
                <p class="text-sm text-red-600">Santri yang tidak setor sama sekali akan mendapat pengurangan 1 poin dan streak direset ke 0.</p>
            </div>
            
            <!-- Filter Tabs -->
            <div class="flex gap-2 mb-4 border-b border-slate-200">
                <button onclick="filterAbsence('belum')" id="tab-belum" class="absence-tab active px-4 py-2 font-bold text-sm border-b-2 border-red-600 text-red-600">
                    Belum Setor (${notSubmittedCount})
                </button>
                <button onclick="filterAbsence('sudah')" id="tab-sudah" class="absence-tab px-4 py-2 font-bold text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-700">
                    Sudah Setor (${submittedCount})
                </button>
                <button onclick="filterAbsence('semua')" id="tab-semua" class="absence-tab px-4 py-2 font-bold text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-700">
                    Semua (${totalStudents})
                </button>
            </div>
            
            ${(typeof currentProfile !== 'undefined' && currentProfile && (currentProfile.role === 'admin' || currentProfile.role === 'guru')) && notSubmittedCount > 0 ? `
            <div class="flex gap-2 mb-4">
                <button onclick="selectAllAbsent()" 
                    class="flex-1 bg-amber-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-amber-700 transition-colors text-sm">
                    ✓ Pilih Semua yang Belum Setor
                </button>
                <button onclick="deselectAllAbsent()" 
                    class="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-300 transition-colors text-sm">
                    ✗ Batal Pilih
                </button>
            </div>
            ` : ''}
            
            <!-- Students List -->
            <div class="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                <!-- Belum Setor (Priority) -->
                <div id="list-belum" class="space-y-2">
                    ${notSubmittedCount > 0 ? `
                        <div class="text-xs font-bold text-red-600 mb-2 flex items-center gap-2">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                            </svg>
                            BELUM SETOR (${notSubmittedCount})
                        </div>
                    ` : ''}
                    ${studentsNotSubmitted.map(student => `
                        <div class="flex items-center justify-between p-4 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 transition-colors">
                            <div class="flex items-center gap-3">
                                <input type="checkbox" 
                                    id="absent_${student.id}" 
                                    class="absent-checkbox w-5 h-5 rounded border-red-300 text-red-600 focus:ring-red-500">
                                <label for="absent_${student.id}" class="cursor-pointer">
                                    <div class="font-bold text-slate-800">${student.name}</div>
                                    <div class="text-xs text-slate-600">Halaqah ${student.halaqah} • Streak: ${student.streak || 0} hari</div>
                                </label>
                            </div>
                            <span class="px-3 py-1 bg-red-600 text-white text-xs rounded-full font-bold">❌ BELUM SETOR</span>
                        </div>
                    `).join('')}
                    ${notSubmittedCount === 0 ? `
                        <div class="text-center py-8 text-slate-400">
                            <div class="text-4xl mb-2">🎉</div>
                            <div class="font-bold">Semua Santri Sudah Setor!</div>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Sudah Setor -->
                <div id="list-sudah" class="space-y-2 hidden">
                    ${submittedCount > 0 ? `
                        <div class="text-xs font-bold text-green-600 mb-2 flex items-center gap-2">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                            </svg>
                            SUDAH SETOR (${submittedCount})
                        </div>
                    ` : ''}
                    ${studentsSubmitted.map(student => `
                        <div class="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                            <div class="flex items-center gap-3">
                                <div class="w-5 h-5 flex items-center justify-center">
                                    <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                    </svg>
                                </div>
                                <div>
                                    <div class="font-bold text-slate-800">${student.name}</div>
                                    <div class="text-xs text-slate-600">Halaqah ${student.halaqah} • Streak: ${student.streak || 0} hari</div>
                                </div>
                            </div>
                            <span class="px-3 py-1 bg-green-600 text-white text-xs rounded-full font-bold">✅ SUDAH SETOR</span>
                        </div>
                    `).join('')}
                </div>
                
                <!-- Semua -->
                <div id="list-semua" class="space-y-2 hidden">
                    ${dashboardData.students.map(student => {
                        const hasSetoranToday = student.setoran?.some(s => 
                            new Date(s.date).toDateString() === today
                        );
                        
                        return `
                            <div class="flex items-center justify-between p-4 ${hasSetoranToday ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200 border-2'} border rounded-xl hover:opacity-80 transition-colors">
                                <div class="flex items-center gap-3">
                                    ${hasSetoranToday ? `
                                        <div class="w-5 h-5 flex items-center justify-center">
                                            <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                            </svg>
                                        </div>
                                    ` : `
                                        <input type="checkbox" 
                                            id="absent_all_${student.id}" 
                                            class="absent-checkbox-all w-5 h-5 rounded border-red-300 text-red-600 focus:ring-red-500">
                                    `}
                                    <label for="absent_${hasSetoranToday ? '' : 'all_'}${student.id}" class="cursor-pointer">
                                        <div class="font-bold text-slate-800">${student.name}</div>
                                        <div class="text-xs text-slate-600">Halaqah ${student.halaqah} • Streak: ${student.streak || 0} hari</div>
                                    </label>
                                </div>
                                ${hasSetoranToday 
                                    ? '<span class="px-3 py-1 bg-green-600 text-white text-xs rounded-full font-bold">✅ SUDAH</span>'
                                    : '<span class="px-3 py-1 bg-red-600 text-white text-xs rounded-full font-bold">❌ BELUM</span>'
                                }
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            ${(typeof currentProfile !== 'undefined' && currentProfile && (currentProfile.role === 'admin' || currentProfile.role === 'guru')) ? `
            <div class="flex gap-3 mt-6 pt-4 border-t border-slate-200">
                <button onclick="applyAbsencePenalty()" 
                    class="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg">
                    ⚠️ Terapkan Pengurangan Poin
                </button>
            </div>
            ` : ''}
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
    const checkboxes = document.querySelectorAll('[id^="absent_"]:checked, [id^="absent_all_"]:checked');
    let count = 0;
    
    if (checkboxes.length === 0) {
        showNotification('⚠️ Tidak ada santri yang dipilih', 'warning');
        return;
    }
    
    const confirmMsg = `Yakin ingin menerapkan pengurangan poin untuk ${checkboxes.length} santri?\n\nSetiap santri akan:\n- Mendapat -1 poin\n- Streak direset ke 0\n\nTindakan ini tidak dapat dibatalkan!`;
    
    if (!confirm(confirmMsg)) {
        return;
    }
    
    checkboxes.forEach(checkbox => {
        const studentId = parseInt(checkbox.id.replace('absent_', '').replace('absent_all_', ''));
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
        showNotification(`⚠️ ${count} santri mendapat pengurangan poin karena tidak setor`, 'success');
        
        // Re-render to update the list
        setTimeout(() => renderAbsenceTracker(true), 500);
    }
}

// Filter absence list by status
function filterAbsence(filter) {
    // Update tab styles
    document.querySelectorAll('.absence-tab').forEach(tab => {
        tab.classList.remove('active', 'border-red-600', 'text-red-600', 'border-green-600', 'text-green-600', 'border-primary-600', 'text-primary-600');
        tab.classList.add('border-transparent', 'text-slate-500');
    });
    
    const activeTab = document.getElementById(`tab-${filter}`);
    if (activeTab) {
        activeTab.classList.add('active');
        activeTab.classList.remove('border-transparent', 'text-slate-500');
        
        if (filter === 'belum') {
            activeTab.classList.add('border-red-600', 'text-red-600');
        } else if (filter === 'sudah') {
            activeTab.classList.add('border-green-600', 'text-green-600');
        } else {
            activeTab.classList.add('border-primary-600', 'text-primary-600');
        }
    }
    
    // Show/hide lists
    document.getElementById('list-belum').classList.add('hidden');
    document.getElementById('list-sudah').classList.add('hidden');
    document.getElementById('list-semua').classList.add('hidden');
    
    document.getElementById(`list-${filter}`).classList.remove('hidden');
}

// Select all absent students
function selectAllAbsent() {
    document.querySelectorAll('.absent-checkbox').forEach(checkbox => {
        checkbox.checked = true;
    });
    showNotification('✓ Semua santri yang belum setor dipilih', 'info');
}

// Deselect all
function deselectAllAbsent() {
    document.querySelectorAll('.absent-checkbox, .absent-checkbox-all').forEach(checkbox => {
        checkbox.checked = false;
    });
    showNotification('✗ Pilihan dibatalkan', 'info');
}

// Make functions globally accessible
window.renderAbsenceWidget = renderAbsenceWidget;
window.renderAbsenceTracker = renderAbsenceTracker;
window.showAbsenceTracker = showAbsenceTracker;
window.applyAbsencePenalty = applyAbsencePenalty;
window.filterAbsence = filterAbsence;
window.selectAllAbsent = selectAllAbsent;
window.deselectAllAbsent = deselectAllAbsent;
