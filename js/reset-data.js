// Reset Data Module - Simple functions to reset corrupted data

// Clear local cache and reload
function clearCacheAndReload() {
    if (confirm('⚠️ Hapus cache lokal dan reload halaman?\n\nData akan dimuat ulang dari server Supabase.')) {
        localStorage.removeItem('halaqahData');
        localStorage.removeItem('lastSync');
        localStorage.removeItem('userSantriRelationships');
        
        showNotification('✅ Cache dihapus. Reload...', 'success');
        
        setTimeout(() => {
            window.location.reload(true);
        }, 1000);
    }
}

// Reset all data in Supabase (DANGEROUS!)
async function resetAllDataInSupabase() {
    if (!confirm('⚠️ PERINGATAN! ⚠️\n\nAnda akan menghapus SEMUA data santri dan halaqah di server.\nData TIDAK BISA dikembalikan!\n\nLanjutkan?')) {
        return;
    }
    
    if (!confirm('Yakin 100%? Ketik OK di prompt berikutnya untuk konfirmasi.')) {
        return;
    }
    
    const confirmation = prompt('Ketik "HAPUS" (huruf besar) untuk konfirmasi:');
    if (confirmation !== 'HAPUS') {
        showNotification('❌ Reset dibatalkan', 'info');
        return;
    }
    
    try {
        showNotification('⏳ Menghapus semua data...', 'info');
        
        // Delete all students
        const { error: errorStudents } = await window.supabaseClient
            .from('students')
            .delete()
            .neq('id', 0);
            
        if (errorStudents) throw errorStudents;
        
        // Delete all halaqahs
        const { error: errorHalaqahs } = await window.supabaseClient
            .from('halaqahs')
            .delete()
            .neq('id', 0);
            
        if (errorHalaqahs) throw errorHalaqahs;
        
        // Clear local data
        dashboardData.students = [];
        dashboardData.halaqahs = [];
        StorageManager.save();
        
        showNotification('✅ Database berhasil di-reset!', 'success');
        
        setTimeout(() => {
            window.location.reload(true);
        }, 2000);
        
    } catch (error) {
        console.error('Reset error:', error);
        showNotification('❌ Gagal reset: ' + error.message, 'error');
    }
}

// Reset all points to zero (keep students data)
function resetAllPointsToZero() {
    if (!confirm('⚠️ Reset semua poin ke 0?\n\nData santri tetap ada, hanya poin yang di-reset.')) {
        return;
    }
    
    dashboardData.students.forEach(student => {
        student.total_points = 0;
        student.streak = 0;
        student.setoran = [];
        student.lastSetoranDate = '';
        student.total_hafalan = 0;
    });
    
    recalculateRankings();
    StorageManager.save();
    
    // Sync to Supabase
    if (typeof syncStudentsToSupabase === 'function') {
        syncStudentsToSupabase().then(() => {
            showNotification('✅ Semua poin berhasil di-reset ke 0!', 'success');
            refreshAllData();
        }).catch(err => {
            console.error('Sync error:', err);
            showNotification('⚠️ Poin di-reset lokal, tapi gagal sync ke server', 'warning');
            refreshAllData();
        });
    } else {
        showNotification('✅ Semua poin berhasil di-reset ke 0!', 'success');
        refreshAllData();
    }
}

