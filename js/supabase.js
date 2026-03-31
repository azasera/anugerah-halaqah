// Supabase Configuration and Logic
// Consolidated from fix-setoran-sync.js and original supabase.js

const SUPABASE_URL = 'https://klhegwunosmryqozuahc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsaGVnd3Vub3Ntcnlxb3p1YWhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3Mjg3NDcsImV4cCI6MjA4NjMwNDc0N30.0X54jxpMZI9eilDxfJ7FYUGImuN-TEH9qGQkdRTtRXw';

// Global flags to prevent race conditions
window.isLoadingFromSupabase = false;
window.isLoadingHalaqahs = false;
window.hasPendingLocalChanges = false;
window.deleteOperationInProgress = false;
window.syncInProgress = false;

// Initialize Supabase client
let supabaseClient;
if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabaseClient = supabaseClient;
} else {
    console.error('Supabase library not loaded');
}

// Initialize Supabase and load initial data
async function initSupabase() {
    if (!window.supabaseClient) {
        console.error('Supabase client not available');
        return;
    }

    if (window._supabaseInitDone) {
        console.log('[initSupabase] Sudah pernah dijalankan — lewati (hindari load ganda & realtime ganda)');
        return true;
    }
    window._supabaseInitDone = true;

    // Load initial data
    await Promise.all([
        loadStudentsFromSupabase(),
        loadHalaqahsFromSupabase()
    ]);

    if (typeof recalculateRankings === 'function') {
        recalculateRankings();
        if (typeof StorageManager !== 'undefined' && typeof StorageManager.save === 'function') {
            StorageManager.save();
        }
    }

    // Enable real-time
    enableRealtimeSubscription();

    // Start periodic sync retry for pending changes
    setInterval(() => {
        if (window.hasPendingLocalChanges && !window.syncInProgress && !window.deleteOperationInProgress) {
            console.log('🔄 Retrying sync for pending changes...');
            if (typeof syncStudentsToSupabase === 'function') {
                syncStudentsToSupabase().then((result) => {
                    if (result && result.status === 'success') {
                        window.hasPendingLocalChanges = false;
                        console.log('✅ Retry sync successful');
                    }
                }).catch(err => {
                    console.error('❌ Retry sync failed:', err);
                });
            }
        }
    }, 5000); // Retry every 5 seconds

    return true;
}

