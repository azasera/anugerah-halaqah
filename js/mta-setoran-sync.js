/**
 * MTA Daily Setoran Sync Module
 * Synchronizes daily setoran records from external MTA API to Supabase
 *
 * Override base URL (optional): window.MTA_SETORAN_API_BASE = 'https://.../api/setoran/mta'
 */

const MTA_SETORAN_API_DEFAULT = 'https://asia-southeast1-mootabaah.cloudfunctions.net/api/setoran/mta';

const MTA_AUTO_SYNC_STORAGE = 'mta_setoran_last_attempt_date';

function getMtaApiBase() {
    return (typeof window !== 'undefined' && window.MTA_SETORAN_API_BASE) || MTA_SETORAN_API_DEFAULT;
}

function getLocalDateISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function normalizeJamToTime(isoDate, jamRaw) {
    let t = String(jamRaw || '12:00').trim();
    if (/^\d{1,2}:\d{2}$/.test(t)) t += ':00';
    if (!/^\d{1,2}:\d{2}:\d{2}$/.test(t)) t = '12:00:00';
    const parts = t.split(':');
    const hh = parseInt(parts[0], 10);
    const mm = parseInt(parts[1], 10);
    const ss = parseInt(parts[2], 10) || 0;
    if (Number.isNaN(hh) || Number.isNaN(mm)) {
        return new Date(`${isoDate}T12:00:00`).toISOString();
    }
    const local = new Date(`${isoDate}T00:00:00`);
    local.setHours(hh, mm, ss, 0);
    return local.toISOString();
}

function parseApiPayload(json) {
    if (!json || typeof json !== 'object') return {};
    if (json.data !== undefined && json.data !== null && typeof json.data === 'object' && !Array.isArray(json.data)) {
        return json.data;
    }
    const skip = new Set(['success', 'message', 'status', 'error']);
    const out = {};
    for (const k of Object.keys(json)) {
        if (skip.has(k)) continue;
        const v = json[k];
        if (v && typeof v === 'object' && !Array.isArray(v)) out[k] = v;
    }
    return out;
}

function isMtaLembaga(lembaga) {
    const normalized = (typeof window.normalizeLembagaKey === 'function')
        ? window.normalizeLembagaKey(lembaga)
        : String(lembaga || '').trim().toUpperCase();
    return normalized === 'MTA';
}