// Fix negative points (remove penalties)
function fixNegativePoints(silent = false) {
    console.log('🧹 Checking for negative points/penalties...');
    
    // 1. Check if there are any negative points first
    let hasNegative = false;
    let penaltyCount = 0;
    let mismatchCount = 0;
    
    dashboardData.students.forEach(s => {
        // Calculate real points from history
        const historyPoints = (s.setoran || []).reduce((sum, p) => sum + (Number(p.poin) || 0), 0);
        
        // Check for mismatch (e.g. total says -9 but history is empty/0)
        if (s.total_points !== historyPoints) {
            mismatchCount++;
            hasNegative = true; // Treat mismatch as something to fix
        }
        
        if (s.total_points < 0) hasNegative = true;
        
        if (s.setoran && s.setoran.length > 0) {
            const penalties = s.setoran.filter(p => 
                Number(p.poin) < 0 || 
                p.status === 'Tidak Setor' || 
                p.isAutoPenalty === true || 
                (Number(p.poin) === 0 && p.status === 'Tidak Setor')
            );
            if (penalties.length > 0) {
                hasNegative = true;
                penaltyCount += penalties.length;
            }
        }
    });

    if (!hasNegative) {
        console.log('✅ Data santri bersih. Memaksa recalculateRankings untuk memastikan data halaqah konsisten.');
        // Force recalculate just in case halaqah stats are stale
        recalculateRankings();
        StorageManager.save();
        refreshAllData();
        return; 
    }

    // 2. Ask for confirmation (unless silent mode is forced true)
    if (!silent) {
        const msg = `⚠️ Terdeteksi masalah data:\n` +
                    `- ${penaltyCount} data penalty/poin negatif\n` +
                    `- ${mismatchCount} data tidak sinkron (total vs riwayat)\n\n` +
                    `Apakah Anda ingin membersihkan dan memperbaiki data sekarang?`;
                    
        if (!confirm(msg)) {
            return;
        }
    }
    
    let removedCount = 0;
    let studentsFixed = 0;
    
    dashboardData.students.forEach(student => {
        // Ensure setoran is an array
        if (!student.setoran) student.setoran = [];
        
        const initialCount = student.setoran.length;
        
        // Filter out negative points (penalties)
        const cleanSetoran = student.setoran.filter(s => {
            const isPenalty = Number(s.poin) < 0 || s.status === 'Tidak Setor' || s.isAutoPenalty === true || (Number(s.poin) === 0 && s.status === 'Tidak Setor');
            return !isPenalty;
        });
        
        const removed = initialCount - cleanSetoran.length;
        
        // Calculate correct points from clean history
        const newPoints = cleanSetoran.reduce((sum, s) => sum + (Number(s.poin) || 0), 0);
        
        // Update if:
        // 1. We removed penalties
        // 2. OR current points are negative (even if setoran list was empty/clean)
        // 3. OR current points don't match calculated points (sync error)
        if (removed > 0 || student.total_points < 0 || student.total_points !== newPoints) {
            student.setoran = cleanSetoran;
            student.total_points = newPoints;
            
            // Safety net: ensure no negative total
            if (student.total_points < 0) student.total_points = 0;
            
            removedCount += (removed > 0 ? removed : 1);
            studentsFixed++;
        }
    });
    
    if (removedCount > 0 || studentsFixed > 0) {
        recalculateRankings();
        StorageManager.save();
        
        if (typeof syncStudentsToSupabase === 'function' && navigator.onLine) {
            syncStudentsToSupabase();
        }
        
        refreshAllData();
        showNotification(`✅ Berhasil menghapus ${removedCount} data penalty dari ${studentsFixed} santri.`);
        console.log(`✅ Berhasil menghapus ${removedCount} data penalty dari ${studentsFixed} santri.`);
    } else {
        // Silent if no negative points found (to avoid spamming on auto-run)
        console.log('✅ Tidak ditemukan poin negatif (Clean).');
    }
}

// Reset single student data (points & history only)
async function resetSingleStudent(studentId) {
    const student = dashboardData.students.find(s => s.id === studentId);
    if (!student) return;

    if (!confirm(`⚠️ Reset data untuk ${student.name}?\n\nPoin, hafalan, dan riwayat setoran akan dihapus.\nNama santri TETAP ADA.`)) {
        return;
    }

    try {
        // Reset local data
        student.total_points = 0;
        student.streak = 0;
        student.setoran = [];
        student.lastSetoranDate = '';
        student.total_hafalan = 0;
        student.achievements = []; // Reset achievements too? Maybe yes for full reset.

        // Sync to Supabase
        if (typeof syncStudentsToSupabase === 'function') {
            await syncStudentsToSupabase();
        } else {
            StorageManager.save();
        }

        recalculateRankings();
        refreshAllData();
        
        // If inside modal, reload modal content if needed or close it
        // Better to close modal to reflect changes in list
        if (typeof closeModal === 'function') closeModal();
        
        showNotification(`✅ Data ${student.name} berhasil di-reset!`, 'success');

    } catch (error) {
        console.error('Reset error:', error);
        showNotification('❌ Gagal reset: ' + error.message, 'error');
    }
}