// Load students from Supabase
async function loadStudentsFromSupabase() {
    if (!navigator.onLine) {
        if (typeof showSyncStatus === 'function') showSyncStatus('📴 Mode Offline - menggunakan data lokal', 'warning');
        return;
    }

    // Prevent concurrent loads
    if (window.isLoadingFromSupabase) {
        console.log('[LOAD] ⏭️ Already loading from Supabase');
        return;
    }

    // Mode hapus semua: expired setelah 1 jam
    const deleteFlag = localStorage.getItem('_deleteJustDone');
    if (deleteFlag) {
        const elapsed = Date.now() - parseInt(deleteFlag, 10);
        if (elapsed < 3600000) { // 1 jam
            console.log('[LOAD] ⏭️ Skip load students — mode hapus aktif');
            if (typeof window.enforcePostDeleteLocalState === 'function') {
                window.enforcePostDeleteLocalState();
            }
            return;
        } else {
            // Expired — hapus flag dan lanjut load
            localStorage.removeItem('_deleteJustDone');
            console.log('[LOAD] ✅ Flag hapus expired, lanjut load dari server');
        }
    }

    if (window.hasPendingLocalChanges) {
        console.log('[LOAD] ⏭️ Skipping load - pending local changes');
        return;
    }

    window.isLoadingFromSupabase = true;

    try {
        if (typeof showSyncStatus === 'function') showSyncStatus('☁️ Memuat data santri...', 'info');

        // Fetch all students using pagination (Supabase default limit is 1000)
        const PAGE_SIZE = 1000;
        let allData = [];
        let from = 0;
        let hasMore = true;

        while (hasMore) {
            const { data, error } = await window.supabaseClient
                .from('students')
                .select('*')
                .range(from, from + PAGE_SIZE - 1);

            if (error) throw error;

            if (data.length > 0) {
                allData = allData.concat(data);
                from += PAGE_SIZE;
                if (data.length < PAGE_SIZE) hasMore = false;
            } else {
                hasMore = false;
            }
        }

        console.log(`✅ Loaded ${allData.length} students from Supabase`);

        if (allData.length > 0) {
            // Parse JSON fields
            allData.forEach(s => {
                if (typeof s.achievements === 'string') {
                    try { s.achievements = JSON.parse(s.achievements); } catch (e) { s.achievements = []; }
                }
                // Normalize achievements
                if (!Array.isArray(s.achievements)) s.achievements = [];

                if (typeof s.setoran === 'string') {
                    try { s.setoran = JSON.parse(s.setoran); } catch (e) { s.setoran = []; }
                }
                // Normalize setoran
                if (!Array.isArray(s.setoran)) s.setoran = [];
            });

            // Update local state
            dashboardData.students = allData;
            dashboardData.stats.totalStudents = allData.length;
            dashboardData.stats.totalPoints = allData.reduce((sum, s) => sum + (s.total_points || 0), 0);
            
            // Recalculate average points
            if (dashboardData.stats.totalStudents > 0) {
                dashboardData.stats.avgPointsPerStudent = Math.round(dashboardData.stats.totalPoints / dashboardData.stats.totalStudents);
            }

            if (typeof recalculateRankings === 'function') recalculateRankings();
            StorageManager.save();

            // Update UI
            if (typeof renderStats === 'function') renderStats();
            if (typeof renderHalaqahRankings === 'function') renderHalaqahRankings();
            if (typeof renderSantri === 'function') renderSantri();
            if (typeof renderFilters === 'function') renderFilters();
            if (typeof updateStats === 'function') updateStats();
        } else {
            console.log('⚠️ Remote students empty — sinkronkan ke kosong (sumber: server)');
            dashboardData.students = [];
            if (typeof recalculateRankings === 'function') recalculateRankings();
            else if (typeof calculateStats === 'function') calculateStats();
            StorageManager.save();
            if (typeof renderSantri === 'function') renderSantri();
            if (typeof refreshAllData === 'function') refreshAllData();
        }

        if (typeof showSyncStatus === 'function') showSyncStatus('✅ Data tersinkronisasi', 'success');

    } catch (error) {
        console.error('Error loading students:', error);
        if (typeof showSyncStatus === 'function') showSyncStatus('❌ Gagal memuat data', 'error');
    } finally {
        window.isLoadingFromSupabase = false;
    }
}

// Load halaqahs from Supabase
async function loadHalaqahsFromSupabase() {
    if (!navigator.onLine || window.isLoadingHalaqahs) return;

    if (localStorage.getItem('_deleteJustDone')) {
        const elapsed = Date.now() - parseInt(localStorage.getItem('_deleteJustDone'), 10);
        if (elapsed < 3600000) {
            console.log('[LOAD] ⏭️ Skip load halaqahs — mode hapus aktif');
            if (typeof window.enforcePostDeleteLocalState === 'function') {
                window.enforcePostDeleteLocalState();
            }
            return;
        } else {
            localStorage.removeItem('_deleteJustDone');
        }
    }

    window.isLoadingHalaqahs = true;

    try {
        const { data, error } = await window.supabaseClient
            .from('halaqahs')
            .select('*')
            .order('rank', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
            console.log(`✅ Loaded ${data.length} halaqahs from Supabase`);
            dashboardData.halaqahs = data;
            dashboardData.stats.totalHalaqahs = data.length;

            if (typeof recalculateRankings === 'function') recalculateRankings();
            StorageManager.save();

            if (typeof renderHalaqah === 'function') renderHalaqah();
            if (typeof renderHalaqahRankings === 'function') renderHalaqahRankings();
            if (typeof renderStats === 'function') renderStats();
            if (typeof updateStats === 'function') updateStats();
        } else {
            console.log('⚠️ Remote halaqahs empty — sinkronkan ke kosong');
            dashboardData.halaqahs = [];
            dashboardData.stats.totalHalaqahs = 0;
            if (typeof recalculateRankings === 'function') recalculateRankings();
            else if (typeof calculateStats === 'function') calculateStats();
            StorageManager.save();
            if (typeof renderHalaqah === 'function') renderHalaqah();
            if (typeof renderHalaqahRankings === 'function') renderHalaqahRankings();
            if (typeof updateStats === 'function') updateStats();
        }
    } catch (error) {
        console.error('Error loading halaqahs:', error);
    } finally {
        window.isLoadingHalaqahs = false;
    }
}

