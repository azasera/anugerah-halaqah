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
let lastUserSyncDiagnostics = null;

// Helper: Ensure currentProfile is loaded from localStorage if not already set
function ensureProfileLoaded() {
    if (!window.currentProfile) {
        const storedProfile = localStorage.getItem('currentProfile');
        if (storedProfile) {
            try {
                window.currentProfile = JSON.parse(storedProfile);
                console.log('[PROFILE] Loaded from localStorage:', window.currentProfile.role);
            } catch (e) {
                console.error('[PROFILE] Failed to parse stored profile:', e);
            }
        }
    }
    return window.currentProfile;
}

function isTransientSupabaseError(error) {
    if (!error || !error.message) return false;
    const msg = error.message.toLowerCase();
    if (msg.includes('timeout')) return true;
    if (msg.includes('rate limit') || msg.includes('429')) return true;
    if (msg.includes('network')) return true;
    return false;
}

function deduplicateStudentsByIdentity(students) {
    const protectedIds = new Set();

    try {
        if (typeof userSantriData !== 'undefined' && userSantriData && Array.isArray(userSantriData.relationships)) {
            userSantriData.relationships.forEach(r => {
                if (r && r.santriId !== undefined && r.santriId !== null) {
                    protectedIds.add(r.santriId);
                }
            });
        }
    } catch (e) {
    }

    try {
        if (typeof currentUserChild !== 'undefined' && currentUserChild && currentUserChild.id) {
            protectedIds.add(currentUserChild.id);
        }
        if (typeof window !== 'undefined') {
            if (window.currentUserChild && window.currentUserChild.id) {
                protectedIds.add(window.currentUserChild.id);
            }
            if (window.getCurrentUserChild && typeof window.getCurrentUserChild === 'function') {
                const c = window.getCurrentUserChild();
                if (c && c.id) {
                    protectedIds.add(c.id);
                }
            }
        }
    } catch (e) {
    }

    const keyToStudent = new Map();

    for (const s of students) {
        const nisn = s.nisn ? String(s.nisn).trim() : '';
        const nik = s.nik ? String(s.nik).trim() : '';

        let key = '';
        if (nisn) {
            key = `nisn:${nisn}`;
        } else if (nik) {
            key = `nik:${nik}`;
        } else {
            key = `id:${s.id}`;
        }

        const existing = keyToStudent.get(key);
        if (!existing) {
            keyToStudent.set(key, s);
            continue;
        }

        const existingId = parseInt(existing.id);
        const newId = parseInt(s.id);
        const existingProtected = protectedIds.has(existingId);
        const newProtected = protectedIds.has(newId);

        let keep = existing;
        let drop = s;

        if (existingProtected && !newProtected) {
            keep = existing;
            drop = s;
        } else if (!existingProtected && newProtected) {
            keep = s;
            drop = existing;
        } else {
            const existingScore =
                (parseFloat(existing.total_hafalan) || 0) +
                (parseInt(existing.total_points) || 0) / 1000;
            const newScore =
                (parseFloat(s.total_hafalan) || 0) +
                (parseInt(s.total_points) || 0) / 1000;

            if (newScore > existingScore) {
                keep = s;
                drop = existing;
            }
        }

        keyToStudent.set(key, keep);
        console.log('[DEDUP] Removing duplicate student:', drop.name, 'key:', key);
    }

    return Array.from(keyToStudent.values());
}

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
        return { status: 'skipped_offline' };
    }

    // CHECK: Ensure dashboardData is loaded
    // dashboardData is a global variable from data.js, not window.dashboardData
    if (!dashboardData || !dashboardData.students || !Array.isArray(dashboardData.students) || dashboardData.students.length === 0) {
        console.log('⏭️ dashboardData not loaded yet or empty, skipping sync');
        return { status: 'skipped_empty' };
    }

    // AUTH CHECK: Ensure profile is loaded and allow admin and guru to write to DB
    const profile = ensureProfileLoaded(); // Try to load from localStorage if not set
    if (!profile || (profile.role !== 'admin' && profile.role !== 'guru')) {
        console.warn('⛔ Sync blocked: User is not admin or guru (role:', profile?.role || 'undefined', ')');
        return { status: 'skipped_permission' };
    }

    // Prevent concurrent syncs and realtime loops
    if (window.syncInProgress) {
        console.log('⏭️ Sync already in progress, skipping...');
        return { status: 'skipped_in_progress' };
    }

    try {
        window.syncInProgress = true;
        isSyncing = true;

        // Deduplicate students before syncing
        dashboardData.students = deduplicateStudentsByIdentity(dashboardData.students);

        // Upsert students
        // Validate and clean data before upsert
        const studentsToUpsert = dashboardData.students.map(s => {
            // Ensure ID is valid big int
            const id = parseInt(s.id);
            if (isNaN(id)) return null;

            const studentData = {
                id: id,
                name: s.name || 'Unknown',
                halaqah: s.halaqah || 'Tidak Ada',
                nisn: s.nisn || '',
                nik: s.nik || '',
                lembaga: s.lembaga || 'MTA',
                kelas: s.kelas || '',
                // New Profile Fields
                jenis_kelamin: s.jenis_kelamin || '',
                tempat_lahir: s.tempat_lahir || '',
                tanggal_lahir: s.tanggal_lahir || null,
                alamat: s.alamat || '',
                hp: s.hp || '',
                nama_ayah: s.nama_ayah || '',
                nama_ibu: s.nama_ibu || '',
                sekolah_asal: s.sekolah_asal || '',
                // Alumni fields
                is_alumni: s.is_alumni === true,
                kategori: s.kategori || '',

                total_points: parseInt(s.total_points) || 0,
                daily_ranking: parseInt(s.daily_ranking) || 0,
                overall_ranking: parseInt(s.overall_ranking) || 0,
                streak: parseInt(s.streak) || 0,
                last_activity: s.lastActivity || '',
                achievements: JSON.stringify(s.achievements || []),
                setoran: JSON.stringify(s.setoran || []),
                last_setoran_date: s.lastSetoranDate || '',
                total_hafalan: parseFloat(s.total_hafalan) || 0,
                updated_at: new Date().toISOString()
            };

            // Debug log for first student
            if (id === dashboardData.students[0].id) {
                console.log('[SYNC DEBUG] First student data:', studentData);
                console.log('[SYNC DEBUG] Original tanggal_lahir:', s.tanggal_lahir);
            }

            return studentData;
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
            window.syncInProgress = false;
            return { status: 'skipped_empty' };
        }

        // Split into chunks to avoid too large payload or complex conflicts
        const chunkSize = 20; // Reduce from 50 to 20 to avoid connection issues
        const failures = [];

        for (let i = 0; i < uniqueStudents.length; i += chunkSize) {
            const chunk = uniqueStudents.slice(i, i + chunkSize);

            console.log(`[SYNC] Uploading chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(uniqueStudents.length / chunkSize)}...`);

            try {
                const { data, error } = await supabaseClient
                    .from('students')
                    .upsert(chunk, { onConflict: 'id' });

                if (error) {
                    console.error('Supabase Upsert Chunk Error:', error);
                    throw error;
                }

                console.log(`[SYNC] Chunk ${Math.floor(i / chunkSize) + 1} uploaded successfully`);

                // Add delay between chunks to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (chunkError) {
                console.error(`[SYNC] Failed to upload chunk ${Math.floor(i / chunkSize) + 1}:`, chunkError);
                failures.push(chunkError);
                // Continue with next chunk instead of failing completely
            }
        }

        if (failures.length > 0) {
            throw new Error(`Sync failed for ${failures.length} chunks. Check console for details.`);
        }

        isSyncing = false;

        setTimeout(() => {
            window.syncInProgress = false;
        }, 2000);

        return { status: 'success', count: uniqueStudents.length };
    } catch (error) {
        console.error('Error syncing students:', error);
        showSyncStatus('❌ Gagal sinkronisasi santri', 'error');
        isSyncing = false;
        window.syncInProgress = false;
        throw error;
    }
}