// Show reset options modal
function showResetDataModal() {
    const content = `
        <div class="p-8">
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="font-display font-bold text-3xl text-slate-800 mb-2">🔧 Reset Data</h2>
                    <p class="text-slate-500">Pilih opsi reset yang sesuai</p>
                </div>
                <button onclick="closeModal()" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <div class="space-y-4">
                <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h3 class="font-bold text-blue-900 mb-2">ℹ️ Informasi</h3>
                    <p class="text-sm text-blue-800">Pilih salah satu opsi di bawah untuk memperbaiki data yang corrupt.</p>
                </div>
                
                <button onclick="closeModal(); fixNegativePoints()" 
                    class="w-full p-4 bg-purple-50 border-2 border-purple-200 text-purple-800 rounded-xl font-bold hover:bg-purple-100 transition-colors text-left">
                    <div class="flex items-center gap-3">
                        <div class="text-3xl">🧹</div>
                        <div class="flex-1">
                            <div class="font-bold text-lg">Hapus Poin Negatif</div>
                            <div class="text-sm font-normal">Hapus semua penalty (-1) dan hitung ulang poin</div>
                        </div>
                    </div>
                </button>
                
                <button onclick="closeModal(); clearCacheAndReload()" 
                    class="w-full p-4 bg-green-50 border-2 border-green-200 text-green-800 rounded-xl font-bold hover:bg-green-100 transition-colors text-left">
                    <div class="flex items-center gap-3">
                        <div class="text-3xl">🗑️</div>
                        <div class="flex-1">
                            <div class="font-bold text-lg">Hapus Cache & Reload</div>
                            <div class="text-sm font-normal">Hapus cache lokal dan muat ulang dari server (Recommended)</div>
                        </div>
                    </div>
                </button>
                
                <button onclick="closeModal(); resetAllPointsToZero()" 
                    class="w-full p-4 bg-amber-50 border-2 border-amber-200 text-amber-800 rounded-xl font-bold hover:bg-amber-100 transition-colors text-left">
                    <div class="flex items-center gap-3">
                        <div class="text-3xl">0️⃣</div>
                        <div class="flex-1">
                            <div class="font-bold text-lg">Reset Poin ke 0</div>
                            <div class="text-sm font-normal">Data santri tetap ada, hanya poin yang di-reset</div>
                        </div>
                    </div>
                </button>
                
                <button onclick="closeModal(); resetAllDataInSupabase()" 
                    class="w-full p-4 bg-red-50 border-2 border-red-200 text-red-800 rounded-xl font-bold hover:bg-red-100 transition-colors text-left">
                    <div class="flex items-center gap-3">
                        <div class="text-3xl">⚠️</div>
                        <div class="flex-1">
                            <div class="font-bold text-lg">Hapus SEMUA Data</div>
                            <div class="text-sm font-normal">Reset total database (TIDAK BISA DIKEMBALIKAN!)</div>
                        </div>
                    </div>
                </button>
            </div>
            
            <div class="mt-6 pt-4 border-t border-slate-200">
                <button onclick="closeModal()" 
                    class="w-full px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                    Batal
                </button>
            </div>
        </div>
    `;
    
    createModal(content, false);
}

// Export functions
window.clearCacheAndReload = clearCacheAndReload;
window.resetAllDataInSupabase = resetAllDataInSupabase;
window.resetAllPointsToZero = resetAllPointsToZero;
window.showResetDataModal = showResetDataModal;
window.fixNegativePoints = fixNegativePoints;
window.resetSingleStudent = resetSingleStudent;