// Normalize tanggal_lahir to YYYY-MM-DD for Supabase
function normalizeTanggalLahir(raw) {
    if (!raw) return null;
    const s = String(raw).trim();
    // Already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    // DD-MM-YY → YYYY-MM-DD (assume 2000s)
    const m1 = s.match(/^(\d{2})-(\d{2})-(\d{2})$/);
    if (m1) return `20${m1[3]}-${m1[2]}-${m1[1]}`;
    // DD-MM-YYYY
    const m2 = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (m2) return `${m2[3]}-${m2[2]}-${m2[1]}`;
    // DD/MM/YYYY
    const m3 = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m3) return `${m3[3]}-${m3[2]}-${m3[1]}`;
    // Try native parse as last resort
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    return null;
}

// Sync students to Supabase (Upload changes)
async function syncStudentsToSupabase() {
    if (!window.supabaseClient || !navigator.onLine) {
        window.hasPendingLocalChanges = true;
        return;
    }

    if (window.syncInProgress) {
        window.hasPendingLocalChanges = true;
        return { status: 'skipped_in_progress' };
    }
    window.syncInProgress = true;

    try {
        if (typeof showSyncStatus === 'function') showSyncStatus('☁️ Menyimpan perubahan...', 'info');

        // Prepare data for upsert
        // Ensure JSON fields are stringified and IDs are present
        const studentsToUpsert = dashboardData.students.map(s => {
            // Ensure ID exists
            if (!s.id) s.id = Date.now();
            
            return {
                id: s.id,
                name: s.name,
                halaqah: s.halaqah,
                nisn: s.nisn || '',
                nik: s.nik || '', // Add NIK
                lembaga: (typeof window.normalizeLembagaKey === 'function')
                    ? (window.normalizeLembagaKey(s.lembaga || '') || s.lembaga || '')
                    : (s.lembaga || ''), // Keep original lembaga, don't default to MTA
                kelas: s.kelas || '', // Add Kelas
                jenis_kelamin: s.jenis_kelamin || '',
                tempat_lahir: s.tempat_lahir || '',
                tanggal_lahir: normalizeTanggalLahir(s.tanggal_lahir),
                alamat: s.alamat || '',
                hp: s.hp || '',
                nama_ayah: s.nama_ayah || '',
                nama_ibu: s.nama_ibu || '',
                sekolah_asal: s.sekolah_asal || '',
                total_hafalan: Number(s.total_hafalan) || 0,
                total_points: s.total_points || 0,
                daily_ranking: s.daily_ranking || 0,
                overall_ranking: s.overall_ranking || 0,
                streak: s.streak || 0,
                last_activity: s.last_activity || new Date().toISOString(),
                achievements: JSON.stringify(s.achievements || []),
                setoran: JSON.stringify(s.setoran || []),
                last_setoran_date: s.last_setoran_date || null
            };
        });

        // Upsert in batches of 100
        const BATCH_SIZE = 100;
        for (let i = 0; i < studentsToUpsert.length; i += BATCH_SIZE) {
            const batch = studentsToUpsert.slice(i, i + BATCH_SIZE);
            const { error } = await window.supabaseClient
                .from('students')
                .upsert(batch);
            
            if (error) throw error;
        }

        console.log('✅ Sync successful');
        if (typeof showSyncStatus === 'function') showSyncStatus('✅ Perubahan tersimpan', 'success');
        window.hasPendingLocalChanges = false;
        // Block realtime reload for 5s to prevent overwriting fresh local data
        window._justSynced = true;
        setTimeout(() => { window._justSynced = false; }, 5000);
        return { status: 'success' };

    } catch (error) {
        console.error('Sync failed:', error);
        if (typeof showSyncStatus === 'function') showSyncStatus('❌ Gagal menyimpan (akan mencoba lagi)', 'warning');
        window.hasPendingLocalChanges = true; // Mark for retry
        return { status: 'error', error };
    } finally {
        window.syncInProgress = false;
    }
}