// Sync halaqahs to Supabase
async function syncHalaqahsToSupabase() {
    if (!isOnline) return;

    // AUTH CHECK: Allow admin and guru to write to DB
    const profile = window.currentProfile;
    if (!profile || (profile.role !== 'admin' && profile.role !== 'guru')) {
        return;
    }
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

        // Fetch all students using pagination (Supabase default limit is 1000)
        const PAGE_SIZE = 1000;
        let allData = [];
        let from = 0;
        let hasMore = true;
        while (hasMore) {
            const { data: pageData, error: pageError } = await supabaseClient
                .from('students')
                .select('*')
                .order('overall_ranking', { ascending: true })
                .range(from, from + PAGE_SIZE - 1);
            if (pageError) throw pageError;
            if (pageData && pageData.length > 0) {
                allData = allData.concat(pageData);
                from += PAGE_SIZE;
                hasMore = pageData.length === PAGE_SIZE;
            } else {
                hasMore = false;
            }
        }
        const data = allData;
        const error = null;

        if (error) throw error;

        if (data && data.length > 0) {
            const existingMap = new Map();
            if (dashboardData && dashboardData.students) {
                dashboardData.students.forEach(s => existingMap.set(s.id, s));
            }

            const mappedStudents = data.map(s => {
                const existing = existingMap.get(s.id);

                // Helper to merge fields from Supabase and local data
                // Default: prefer remote value when available, but for some
                // critical identity fields we prefer local corrections.
                const getField = (field, fallback = '') => {
                    const remoteVal = s[field];
                    const localVal = existing ? existing[field] : undefined;

                    // Special rule for NIK: if local has a non-empty value that
                    // differs from remote, treat local as the latest correction
                    if (field === 'nik' &&
                        localVal !== undefined && localVal !== null && localVal !== '' &&
                        remoteVal !== undefined && remoteVal !== null && remoteVal !== '' &&
                        String(localVal) !== String(remoteVal)) {
                        console.log(`[SYNC PRESERVE] Preferring local NIK for ${s.name}:`, localVal, 'over remote:', remoteVal);
                        return localVal;
                    }

                    // If remote has value (non-empty string/valid number), use it
                    if (remoteVal !== undefined && remoteVal !== null && remoteVal !== '') {
                        return remoteVal;
                    }

                    // If remote is empty, but we have local value, keep local
                    if (localVal !== undefined && localVal !== null && localVal !== '') {
                        console.log(`[SYNC PRESERVE] Keeping local ${field} for ${s.name}: ${localVal}`);
                        return localVal;
                    }

                    // Default fallback
                    return fallback;
                };

                const localHafalan = existing ? parseFloat(existing.total_hafalan) : NaN;
                const remoteHafalan = parseFloat(s.total_hafalan);
                let totalHafalan = 0;
                if (!Number.isNaN(remoteHafalan) && remoteHafalan > 0) {
                    totalHafalan = remoteHafalan;
                } else if (!Number.isNaN(localHafalan) && localHafalan > 0) {
                    console.log('[SYNC PRESERVE] Keeping local total_hafalan for', s.name, ':', localHafalan);
                    totalHafalan = localHafalan;
                }

                const localIsAlumni = existing ? existing.is_alumni === true : null;
                const remoteIsAlumni = s.is_alumni === true;
                const finalIsAlumni = localIsAlumni !== null ? localIsAlumni : remoteIsAlumni;

                const localKategori = existing && existing.kategori !== undefined && existing.kategori !== null && existing.kategori !== ''
                    ? existing.kategori
                    : null;
                const finalKategori = localKategori !== null ? localKategori : getField('kategori');

                const mapped = {
                    id: s.id,
                    name: s.name,
                    halaqah: s.halaqah,
                    nisn: getField('nisn'),
                    nik: getField('nik', ''),
                    lembaga: s.lembaga,
                    kelas: s.kelas,

                    jenis_kelamin: getField('jenis_kelamin'),
                    tempat_lahir: getField('tempat_lahir'),
                    tanggal_lahir: getField('tanggal_lahir'),
                    alamat: getField('alamat'),
                    hp: getField('hp'),
                    nama_ayah: getField('nama_ayah'),
                    nama_ibu: getField('nama_ibu'),
                    sekolah_asal: getField('sekolah_asal'),

                    is_alumni: finalIsAlumni,
                    kategori: finalKategori,
                    total_points: s.total_points,
                    daily_ranking: s.daily_ranking,
                    overall_ranking: s.overall_ranking,
                    streak: s.streak,
                    lastActivity: s.last_activity,
                    achievements: JSON.parse(s.achievements || '[]'),
                    setoran: JSON.parse(s.setoran || '[]'),
                    lastSetoranDate: s.last_setoran_date,
                    total_hafalan: totalHafalan
                };

                if (parseFloat(s.total_hafalan) > 0) {
                    console.log('[LOAD] Student with hafalan:', s.name, 'hafalan:', s.total_hafalan);
                }
                return mapped;
            });

            dashboardData.students = deduplicateStudentsByIdentity(mappedStudents);

            console.log('[LOAD] Loaded', data.length, 'students from Supabase, after dedupe:', dashboardData.students.length);
            console.log('[LOAD] Sample student:', dashboardData.students[0]);

            showSyncStatus('✅ Data santri dimuat', 'success');

            // Refresh parent-child link after data is loaded
            if (typeof refreshUserChildLink === 'function') {
                console.log('🔗 Refreshing parent-child link after data load...');
                refreshUserChildLink();
            }
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
            // console.log('Real-time update received (students):', payload);
            handleRealtimeUpdate(payload);
        })
        .subscribe((status) => {
            console.log('Students subscription status:', status);
        });

    // Subscribe to setoran table (if it exists and is used)
    const setoranChannel = supabaseClient.channel('public:setoran');
    setoranChannel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'setoran' }, payload => {
            // console.log('Real-time update received (setoran):', payload);
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
    // Prevent processing updates during delete operations
    if (window.deleteOperationInProgress) {
        // console.log('⏭️ Skipping realtime update during delete operation');
        return;
    }

    // Prevent processing updates during sync operations to avoid loops
    if (window.syncInProgress) {
        // console.log('⏭️ Skipping realtime update during sync operation');
        return;
    }

    const { eventType, new: newRecord, old: oldRecord } = payload;

    // Helper to map DB snake_case to local camelCase
    // FIX: Look up existing student to preserve local data if remote is empty/partial
    const existing = dashboardData.students.find(s => s.id === (newRecord ? newRecord.id : 0));

    const mapStudentData = (record) => {
        const getField = (field, fallback = '') => {
            const remoteVal = record[field];
            const localVal = existing ? existing[field] : undefined;
            if (remoteVal !== undefined && remoteVal !== null && remoteVal !== '') {
                return remoteVal;
            }
            if (localVal !== undefined && localVal !== null && localVal !== '') {
                return localVal;
            }
            return fallback;
        };

        return {
            id: record.id,
            name: record.name,
            halaqah: record.halaqah,
            nisn: getField('nisn'),
            nik: getField('nik', ''),
            lembaga: record.lembaga,
            kelas: record.kelas,

            jenis_kelamin: getField('jenis_kelamin'),
            tempat_lahir: getField('tempat_lahir'),
            tanggal_lahir: getField('tanggal_lahir', null),
            alamat: getField('alamat'),
            hp: getField('hp'),
            nama_ayah: getField('nama_ayah'),
            nama_ibu: getField('nama_ibu'),
            sekolah_asal: getField('sekolah_asal'),

            total_points: record.total_points,
            daily_ranking: record.daily_ranking,
            overall_ranking: record.overall_ranking,
            streak: record.streak,
            lastActivity: record.last_activity,
            achievements: typeof record.achievements === 'string' ? JSON.parse(record.achievements || '[]') : record.achievements,
            setoran: typeof record.setoran === 'string' ? JSON.parse(record.setoran || '[]') : record.setoran,
            lastSetoranDate: record.last_setoran_date,
            total_hafalan: record.total_hafalan || 0,
            is_alumni: record.is_alumni === true,
            kategori: getField('kategori')
        };
    };

    if (eventType === 'INSERT') {
        const exists = dashboardData.students.find(s => s.id === newRecord.id);
        if (!exists) {
            console.log('📥 Realtime INSERT:', newRecord.name);
            dashboardData.students.push(mapStudentData(newRecord));

            // Debounce refresh to prevent spam
            if (window.refreshDebounceTimeout) clearTimeout(window.refreshDebounceTimeout);
            window.refreshDebounceTimeout = setTimeout(() => {
                if (typeof refreshAllData === 'function') {
                    refreshAllData();
                }
            }, 500);
        }
    } else if (eventType === 'UPDATE') {
        const index = dashboardData.students.findIndex(s => s.id === newRecord.id);
        if (index !== -1) {
            console.log('🔄 Realtime UPDATE:', newRecord.name);
            // Replace with new data from server (server is source of truth)
            dashboardData.students[index] = mapStudentData(newRecord);

            // Debounce refresh to prevent spam
            if (window.refreshDebounceTimeout) clearTimeout(window.refreshDebounceTimeout);
            window.refreshDebounceTimeout = setTimeout(() => {
                if (typeof refreshAllData === 'function') {
                    refreshAllData();
                }
            }, 500);
        }
    } else if (eventType === 'DELETE') {
        const index = dashboardData.students.findIndex(s => s.id === oldRecord.id);
        if (index !== -1) {
            dashboardData.students.splice(index, 1);

            // Debounce refresh to prevent spam
            if (window.refreshDebounceTimeout) clearTimeout(window.refreshDebounceTimeout);
            window.refreshDebounceTimeout = setTimeout(() => {
                if (typeof refreshAllData === 'function') {
                    refreshAllData();
                }
            }, 500);
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

    // Allow admin and guru to sync data TO server
    // Parents only READ data via realtime
    const profile = window.currentProfile;
    if (!profile || (profile.role !== 'admin' && profile.role !== 'guru')) {
        // console.log('⏭️ Skipping auto-sync (not admin/guru)');
        return;
    }

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

// ============================================
// USER/PROFILES SYNCHRONIZATION
// ============================================

// Sync users to Supabase local_users table
async function syncUsersToSupabase() {
    if (!isOnline) {
        console.log('Offline - users will sync when online');
        showSyncStatus('📴 Mode offline - user akan disync saat online', 'warning');
        return;
    }
    // AUTH CHECK: Only admin can write to DB
    const profile = window.currentProfile;
    if (!profile || profile.role !== 'admin') {
        console.warn('⛔ Sync blocked: User is not admin');
        showSyncStatus('⛔ Sync user hanya bisa dilakukan oleh admin', 'error');
        return;
    }

    // Prevent concurrent syncs
    if (window.userSyncInProgress) {
        console.log('⏭️ User sync already in progress, skipping...');
        showSyncStatus('⏳ Sync user sedang berjalan, tunggu sebentar...', 'info');
        return;
    }

    try {
        window.userSyncInProgress = true;
        console.log('[USER SYNC] Starting user sync to Supabase...');

        const usersData = JSON.parse(localStorage.getItem('usersData') || '{"users":[]}');

        if (!usersData.users || usersData.users.length === 0) {
            console.log('[USER SYNC] No users to sync');
            showSyncStatus('ℹ️ Tidak ada user yang perlu disinkronkan', 'info');
            window.userSyncInProgress = false;
            return;
        }

        let synced = 0;
        let skipped = 0;
        const failed = [];

        for (const user of usersData.users) {
            if (!user.email || !user.name) {
                skipped++;
                failed.push({
                    email: user.email || null,
                    reason: 'Missing email or name',
                    details: null
                });
                continue;
            }

            const userData = {
                id: typeof user.id === 'number' ? user.id : Date.now(),
                name: user.name,
                email: user.email,
                phone: user.phone || null,
                role: user.role || 'ortu',
                status: user.status || 'active',
                password: user.password || null,
                lembaga: user.lembaga || null,
                last_login: user.lastLogin && user.lastLogin !== '-' ? user.lastLogin : null
            };

            let attempt = 0;
            const maxAttempts = 3;
            let lastError = null;
            let success = false;

            while (attempt < maxAttempts && !success) {
                try {
                    const { error } = await supabaseClient
                        .from('local_users')
                        .upsert(userData, { onConflict: 'email' });

                    if (error) {
                        lastError = error;

                        if (error.code === '42501' || (error.message && error.message.toLowerCase().includes('permission denied'))) {
                            console.error(`[USER SYNC] Permission error for ${user.email}:`, error);
                            break;
                        }

                        if (!isTransientSupabaseError(error)) {
                            console.error(`[USER SYNC] Non-retryable error for ${user.email}:`, error);
                            break;
                        }

                        attempt++;
                        const waitMs = 500 * attempt;
                        console.warn(`[USER SYNC] Transient error for ${user.email}, retry ${attempt}/${maxAttempts} in ${waitMs}ms`);
                        await new Promise(resolve => setTimeout(resolve, waitMs));
                    } else {
                        success = true;
                        synced++;
                        console.log(`[USER SYNC] ✓ Synced: ${user.email}`);
                    }
                } catch (error) {
                    lastError = error;
                    if (!isTransientSupabaseError(error)) {
                        console.error(`[USER SYNC] Exception syncing user ${user.email}:`, error);
                        break;
                    }
                    attempt++;
                    const waitMs = 500 * attempt;
                    console.warn(`[USER SYNC] Exception (transient) for ${user.email}, retry ${attempt}/${maxAttempts} in ${waitMs}ms`);
                    await new Promise(resolve => setTimeout(resolve, waitMs));
                }
            }

            if (!success) {
                skipped++;
                failed.push({
                    email: user.email,
                    reason: lastError && lastError.message ? lastError.message : 'Unknown error',
                    details: lastError || null
                });
            }

            await new Promise(resolve => setTimeout(resolve, 100));
        }

        lastUserSyncDiagnostics = {
            startedAt: new Date().toISOString(),
            totalUsers: usersData.users.length,
            synced,
            skipped,
            failed
        };

        if (failed.length > 0) {
            console.group('[USER SYNC] Failed inserts');
            console.table(failed.map(item => ({
                email: item.email,
                reason: item.reason
            })));
            console.groupEnd();
        }

        console.log(`[USER SYNC] Complete - ${synced} synced, ${skipped} skipped, ${failed.length} failed`);

        if (failed.length === 0) {
            showSyncStatus(`✅ Sync user berhasil: ${synced} tersimpan`, 'success');
        } else {
            showSyncStatus(`⚠️ Sync user: ${synced} berhasil, ${failed.length} gagal. Lihat console untuk detail.`, 'warning');
        }

        window.userSyncInProgress = false;

    } catch (error) {
        console.error('[USER SYNC] Error syncing users:', error);
        lastUserSyncDiagnostics = {
            startedAt: new Date().toISOString(),
            totalUsers: null,
            synced: 0,
            skipped: 0,
            failed: [{
                email: null,
                reason: error.message || 'Unexpected error',
                details: error
            }]
        };
        showSyncStatus('❌ Terjadi error saat sync user. Lihat console untuk detail.', 'error');
        window.userSyncInProgress = false;
    }
}


// Load users from Supabase (both profiles and local_users tables)
async function loadUsersFromSupabase() {
    if (!isOnline) {
        console.log('[USER LOAD] Offline - using local data');
        return;
    }

    try {
        console.log('[USER LOAD] Loading users from Supabase...');

        // Load from both profiles and local_users tables
        const [profilesResult, localUsersResult] = await Promise.all([
            supabaseClient.from('profiles').select('*').order('created_at', { ascending: false }),
            supabaseClient.from('local_users').select('*').order('created_at', { ascending: false })
        ]);

        const allUsers = [];

        // Map profiles to usersData format
        if (profilesResult.data && profilesResult.data.length > 0) {
            const profileUsers = profilesResult.data.map(profile => ({
                id: profile.id, // UUID from Supabase
                name: profile.full_name,
                email: profile.email,
                phone: profile.phone || '-',
                role: profile.role,
                status: profile.is_active ? 'active' : 'inactive',
                createdAt: profile.created_at ? new Date(profile.created_at).toISOString().split('T')[0] : '-',
                lastLogin: '-',
                // Additional fields from profiles
                halaqah_id: profile.halaqah_id,
                student_id: profile.student_id,
                avatar_url: profile.avatar_url,
                source: 'profiles' // Mark source
            }));
            allUsers.push(...profileUsers);
            console.log(`[USER LOAD] Loaded ${profileUsers.length} users from profiles table`);
        }

        // Map local_users to usersData format
        if (localUsersResult.data && localUsersResult.data.length > 0) {
            const localUsers = localUsersResult.data.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone || '-',
                role: user.role,
                status: user.status || 'active',
                createdAt: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : '-',
                lastLogin: user.last_login || '-',
                password: user.password, // Keep password for local auth
                lembaga: user.lembaga,
                source: 'local_users' // Mark source
            }));
            allUsers.push(...localUsers);
            console.log(`[USER LOAD] Loaded ${localUsers.length} users from local_users table`);
        }

        if (allUsers.length > 0) {
            // Remove duplicates by email (prefer profiles over local_users)
            const uniqueUsers = [];
            const seenEmails = new Set();

            for (const user of allUsers) {
                if (!seenEmails.has(user.email)) {
                    seenEmails.add(user.email);
                    uniqueUsers.push(user);
                }
            }

            const usersData = { users: uniqueUsers };

            // Save to localStorage
            localStorage.setItem('usersData', JSON.stringify(usersData));

            console.log(`[USER LOAD] Total ${uniqueUsers.length} unique users loaded`);

            // Refresh UI if function exists
            if (typeof window.renderUserManagement === 'function') {
                window.renderUserManagement();
            }
        } else {
            console.log('[USER LOAD] No users found in Supabase');
        }

    } catch (error) {
        console.error('[USER LOAD] Error loading users:', error);
    }
}

