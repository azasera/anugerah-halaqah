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

        // CRITICAL: Matikan realtime subscription DULU sebelum delete
        if (window.realtimeSubscription) {
            console.log('[RESET] 🔴 Menonaktifkan realtime subscription...');
            await window.supabaseClient.removeChannel(window.realtimeSubscription);
            window.realtimeSubscription = null;
        }

        // Blokir semua sync & realtime
        window.deleteOperationInProgress = true;
        window.syncInProgress = true;
        window.isLoadingFromSupabase = true;
        window.isLoadingHalaqahs = true;
        if (window.studentUpdateTimeout) clearTimeout(window.studentUpdateTimeout);
        if (window.halaqahUpdateTimeout) clearTimeout(window.halaqahUpdateTimeout);
        if (window.refreshDebounceTimeout) clearTimeout(window.refreshDebounceTimeout);

        // --- STEP 1: Bersihkan data lokal & localStorage DULU ---
        dashboardData.students = [];
        dashboardData.halaqahs = [];
        localStorage.removeItem('halaqahData');
        localStorage.removeItem('lastSync');
        localStorage.removeItem('userSantriRelationships');
        console.log('[RESET] ✅ Local data & localStorage cleared');

        // --- STEP 2: Ambil SEMUA student IDs dari Supabase ---
        const { data: allStudents, error: fetchStudentErr } = await window.supabaseClient
            .from('students').select('id');

        if (fetchStudentErr) {
            console.error('[RESET] Gagal fetch student IDs:', fetchStudentErr);
            throw new Error('Gagal membaca data students: ' + fetchStudentErr.message);
        }

        const studentIds = (allStudents || []).map(s => s.id);
        console.log(`[RESET] Ditemukan ${studentIds.length} students di Supabase`);

        // --- STEP 3: Hapus students pakai batch .in() (lebih cepat & andal) ---
        let deletedStudents = 0;
        if (studentIds.length > 0) {
            const batchSize = 100;
            for (let i = 0; i < studentIds.length; i += batchSize) {
                const batch = studentIds.slice(i, i + batchSize);
                const { error } = await window.supabaseClient.from('students').delete().in('id', batch);
                if (error) {
                    console.warn(`[RESET] Batch delete students error:`, error.message);
                } else {
                    deletedStudents += batch.length;
                }
                showNotification(`⏳ Menghapus santri: ${Math.min(i + batchSize, studentIds.length)}/${studentIds.length}...`, 'info');
                console.log(`[RESET] Progress: ${Math.min(i + batchSize, studentIds.length)}/${studentIds.length} students processed`);
            }
        }

        // Fallback: hapus semua lembaga satu per satu pakai .ilike() jika masih ada sisa
        const lembagaKeys = Object.keys(appSettings.lembaga || {});
        for (const key of lembagaKeys) {
            if (key.startsWith('SDITA_')) {
                const kelasNum = parseInt(key.split('_')[1], 10);
                await window.supabaseClient.from('students').delete()
                    .ilike('lembaga', 'SDITA').ilike('kelas', `%${kelasNum}%`);
            } else {
                await window.supabaseClient.from('students').delete().ilike('lembaga', key);
            }
        }
        console.log(`[RESET] ✅ Students: ${deletedStudents} dihapus (+ fallback per-lembaga dijalankan)`);

        // --- STEP 4: Ambil SEMUA halaqah IDs dari Supabase ---
        const { data: allHalaqahs, error: fetchHalaqahErr } = await window.supabaseClient
            .from('halaqahs').select('id');

        if (fetchHalaqahErr) {
            console.error('[RESET] Gagal fetch halaqah IDs:', fetchHalaqahErr);
        }

        const halaqahIds = (allHalaqahs || []).map(h => h.id);
        console.log(`[RESET] Ditemukan ${halaqahIds.length} halaqahs di Supabase`);

        // --- STEP 5: Hapus halaqahs pakai batch .in() ---
        let deletedHalaqahs = 0;
        if (halaqahIds.length > 0) {
            const batchSize = 100;
            for (let i = 0; i < halaqahIds.length; i += batchSize) {
                const batch = halaqahIds.slice(i, i + batchSize);
                const { error } = await window.supabaseClient.from('halaqahs').delete().in('id', batch);
                if (!error) deletedHalaqahs += batch.length;
            }
        }
        console.log(`[RESET] ✅ Halaqahs: ${deletedHalaqahs}/${halaqahIds.length} dihapus`);

        // --- STEP 6: Verifikasi data benar-benar kosong ---
        const { count: remainStudents } = await window.supabaseClient
            .from('students').select('*', { count: 'exact', head: true });
        const { count: remainHalaqahs } = await window.supabaseClient
            .from('halaqahs').select('*', { count: 'exact', head: true });

        console.log(`[RESET] Verifikasi sisa: ${remainStudents} students, ${remainHalaqahs} halaqahs`);

        if ((remainStudents || 0) > 0 || (remainHalaqahs || 0) > 0) {
            showNotification(`⚠️ Masih ada ${remainStudents || 0} santri & ${remainHalaqahs || 0} halaqah tersisa. RLS memblokir delete. Periksa Supabase Dashboard > Authentication > Policies.`, 'warning');
            window.deleteOperationInProgress = false;
            window.syncInProgress = false;
            window.isLoadingFromSupabase = false;
            window.isLoadingHalaqahs = false;
            if (typeof refreshAllData === 'function') refreshAllData();
            return;
        }

        showNotification('✅ Database berhasil di-reset! Semua data terhapus.', 'success');

        // Set flag untuk mencegah auto-load saat reload
        localStorage.setItem('_deleteJustDone', Date.now().toString());
        
        setTimeout(() => {
            try {
                const url = new URL(window.location.href);
                url.searchParams.set('_cb', String(Date.now()));
                window.location.href = url.toString();
            } catch (e) {
                window.location.reload();
            }
        }, 2000);

    } catch (error) {
        console.error('[RESET] Error:', error);
        window.deleteOperationInProgress = false;
        window.syncInProgress = false;
        window.isLoadingFromSupabase = false;
        window.isLoadingHalaqahs = false;
        
        // Re-enable realtime jika gagal
        if (!window.realtimeSubscription && typeof enableRealtimeSubscription === 'function') {
            console.log('[RESET] ♻️ Re-enabling realtime after error...');
            enableRealtimeSubscription();
        }
        
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

// Delete all data (students + halaqahs) for a specific lembaga
async function deleteDataByLembaga(lembagaKey) {
    const lembagaName = (appSettings.lembaga[lembagaKey] && appSettings.lembaga[lembagaKey].name) || lembagaKey;

    if (!confirm(`⚠️ HAPUS DATA ${lembagaName.toUpperCase()}\n\nSemua santri dan halaqah dari lembaga ini akan dihapus permanen dari server.\n\nLanjutkan?`)) {
        return;
    }

    const confirmation = prompt(`Ketik "HAPUS" (huruf besar) untuk konfirmasi hapus data ${lembagaName}:`);
    if (confirmation !== 'HAPUS') {
        showNotification('❌ Hapus data dibatalkan', 'info');
        return;
    }

    try {
        showNotification(`⏳ Menghapus data ${lembagaName}...`, 'info');

        // CRITICAL: Matikan realtime subscription DULU
        if (window.realtimeSubscription) {
            console.log('[DELETE LEMBAGA] 🔴 Menonaktifkan realtime subscription...');
            await window.supabaseClient.removeChannel(window.realtimeSubscription);
            window.realtimeSubscription = null;
        }

        // FIX: Blokir auto-sync dan realtime update agar tidak mengembalikan data
        window.deleteOperationInProgress = true;
        window.syncInProgress = true;
        window.isLoadingFromSupabase = true;
        window.isLoadingHalaqahs = true;

        // --- Helper: match student to lembaga (by lembaga field on student) ---
        function studentMatchesLembaga(s, key) {
            if (key.startsWith('SDITA_')) {
                const kelasNum = parseInt(key.split('_')[1], 10);
                if ((s.lembaga || '').toUpperCase().trim() !== 'SDITA') return false;
                const m = (s.kelas || '').toString().match(/\d+/);
                return m ? parseInt(m[0], 10) === kelasNum : false;
            }
            return (s.lembaga || '').toUpperCase().trim() === key.toUpperCase();
        }

        // --- STEP 1: Query santri dari Supabase langsung (bukan hanya cache lokal) ---
        // Ini memastikan santri yang mungkin tidak ada di cache sekalipun ikut terhapus
        let allTargetStudentIds = [];
        let targetHalaqahNamesFromServer = new Set();

        try {
            let q = window.supabaseClient.from('students').select('id, halaqah');
            if (lembagaKey.startsWith('SDITA_')) {
                const kelasNum = parseInt(lembagaKey.split('_')[1], 10);
                q = q.ilike('lembaga', 'SDITA').ilike('kelas', `%${kelasNum}%`);
            } else {
                q = q.ilike('lembaga', lembagaKey);
            }
            const { data: serverStudents, error: fetchErr } = await q;
            if (!fetchErr && serverStudents) {
                allTargetStudentIds = serverStudents.map(s => s.id).filter(Boolean);
                targetHalaqahNamesFromServer = new Set(serverStudents.map(s => s.halaqah).filter(Boolean));
                console.log(`[DELETE] Server: ${allTargetStudentIds.length} santri, halaqah: ${[...targetHalaqahNamesFromServer].join(', ')}`);
            }
        } catch (e) { console.warn('[DELETE] Query server students error:', e); }

        // Merge dengan cache lokal
        const targetStudents = dashboardData.students.filter(s => studentMatchesLembaga(s, lembagaKey));
        for (const s of targetStudents) {
            if (!allTargetStudentIds.includes(s.id)) allTargetStudentIds.push(s.id);
        }

        console.log(`[DELETE] Total santri yang akan dihapus: ${allTargetStudentIds.length}`);

        // --- STEP 2: Kumpulkan semua nama halaqah target (dari cache lokal + server) ---
        const allTargetHalaqahNames = new Set([
            ...targetStudents.map(s => s.halaqah).filter(Boolean),
            ...targetHalaqahNamesFromServer
        ]);

        // Query semua halaqah dari Supabase untuk menangkap yang orphan (santrinya sudah terhapus)
        let targetHalaqahIds = [];
        try {
            const { data: allServerHalaqahs, error: hFetchErr } = await window.supabaseClient
                .from('halaqahs').select('id, name');
            if (!hFetchErr && allServerHalaqahs) {
                targetHalaqahIds = allServerHalaqahs
                    .filter(h => {
                        const raw = (h.name || '').replace(/^Halaqah\s+/i, '').trim();
                        return allTargetHalaqahNames.has(raw) || allTargetHalaqahNames.has(h.name);
                    })
                    .map(h => h.id).filter(Boolean);
                console.log(`[DELETE] Halaqahs to delete: ${targetHalaqahIds.length}`);
            }
        } catch (e) { console.warn('[DELETE] Query server halaqahs error:', e); }

        // Merge dengan cache lokal
        for (const h of dashboardData.halaqahs) {
            if (!targetHalaqahIds.includes(h.id)) {
                const raw = (h.name || '').replace(/^Halaqah\s+/i, '').trim();
                if (allTargetHalaqahNames.has(raw) || allTargetHalaqahNames.has(h.name)) {
                    targetHalaqahIds.push(h.id);
                }
            }
        }

        // --- STEP 3: Bersihkan data lokal DULU ---
        dashboardData.students = dashboardData.students.filter(s => !studentMatchesLembaga(s, lembagaKey));
        dashboardData.halaqahs = dashboardData.halaqahs.filter(h => !targetHalaqahIds.includes(h.id));
        StorageManager.save();

        // --- STEP 4: Hapus santri dari Supabase ---
        if (allTargetStudentIds.length > 0) {
            const batchSize = 100;
            for (let i = 0; i < allTargetStudentIds.length; i += batchSize) {
                const batch = allTargetStudentIds.slice(i, i + batchSize);
                const { error } = await window.supabaseClient.from('students').delete().in('id', batch);
                if (error) { console.error('Delete students error:', error); throw error; }
            }
            console.log(`✅ ${allTargetStudentIds.length} students dihapus dari Supabase`);
        } else if (lembagaKey.startsWith('SDITA_')) {
            // Fallback terakhir: hapus by lembaga+kelas langsung
            const kelasNum = parseInt(lembagaKey.split('_')[1], 10);
            const { error } = await window.supabaseClient.from('students').delete()
                .ilike('lembaga', 'SDITA').ilike('kelas', `%${kelasNum}%`);
            if (error) console.error('Fallback delete error:', error);
            else console.log(`✅ Fallback: santri SDITA kelas ${kelasNum} dihapus`);
        } else {
            const { error } = await window.supabaseClient.from('students').delete().ilike('lembaga', lembagaKey);
            if (error) console.error('Fallback delete error:', error);
            else console.log(`✅ Fallback: santri ${lembagaKey} dihapus`);
        }

        // --- STEP 5: Hapus halaqahs dari Supabase ---
        if (targetHalaqahIds.length > 0) {
            const { error } = await window.supabaseClient.from('halaqahs').delete().in('id', targetHalaqahIds);
            if (error) { console.error('Delete halaqahs error:', error); throw error; }
            console.log(`✅ ${targetHalaqahIds.length} halaqahs dihapus dari Supabase`);
        }

        showNotification(`✅ Data ${lembagaName} berhasil dihapus!`, 'success');

        // Set flag untuk mencegah auto-load saat reload
        localStorage.setItem('_deleteJustDone', Date.now().toString());

        setTimeout(() => {
            try {
                const url = new URL(window.location.href);
                url.searchParams.set('_cb', String(Date.now()));
                window.location.href = url.toString();
            } catch (e) {
                window.location.reload();
            }
        }, 2000);

    } catch (error) {
        console.error('Delete lembaga error:', error);
        window.deleteOperationInProgress = false;
        window.syncInProgress = false;
        window.isLoadingFromSupabase = false;
        window.isLoadingHalaqahs = false;
        
        // Re-enable realtime jika gagal
        if (!window.realtimeSubscription && typeof enableRealtimeSubscription === 'function') {
            console.log('[DELETE LEMBAGA] ♻️ Re-enabling realtime after error...');
            enableRealtimeSubscription();
        }
        
        showNotification('❌ Gagal hapus data: ' + error.message, 'error');
    }
}

// Reset points (keep students) for a specific lembaga
async function resetPointsByLembaga(lembagaKey) {
    const lembagaName = (appSettings.lembaga[lembagaKey] && appSettings.lembaga[lembagaKey].name) || lembagaKey;

    if (!confirm(`⚠️ Reset semua poin santri ${lembagaName}?\n\nData santri tetap ada, hanya poin yang di-reset ke 0.\n\nLanjutkan?`)) {
        return;
    }

    let targetStudents;
    if (lembagaKey.startsWith('SDITA_')) {
        const kelasNum = parseInt(lembagaKey.split('_')[1], 10);
        targetStudents = dashboardData.students.filter(s => {
            const sl = (s.lembaga || '').toUpperCase().trim();
            if (sl !== 'SDITA') return false;
            const kelasRaw = (s.kelas || '').toString().toLowerCase();
            const match = kelasRaw.match(/\d+/);
            const kelasStudentNum = match ? parseInt(match[0], 10) : null;
            return kelasStudentNum === kelasNum;
        });
    } else {
        targetStudents = dashboardData.students.filter(
            s => (s.lembaga || '').toUpperCase().trim() === lembagaKey.toUpperCase()
        );
    }

    targetStudents.forEach(student => {
        student.total_points = 0;
        student.streak = 0;
        student.setoran = [];
        student.lastSetoranDate = '';
        student.total_hafalan = 0;
    });

    recalculateRankings();
    StorageManager.save();

    if (typeof syncStudentsToSupabase === 'function') {
        syncStudentsToSupabase().then(() => {
            showNotification(`✅ Poin ${lembagaName} berhasil di-reset ke 0!`, 'success');
            refreshAllData();
        }).catch(err => {
            console.error('Sync error:', err);
            showNotification(`⚠️ Poin ${lembagaName} di-reset lokal, tapi gagal sync ke server`, 'warning');
            refreshAllData();
        });
    } else {
        showNotification(`✅ Poin ${lembagaName} berhasil di-reset ke 0!`, 'success');
        refreshAllData();
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

                <button onclick="closeModal(); mergeDuplicateHalaqahs()" 
                    class="w-full p-4 bg-indigo-50 border-2 border-indigo-200 text-indigo-800 rounded-xl font-bold hover:bg-indigo-100 transition-colors text-left">
                    <div class="flex items-center gap-3">
                        <div class="text-3xl">🔗</div>
                        <div class="flex-1">
                            <div class="font-bold text-lg">Gabungkan Duplikasi Halaqah</div>
                            <div class="text-sm font-normal">Gabungkan halaqah yang mirip (misal: Basrial & Ustadz Basrial)</div>
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
                            <div class="font-bold text-lg">Reset Poin ke 0 (Semua)</div>
                            <div class="text-sm font-normal">Data santri tetap ada, hanya poin semua lembaga yang di-reset</div>
                        </div>
                    </div>
                </button>

                <!-- Per-Lembaga Section -->
                <div class="border-t-2 border-slate-200 pt-4">
                    <h3 class="font-bold text-slate-700 mb-3">🏫 Hapus / Reset Per Lembaga</h3>
                    <div class="space-y-2">
                        ${Object.entries(appSettings.lembaga).map(([key, cfg]) => {
                            // Hitung jumlah santri per lembaga
                            const count = dashboardData.students.filter(s => {
                                if (key.startsWith('SDITA_')) {
                                     const kelasNum = parseInt(key.split('_')[1], 10);
                                     if ((s.lembaga || '').toUpperCase().trim() !== 'SDITA') return false;
                                     const m = (s.kelas || '').toString().match(/\d+/);
                                     return m ? parseInt(m[0], 10) === kelasNum : false;
                                }
                                return (s.lembaga || '').toUpperCase().trim() === key.toUpperCase();
                            }).length;

                            return `
                            <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
                                <div class="flex-1">
                                    <div class="font-semibold text-slate-800 text-sm">${cfg.name}</div>
                                    <div class="text-xs ${count > 0 ? 'text-slate-500' : 'text-slate-400 italic'}">
                                        ${count > 0 ? `📂 ${count} Santri` : '✅ 0 Santri (Kosong)'}
                                    </div>
                                </div>
                                <button onclick="closeModal(); resetPointsByLembaga('${key}')" 
                                    class="px-3 py-1.5 bg-amber-100 border border-amber-300 text-amber-800 rounded-lg text-xs font-bold hover:bg-amber-200 transition-colors whitespace-nowrap"
                                    ${count === 0 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
                                    🔄 Reset Poin
                                </button>
                                <button onclick="closeModal(); deleteDataByLembaga('${key}')" 
                                    class="px-3 py-1.5 bg-red-100 border border-red-300 text-red-800 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors whitespace-nowrap"
                                    ${count === 0 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
                                    🗑️ Hapus Data
                                </button>
                            </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <button onclick="closeModal(); resetAllDataInSupabase()" 
                    class="w-full p-4 bg-red-50 border-2 border-red-300 text-red-800 rounded-xl font-bold hover:bg-red-100 transition-colors text-left">
                    <div class="flex items-center gap-3">
                        <div class="text-3xl">⚠️</div>
                        <div class="flex-1">
                            <div class="font-bold text-lg">Hapus SEMUA Data (Semua Lembaga)</div>
                            <div class="text-sm font-normal">Reset total database semua lembaga (TIDAK BISA DIKEMBALIKAN!)</div>
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

// Merge duplicate halaqahs (e.g. "Basrial" and "Ustadz Basrial")
async function mergeDuplicateHalaqahs() {
    if (!confirm('⚠️ Gabungkan duplikasi halaqah?\n\nSistem akan mencari halaqah dengan nama yang mirip (misal: "Basrial" dan "Ustadz Basrial") dan menggabungkannya menjadi satu.\n\nLanjutkan?')) return;

    try {
        if (!window.supabaseClient) {
            showNotification('❌ Supabase client belum siap', 'error');
            return;
        }

        showNotification('⏳ Mencari duplikasi halaqah...', 'info');
        
        const groups = {};
        dashboardData.halaqahs.forEach(h => {
            const key = typeof normalizeHalaqahLabel === 'function' ? normalizeHalaqahLabel(h.name) : (h.name || '').toLowerCase();
            if (!groups[key]) groups[key] = [];
            groups[key].push(h);
        });

        const duplicates = Object.values(groups).filter(g => g.length > 1);
        
        if (duplicates.length === 0) {
            showNotification('✅ Tidak ditemukan duplikasi halaqah.', 'success');
            return;
        }

        let totalMerged = 0;
        const deletedIds = [];

        for (const group of duplicates) {
            // Sort: prioritize names with titles (Ustadz/Ustadzah) or more members
            group.sort((a, b) => {
                const aHasTitle = /Ustadz|Ustadzah|Ust\./i.test(a.name);
                const bHasTitle = /Ustadz|Ustadzah|Ust\./i.test(b.name);
                if (aHasTitle && !bHasTitle) return -1;
                if (!aHasTitle && bHasTitle) return 1;
                return (b.members || 0) - (a.members || 0);
            });

            const canonical = group[0];
            const toDelete = group.slice(1);
            
            console.log(`[MERGE] Canonical: ${canonical.name} (${canonical.id})`);
            
            for (const dup of toDelete) {
                console.log(`[MERGE] Removing duplicate: ${dup.name} (${dup.id})`);
                deletedIds.push(dup.id);
                totalMerged++;
            }
        }

        if (deletedIds.length > 0) {
            showNotification(`⏳ Menghapus ${deletedIds.length} duplikasi di server...`, 'info');
            
            // Delete from Supabase
            const { error } = await window.supabaseClient
                .from('halaqahs')
                .delete()
                .in('id', deletedIds);

            if (error) throw error;

            // Update local state
            dashboardData.halaqahs = dashboardData.halaqahs.filter(h => !deletedIds.includes(h.id));
            
            // Reconcile students (move them to canonical name)
            if (typeof recalculateRankings === 'function') {
                recalculateRankings();
            }
            
            // Save & Sync students
            if (typeof StorageManager !== 'undefined') StorageManager.save();
            
            if (typeof syncStudentsToSupabase === 'function' && navigator.onLine) {
                await syncStudentsToSupabase();
            }

            showNotification(`✅ Berhasil menggabungkan ${totalMerged} duplikasi halaqah!`, 'success');
            if (typeof refreshAllData === 'function') refreshAllData();
        }

    } catch (error) {
        console.error('[MERGE] Error:', error);
        showNotification('❌ Gagal menggabungkan: ' + error.message, 'error');
    }
}

// Export functions
window.clearCacheAndReload = clearCacheAndReload;
window.resetAllDataInSupabase = resetAllDataInSupabase;
window.resetAllPointsToZero = resetAllPointsToZero;
window.showResetDataModal = showResetDataModal;
window.fixNegativePoints = fixNegativePoints;
window.mergeDuplicateHalaqahs = mergeDuplicateHalaqahs;
window.resetSingleStudent = resetSingleStudent;
window.deleteDataByLembaga = deleteDataByLembaga;
window.resetPointsByLembaga = resetPointsByLembaga;