// Sync halaqahs to Supabase
async function syncHalaqahsToSupabase() {
    if (!window.supabaseClient || !navigator.onLine) return;

    try {
        const halaqahsToUpsert = dashboardData.halaqahs.map(h => ({
            id: h.id,
            name: h.name,
            points: h.points || 0,
            rank: h.rank || 0,
            status: h.status || 'LAMA',
            members: h.members || 0,
            avg_points: h.avg_points || 0,
            trend: h.trend || 0,
            guru: h.guru || '',
            kelas: h.kelas || ''
        }));

        const { error } = await window.supabaseClient
            .from('halaqahs')
            .upsert(halaqahsToUpsert);

        if (error) throw error;
        console.log('✅ Halaqahs synced');

    } catch (error) {
        console.error('Halaqah sync failed:', error);
    }
}

// Enable Realtime Subscription
function enableRealtimeSubscription() {
    if (!window.supabaseClient) return;
    if (window._supabaseRealtimeSubscribed) {
        console.log('[Realtime] Sudah aktif — lewati');
        return;
    }
    window._supabaseRealtimeSubscribed = true;

    window.supabaseClient
        .channel('public:students')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, (payload) => {
            console.log('🔄 Realtime update received:', payload);

            if (localStorage.getItem('_deleteJustDone')) {
                console.log('🔄 Realtime: skip reload (mode hapus aktif)');
                return;
            }
            if (window.deleteOperationInProgress) {
                console.log('🔄 Realtime: skip reload (operasi hapus berjalan)');
                return;
            }

            // If we are the one who made the change (via sync), ignore to prevent loop
            // But Supabase doesn't give us the "origin" easily.
            // Simple strategy: Just reload if we are not currently syncing/editing
            if (!window.hasPendingLocalChanges && !window.syncInProgress && !window._justSynced) {
                // Debounce reload
                if (window.reloadTimeout) clearTimeout(window.reloadTimeout);
                window.reloadTimeout = setTimeout(() => {
                    loadStudentsFromSupabase();
                }, 2000);
            }
        })
        .subscribe();
}

// --- DELETE OPERATIONS WITH SERVER-SIDE CHECK ---

async function deleteStudentFromSupabase(studentId) {
    if (!window.supabaseClient) return false;
    
    // Set flag to prevent immediate reload
    localStorage.setItem('_deleteJustDone', Date.now().toString());
    window.deleteOperationInProgress = true;

    try {
        // 1. Attempt DELETE and select the deleted row to confirm
        const { data, error } = await window.supabaseClient
            .from('students')
            .delete()
            .eq('id', studentId)
            .select(); // IMPORTANT: Return deleted data to confirm

        if (error) throw error;

        // 2. Check if data was actually returned (meaning something was deleted)
        if (data && data.length > 0) {
            console.log(`✅ Deleted student ${studentId} successfully.`);
            return true;
        }

        // 3. If no data returned, check if it exists (maybe permissions issue or already gone)
        const { data: checkData, error: checkError } = await window.supabaseClient
            .from('students')
            .select('id')
            .eq('id', studentId)
            .maybeSingle();

        if (checkData) {
            // It exists but wasn't deleted -> Permission/RLS issue
            throw new Error('Izin ditolak: Data ada di server tapi tidak dapat dihapus.');
        } else {
            // It doesn't exist -> Already deleted
            console.warn(`Student ${studentId} already gone from server.`);
            return true;
        }

    } catch (error) {
        console.error('Delete student failed:', error);
        throw error; // Re-throw to be caught by UI
    } finally {
        setTimeout(() => {
            window.deleteOperationInProgress = false;
        }, 2000);
    }
}

