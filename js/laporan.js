// Laporan Terpadu Module
// Handles the rendering and logic for the combined Tilawah, Ziyadah, and Murojaah report

let startDateLaporan = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]; // First day of current month
let endDateLaporan = new Date().toISOString().split('T')[0];
let filterLembagaLaporan = '';

function renderLaporanSection() {
    const container = document.getElementById('laporanContainer');
    if (!container) return;

    // Ortu tidak punya akses ke laporan terpadu
    if (typeof currentProfile !== 'undefined' && currentProfile && currentProfile.role === 'ortu') {
        container.innerHTML = `
            <div class="glass rounded-3xl p-12 border border-slate-200 text-center">
                <div class="text-5xl mb-4">🔒</div>
                <p class="font-bold text-slate-700 text-lg">Akses Terbatas</p>
                <p class="text-sm text-slate-500 mt-2">Laporan Terpadu hanya tersedia untuk Admin dan Guru.</p>
            </div>
        `;
        return;
    }

    let students = Array.isArray(dashboardData.students) ? dashboardData.students : [];
    
    // Filter
    if (filterLembagaLaporan) {
         students = students.filter(s => {
             const lem = (typeof window.normalizeLembagaKey === 'function') ? window.normalizeLembagaKey(s.lembaga || '') : (s.lembaga || '');
             return lem === filterLembagaLaporan;
         });
    }

    // Process table rows
    const rows = students.map(s => {
        // Ziyadah / Setoran
        const setoranInRange = (s.setoran || []).filter(st => {
            const d = st.date.split('T')[0];
            return d >= startDateLaporan && d <= endDateLaporan;
        });
        const ziyadahPoin = setoranInRange.reduce((acc, curr) => acc + (curr.poin || 0), 0);
        const setoranCount = setoranInRange.length;

        // Tilawah
        const tilawahInRange = (dashboardData.tilawah || []).filter(t => {
            return String(t.studentId) === String(s.id) && t.date >= startDateLaporan && t.date <= endDateLaporan;
        });
        const tilawahSum = tilawahInRange.flatMap(t => Object.values(t.entries || {})).reduce((sum, e) => sum + (e.jumlahHal || e.hal || 0), 0);

        // Murojaah
        const mutInR = (s.murojaah || []).filter(m => {
            const d = m.date.split('T')[0];
            return d >= startDateLaporan && d <= endDateLaporan;
        });
        const murojaahCount = mutInR.length;
        
        let mutLabel = murojaahCount + 'x setoran';
        if (murojaahCount === 0) mutLabel = '-';

        return {
            s, ziyadahPoin, setoranCount, tilawahSum, mutLabel, murojaahCount
        };
    }).sort((a,b) => {
        const sumA = a.ziyadahPoin + a.tilawahSum + (a.murojaahCount * 5);
        const sumB = b.ziyadahPoin + b.tilawahSum + (b.murojaahCount * 5);
        return sumB - sumA;
    });

    // Helper for formatting hafalan exactly like other pages
    const formatHafalanLocal = (val) => {
        if (!val && val !== 0) return '0';
        const num = Number(val);
        return isNaN(num) ? String(val) : num.toLocaleString('id-ID');
    };

    const rowsHtml = rows.map((r, i) => {
        const rowLembaga = (typeof window.normalizeLembagaKey === 'function') ? window.normalizeLembagaKey(r.s.lembaga || '') : (r.s.lembaga || '');
        const currentHafalan = formatHafalanLocal(r.s.total_hafalan) + ' Juz';

        return `
            <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 bg-white">
                <td class="px-4 py-3 text-sm font-bold text-slate-400 text-center">${i + 1}</td>
                <td class="px-4 py-3">
                    <div class="font-bold text-slate-800 text-sm">${r.s.name}</div>
                    <div class="text-[10px] text-slate-400 font-medium">${rowLembaga} - Halaqah ${r.s.halaqah || '?'}</div>
                </td>
                <td class="px-4 py-3 text-center">
                    <div class="font-bold text-purple-600">${currentHafalan}</div>
                </td>
                <td class="px-4 py-3 text-center">
                    <div class="font-bold text-blue-600">${r.setoranCount}x Setoran</div>
                    <div class="text-[10px] font-bold text-slate-500">${r.ziyadahPoin} poin</div>
                </td>
                <td class="px-4 py-3 text-center">
                    <div class="font-bold text-amber-600">${r.mutLabel}</div>
                </td>
                <td class="px-4 py-3 text-center">
                    <div class="font-bold text-emerald-600">${r.tilawahSum > 0 ? r.tilawahSum + ' halaman' : '-'}</div>
                </td>
            </tr>
        `;
    }).join('');

    container.innerHTML = `
        <div class="glass rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm animate-fade-in mx-auto max-w-5xl">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 class="font-display font-bold text-2xl text-slate-800 flex items-center gap-2">
                        <span class="w-2 h-8 bg-indigo-500 rounded-full"></span>
                        Laporan Terpadu
                    </h3>
                    <p class="text-sm text-slate-500 mt-1">Ziyadah, Murojaah, dan Tilawah Santri</p>
                </div>
                <div class="flex flex-wrap items-center gap-3">
                    <button onclick="refreshDataForLaporan(this)" class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-emerald-200 transition-all flex items-center gap-2">
                        <svg class="w-4 h-4" id="syncIconLaporan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        Sinkronisasi API
                    </button>
                    <button onclick="exportLaporanToExcel()" class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-indigo-200 transition-all flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Export Excel
                    </button>
                    ${typeof renderLaporanPdfButton === 'function' ? renderLaporanPdfButton() : ''}
                </div>
            </div>

            <!-- Dashboard Filters -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Mulai Tanggal</label>
                    <input type="date" value="${startDateLaporan}" onchange="startDateLaporan=this.value; renderLaporanSection()" class="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-white focus:border-indigo-500 outline-none transition-all shadow-sm">
                </div>
                <div>
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Sampai Tanggal</label>
                    <input type="date" value="${endDateLaporan}" onchange="endDateLaporan=this.value; renderLaporanSection()" class="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-white focus:border-indigo-500 outline-none transition-all shadow-sm">
                </div>
                <div>
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Filter Lembaga</label>
                    <div class="relative">
                        <select onchange="filterLembagaLaporan=this.value; renderLaporanSection()" class="appearance-none w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-white focus:border-indigo-500 outline-none transition-all shadow-sm cursor-pointer pr-8">
                            <option value="">Semua Lembaga</option>
                            <option value="SDITA" ${filterLembagaLaporan === 'SDITA'?'selected':''}>SDITA</option>
                            <option value="SMPITA" ${filterLembagaLaporan === 'SMPITA'?'selected':''}>SMPITA</option>
                            <option value="SMAITA" ${filterLembagaLaporan === 'SMAITA'?'selected':''}>SMAITA</option>
                            <option value="MTA" ${filterLembagaLaporan === 'MTA'?'selected':''}>MTA</option>
                        </select>
                        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Table section -->
            <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table class="w-full text-left">
                    <thead class="bg-indigo-50/50 border-b border-slate-200">
                        <tr class="text-[10px] uppercase font-black text-indigo-800 tracking-wider">
                            <th class="px-4 py-3.5 text-center w-12">No</th>
                            <th class="px-4 py-3.5 w-64">Nama & Halaqah</th>
                            <th class="px-4 py-3.5 text-center">Total Hafalan</th>
                            <th class="px-4 py-3.5 text-center">Ziyadah (Setoran)</th>
                            <th class="px-4 py-3.5 text-center">Murojaah</th>
                            <th class="px-4 py-3.5 text-center">Tilawah</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml || '<tr><td colspan="6" class="py-12 text-center text-slate-400 italic">Belum ada data di rentang waktu ini</td></tr>'}
                    </tbody>
                </table>
            </div>
            
            <p class="text-xs text-slate-400 mt-5 text-center">💡 Laporan menampilkan data Ziyadah, Murojaah, dan Tilawah sesuai rentang tanggal terpilih.</p>
        </div>
    `;
}

