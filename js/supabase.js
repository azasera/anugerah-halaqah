// Supabase Integration Module

const SUPABASE_URL = 'https://klhegwunosmryqozuahc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsaGVnd3Vub3Ntcnlxb3p1YWhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3Mjg3NDcsImV4cCI6MjA4NjMwNDc0N30.0X54jxpMZI9eilDxfJ7FYUGImuN-TEH9qGQkdRTtRXw';

// Initialize Supabase client (only if not already initialized)
let supabaseClient;
if (!window.supabaseClient) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabaseClient = supabaseClient;
} else {
    supabaseClient = window.supabaseClient;
}

// Database sync status
let isSyncing = false;
let isOnline = navigator.onLine;

// Show sync status
function showSyncStatus(message, type = 'info') {
    const statusEl = document.getElementById('syncStatus');
    if (!statusEl) return;
    
    const colors = {
        info: 'bg-blue-50 text-blue-700 border-blue-200',
        success: 'bg-green-50 text-green-700 border-green-200',
        error: 'bg-red-50 text-red-700 border-red-200',
        warning: 'bg-amber-50 text-amber-700 border-amber-200'
    };
    
    statusEl.className = `fixed top-20 right-4 z-[100] px-4 py-2 rounded-lg border ${colors[type]} text-sm font-semibold shadow-lg animate-scale-in`;
    statusEl.textContent = message;
    statusEl.classList.remove('hidden');
    
    setTimeout(() => {
        statusEl.classList.add('hidden');
    }, 3000);
}

// Sync students to Supabase
async function syncStudentsToSupabase() {
    if (!isOnline) {
        console.log('Offline - data will sync when online');
        return;
    }
    
    try {
        isSyncing = true;
        // Silent sync - no notification
        
        // Upsert students
        // Validate and clean data before upsert
        const studentsToUpsert = dashboardData.students.map(s => {
            // Ensure ID is valid big int
            const id = parseInt(s.id);
            if (isNaN(id)) return null;

            return {
                id: id,
                name: s.name || 'Unknown',
                halaqah: s.halaqah || 'Tidak Ada',
                nisn: s.nisn || '',
                nik: s.nik || '',
                lembaga: s.lembaga || 'MTA',
                kelas: s.kelas || '',
                total_points: parseInt(s.total_points) || 0,
                daily_ranking: parseInt(s.daily_ranking) || 0,
                overall_ranking: parseInt(s.overall_ranking) || 0,
                streak: parseInt(s.streak) || 0,
                last_activity: s.lastActivity || '',
                achievements: JSON.stringify(s.achievements || []),
                setoran: JSON.stringify(s.setoran || []),
                last_setoran_date: s.lastSetoranDate || '',
                updated_at: new Date().toISOString()
            };
        }).filter(item => item !== null); // Remove invalid items

        // Unique filter to prevent duplicates in same batch
        const uniqueStudents = [];
        const seenIds = new Set();
        
        for (const student of studentsToUpsert) {
            if (!seenIds.has(student.id)) {
                seenIds.add(student.id);
                uniqueStudents.push(student);
            }
        }

        if (uniqueStudents.length === 0) {
            console.log('No valid students to sync');
            isSyncing = false;
            return;
        }

        // Split into chunks to avoid too large payload or complex conflicts
        const chunkSize = 50;
        for (let i = 0; i < uniqueStudents.length; i += chunkSize) {
            const chunk = uniqueStudents.slice(i, i + chunkSize);
            const { data, error } = await supabaseClient
                .from('students')
                .upsert(chunk, { onConflict: 'id' });
            
            if (error) {
                console.error('Supabase Upsert Chunk Error:', error);
                throw error;
            }
        }
        
        // Success - no notification (silent sync)
        isSyncing = false;
    } catch (error) {
        console.error('Error syncing students:', error);
        showSyncStatus('❌ Gagal sinkronisasi santri', 'error');
        isSyncing = false;
    }
}

// Sync halaqahs to Supabase
async function syncHalaqahsToSupabase() {
    if (!isOnline) return;
    
    try {
        // Silent sync - no notification to avoid confusion
        const { data, error } = await supabaseClient
            .from('halaqahs')
            .upsert(dashboardData.halaqahs.map(h => ({
                id: h.id,
                name: h.name,
                points: h.points,
                rank: h.rank,
                status: h.status,
                members: h.members,
                avg_points: h.avgPoints,
                trend: h.trend,
                guru: h.guru || '',
                kelas: h.kelas || '',
                updated_at: new Date().toISOString()
            })), { onConflict: 'id' });
        
        if (error) throw error;
        
        // Success - no notification (silent sync)
    } catch (error) {
        console.error('Error syncing halaqahs:', error);
        showSyncStatus('❌ Gagal sinkronisasi halaqah', 'error');
    }
}