async function deleteHalaqahFromSupabase(halaqahId) {
    if (!window.supabaseClient) return false;
    
    localStorage.setItem('_deleteJustDone', Date.now().toString());
    window.deleteOperationInProgress = true;
    
    try {
        const { data, error } = await window.supabaseClient
            .from('halaqahs')
            .delete()
            .eq('id', halaqahId)
            .select();
            
        if (error) throw error;
        
        if (data && data.length > 0) {
            return true;
        }

        // Check existence if 0 deleted
        const { data: checkData, error: checkError } = await window.supabaseClient
            .from('halaqahs')
            .select('id')
            .eq('id', halaqahId)
            .maybeSingle();

        if (checkData) {
             throw new Error('Izin ditolak: Data halaqah ada di server tapi tidak dapat dihapus.');
        } else {
             return true; // Already gone
        }
    } catch (error) {
        console.error('Delete halaqah failed:', error);
        throw error;
    } finally {
        setTimeout(() => {
            window.deleteOperationInProgress = false;
        }, 2000);
    }
}


/**
 * Hapus semua baris di tabel (pagination select id + delete per chunk).
 * .neq('id', 0) tidak andal untuk UUID / id string — sering 0 baris terhapus di server.
 */
async function deleteAllRowsInTable(tableName) {
    if (!window.supabaseClient) return false;

    const PAGE_SIZE = 1000;
    const DELETE_CHUNK = 80;
    const allIds = [];
    let from = 0;

    while (true) {
        const { data, error } = await window.supabaseClient
            .from(tableName)
            .select('id')
            .range(from, from + PAGE_SIZE - 1);

        if (error) throw error;
        if (!data || data.length === 0) break;
        data.forEach((r) => { if (r.id != null) allIds.push(r.id); });
        if (data.length < PAGE_SIZE) break;
        from += PAGE_SIZE;
    }

    if (allIds.length === 0) {
        console.log(`[DELETE ALL] ${tableName}: tidak ada baris di server`);
        return true;
    }

    for (let i = 0; i < allIds.length; i += DELETE_CHUNK) {
        const chunk = allIds.slice(i, i + DELETE_CHUNK);
        const { error } = await window.supabaseClient
            .from(tableName)
            .delete()
            .in('id', chunk);
        if (error) throw error;
    }

    console.log(`[DELETE ALL] ${tableName}: ${allIds.length} baris dihapus`);
    return true;
}

async function deleteAllStudentsFromSupabase() {
    if (!window.supabaseClient) return false;

    localStorage.setItem('_deleteJustDone', Date.now().toString());
    window.deleteOperationInProgress = true;

    try {
        return await deleteAllRowsInTable('students');
    } catch (error) {
        console.error('Delete all students failed:', error);
        return false;
    } finally {
        setTimeout(() => {
            window.deleteOperationInProgress = false;
        }, 2000);
    }
}

async function deleteAllHalaqahsFromSupabase() {
    if (!window.supabaseClient) return false;

    localStorage.setItem('_deleteJustDone', Date.now().toString());
    window.deleteOperationInProgress = true;

    try {
        return await deleteAllRowsInTable('halaqahs');
    } catch (error) {
        console.error('Delete all halaqahs failed:', error);
        return false;
    } finally {
        setTimeout(() => {
            window.deleteOperationInProgress = false;
        }, 2000);
    }
}

// ============================================
// USER MANAGEMENT FUNCTIONS
// ============================================