function exportLaporanToExcel() {
    if (typeof XLSX === 'undefined') {
        showNotification('Library Excel belum dimuat. Silakan tunggu.', 'error');
        return;
    }

    const table = document.querySelector('#laporanContainer table');
    if (!table) return;

    // We can do a basic table export
    const wb = XLSX.utils.table_to_book(table, {sheet: "Laporan"});
    XLSX.writeFile(wb, `Laporan_Terpadu_${startDateLaporan}_to_${endDateLaporan}.xlsx`);
    showNotification('Export Excel berhasil!', 'success');
}

window.renderLaporanSection = renderLaporanSection;
window.exportLaporanToExcel = exportLaporanToExcel;

/**
 * Sync total_hafalan semua santri dari API mutabaah untuk semua jenjang.
 * Logika matching sama dengan importTotalHafalanSdFromGuru di excel.js.
 */
async function syncTotalHafalanFromAPI() {
    const API_BASE = 'https://asia-southeast1-mootabaah.cloudfunctions.net/api/totalHafalan2025';
    const jenjangList = [
        { slug: 'sd',  lembagaKey: 'SDITA'  },
        { slug: 'smp', lembagaKey: 'SMPITA' },
        { slug: 'sma', lembagaKey: 'SMAITA' },
        { slug: 'mta', lembagaKey: 'MTA'    },
    ];

    const normalizeName = (name) => {
        if (!name) return '';
        return String(name)
            .replace(/\b([A-Z])\.\s*/g, '$1 ')
            .toLowerCase()
            .replace(/[\s\u00A0]+/g, ' ')
            .trim();
    };

    const levenshtein = (a, b) => {
        const m = [], al = a.length, bl = b.length;
        for (let i = 0; i <= bl; i++) m[i] = [i];
        for (let j = 0; j <= al; j++) m[0][j] = j;
        for (let i = 1; i <= bl; i++)
            for (let j = 1; j <= al; j++)
                m[i][j] = a[j-1] === b[i-1]
                    ? m[i-1][j-1]
                    : 1 + Math.min(m[i-1][j-1], m[i][j-1], m[i-1][j]);
        return m[bl][al];
    };

    const similarity = (a, b) => {
        const len = Math.max(a.length, b.length);
        return len === 0 ? 100 : ((len - levenshtein(a, b)) / len) * 100;
    };

    let totalUpdated = 0;

    for (const { slug, lembagaKey } of jenjangList) {
        try {
            const res = await fetch(`${API_BASE}/${slug}`);
            if (!res.ok) { console.warn(`[Laporan] API ${slug} gagal: ${res.status}`); continue; }

            const json = await res.json();
            const allGuruData = json?.data || {};

            // Filter santri sesuai jenjang
            const students = (dashboardData.students || []).filter(s => {
                if (!s) return false;
                const lem = (typeof window.normalizeLembagaKey === 'function')
                    ? window.normalizeLembagaKey(s.lembaga || '')
                    : (s.lembaga || '').toUpperCase();
                return lem === lembagaKey;
            });

            if (students.length === 0) continue;

            // Iterasi semua guru → semua santri
            Object.values(allGuruData).forEach(guruStudents => {
                const list = Array.isArray(guruStudents)
                    ? guruStudents
                    : Object.values(guruStudents || {});

                list.forEach(sd => {
                    if (!sd || typeof sd !== 'object') return;
                    const name = String(sd.namaSiswa || sd.nama || '').trim();
                    if (!name) return;

                    const rawTotal = sd.totalHafalan ?? sd.total_hafalan ?? sd.totalJuz ?? sd.juz;
                    if (rawTotal === undefined || rawTotal === null || rawTotal === '') return;
                    const total = parseFloat(rawTotal);
                    if (isNaN(total)) return;

                    const targetNorm = normalizeName(name);

                    // Exact match dulu, lalu fuzzy
                    let match = students.find(s => normalizeName(s.name) === targetNorm);
                    if (!match) {
                        const best = students
                            .map(s => ({ s, sim: similarity(targetNorm, normalizeName(s.name)) }))
                            .filter(x => x.sim > 75)
                            .sort((a, b) => b.sim - a.sim)[0];
                        if (best) match = best.s;
                    }

                    if (match && match.total_hafalan !== total) {
                        match.total_hafalan = total;
                        totalUpdated++;
                    }
                });
            });

        } catch (err) {
            console.warn(`[Laporan] Sync hafalan ${slug} error:`, err);
        }
    }

    if (totalUpdated > 0) {
        StorageManager.save();
        if (typeof window.syncStudentsToSupabase === 'function') {
            await window.syncStudentsToSupabase().catch(e => console.warn('[Laporan] Supabase sync error:', e));
        }
        console.log(`[Laporan] ✅ Total hafalan diupdate: ${totalUpdated} santri`);
    }

    return totalUpdated;
}

