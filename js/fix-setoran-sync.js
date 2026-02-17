// Fix Setoran Sync Issues
// This script fixes race conditions and sync problems

// Global flags to prevent race conditions
window.isLoadingFromSupabase = false;
window.hasPendingLocalChanges = false;

// Override loadStudentsFromSupabase to prevent overwriting local changes
const originalLoadStudents = window.loadStudentsFromSupabase;
if (originalLoadStudents) {
    window.loadStudentsFromSupabase = async function() {
        // Don't load if we have pending local changes
        if (window.hasPendingLocalChanges) {
            console.log('⏭️ Skipping load - pending local changes');
            return;
        }

        // Set flag to prevent concurrent loads
        if (window.isLoadingFromSupabase) {
            console.log('⏭️ Already loading from Supabase');
            return;
        }

        window.isLoadingFromSupabase = true;
        
        try {
            await originalLoadStudents();
        } finally {
            window.isLoadingFromSupabase = false;
        }
    };
}

// Enhanced handleSetoran with better sync
const originalHandleSetoran = window.handleSetoran;
if (originalHandleSetoran) {
    window.handleSetoran = async function(event, studentId) {
        event.preventDefault();

        // Security check
        if (typeof currentProfile === 'undefined' || !currentProfile || 
            (currentProfile.role !== 'guru' && currentProfile.role !== 'admin')) {
            showNotification('⛔ Akses ditolak: Hanya Guru dan Admin yang dapat input setoran', 'error');
            return;
        }

        const formData = new FormData(event.target);
        const student = dashboardData.students.find(s => s.id === studentId);
        if (!student) return;

        const lembagaKey = formData.get('lembaga');
        const sesiId = parseInt(formData.get('sesi'));
        const baris = parseInt(formData.get('baris'));
        const kelancaran = formData.get('kelancaran');
        const kesalahan = parseInt(formData.get('kesalahan'));
        const note = formData.get('note');

        const halaman = barisToHalaman(baris, lembagaKey);
        const lembaga = appSettings.lembaga[lembagaKey];

        const currentSession = getCurrentSession(lembagaKey);
        const isOnTime = currentSession !== null;
        const targetsMet = baris >= lembaga.targetBaris;
        const isLancar = kelancaran === 'lancar' && kesalahan === 0;
        const isTidakLancar = kelancaran === 'tidak_lancar' && kesalahan <= 3;
        const meetsIstiqomahCriteria = isOnTime && targetsMet && isLancar;

        let poin = 0;
        let status = '';

        if (meetsIstiqomahCriteria) {
            poin = poinRules.tepatWaktuLancarTarget;
            status = 'Istiqomah: Tepat Waktu, Lancar, Capai Target';
        } else {
            poin = 0;
            if (!isOnTime && !targetsMet && !isLancar) {
                status = 'Tidak Tepat Waktu, Tidak Capai Target, Tidak Lancar';
            } else if (!isOnTime && !targetsMet) {
                status = 'Tidak Tepat Waktu dan Tidak Capai Target';
            } else if (!isOnTime && !isLancar) {
                status = 'Tidak Tepat Waktu dan Tidak Lancar';
            } else if (!isOnTime) {
                status = 'Tidak Tepat Waktu';
            } else if (!targetsMet && !isLancar) {
                status = 'Tidak Capai Target dan Tidak Lancar';
            } else if (!targetsMet) {
                status = 'Tidak Capai Target';
            } else if (!isLancar) {
                status = 'Tidak Lancar';
            } else if (isTidakLancar && targetsMet) {
                status = 'Tidak Lancar meskipun Capai Target';
            } else {
                status = 'Tidak Memenuhi Kriteria';
            }
        }

        // Create setoran record
        if (!student.setoran) student.setoran = [];

        const setoran = {
            id: Date.now(),
            date: new Date().toISOString(),
            lembaga: appSettings.lembaga[lembagaKey].name,
            sesi: (appSettings.lembaga[lembagaKey].sesiHalaqah.find(s => s.id === sesiId) || { name: '-' }).name,
            baris: baris,
            halaman: parseFloat(halaman),
            kelancaran: kelancaran,
            kesalahan: kesalahan,
            tepatWaktu: isOnTime,
            capaiTarget: targetsMet,
            poin: poin,
            status: status,
            istiqomah: meetsIstiqomahCriteria,
            noPoinReason: meetsIstiqomahCriteria ? '' : status,
            note: note || '',
            timestamp: new Date().toLocaleString('id-ID')
        };

        console.log('💾 Saving setoran:', setoran);

        // Update student data
        student.setoran.push(setoran);
        student.total_points += poin;
        student.lastActivity = 'Baru saja';

        if (meetsIstiqomahCriteria) {
            const today = new Date().toDateString();
            const lastSetoranDate = student.lastSetoranDate || '';

            if (lastSetoranDate !== today) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);

                if (lastSetoranDate === yesterday.toDateString()) {
                    student.streak += 1;
                } else if (lastSetoranDate === '') {
                    student.streak = 1;
                } else {
                    student.streak = 1;
                }

                student.lastSetoranDate = today;
            }
        }

        // Update Total Hafalan
        if (!student.total_hafalan) student.total_hafalan = 0;
        student.total_hafalan += parseFloat(halaman);
        student.total_hafalan = Math.round(student.total_hafalan * 100) / 100;

        console.log('📊 Updated student:', {
            name: student.name,
            total_points: student.total_points,
            total_hafalan: student.total_hafalan,
            streak: student.streak
        });

        // Mark that we have pending changes
        window.hasPendingLocalChanges = true;

        // Step 1: Save to localStorage immediately
        recalculateRankings();
        StorageManager.save();
        console.log('✅ Saved to localStorage');

        closeModal();
        refreshAllData();
        if (meetsIstiqomahCriteria) {
            showNotification(`✅ Setoran ${baris} baris memenuhi kriteria istiqomah dan mendapat poin (+${poin})`);
        } else {
            showNotification(`ℹ️ Setoran ${baris} baris tersimpan, hafalan bertambah, namun tidak memenuhi kriteria poin/istiqomah`, 'warning');
        }

        // Step 3: Sync to Supabase in background
        if (typeof syncStudentsToSupabase === 'function') {
            try {
                console.log('☁️ Syncing to Supabase...');
                await syncStudentsToSupabase();
                console.log('✅ Synced to Supabase');
                
                // Clear pending changes flag after successful sync
                setTimeout(() => {
                    window.hasPendingLocalChanges = false;
                    console.log('✅ Sync complete, cleared pending flag');
                }, 3000); // Wait 3 seconds to ensure sync is complete
                
            } catch (err) {
                console.error('❌ Sync error:', err);
                showNotification('⚠️ Data tersimpan lokal, tapi gagal sync ke server', 'warning');
                
                // Keep pending flag to retry later
                setTimeout(() => {
                    window.hasPendingLocalChanges = false;
                }, 10000); // Clear after 10 seconds anyway
            }
        } else {
            // No sync function available
            window.hasPendingLocalChanges = false;
        }
    };
}

