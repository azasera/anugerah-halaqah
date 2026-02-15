// Setoran Harian Integration with Existing UI
// This file bridges the new setoran_harian table with existing UI

// Enhanced showSetoranForm with setoran_harian integration
async function showSetoranFormV2(studentOrId) {
    let student = studentOrId;
    
    // Handle if ID is passed instead of object
    if (typeof studentOrId === 'number' || typeof studentOrId === 'string') {
        const found = dashboardData.students.find(s => s.id == studentOrId);
        if (found) {
            student = found;
        } else {
            console.error('Student not found with ID:', studentOrId);
            showNotification('❌ Data santri tidak ditemukan', 'error');
            return;
        }
    }

    if (!student || !student.name) {
        console.error('Invalid student data:', student);
        showNotification('❌ Data santri tidak valid', 'error');
        return;
    }

    const lembagaKey = student.lembaga || 'MTA';
    const currentSession = getCurrentSession(lembagaKey);
    const isOnTime = currentSession !== null;
    
    // Get recent setoran history
    let recentHistory = '';
    if (window.SetoranHarian) {
        try {
            const history = await SetoranHarian.getHistory(student.id, 5);
            if (history && history.length > 0) {
                recentHistory = `
                    <div class="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 mb-6 border border-slate-200">
                        <div class="flex items-center gap-2 mb-3">
                            <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <h4 class="font-bold text-sm text-slate-700">5 Setoran Terakhir</h4>
                        </div>
                        <div class="space-y-2">
                            ${history.map(h => `
                                <div class="flex justify-between items-center bg-white rounded-lg px-3 py-2 text-xs">
                                    <span class="text-slate-600 font-medium">${new Date(h.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                    <span class="font-mono font-bold px-2 py-1 rounded ${
                                        h.poin >= 2 ? 'bg-green-100 text-green-700' : 
                                        h.poin === 1 ? 'bg-amber-100 text-amber-700' : 
                                        h.poin === 0 ? 'bg-slate-100 text-slate-600' : 
                                        'bg-red-100 text-red-700'
                                    }">
                                        ${h.poin >= 0 ? '+' : ''}${h.poin}
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading history:', error);
        }
    }
    
    const sessionInfo = currentSession 
        ? `<div class="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-4 mb-6">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                </div>
                <div>
                    <div class="font-bold text-green-800">✅ Tepat Waktu!</div>
                    <div class="text-sm text-green-600">${currentSession.name}</div>
                </div>
            </div>
        </div>`
        : `<div class="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 mb-6">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                    </svg>
                </div>
                <div>
                    <div class="font-bold text-amber-800">⚠️ Tidak Tepat Waktu</div>
                    <div class="text-sm text-amber-600">Poin maksimal: 0</div>
                </div>
            </div>
        </div>`;

    const content = `
        <div class="p-6 md:p-8">
            <!-- Header -->
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="font-display font-bold text-2xl md:text-3xl text-slate-800 mb-1">Catat Setoran</h2>
                    <p class="text-slate-600 font-medium">${student.name}</p>
                    <p class="text-sm text-slate-500">${student.halaqah}</p>
                </div>
                <button onclick="closeModal()" class="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            ${sessionInfo}
            ${recentHistory}
            
            <form onsubmit="submitSetoranV2(event, ${student.id})" class="space-y-6">
                <!-- Kondisi Setoran - Auto Calculate Poin -->
                <div class="space-y-4">
                    <div class="flex items-center justify-between mb-2">
                        <label class="block text-base font-bold text-slate-800">Kondisi Setoran:</label>
                        <div id="poinPreview" class="text-3xl font-black text-slate-400">?</div>
                    </div>
                    
                    <!-- Tepat Waktu -->
                    <div class="bg-white border-2 border-slate-200 rounded-xl p-4">
                        <label class="flex items-center justify-between cursor-pointer">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <div class="font-bold text-slate-800">Tepat Waktu?</div>
                                    <div class="text-xs text-slate-500">Sesuai jadwal sesi</div>
                                </div>
                            </div>
                            <input type="checkbox" id="tepatWaktu" onchange="calculatePoin()" 
                                class="w-6 h-6 text-primary-600 rounded focus:ring-2 focus:ring-primary-500" ${isOnTime ? 'checked' : ''}>
                        </label>
                    </div>
                    
                    <!-- Lancar -->
                    <div class="bg-white border-2 border-slate-200 rounded-xl p-4">
                        <label class="flex items-center justify-between cursor-pointer">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <div class="font-bold text-slate-800">Lancar?</div>
                                    <div class="text-xs text-slate-500">Tidak ada salah atau max 3 salah</div>
                                </div>
                            </div>
                            <input type="checkbox" id="lancar" onchange="calculatePoin()" 
                                class="w-6 h-6 text-primary-600 rounded focus:ring-2 focus:ring-primary-500">
                        </label>
                    </div>
                    
                    <!-- Capai Target -->
                    <div class="bg-white border-2 border-slate-200 rounded-xl p-4">
                        <label class="flex items-center justify-between cursor-pointer">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                                <div>
                                    <div class="font-bold text-slate-800">Capai Target?</div>
                                    <div class="text-xs text-slate-500">Sesuai target lembaga</div>
                                </div>
                            </div>
                            <input type="checkbox" id="capaiTarget" onchange="calculatePoin()" 
                                class="w-6 h-6 text-primary-600 rounded focus:ring-2 focus:ring-primary-500">
                        </label>
                    </div>
                    
                    <!-- Tidak Setor -->
                    <div class="bg-white border-2 border-slate-200 rounded-xl p-4">
                        <label class="flex items-center justify-between cursor-pointer">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </div>
                                <div>
                                    <div class="font-bold text-slate-800">Tidak Setor?</div>
                                    <div class="text-xs text-slate-500">Tidak setor sama sekali</div>
                                </div>
                            </div>
                            <input type="checkbox" id="tidakSetor" onchange="calculatePoin()" 
                                class="w-6 h-6 text-primary-600 rounded focus:ring-2 focus:ring-primary-500">
                        </label>
                    </div>
                    
                    <!-- Poin Result Display -->
                    <div id="poinResult" class="hidden bg-gradient-to-r rounded-2xl p-6 text-center">
                        <div class="text-sm font-bold mb-2">Poin yang Didapat:</div>
                        <div id="poinValue" class="text-5xl font-black mb-2"></div>
                        <div id="poinDesc" class="text-sm font-semibold"></div>
                    </div>
                    
                    <input type="hidden" id="selectedPoin" name="poin" required>
                </div>
                
                <!-- Catatan -->
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Catatan (Opsional):</label>
                    <textarea name="keterangan" rows="2" 
                        class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                        placeholder="Contoh: Lancar, hafalan kuat..."></textarea>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" 
                        class="flex-1 px-6 py-4 border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all text-base">
                        Batal
                    </button>
                    <button type="submit" 
                        class="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 rounded-xl font-bold hover:from-primary-500 hover:to-primary-600 transition-all shadow-lg shadow-primary-200 text-base">
                        💾 Simpan
                    </button>
                </div>
            </form>
        </div>
    `;
    
    createModal(content, false);
}

// Calculate poin based on conditions
function calculatePoin() {
    const tepatWaktu = document.getElementById('tepatWaktu').checked;
    const lancar = document.getElementById('lancar').checked;
    const capaiTarget = document.getElementById('capaiTarget').checked;
    const tidakSetor = document.getElementById('tidakSetor').checked;
    
    const poinPreview = document.getElementById('poinPreview');
    const poinResult = document.getElementById('poinResult');
    const poinValue = document.getElementById('poinValue');
    const poinDesc = document.getElementById('poinDesc');
    const selectedPoinInput = document.getElementById('selectedPoin');
    
    let poin = 0;
    let desc = '';
    let bgClass = '';
    let textClass = '';
    let emoji = '';
    
    // Disable other checkboxes if "Tidak Setor" is checked
    if (tidakSetor) {
        document.getElementById('tepatWaktu').disabled = true;
        document.getElementById('lancar').disabled = true;
        document.getElementById('capaiTarget').disabled = true;
        document.getElementById('tepatWaktu').checked = false;
        document.getElementById('lancar').checked = false;
        document.getElementById('capaiTarget').checked = false;
        
        poin = -1;
        desc = 'Tidak Setor Sama Sekali';
        bgClass = 'from-red-500 to-rose-600';
        textClass = 'text-white';
        emoji = '❌';
    } else {
        // Enable other checkboxes
        document.getElementById('tepatWaktu').disabled = false;
        document.getElementById('lancar').disabled = false;
        document.getElementById('capaiTarget').disabled = false;
        
        // Calculate based on rules
        if (tepatWaktu && lancar && capaiTarget) {
            // +2: Tepat waktu + Lancar + Target
            poin = 2;
            desc = 'Tepat Waktu, Lancar & Capai Target';
            bgClass = 'from-green-500 to-emerald-600';
            textClass = 'text-white';
            emoji = '🌟';
        } else if (tepatWaktu && !lancar && capaiTarget) {
            // +1: Tepat waktu + Tidak lancar + Target
            poin = 1;
            desc = 'Tepat Waktu, Kurang Lancar';
            bgClass = 'from-amber-500 to-yellow-600';
            textClass = 'text-white';
            emoji = '👍';
        } else if (tepatWaktu && lancar && !capaiTarget) {
            // 0: Tepat waktu + Lancar + Tidak target
            poin = 0;
            desc = 'Tepat Waktu & Lancar, Tapi Tidak Capai Target';
            bgClass = 'from-slate-400 to-slate-500';
            textClass = 'text-white';
            emoji = '😐';
        } else if (!tepatWaktu && lancar && capaiTarget) {
            // 0: Tidak tepat waktu + Lancar + Target
            poin = 0;
            desc = 'Lancar & Target, Tapi Tidak Tepat Waktu';
            bgClass = 'from-slate-400 to-slate-500';
            textClass = 'text-white';
            emoji = '😐';
        } else {
            // 0: Kondisi lainnya
            poin = 0;
            desc = 'Kondisi Tidak Memenuhi Syarat Poin Positif';
            bgClass = 'from-slate-400 to-slate-500';
            textClass = 'text-white';
            emoji = '😐';
        }
    }
    
    // Update preview
    poinPreview.textContent = poin >= 0 ? `+${poin}` : poin;
    poinPreview.className = `text-3xl font-black ${
        poin === 2 ? 'text-green-600' :
        poin === 1 ? 'text-amber-600' :
        poin === 0 ? 'text-slate-600' :
        'text-red-600'
    }`;
    
    // Update result display
    if (tepatWaktu || lancar || capaiTarget || tidakSetor) {
        poinResult.classList.remove('hidden');
        poinResult.className = `bg-gradient-to-r ${bgClass} rounded-2xl p-6 text-center shadow-lg`;
        poinValue.textContent = `${emoji} ${poin >= 0 ? '+' : ''}${poin}`;
        poinValue.className = `text-5xl font-black mb-2 ${textClass}`;
        poinDesc.textContent = desc;
        poinDesc.className = `text-sm font-semibold ${textClass}`;
    } else {
        poinResult.classList.add('hidden');
    }
    
    // Set hidden input value
    selectedPoinInput.value = poin;
}

// Select poin and highlight button (legacy - kept for compatibility)
function selectPoin(poin) {
    document.getElementById('selectedPoin').value = poin;
    
    // Remove active class from all buttons
    document.querySelectorAll('.poin-btn').forEach(btn => {
        btn.classList.remove('ring-4', 'ring-primary-500', 'ring-offset-2');
    });
    
    // Add active class to selected button
    if (event && event.target) {
        event.target.closest('.poin-btn').classList.add('ring-4', 'ring-primary-500', 'ring-offset-2');
    }
}

// Submit setoran using new API
async function submitSetoranV2(event, studentId) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const poin = parseInt(formData.get('poin'));
    const keterangan = formData.get('keterangan') || '';
    
    if (isNaN(poin)) {
        showNotification('❌ Pilih kondisi terlebih dahulu!', 'error');
        return;
    }
    
    try {
        // Get student data
        const student = dashboardData.students.find(s => s.id === studentId);
        if (!student) {
            throw new Error('Student not found');
        }
        
        // Get halaqah ID
        const halaqah = dashboardData.halaqahs.find(h => h.name === student.halaqah);
        if (!halaqah) {
            throw new Error('Halaqah not found');
        }
        
        // Create setoran using new API
        if (window.SetoranHarian) {
            await SetoranHarian.create(studentId, halaqah.id, poin, keterangan);
            
            // Update streak otomatis
            await updateStudentStreak(studentId);
            
            showNotification('✅ Setoran berhasil disimpan!', 'success');
        } else {
            // Fallback to old method if API not available
            console.warn('SetoranHarian API not available, using fallback');
            await submitSetoranOld(studentId, poin, keterangan);
        }
        
        // Refresh data
        await refreshAllData();
        
        // Close modal
        closeModal();
        
    } catch (error) {
        console.error('Error submitting setoran:', error);
        showNotification('❌ Gagal menyimpan setoran: ' + error.message, 'error');
    }
}

// Fallback to old method (for backward compatibility)
async function submitSetoranOld(studentId, poin, keterangan) {
    const student = dashboardData.students.find(s => s.id === studentId);
    if (!student) return;
    
    // Add to setoran array (old way)
    if (!student.setoran) student.setoran = [];
    student.setoran.push({
        date: new Date().toISOString(),
        poin: poin,
        keterangan: keterangan
    });
    
    // Update total points
    student.total_points = (student.total_points || 0) + poin;
    student.updated_at = new Date().toISOString();
    
    // Save to Supabase
    if (window.supabaseClient) {
        await window.supabaseClient
            .from('students')
            .update({
                setoran: student.setoran,
                total_points: student.total_points,
                updated_at: student.updated_at
            })
            .eq('id', studentId);
    }
}

// Show setoran history modal
async function showSetoranHistory(studentId) {
    const student = dashboardData.students.find(s => s.id === studentId);
    if (!student) return;
    
    let historyHTML = '<div class="text-center text-slate-500 py-8">Memuat history...</div>';
    
    const content = `
        <div class="p-8">
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="font-display font-bold text-3xl text-slate-800 mb-2">History Setoran</h2>
                    <p class="text-slate-500">${student.name} - Halaqah ${student.halaqah}</p>
                </div>
                <button onclick="closeModal()" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <div id="historyContent">${historyHTML}</div>
        </div>
    `;
    
    createModal(content, false);
    
    // Load history
    if (window.SetoranHarian) {
        try {
            const history = await SetoranHarian.getHistory(studentId, 50);
            
            if (history && history.length > 0) {
                historyHTML = `
                    <div class="space-y-3 max-h-96 overflow-y-auto">
                        ${history.map(h => `
                            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                <div class="flex-1">
                                    <div class="font-bold text-slate-800">${new Date(h.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                    <div class="text-sm text-slate-500">${new Date(h.waktu_setor).toLocaleTimeString('id-ID')} - ${h.halaqah_name}</div>
                                    ${h.keterangan ? `<div class="text-xs text-slate-600 mt-1">${h.keterangan}</div>` : ''}
                                </div>
                                <div class="text-right">
                                    <div class="text-2xl font-black ${h.poin >= 2 ? 'text-green-600' : h.poin === 1 ? 'text-amber-600' : h.poin === 0 ? 'text-slate-600' : 'text-red-600'}">
                                        ${h.poin >= 0 ? '+' : ''}${h.poin}
                                    </div>
                                    <div class="text-xs text-slate-500">poin</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                historyHTML = '<div class="text-center text-slate-500 py-8">Belum ada history setoran</div>';
            }
            
            document.getElementById('historyContent').innerHTML = historyHTML;
        } catch (error) {
            console.error('Error loading history:', error);
            document.getElementById('historyContent').innerHTML = '<div class="text-center text-red-500 py-8">Error loading history</div>';
        }
    }
}

// Update student streak based on setoran history
async function updateStudentStreak(studentId) {
    if (!window.supabaseClient) return;
    
    try {
        // Get last 2 days of setoran (today and yesterday)
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const todayStr = today.toISOString().split('T')[0];
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        // Get all setoran history ordered by date DESC
        const { data: history, error } = await window.supabaseClient
            .from('setoran_harian')
            .select('tanggal')
            .eq('santri_id', studentId)
            .order('tanggal', { ascending: false })
            .limit(100);
        
        if (error) throw error;
        
        if (!history || history.length === 0) {
            // No history, streak = 0
            await updateStudentStreakValue(studentId, 0);
            return;
        }
        
        // Calculate streak
        let streak = 0;
        let currentDate = new Date(todayStr);
        
        // Convert history to Set for faster lookup
        const setoranDates = new Set(history.map(h => h.tanggal));
        
        // Count consecutive days backwards from today
        while (true) {
            const dateStr = currentDate.toISOString().split('T')[0];
            
            if (setoranDates.has(dateStr)) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        // Update student streak in database
        await updateStudentStreakValue(studentId, streak);
        
        console.log(`✅ Streak updated for student ${studentId}: ${streak} hari`);
        
    } catch (error) {
        console.error('Error updating streak:', error);
    }
}

// Helper function to update streak value in database
async function updateStudentStreakValue(studentId, streak) {
    if (!window.supabaseClient) return;
    
    try {
        const { error } = await window.supabaseClient
            .from('students')
            .update({ 
                streak: streak,
                updated_at: new Date().toISOString()
            })
            .eq('id', studentId);
        
        if (error) throw error;
        
        // Update local data
        const student = dashboardData.students.find(s => s.id === studentId);
        if (student) {
            student.streak = streak;
        }
        
    } catch (error) {
        console.error('Error updating streak value:', error);
    }
}

// Export functions
window.showSetoranFormV2 = showSetoranFormV2;
window.submitSetoranV2 = submitSetoranV2;
window.calculatePoin = calculatePoin;
window.selectPoin = selectPoin;
window.showSetoranHistory = showSetoranHistory;
window.updateStudentStreak = updateStudentStreak;

// Test function for console
window.testSetoranForm = function() {
    // Get first student for testing
    const student = dashboardData.students[0];
    if (student) {
        showSetoranFormV2(student);
    } else {
        console.error('No students found. Load data first.');
    }
};

window.testSetoranHistory = function() {
    // Get first student for testing
    const student = dashboardData.students[0];
    if (student) {
        showSetoranHistory(student.id);
    } else {
        console.error('No students found. Load data first.');
    }
};