async function refreshDataForLaporan(btn) {
    if (btn) {
        btn.disabled = true;
        const icon = btn.querySelector('#syncIconLaporan');
        if (icon) icon.classList.add('animate-spin');
    }
    
    try {
        // 1. Sync total_hafalan dari API mutabaah semua jenjang
        if (typeof showNotification === 'function') showNotification('☁️ Mengambil total hafalan dari API...', 'info');
        const updated = await syncTotalHafalanFromAPI();

        // 2. Sync setoran MTA harian
        if (window.MTASetoranSync && typeof window.MTASetoranSync.syncDate === 'function') {
            const today = window.MTASetoranSync.getLocalDateISO();
            await window.MTASetoranSync.syncDate(today);
            localStorage.setItem('mta_setoran_last_attempt_date', today);
        }
        
        // 3. Ambil data terbaru dari Supabase
        if (window.refreshAllData) {
            await window.refreshAllData();
        } else if (window.loadStudentsFromSupabase && window.loadTilawahFromSupabase) {
            await Promise.all([window.loadStudentsFromSupabase(), window.loadTilawahFromSupabase()]);
        }
        
        // 4. Render ulang
        renderLaporanSection();
        
        if (typeof showNotification === 'function') {
            const msg = updated > 0
                ? `✅ Sinkronisasi selesai. ${updated} santri diupdate total hafalannya.`
                : '✅ Data Laporan Terpadu berhasil disinkronisasi.';
            showNotification(msg, 'success');
        }
    } catch (e) {
        console.error('Laporan Sync Error: ', e);
        if (typeof showNotification === 'function') {
            showNotification('Gagal mensinkronisasikan data: ' + e.message, 'error');
        }
    } finally {
        if (btn) {
            btn.disabled = false;
            const icon = btn.querySelector('#syncIconLaporan');
            if (icon) icon.classList.remove('animate-spin');
        }
    }
}
window.refreshDataForLaporan = refreshDataForLaporan;