const MTASetoranSync = {
    getLocalDateISO,

    /**
     * Fetch setoran data for a specific date (tries path + query variants)
     * @param {string} date - Format YYYY-MM-DD
     */
    async fetchFromAPI(date) {
        const base = getMtaApiBase().replace(/\/$/, '');
        const urls = [
            `${base}/${encodeURIComponent(date)}`,
            `${base}?tanggal=${encodeURIComponent(date)}`,
            `${base}?date=${encodeURIComponent(date)}`
        ];

        let lastErr = null;
        for (const url of urls) {
            try {
                console.log(`[MTA-SYNC] GET ${url}`);
                const response = await fetch(url, { method: 'GET', credentials: 'omit' });
                const text = await response.text();
                let json;
                try {
                    json = text ? JSON.parse(text) : {};
                } catch {
                    throw new Error(`Respons bukan JSON (HTTP ${response.status})`);
                }

                if (response.status === 404) {
                    lastErr = new Error('Endpoint API tidak ditemukan (404). Pastikan route /api/setoran/mta sudah aktif di backend.');
                    continue;
                }
                if (!response.ok) {
                    lastErr = new Error(json.error || json.message || `HTTP ${response.status}`);
                    continue;
                }
                if (json.error && Object.keys(parseApiPayload(json)).length === 0) {
                    lastErr = new Error(json.error || 'API mengembalikan error');
                    continue;
                }

                return parseApiPayload(json);
            } catch (e) {
                lastErr = e;
            }
        }
        throw lastErr || new Error('Gagal mengambil data dari API MTA');
    },

    normalizeName(name) {
        if (!name) return '';
        return String(name).toLowerCase()
            .replace(/[\s\u00A0]+/g, ' ')
            .replace(/[^a-z0-9 ]/g, '')
            .trim();
    },

    mapToPoin(attendance, fluency) {
        const att = String(attendance || '').toLowerCase();
        if (att === 'absent' || att === 'izin' || att === 'sakit') {
            return -1;
        }

        const norm = String(fluency || '').toLowerCase().trim();
        if (norm.includes('ممتاز') || norm.includes('mumtaz')) return 2;
        if (norm.includes('جيد') || norm.includes('jayyid') || norm.includes('good')) return 1;

        return 0;
    },

    /**
     * Auto-sync hari ini (maks. sekali per hari per browser), hanya admin/guru, ada santri MTA.
     */
    async runAutoSyncIfNeeded() {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            return { skipped: true, reason: 'offline' };
        }
        if (!window.supabaseClient) {
            return { skipped: true, reason: 'no_supabase' };
        }

        const role = window.currentProfile && window.currentProfile.role;
        if (!role || (role !== 'admin' && role !== 'guru')) {
            return { skipped: true, reason: 'role' };
        }

        const today = getLocalDateISO();
        if (localStorage.getItem(MTA_AUTO_SYNC_STORAGE) === today) {
            return { skipped: true, reason: 'already_today' };
        }

        const students = window.dashboardData && window.dashboardData.students;
        if (!students || !students.some(s => isMtaLembaga(s.lembaga))) {
            return { skipped: true, reason: 'no_mta_students' };
        }

        let result;
        try {
            result = await this.syncDate(today);
        } finally {
            localStorage.setItem(MTA_AUTO_SYNC_STORAGE, today);
        }

        const notify = typeof window !== 'undefined' && typeof window.showSyncStatus === 'function'
            ? window.showSyncStatus.bind(window)
            : null;
        if (result && result.success && result.created > 0 && notify) {
            notify(`☁️ Setoran MTA: +${result.created} entri dari API`, 'success');
        } else if (result && !result.success && !result.skipped && notify) {
            notify('⚠️ Sync setoran MTA: ' + (result.error || 'gagal'), 'warning');
        }

        return result;
    },

    /**
     * @param {string} dateStr - YYYY-MM-DD
     */
    async syncDate(dateStr) {
        if (!window.supabaseClient && window.initSupabase) {
            await window.initSupabase();
        }
        if (!window.supabaseClient) {
            return { success: false, error: 'Supabase belum siap' };
        }

        try {
            const apiData = await this.fetchFromAPI(dateStr);
            const guruNames = Object.keys(apiData);

            if (guruNames.length === 0) {
                return {
                    success: true,
                    message: 'Tidak ada data setoran untuk tanggal ini',
                    processed: 0,
                    matched: 0,
                    created: 0,
                    skipped: 0,
                    logs: []
                };
            }

            if (!window.dashboardData || !window.dashboardData.students.length) {
                if (window.loadStudentsFromSupabase) await window.loadStudentsFromSupabase();
            }
            if (!window.dashboardData || !window.dashboardData.halaqahs.length) {
                if (window.loadHalaqahsFromSupabase) await window.loadHalaqahsFromSupabase();
            }

            const localStudents = window.dashboardData.students.filter(s => isMtaLembaga(s.lembaga));
            const localHalaqahs = window.dashboardData.halaqahs;

            let totalProcessed = 0;
            let totalMatched = 0;
            let totalCreated = 0;
            let totalSkipped = 0;

            const syncLogs = [];
            const todayLocal = getLocalDateISO();
            const isToday = todayLocal === dateStr;

            for (const guruName of guruNames) {
                let bucket = apiData[guruName];
                if (bucket == null) continue;
                if (Array.isArray(bucket)) {
                    const arr = bucket;
                    bucket = {};
                    arr.forEach((item, i) => {
                        bucket[String(i)] = item;
                    });
                }
                if (typeof bucket !== 'object') continue;

                for (const studentKey in bucket) {
                    const record = bucket[studentKey];
                    if (!record || typeof record !== 'object') continue;

                    totalProcessed++;

                    const normalizedAPIName = this.normalizeName(record.namaSantri || studentKey);
                    const student = localStudents.find(s => this.normalizeName(s.name) === normalizedAPIName);

                    if (!student) {
                        syncLogs.push(`[NOT FOUND] ${record.namaSantri || studentKey} (${guruName})`);
                        continue;
                    }

                    totalMatched++;

                    const { data: existing } = await window.supabaseClient
                        .from('setoran_harian')
                        .select('id')
                        .eq('santri_id', student.id)
                        .eq('tanggal', dateStr);

                    if (existing && existing.length > 0) {
                        totalSkipped++;
                        syncLogs.push(`[SKIPPED] ${student.name} - Sudah ada setoran tanggal ${dateStr}`);
                        continue;
                    }

                    const poin = this.mapToPoin(record.kehadiran, record.kelancaran);

                    let halaqahId = null;
                    const halaqahMatch = localHalaqahs.find(h =>
                        this.normalizeName(h.name) === this.normalizeName(student.halaqah) ||
                        this.normalizeName(h.name) === this.normalizeName(record.namaHalaqoh)
                    );

                    if (halaqahMatch) {
                        halaqahId = halaqahMatch.id;
                    } else {
                        syncLogs.push(`[HALAQAH] ${student.name} — halaqah tidak cocok, menyimpan tanpa ID`);
                    }

                    const keterangan = `[API-SYNC] ${record.kelancaran || ''} ${record.keterangan || ''}`.trim();

                    if (!window.SetoranHarian || !window.SetoranHarian.create) {
                        syncLogs.push(`[ERROR] Modul SetoranHarian tidak tersedia`);
                        continue;
                    }

                    try {
                        if (isToday) {
                            await window.SetoranHarian.create(student.id, halaqahId, poin, keterangan);
                        } else {
                            const sid = Date.now() + Math.floor(Math.random() * 1000);
                            const waktuSetor = normalizeJamToTime(dateStr, record.jamSetoran);
                            const row = {
                                id: sid,
                                santri_id: student.id,
                                halaqah_id: halaqahId,
                                tanggal: dateStr,
                                waktu_setor: waktuSetor,
                                poin: poin,
                                keterangan: keterangan,
                                created_by: null
                            };

                            const { error: insErr } = await window.supabaseClient
                                .from('setoran_harian')
                                .insert(row);

                            if (insErr) {
                                syncLogs.push(`[INSERT FAIL] ${student.name}: ${insErr.message}`);
                                continue;
                            }

                            if (window.SetoranHarian.updateStudentPoints) {
                                await window.SetoranHarian.updateStudentPoints(student.id);
                            }
                            if (halaqahId && window.SetoranHarian.updateHalaqahPoints) {
                                await window.SetoranHarian.updateHalaqahPoints(halaqahId);
                            }
                        }

                        totalCreated++;
                        syncLogs.push(`[CREATED] ${student.name} (${poin} poin)`);
                    } catch (rowErr) {
                        syncLogs.push(`[ERROR] ${student.name}: ${rowErr.message || rowErr}`);
                    }
                }
            }

            if (totalCreated > 0 && window.refreshAllData) {
                window.refreshAllData();
            }

            return {
                success: true,
                processed: totalProcessed,
                matched: totalMatched,
                created: totalCreated,
                skipped: totalSkipped,
                logs: syncLogs
            };
        } catch (error) {
            const message = error && error.message ? error.message : String(error);
            // Endpoint belum tersedia: jangan spam error/warning untuk user yang belum pakai MTA API.
            if (String(message).includes('Endpoint API tidak ditemukan (404)')) {
                console.info('[MTA-SYNC] Endpoint belum tersedia, lewati auto-sync hari ini.');
                return { success: false, skipped: true, reason: 'endpoint_not_found', error: message };
            }
            console.error('[MTA-SYNC] Sync operation failed:', error);
            return { success: false, error: message };
        }
    }
};

window.MTASetoranSync = MTASetoranSync;
window.MTA_SETORAN_API_DEFAULT = MTA_SETORAN_API_DEFAULT;