// Load students from Supabase
async function loadStudentsFromSupabase() {
    if (!isOnline) {
        showSyncStatus('📴 Mode Offline - menggunakan data lokal', 'warning');
        return;
    }
    
    try {
        showSyncStatus('☁️ Memuat data santri...', 'info');
        
        const { data, error } = await supabaseClient
            .from('students')
            .select('*')
            .order('overall_ranking', { ascending: true });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
            dashboardData.students = data.map(s => ({
                id: s.id,
                name: s.name,
                halaqah: s.halaqah,
                nisn: s.nisn,
                nik: s.nik || '', // Ensure NIK is loaded
                lembaga: s.lembaga,
                kelas: s.kelas,
                total_points: s.total_points,
                daily_ranking: s.daily_ranking,
                overall_ranking: s.overall_ranking,
                streak: s.streak,
                lastActivity: s.last_activity,
                achievements: JSON.parse(s.achievements || '[]'),
                setoran: JSON.parse(s.setoran || '[]'),
                lastSetoranDate: s.last_setoran_date,
                total_hafalan: s.total_points > 0 ? (s.total_points / 20) : 0 // Fallback logic if needed, ideally from DB
            }));
            
            showSyncStatus('✅ Data santri dimuat', 'success');
        } else {
             // If no data in Supabase, keep local data but don't show "Demo Mode"
             console.log('No data in Supabase, using local defaults');
        }
    } catch (error) {
        console.error('Error loading students:', error);
        showSyncStatus('❌ Gagal memuat santri', 'error');
    }
}

// Load halaqahs from Supabase
async function loadHalaqahsFromSupabase() {
    if (!isOnline) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('halaqahs')
            .select('*')
            .order('rank', { ascending: true });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
            dashboardData.halaqahs = data.map(h => ({
                id: h.id,
                name: h.name,
                points: h.points,
                rank: h.rank,
                status: h.status,
                members: h.members,
                avgPoints: h.avg_points,
                trend: h.trend,
                guru: h.guru,
                kelas: h.kelas
            }));
        }
    } catch (error) {
        console.error('Error loading halaqahs:', error);
    }
}

// Initialize Supabase and load initial data
async function initSupabase() {
    if (!window.supabaseClient) {
        console.error('Supabase client not available');
        return;
    }
    
    // Load initial data
    await Promise.all([
        loadStudentsFromSupabase(),
        loadHalaqahsFromSupabase()
    ]);
    
    // Enable real-time
    enableRealtimeSubscription();
    
    return true;
}

// Expose to window
window.initSupabase = initSupabase;

// Real-time Subscription
function enableRealtimeSubscription() {
    if (!supabaseClient) return;

    console.log('Activating Real-time Subscription...');
    
    // Subscribe to students table
    const studentChannel = supabaseClient.channel('public:students');
    studentChannel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, payload => {
            console.log('Real-time update received (students):', payload);
            handleRealtimeUpdate(payload);
        })
        .subscribe((status) => {
            console.log('Students subscription status:', status);
        });

    // Subscribe to setoran table (if it exists and is used)
    const setoranChannel = supabaseClient.channel('public:setoran');
    setoranChannel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'setoran' }, payload => {
            console.log('Real-time update received (setoran):', payload);
            // We might need a specific handler for setoran if it's a separate table
            // For now, reloading students might be enough if setoran triggers student update
            // Or if we need to merge it. 
            // Assuming setoran updates affect student stats, refreshing data is safe.
            if (typeof loadStudentsFromSupabase === 'function') {
                loadStudentsFromSupabase(); 
            }
        })
        .subscribe((status) => {
             console.log('Setoran subscription status:', status);
        });
}