// Enhanced submitSetoranV2 with better sync
const originalSubmitSetoranV2 = window.submitSetoranV2;
if (originalSubmitSetoranV2) {
    window.submitSetoranV2 = async function(event, studentId) {
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
            
            console.log('💾 Saving setoran V2:', { studentId, poin, keterangan });
            
            // Mark pending changes
            window.hasPendingLocalChanges = true;
            
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
                // Fallback to old method
                console.warn('SetoranHarian API not available, using fallback');
                
                // Add to setoran array
                if (!student.setoran) student.setoran = [];
                student.setoran.push({
                    date: new Date().toISOString(),
                    poin: poin,
                    keterangan: keterangan
                });
                
                // Update total points
                student.total_points = (student.total_points || 0) + poin;
                student.updated_at = new Date().toISOString();
                
                // Save locally
                recalculateRankings();
                StorageManager.save();
                
                // Sync to Supabase
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
            
            // Refresh data
            await refreshAllData();
            
            // Close modal
            closeModal();
            
            // Clear pending flag after delay
            setTimeout(() => {
                window.hasPendingLocalChanges = false;
                console.log('✅ Cleared pending flag after V2 submit');
            }, 3000);
            
        } catch (error) {
            console.error('Error submitting setoran:', error);
            showNotification('❌ Gagal menyimpan setoran: ' + error.message, 'error');
            
            // Clear pending flag on error
            setTimeout(() => {
                window.hasPendingLocalChanges = false;
            }, 5000);
        }
    };
}

// Disable realtime updates when we have pending changes
const originalHandleRealtimeUpdate = window.handleRealtimeUpdate;
if (originalHandleRealtimeUpdate) {
    window.handleRealtimeUpdate = function(payload) {
        // Skip realtime updates if we have pending local changes
        if (window.hasPendingLocalChanges) {
            console.log('⏭️ Skipping realtime update - pending local changes');
            return;
        }
        
        // Call original handler
        originalHandleRealtimeUpdate(payload);
    };
}

// Add periodic sync retry for pending changes
setInterval(() => {
    if (window.hasPendingLocalChanges && !window.syncInProgress) {
        console.log('🔄 Retrying sync for pending changes...');
        if (typeof syncStudentsToSupabase === 'function') {
            syncStudentsToSupabase().then(() => {
                window.hasPendingLocalChanges = false;
                console.log('✅ Retry sync successful');
            }).catch(err => {
                console.error('❌ Retry sync failed:', err);
            });
        }
    }
}, 30000); // Retry every 30 seconds

console.log('✅ Setoran sync fix loaded');
console.log('📝 Features:');
console.log('  - Prevents race conditions');
console.log('  - Protects local changes from being overwritten');
console.log('  - Auto-retry sync for pending changes');
console.log('  - Better logging for debugging');