// Setup realtime subscription for profiles and local_users tables
function setupProfilesRealtimeSubscription() {
    if (!supabaseClient) return;

    // Check if subscription already exists
    if (window.profilesRealtimeSubscription) {
        console.log('[PROFILES RT] Subscription already exists');
        return;
    }

    console.log('[PROFILES RT] Setting up realtime subscription...');

    window.profilesRealtimeSubscription = supabaseClient
        .channel('profiles-and-users-changes')
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'profiles' },
            (payload) => {
                console.log('[PROFILES RT] Profiles change detected:', payload.eventType);

                // Debounce updates
                if (window.profilesUpdateTimeout) clearTimeout(window.profilesUpdateTimeout);
                window.profilesUpdateTimeout = setTimeout(() => {
                    loadUsersFromSupabase();
                }, 1000);
            }
        )
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'local_users' },
            (payload) => {
                console.log('[PROFILES RT] Local users change detected:', payload.eventType);

                // Debounce updates
                if (window.profilesUpdateTimeout) clearTimeout(window.profilesUpdateTimeout);
                window.profilesUpdateTimeout = setTimeout(() => {
                    loadUsersFromSupabase();
                }, 1000);
            }
        )
        .subscribe((status) => {
            console.log('[PROFILES RT] Subscription status:', status);
        });
}

// Export functions
window.syncStudentsToSupabase = syncStudentsToSupabase;
window.syncHalaqahsToSupabase = syncHalaqahsToSupabase;
window.syncUsersToSupabase = syncUsersToSupabase;
window.loadStudentsFromSupabase = loadStudentsFromSupabase;
window.loadHalaqahsFromSupabase = loadHalaqahsFromSupabase;
window.loadUsersFromSupabase = loadUsersFromSupabase;
window.deleteStudentFromSupabase = deleteStudentFromSupabase;
window.deleteHalaqahFromSupabase = deleteHalaqahFromSupabase;
window.deleteAllStudentsFromSupabase = deleteAllStudentsFromSupabase;
window.deleteAllHalaqahsFromSupabase = deleteAllHalaqahsFromSupabase;
window.setupProfilesRealtimeSubscription = setupProfilesRealtimeSubscription;
window.initSupabase = initSupabase;
window.autoSync = autoSync;
window.getUserSyncDiagnostics = function () {
    return lastUserSyncDiagnostics;
};