function handleRealtimeUpdate(payload) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    // Helper to map DB snake_case to local camelCase
    const mapStudentData = (record) => {
        return {
            id: record.id,
            name: record.name,
            halaqah: record.halaqah,
            nisn: record.nisn,
            nik: record.nik,
            lembaga: record.lembaga,
            kelas: record.kelas,
            total_points: record.total_points,
            daily_ranking: record.daily_ranking,
            overall_ranking: record.overall_ranking,
            streak: record.streak,
            lastActivity: record.last_activity,
            achievements: typeof record.achievements === 'string' ? JSON.parse(record.achievements || '[]') : record.achievements,
            setoran: typeof record.setoran === 'string' ? JSON.parse(record.setoran || '[]') : record.setoran,
            lastSetoranDate: record.last_setoran_date,
            total_hafalan: record.total_points > 0 ? (record.total_points / 20) : 0
        };
    };

    if (eventType === 'INSERT') {
        const exists = dashboardData.students.find(s => s.id === newRecord.id);
        if (!exists) {
            dashboardData.students.push(mapStudentData(newRecord));
            refreshAllData();
        }
    } else if (eventType === 'UPDATE') {
        const index = dashboardData.students.findIndex(s => s.id === newRecord.id);
        if (index !== -1) {
            // Merge to avoid losing local UI state if any, though usually we replace data
            dashboardData.students[index] = { ...dashboardData.students[index], ...mapStudentData(newRecord) };
            refreshAllData();
            // showSyncStatus('🔄 Data diperbarui', 'info');
        }
    } else if (eventType === 'DELETE') {
        const index = dashboardData.students.findIndex(s => s.id === oldRecord.id);
        if (index !== -1) {
            dashboardData.students.splice(index, 1);
            refreshAllData();
        }
    }
}

// Call this when app starts
// We'll attach it to window so it can be called from app.js or auth.js
window.enableRealtimeSubscription = enableRealtimeSubscription;

// Initialize if online
if (isOnline && window.supabaseClient) {
    // Delay slightly to ensure everything is loaded
    setTimeout(enableRealtimeSubscription, 2000);
}

// Auto-sync when data changes
async function autoSync() {
    if (isSyncing || !isOnline) return;
    
    await syncStudentsToSupabase();
    await syncHalaqahsToSupabase();
}

// Setup real-time subscriptions
function setupRealtimeSubscriptions() {
    // Check if Supabase is configured
    if (!supabaseClient || !SUPABASE_URL || SUPABASE_URL === 'YOUR_SUPABASE_URL') {
        console.log('Supabase not configured, skipping realtime subscriptions');
        return;
    }
    
    // Check if subscription already exists to prevent duplicate listeners
    if (window.realtimeSubscription) {
        return;
    }

    // Subscribe to changes
    window.realtimeSubscription = supabaseClient
        .channel('db-changes')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'students' },
            (payload) => {
                // Skip if delete operation is in progress
                if (window.deleteOperationInProgress) {
                    console.log('Delete in progress, skipping realtime update');
                    return;
                }
                
                // Debounce updates to prevent spamming
                if (window.studentUpdateTimeout) clearTimeout(window.studentUpdateTimeout);
                window.studentUpdateTimeout = setTimeout(() => {
                    console.log('Students (including Setoran) updated, refreshing...');
                    // Only reload on INSERT and UPDATE, not DELETE
                    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                        loadStudentsFromSupabase().then(() => {
                            // Update parent-child link with fresh data
                            if (typeof refreshUserChildLink === 'function') refreshUserChildLink();
                            
                            if (typeof refreshAllData === 'function') {
                                refreshAllData();
                            } else if (typeof renderStats === 'function') {
                                // Fallback render calls if refreshAllData is not available
                                renderStats();
                                if (typeof renderSantri === 'function') renderSantri();
                                if (typeof renderHalaqah === 'function') renderHalaqah();
                            }
                        });
                    }
                }, 1000); // Wait 1s before refreshing
            }
        )
        // Explicitly subscribe to 'setoran' table if it exists (for redundancy/future-proofing)
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'setoran' },
            (payload) => {
                console.log('Setoran table updated, refreshing students...');
                if (window.setoranUpdateTimeout) clearTimeout(window.setoranUpdateTimeout);
                window.setoranUpdateTimeout = setTimeout(() => {
                    loadStudentsFromSupabase().then(() => {
                        if (typeof refreshAllData === 'function') refreshAllData();
                    });
                }, 1000);
            }
        )
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'halaqahs' },
            (payload) => {
                // Skip if delete operation is in progress
                if (window.deleteOperationInProgress) {
                    console.log('Delete in progress, skipping realtime update');
                    return;
                }
                
                 if (window.halaqahUpdateTimeout) clearTimeout(window.halaqahUpdateTimeout);
                 window.halaqahUpdateTimeout = setTimeout(() => {
                    console.log('Halaqahs updated, refreshing...');
                    // Only reload on INSERT and UPDATE, not DELETE
                    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                        loadHalaqahsFromSupabase().then(() => {
                            if (typeof refreshAllData === 'function') {
                                refreshAllData();
                            } else if (typeof renderHalaqah === 'function') {
                                renderHalaqah();
                                if (typeof renderBestHalaqah === 'function') renderBestHalaqah();
                            }
                        });
                    }
                 }, 1000);
            }
        )
        .subscribe();
}