// Load users from Supabase (Profiles & Local Users)
async function loadUsersFromSupabase() {
    if (!window.supabaseClient) return;

    try {
        console.log('🔄 Loading users from Supabase...');
        
        // 1. Fetch from Profiles (Auth Users)
        const { data: profiles, error: profilesError } = await window.supabaseClient
            .from('profiles')
            .select('*');

        if (profilesError) console.error('Error fetching profiles:', profilesError);

        // 2. Fetch from Local Users (Manual Users)
        const { data: localUsers, error: localUsersError } = await window.supabaseClient
            .from('local_users')
            .select('*');

        if (localUsersError) console.error('Error fetching local_users:', localUsersError);

        // 3. Merge Data
        const allUsers = [];

        // Add Profiles
        if (profiles) {
            profiles.forEach(p => {
                allUsers.push({
                    id: p.id,
                    name: p.full_name,
                    email: p.email,
                    role: p.role,
                    phone: p.phone || '',
                    status: p.is_active ? 'active' : 'inactive',
                    createdAt: p.created_at,
                    lastLogin: p.updated_at,
                    source: 'profiles' // Mark source
                });
            });
        }

        // Add Local Users (if email not already in profiles)
        if (localUsers) {
            localUsers.forEach(u => {
                if (!allUsers.find(p => p.email === u.email)) {
                    allUsers.push({
                        id: u.id,
                        name: u.name,
                        email: u.email,
                        role: u.role,
                        phone: u.phone || '',
                        status: u.status || 'active',
                        createdAt: u.created_at,
                        lastLogin: u.last_login || '-',
                        source: 'local_users', // Mark source
                        password: u.password || '' // untuk fallback login (disimpan di DB)
                    });
                }
            });
        }

        // 4. Update Global State + localStorage (always persist so localhost cache matches deploy)
        if (window.usersData) {
            window.usersData.users = allUsers;
        }
        localStorage.setItem('usersData', JSON.stringify({ users: allUsers }));
        console.log(`✅ Loaded ${allUsers.length} users from Supabase (Profiles + Local)`);

        if (typeof renderUserManagement === 'function') {
            renderUserManagement();
        }

        return allUsers;

    } catch (error) {
        console.error('Error in loadUsersFromSupabase:', error);
    }
}

// Sync Local Users to Supabase
async function syncUsersToSupabase() {
    if (!window.supabaseClient || !window.usersData) return;

    try {
        console.log('🔄 Syncing users to Supabase...');
        const users = window.usersData.users;
        
        // Filter users that are NOT from profiles (Auth)
        // We only sync manual users to local_users table
        const manualUsers = users.filter(u => u.source !== 'profiles');
        
        if (manualUsers.length === 0) {
            console.log('✅ No manual users to sync');
            return;
        }

        const usersToUpsert = manualUsers.map(u => ({
            id: typeof u.id === 'string' && u.id.length > 20 ? undefined : u.id, // Skip UUIDs if any
            name: u.name,
            email: u.email,
            role: u.role,
            phone: u.phone,
            status: u.status,
            updated_at: new Date().toISOString()
        })).filter(u => u.id); // Ensure we have ID (timestamp usually)

        // Upsert to local_users
        const { error } = await window.supabaseClient
            .from('local_users')
            .upsert(usersToUpsert);

        if (error) {
            console.error('Error syncing local_users:', error);
            if (typeof showNotification === 'function') {
                showNotification('❌ Gagal sync user ke server', 'error');
            }
        } else {
            console.log('✅ Users synced successfully');
            // Reload to get fresh state
            loadUsersFromSupabase();
        }

    } catch (error) {
        console.error('Exception in syncUsersToSupabase:', error);
    }
}

// Expose functions to window
window.initSupabase = initSupabase;
window.loadStudentsFromSupabase = loadStudentsFromSupabase;
window.loadHalaqahsFromSupabase = loadHalaqahsFromSupabase;
window.syncStudentsToSupabase = syncStudentsToSupabase;
window.syncHalaqahsToSupabase = syncHalaqahsToSupabase;
window.deleteStudentFromSupabase = deleteStudentFromSupabase;
window.deleteHalaqahFromSupabase = deleteHalaqahFromSupabase;
window.deleteAllStudentsFromSupabase = deleteAllStudentsFromSupabase;
window.deleteAllHalaqahsFromSupabase = deleteAllHalaqahsFromSupabase;
window.loadUsersFromSupabase = loadUsersFromSupabase;
window.syncUsersToSupabase = syncUsersToSupabase;