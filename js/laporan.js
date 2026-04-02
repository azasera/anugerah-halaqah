// Laporan Terpadu Module
// Handles the rendering and logic for the combined Tilawah, Ziyadah, and Murojaah report

let startDateLaporan = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]; // First day of current month
let endDateLaporan = new Date().toISOString().split('T')[0];
let filterLembagaLaporan = '';

function renderLaporanSection() {
    const container = document.getElementById('laporanContainer');
    if (!container) return;

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

    const rowsHtml = rows.map((r, i) => {
        const rowLembaga = (typeof window.normalizeLembagaKey === 'function') ? window.normalizeLembagaKey(r.s.lembaga || '') : (r.s.lembaga || '');
        return `
            <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 bg-white">
                <td class="px-4 py-3 text-sm font-bold text-slate-400 text-center">${i + 1}</td>
                <td class="px-4 py-3">
                    <div class="font-bold text-slate-800 text-sm">${r.s.name}</div>
                    <div class="text-[10px] text-slate-400 font-medium">${rowLembaga} - Halaqah ${r.s.halaqah || '?'}</div>
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
                <div class="flex items-center gap-3">
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
                            <th class="px-4 py-3.5 text-center">Ziyadah (Setoran)</th>
                            <th class="px-4 py-3.5 text-center">Murojaah</th>
                            <th class="px-4 py-3.5 text-center">Tilawah</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml || '<tr><td colspan="5" class="py-12 text-center text-slate-400 italic">Belum ada data di rentang waktu ini</td></tr>'}
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