// Online/Offline detection
window.addEventListener('online', () => {
    isOnline = true;
    showSyncStatus('🌐 Online - sinkronisasi otomatis aktif', 'success');
    autoSync();
});

window.addEventListener('offline', () => {
    isOnline = false;
    showSyncStatus('📴 Offline - data tersimpan lokal', 'warning');
});

// Initialize Supabase integration
async function initSupabase() {
    // Check if Supabase is properly configured
    if (!supabaseClient || !SUPABASE_URL || SUPABASE_URL === 'YOUR_SUPABASE_URL') {
        console.log('Supabase not configured, running in demo mode');
        return;
    }
    
    // Load data from Supabase
    await loadStudentsFromSupabase();
    await loadHalaqahsFromSupabase();
    
    // Setup real-time subscriptions
    setupRealtimeSubscriptions();
    
    // Auto-sync every 30 seconds
    setInterval(autoSync, 30000);
}

// Delete student from Supabase
async function deleteStudentFromSupabase(studentId) {
    if (!isOnline) {
        showSyncStatus('⚠️ Offline: Penghapusan akan disinkronkan nanti', 'warning');
        return; 
    }

    console.log('=== DELETE STUDENT DEBUG ===');
    console.log('Student ID to delete:', studentId);
    
    // Cek session user
    const { data: { session } } = await supabaseClient.auth.getSession();
    console.log('Current session:', session);
    console.log('Current user ID:', session?.user?.id);
    
    if (!session?.user?.id) {
        console.error('❌ No user logged in!');
        showSyncStatus('❌ Anda belum login!', 'error');
        return;
    }

    // Cek apakah student memang ada di Supabase
    console.log('Checking if student exists in Supabase...');
    const { data: existingStudent, error: checkError } = await supabaseClient
        .from('students')
        .select('id')
        .eq('id', studentId)
        .single();
    
    if (checkError || !existingStudent) {
        console.error('Student not found in Supabase:', checkError);
        showSyncStatus('⚠️ Data tidak ditemukan di server', 'warning');
        return;
    }
    
    console.log('Student found, proceeding with delete...');

    try {
        console.log('Attempting to delete student from Supabase...');
        const { error } = await supabaseClient
            .from('students')
            .delete()
            .eq('id', studentId);

        console.log('Delete response:', { error });

        if (error) {
            console.error('RLS Delete Error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            throw error;
        }
        
        console.log(`✅ Student ${studentId} deleted from Supabase`);
        showSyncStatus('✅ Santri berhasil dihapus dari server', 'success');
        
    } catch (error) {
        console.error('❌ Error deleting student:', error);
        
        // Show more specific error message based on code
        if (error.code === '42501' || error.message?.includes('violates row-level security policy')) {
             showSyncStatus('⛔ Izin Ditolak: Hanya Admin yang bisa menghapus', 'error');
        } else if (error.code === 'PGRST116') {
             showSyncStatus('⛔ Data tidak ditemukan', 'error');
        } else if (error.code === '23503') {
             showSyncStatus('⛔ Data masih digunakan di tempat lain', 'error');
        } else {
             showSyncStatus(`❌ Gagal menghapus: ${error.message || 'Unknown error'}`, 'error');
        }
        throw error;
    }
}

// Delete halaqah from Supabase
async function deleteHalaqahFromSupabase(halaqahId) {
    if (!isOnline) {
        console.log('Offline - skipping Supabase delete');
        return Promise.resolve();
    }

    console.log('=== DELETE HALAQAH DEBUG ===');
    console.log('Halaqah ID to delete:', halaqahId);

    // Cek session user
    const { data: { session } } = await supabaseClient.auth.getSession();
    console.log('Current session:', session);
    console.log('Current user ID:', session?.user?.id);
    
    if (!session?.user?.id) {
        console.error('❌ No user logged in!');
        showSyncStatus('❌ Anda belum login!', 'error');
        return Promise.reject('No user logged in');
    }

    // Cek apakah halaqah memang ada di Supabase
    console.log('Checking if halaqah exists in Supabase...');
    const { data: existingHalaqah, error: checkError } = await supabaseClient
        .from('halaqahs')
        .select('id, name')
        .eq('id', halaqahId)
        .single();
    
    if (checkError || !existingHalaqah) {
        console.error('Halaqah not found in Supabase:', checkError);
        showSyncStatus('⚠️ Halaqah tidak ditemukan di server', 'warning');
        return Promise.resolve(); // Not an error, just doesn't exist
    }
    
    console.log('Halaqah found in Supabase:', existingHalaqah);

    // Cek apakah ada students yang masih menggunakan halaqah ini
    console.log('Checking if halaqah is still used by students...');
    const halaqahName = existingHalaqah.name.replace('Halaqah ', '');
    console.log('Checking for students with halaqah:', halaqahName);
    
    const { data: studentsInHalaqah, error: studentsError } = await supabaseClient
        .from('students')
        .select('id')
        .eq('halaqah', halaqahName);
    
    if (studentsError) {
        console.error('Error checking students:', studentsError);
    }
    
    console.log('Students in halaqah:', studentsInHalaqah);
    
    if (studentsInHalaqah && studentsInHalaqah.length > 0) {
        console.error('Cannot delete halaqah: still has', studentsInHalaqah.length, 'students');
        showSyncStatus(`⛔ Halaqah masih memiliki ${studentsInHalaqah.length} santri, hapus santri terlebih dahulu`, 'error');
        return Promise.reject('Halaqah still has students');
    }

    try {
        console.log('Attempting to delete halaqah from Supabase...');
        const { error } = await supabaseClient
            .from('halaqahs')
            .delete()
            .eq('id', halaqahId);

        console.log('Delete response:', { error });

        if (error) {
            console.error('RLS Delete Error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            throw error;
        }
        
        console.log(`✅ Halaqah ${halaqahId} deleted from Supabase`);
        showSyncStatus('✅ Halaqah berhasil dihapus dari server', 'success');
        return Promise.resolve();
        
    } catch (error) {
        console.error('❌ Error deleting halaqah:', error);
        
        if (error.code === '42501' || error.message?.includes('violates row-level security policy')) {
             showSyncStatus('⛔ Izin Ditolak: Hanya Admin yang bisa menghapus', 'error');
        } else if (error.code === 'PGRST116') {
             showSyncStatus('⛔ Halaqah tidak ditemukan', 'error');
        } else if (error.code === '23503') {
             showSyncStatus('⛔ Halaqah masih digunakan di tempat lain', 'error');
        } else {
             showSyncStatus(`❌ Gagal menghapus halaqah: ${error.message || 'Unknown error'}`, 'error');
        }
        return Promise.reject(error);
    }
}

// Delete all students from Supabase
async function deleteAllStudentsFromSupabase() {
    if (!isOnline) {
        console.log('Offline - cannot delete from Supabase');
        return false;
    }

    console.log('=== DELETE ALL STUDENTS ===');
    
    try {
        // Set flag to prevent realtime listener from reloading
        window.deleteOperationInProgress = true;
        
        const { error } = await supabaseClient
            .from('students')
            .delete()
            .neq('id', 0); // Delete all records (id != 0 matches all)

        if (error) {
            console.error('Error deleting all students:', error);
            showSyncStatus('❌ Gagal menghapus semua santri dari server', 'error');
            window.deleteOperationInProgress = false;
            return false;
        }
        
        console.log('✅ All students deleted from Supabase');
        return true;
        
    } catch (error) {
        console.error('❌ Error deleting all students:', error);
        showSyncStatus('❌ Gagal menghapus semua santri', 'error');
        window.deleteOperationInProgress = false;
        return false;
    }
}

// Delete all halaqahs from Supabase
async function deleteAllHalaqahsFromSupabase() {
    if (!isOnline) {
        console.log('Offline - cannot delete from Supabase');
        return false;
    }

    console.log('=== DELETE ALL HALAQAHS ===');
    
    try {
        const { error } = await supabaseClient
            .from('halaqahs')
            .delete()
            .neq('id', 0); // Delete all records

        if (error) {
            console.error('Error deleting all halaqahs:', error);
            showSyncStatus('❌ Gagal menghapus semua halaqah dari server', 'error');
            return false;
        }
        
        console.log('✅ All halaqahs deleted from Supabase');
        return true;
        
    } catch (error) {
        console.error('❌ Error deleting all halaqahs:', error);
        showSyncStatus('❌ Gagal menghapus semua halaqah', 'error');
        return false;
    }
}

// Export functions
window.syncStudentsToSupabase = syncStudentsToSupabase;
window.syncHalaqahsToSupabase = syncHalaqahsToSupabase;
window.loadStudentsFromSupabase = loadStudentsFromSupabase;
window.loadHalaqahsFromSupabase = loadHalaqahsFromSupabase;
window.deleteStudentFromSupabase = deleteStudentFromSupabase;
window.deleteHalaqahFromSupabase = deleteHalaqahFromSupabase;
window.deleteAllStudentsFromSupabase = deleteAllStudentsFromSupabase;
window.deleteAllHalaqahsFromSupabase = deleteAllHalaqahsFromSupabase;
window.initSupabase = initSupabase;
window.autoSync = autoSync;
