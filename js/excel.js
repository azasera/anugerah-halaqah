// Excel Import/Export Module
// Using SheetJS (xlsx) library for Excel handling

/**
 * Helper: Tunggu hingga sync yang sedang berjalan selesai, lalu jalankan sync baru.
 * Mengatasi race condition antara auto-sync startup dan sync saat import.
 * @param {number} maxWaitMs - Maksimal tunggu dalam ms (default 60 detik)
 * @returns {Promise<object>} - Hasil dari syncStudentsToSupabase
 */
async function waitAndSyncAfterImport(maxWaitMs = 60000) {
    const pollInterval = 500; // cek setiap 500ms
    let waited = 0;

    // Tunggu jika sync sedang berjalan
    while (window.syncInProgress && waited < maxWaitMs) {
        console.log(`[IMPORT RETRY] Sync sedang berjalan, menunggu... (${waited}ms)`);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        waited += pollInterval;
    }

    if (window.syncInProgress) {
        console.warn('[IMPORT RETRY] Timeout menunggu sync selesai. Memaksa sync baru...');
    } else {
        console.log(`[IMPORT RETRY] Sync selesai setelah ${waited}ms. Memulai sync import...`);
    }

    // Jalankan sync santri (dan halaqah jika ada)
    const retryPromises = [];
    if (typeof window.syncHalaqahsToSupabase === 'function') {
        retryPromises.push(window.syncHalaqahsToSupabase());
    }
    if (typeof window.syncStudentsToSupabase === 'function') {
        retryPromises.push(window.syncStudentsToSupabase());
    }
    const results = await Promise.all(retryPromises);
    return results.find(r => r && r.status) || { status: 'unknown' };
}


function showImportExcel() {
    const content = `
        <div class="p-8">
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="font-display font-bold text-3xl text-slate-800 mb-2">📊 Import Data Excel</h2>
                    <p class="text-slate-500">Upload file Excel untuk import data halaqah dan santri</p>
                </div>
                <button onclick="closeModal()" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <div class="space-y-6">
                <!-- Download Template -->
                <div class="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                    <h3 class="font-bold text-blue-900 mb-3 flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                        </svg>
                        Download Template Excel
                    </h3>
                    <p class="text-sm text-blue-700 mb-4">Download template Excel terlebih dahulu, isi data sesuai format, lalu upload kembali.</p>
                    <button onclick="downloadExcelTemplate()" 
                        class="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        Download Template
                    </button>
                </div>
                
                <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                    <h3 class="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        Import Langsung Santri SD 2025
                    </h3>
                    <p class="text-sm text-emerald-800 mb-4">
                        Ambil data santri SD 2025 langsung dari server tanpa perlu file Excel. Santri baru saja; halaqah yang belum ada akan <strong>dibuat otomatis</strong> dari nama halaqah/guru di API.
                    </p>
                    <button onclick="importFromSdApi()" 
                        class="w-full bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18"></path>
                        </svg>
                        Import dari SD 2025
                    </button>
                </div>

                <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                    <h3 class="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        Import Langsung Santri SMP 2025
                    </h3>
                    <p class="text-sm text-emerald-800 mb-4">
                        Ambil data santri SMP 2025 langsung dari server tanpa perlu file Excel. Santri baru saja; halaqah yang belum ada akan <strong>dibuat otomatis</strong> dari nama halaqah/guru di API.
                    </p>
                    <button onclick="importFromSmpApi()" 
                        class="w-full bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18"></path>
                        </svg>
                        Import dari SMP 2025
                    </button>
                </div>

                <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                    <h3 class="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        Import Langsung Santri SMA 2025
                    </h3>
                    <p class="text-sm text-emerald-800 mb-4">
                        Ambil data santri SMA 2025 langsung dari server tanpa perlu file Excel. Santri baru saja; halaqah yang belum ada akan <strong>dibuat otomatis</strong> dari nama halaqah/guru di API.
                    </p>
                    <button onclick="importFromSmaApi()" 
                        class="w-full bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18"></path>
                        </svg>
                        Import dari SMA 2025
                    </button>
                </div>

                <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                    <h3 class="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        Import Langsung Santri MTA 2025
                    </h3>
                    <p class="text-sm text-emerald-800 mb-4">
                        Ambil data santri MTA 2025 langsung dari server tanpa perlu file Excel. Santri baru saja; halaqah yang belum ada akan <strong>dibuat otomatis</strong> dari nama halaqah/guru di API.
                    </p>
                    <button onclick="importFromMtaApi()" 
                        class="w-full bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18"></path>
                        </svg>
                        Import dari MTA 2025
                    </button>
                </div>

                <div class="bg-purple-50 border border-purple-200 rounded-2xl p-6">
                    <h3 class="font-bold text-purple-900 mb-3 flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h10m-4 5h8"></path>
                        </svg>
                        Sinkron Total Hafalan 2025
                    </h3>
                    <p class="text-sm text-purple-800 mb-4">
                        Pilih jenjang (SD/SMP/SMA/MTA) lalu klik tombol sinkron. 
                        Sistem akan otomatis mengambil data total hafalan dari <span class="font-semibold">semua guru</span> untuk jenjang yang dipilih 
                        dan mengupdate kolom <span class="font-semibold">Total Hafalan</span> untuk santri yang namanya cocok.
                    </p>
                <div class="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-3">
                        <select id="hafalan-jenjang"
                            class="w-full px-4 py-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm">
                            <option value="SDITA" selected>SD</option>
                            <option value="SMPITA">SMP</option>
                            <option value="SMAITA">SMA</option>
                            <option value="MTA">MTA</option>
                        </select>
                        <button onclick="importTotalHafalanSdFromGuru()"
                            class="w-full bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8M3 7h4a2 2 0 012 2v8"></path>
                            </svg>
                            Sinkron Total Hafalan
                        </button>
                    </div>
                    <p class="mt-2 text-xs text-purple-700">
                        Catatan: Hanya mengubah <span class="font-semibold">total_hafalan</span>, tidak mengubah poin atau riwayat setoran.
                    </p>
                    <p class="mt-1 text-[11px] text-purple-600">
                        Data diambil dari semua guru untuk jenjang yang dipilih secara otomatis.
                    </p>
                </div>
                
                <!-- Upload Area -->
                <div class="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-primary-500 transition-colors">
                    <input type="file" id="excelFileInput" accept=".xlsx,.xls" class="hidden" onchange="handleExcelUpload(event)">
                    <label for="excelFileInput" class="cursor-pointer">
                        <div class="flex flex-col items-center gap-4">
                            <svg class="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                            <div>
                                <p class="text-lg font-bold text-slate-700">Klik untuk upload file Excel</p>
                                <p class="text-sm text-slate-500">atau drag & drop file di sini</p>
                                <p class="text-xs text-slate-400 mt-2">Format: .xlsx atau .xls</p>
                            </div>
                        </div>
                    </label>
                </div>
                
                <!-- Preview Area -->
                <div id="excelPreview" class="hidden">
                    <h3 class="font-bold text-slate-800 mb-3">Preview Data</h3>
                    <div class="bg-slate-50 rounded-xl p-4 max-h-96 overflow-auto custom-scrollbar">
                        <div id="previewContent"></div>
                    </div>
                    <div class="flex gap-3 mt-4">
                        <button onclick="confirmImport()" 
                            class="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors">
                            ✅ Import Data
                        </button>
                        <button onclick="cancelImport()" 
                            class="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                            Batal
                        </button>
                    </div>
                </div>
                
                <!-- Format Info -->
                <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <h4 class="font-bold text-amber-900 mb-2">📋 Format Excel yang Diperlukan:</h4>
                    <ul class="text-sm text-amber-800 space-y-1">
                        <li>• <strong>Nama Halaqah</strong>: Nama halaqah (contoh: Alim Aswari, Harziki)</li>
                        <li>• <strong>Guru Halaqah</strong>: Nama ustadz/ustadzah</li>
                        <li>• <strong>Kelas</strong>: Tingkat kelas (contoh: MTA 1, MTA 2)</li>
                        <li>• <strong>Nama Santri</strong>: Nama lengkap santri</li>
                        <li>• <strong>NISN</strong>: Nomor Induk Siswa Nasional (WAJIB untuk data unik)</li>
                        <li>• <strong>Lembaga</strong>: MTA, SDITA, SMPITA, atau SMAITA</li>
                    </ul>
                </div>
                
                <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                    <h4 class="font-bold text-blue-900 mb-2 flex items-center gap-2">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                        </svg>
                        Aturan Import
                    </h4>
                    <ul class="text-sm text-blue-800 space-y-1">
                        <li>• <strong>Data Baru</strong>: Akan ditambahkan ke sistem</li>
                        <li>• <strong>Data Sudah Ada</strong>: Akan diupdate (berdasarkan NISN atau Nama)</li>
                        <li>• <strong>Poin & Setoran</strong>: Tidak akan berubah saat update</li>
                        <li>• <strong>Halaqah, Kelas, Lembaga</strong>: Akan diupdate sesuai file Excel</li>
                        <li class="font-bold text-red-600 mt-1">• PENTING: Format kolom NIK & NISN harus "Text" di Excel agar angka tidak berubah/dibulatkan!</li>
                    </ul>
                </div>
            </div>
        </div>
    `;

    createModal(content, false);
    attachHafalanGuruSuggestions();
    const jenjangSelect = document.getElementById('hafalan-jenjang');
    if (jenjangSelect) {
        jenjangSelect.addEventListener('change', attachHafalanGuruSuggestions);
    }
}

let importedData = null;
let sdApiImportData = null;
let sdApiImportTitle = 'Import Santri SD 2025';
let sdApiImportSuccessSuffix = 'SD 2025';
/** Default lembaga untuk import API per jenjang (dipakai sinkron total hafalan + filter). */
let sdApiDefaultLembaga = 'SDITA';
let lastHafalanImportSummary = null;

/** Cocokkan santri dengan jenjang sinkron (SD/SDITA, SMP/SMPITA, dll.). */
function studentBelongsToJenjang(s, lembagaKey) {
    if (!s) return false;
    const normalize = (typeof window.normalizeLembagaKey === 'function')
        ? window.normalizeLembagaKey
        : (v) => String(v || '').trim().toUpperCase();
    const v = normalize(s.lembaga);
    const wanted = normalize(lembagaKey);
    if (v) {
        if (v === wanted) return true;
        if (wanted === 'MTA' && v.startsWith('MTA')) return true;
        return false;
    }
    // Tanpa kolom lembaga: tetap ikut pencocokan nama (API per jenjang yang menentukan siapa di-update)
    return true;
}

function stripUstadzTitle(str) {
    return String(str || '').replace(/^(Ustadz|Ustadzah|Ust\.?)\s+/i, '').trim();
}

/** Pastikan ada baris halaqah untuk import API; buat baru jika belum ada. Mengembalikan nama singkat untuk field santri.halaqah. */
function ensureHalaqahForApiImport(shortName, guru, kelas) {
    const raw = String(shortName || '').replace(/^Halaqah\s+/i, '').trim();
    if (!raw) return '';

    const key = typeof normalizeHalaqahLabel === 'function'
        ? normalizeHalaqahLabel(raw)
        : raw.toLowerCase();

    const found = dashboardData.halaqahs.find(h => {
        if (!h || !h.name) return false;
        const hKey = typeof normalizeHalaqahLabel === 'function'
            ? normalizeHalaqahLabel(h.name)
            : String(h.name).replace(/^Halaqah\s+/i, '').trim().toLowerCase();
        return hKey === key;
    });

    if (found) {
        return String(found.name || '').replace(/^Halaqah\s+/i, '').trim();
    }

    const newHalaqah = {
        id: Date.now() + Math.floor(Math.random() * 1e6) + dashboardData.halaqahs.length,
        name: `Halaqah ${raw}`,
        points: 0,
        rank: dashboardData.halaqahs.length + 1,
        status: 'BARU',
        members: 0,
        avgPoints: '0',
        trend: 0,
        guru: guru || '',
        kelas: kelas || ''
    };
    dashboardData.halaqahs.push(newHalaqah);
    return raw;
}

const hafalanGuruSuggestionsCache = {};

async function ensureHafalanGuruSuggestions(lembagaKey) {
    if (hafalanGuruSuggestionsCache[lembagaKey]) {
        return hafalanGuruSuggestionsCache[lembagaKey];
    }
    let url = '';
    if (lembagaKey === 'SDITA') {
        url = 'https://asia-southeast1-mootabaah.cloudfunctions.net/api/listnamasd2025';
    } else if (lembagaKey === 'SMPITA') {
        url = 'https://asia-southeast1-mootabaah.cloudfunctions.net/api/listnamasmp2025';
    } else if (lembagaKey === 'SMAITA') {
        url = 'https://asia-southeast1-mootabaah.cloudfunctions.net/api/listnamasma2025';
    } else {
        return [];
    }
    const res = await fetch(url);
    if (!res.ok) {
        console.error('Failed to load hafalan guru suggestions for', lembagaKey);
        return [];
    }
    const json = await res.json();
    const rows = Array.isArray(json.data) ? json.data : [];
    const guruSet = new Set();
    rows.forEach(row => {
        if (!row) return;
        const raw = row.guruHalaqoh || row.namaHalaqoh || row.halaqah || '';
        const name = String(raw).trim();
        if (!name) return;
        guruSet.add(name);
    });
    const list = Array.from(guruSet).sort();
    hafalanGuruSuggestionsCache[lembagaKey] = list;
    return list;
}

async function attachHafalanGuruSuggestions() {
    try {
        const input = document.getElementById('hafalan-ustadz-name');
        if (!input) return;
        const jenjangSelect = document.getElementById('hafalan-jenjang');
        const lembagaKey = jenjangSelect ? jenjangSelect.value : 'SDITA';
        let datalist = document.getElementById('hafalan-guru-suggestions');
        if (!datalist) {
            datalist = document.createElement('datalist');
            datalist.id = 'hafalan-guru-suggestions';
            document.body.appendChild(datalist);
        }
        input.setAttribute('list', 'hafalan-guru-suggestions');
        const names = await ensureHafalanGuruSuggestions(lembagaKey);
        datalist.innerHTML = '';
        names.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            datalist.appendChild(option);
        });
    } catch (e) {
        console.error('Error loading hafalan guru suggestions', e);
    }
}

function downloadExcelTemplate() {
    if (typeof XLSX === 'undefined') {
        showNotification('❌ Library Excel belum dimuat. Periksa koneksi internet.', 'error');
        return;
    }

    const template = [
        ['Nama Halaqah', 'Guru Halaqah', 'Kelas', 'Nama Santri', 'NISN', 'NIK', 'Lembaga', 'Jenis Kelamin', 'Tempat Lahir', 'Tanggal Lahir', 'Alamat', 'HP Ortu', 'Nama Ayah', 'Nama Ibu', 'Sekolah Asal'],
        ['Alim Aswari', 'Ustadz Alim', 'MTA 1', 'Abercio Nabil Arazzak', '2526.03.0001', '3201123456780001', 'MTA', 'L', 'Jakarta', '2010-01-01', 'Jl. Contoh No. 1', '08123456789', 'Ayah Budi', 'Ibu Ani', 'SDN 01'],
        ['Alim Aswari', 'Ustadz Alim', 'MTA 1', 'Ahmad Fatih Rizqie Qetama', '2526.03.0002', '3201123456780002', 'MTA', 'L', 'Bandung', '2010-05-15', 'Jl. Test No. 2', '08129876543', 'Ayah Ahmad', 'Ibu Siti', 'SDIT Al-Falah'],
        ['Alim Aswari', 'Ustadz Alim', 'MTA 1', 'Umar Zhafran Yazid', '2526.03.0003', '3201123456780003', 'MTA', 'L', 'Surabaya', '2011-03-20', 'Jl. Coba No. 3', '08134567890', 'Ayah Umar', 'Ibu Fatimah', 'MI Nurul Huda']
    ];

    // Create Workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(template);

    // Set column widths
    const wscols = [
        { wch: 20 }, { wch: 20 }, { wch: 10 }, { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 10 },
        { wch: 5 }, { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 }
    ];
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, "Template");

    // Download as XLSX
    XLSX.writeFile(wb, 'Template_Halaqah_Santri.xlsx');

    showNotification('📥 Template Excel berhasil didownload!');
}

async function importFromJenjangApi(config) {
    try {
        showNotification(config.loadingText, 'info');
        const res = await fetch(config.url);
        if (!res.ok) {
            showNotification(config.errorText, 'error');
            return;
        }
        const json = await res.json();
        const rows = Array.isArray(json.data) ? json.data : [];
        if (rows.length === 0) {
            showNotification(config.emptyText, 'info');
            return;
        }

        sdApiImportTitle = config.previewTitle;
        sdApiImportSuccessSuffix = config.successSuffix;

        sdApiImportData = rows.map((row, index) => {
            if (!row) {
                return { index, canImport: false, reason: 'Data kosong' };
            }
            const rawName = row.namaSiswa || row.nama || '';
            const rawHalaqah = row.namaHalaqoh || row.halaqah || '';
            const rawGuruHalaqoh = row.guruHalaqoh || '';
            
            const name = String(rawName).trim();
            const halaqahNameRaw = String(rawHalaqah).trim();
            const guruHalaqoh = String(rawGuruHalaqoh).trim();
            
            // Remove "Halaqah" prefix if exists
            const halaqahName = halaqahNameRaw.replace(/^Halaqah\s+/i, '').trim();
            let effectiveHalaqahShort = halaqahName;
            if (!effectiveHalaqahShort && guruHalaqoh) {
                effectiveHalaqahShort = stripUstadzTitle(guruHalaqoh);
            }

            if (!name) {
                return { index, canImport: false, reason: 'Nama kosong', name, halaqahName: effectiveHalaqahShort, row };
            }

            // Map possible keys for profile fields (API often uses camelCase)
            const mappedRow = {
                ...row,
                jenis_kelamin: row.jenis_kelamin || row.jenisKelamin || row.jk || row.gender || '',
                tempat_lahir: row.tempat_lahir || row.tempatLahir || '',
                tanggal_lahir: row.tanggal_lahir || row.tanggalLahir || row.tglLahir || '',
                alamat: row.alamat || row.alamatLengkap || '',
                hp: row.hp || row.noHp || row.whatsapp || '',
                nama_ayah: row.nama_ayah || row.namaAyah || '',
                nama_ibu: row.nama_ibu || row.namaIbu || '',
                sekolah_asal: row.sekolah_asal || row.sekolahAsal || '',
                nik: row.nik || row.noNik || '',
                nisn: row.nisn || row.noNisn || ''
            };

            // Check if student already exists - by NISN first, then by name
            let existingStudent = null;
            const rowNisn = mappedRow.nisn ? String(mappedRow.nisn).trim() : '';
            if (rowNisn) {
                existingStudent = dashboardData.students.find(s =>
                    s && s.nisn && String(s.nisn).trim() === rowNisn
                );
            }
            if (!existingStudent) {
                existingStudent = dashboardData.students.find(s => {
                    if (!s) return false;
                    const sName = String(s.name || '').trim().toLowerCase();
                    return sName === name.toLowerCase();
                });
            }
            const exists = !!existingStudent;

            // Cocokkan halaqah yang sudah ada (nama halaqah atau nama guru dari API)
            let matchedHalaqah = null;

            if (effectiveHalaqahShort) {
                const effLower = effectiveHalaqahShort.toLowerCase();

                matchedHalaqah = dashboardData.halaqahs.find(h => {
                    if (!h || !h.name) return false;
                    const base = String(h.name).replace(/^Halaqah\s+/i, '').trim().toLowerCase();
                    return base === effLower;
                });

                if (!matchedHalaqah) {
                    matchedHalaqah = dashboardData.halaqahs.find(h => {
                        if (!h || !h.name) return false;
                        const base = String(h.name).replace(/^Halaqah\s+/i, '').trim().toLowerCase();
                        return base.startsWith(effLower);
                    });
                }

                if (!matchedHalaqah && guruHalaqoh) {
                    const guruNameOnly = stripUstadzTitle(guruHalaqoh).toLowerCase();
                    matchedHalaqah = dashboardData.halaqahs.find(h => {
                        if (!h || !h.name) return false;
                        const base = String(h.name).replace(/^Halaqah\s+/i, '').trim().toLowerCase();
                        return base === guruNameOnly || base.startsWith(guruNameOnly.split(' ')[0] || '');
                    });
                }
            }

            const halaqahExists = !!matchedHalaqah;
            const studentHalaqahShort = matchedHalaqah
                ? matchedHalaqah.name.replace(/^Halaqah\s+/i, '').trim()
                : effectiveHalaqahShort;

            let reason = '';
            if (existingStudent) {
                const isMissingData = !existingStudent.nik || !existingStudent.tanggal_lahir || !existingStudent.jenis_kelamin;
                reason = isMissingData ? 'Sudah ada (Data kurang, akan diupdate)' : 'Sudah ada di sistem (akan diupdate)';
            } else if (!studentHalaqahShort) {
                reason = 'Nama halaqah / guru kosong di data API';
            } else {
                reason = halaqahExists ? 'Siap diimport' : 'Halaqah akan dibuat otomatis saat import';
            }

            return {
                index,
                row: mappedRow,
                name,
                halaqahName: studentHalaqahShort,
                guruHalaqoh,
                exists: !!existingStudent,
                existingStudentId: existingStudent ? existingStudent.id : null,
                halaqahExists,
                canImport: !!studentHalaqahShort, // Allow import/update even if exists
                reason
            };
        });

        if (!sdApiImportData || sdApiImportData.length === 0) {
            showNotification(config.noImportableText, 'info');
            return;
        }

        showSdApiImportPreview();
    } catch (error) {
        console.error(config.logPrefix || 'Error importFromJenjangApi', error);
        showNotification(config.catchErrorText, 'error');
    }
}

async function importFromSdApi() {
    sdApiDefaultLembaga = 'SDITA';
    return importFromJenjangApi({
        url: 'https://asia-southeast1-mootabaah.cloudfunctions.net/api/listnamasd2025',
        loadingText: '☁️ Mengambil data santri SD 2025...',
        errorText: '❌ Gagal mengambil data SD 2025 dari server.',
        emptyText: 'ℹ️ Tidak ada data santri SD 2025 yang diterima.',
        noImportableText: 'ℹ️ Tidak ada data yang dapat diimport dari SD 2025.',
        previewTitle: 'Import Santri SD 2025',
        successSuffix: 'SD 2025',
        catchErrorText: '❌ Terjadi kesalahan saat import dari SD 2025.',
        logPrefix: 'Error importFromSdApi'
    });
}

async function importFromSmpApi() {
    sdApiDefaultLembaga = 'SMPITA';
    return importFromJenjangApi({
        url: 'https://asia-southeast1-mootabaah.cloudfunctions.net/api/listnamasmp2025',
        loadingText: '☁️ Mengambil data santri SMP 2025...',
        errorText: '❌ Gagal mengambil data SMP 2025 dari server.',
        emptyText: 'ℹ️ Tidak ada data santri SMP 2025 yang diterima.',
        noImportableText: 'ℹ️ Tidak ada data yang dapat diimport dari SMP 2025.',
        previewTitle: 'Import Santri SMP 2025',
        successSuffix: 'SMP 2025',
        catchErrorText: '❌ Terjadi kesalahan saat import dari SMP 2025.',
        logPrefix: 'Error importFromSmpApi'
    });
}

async function importFromSmaApi() {
    sdApiDefaultLembaga = 'SMAITA';
    return importFromJenjangApi({
        url: 'https://asia-southeast1-mootabaah.cloudfunctions.net/api/listnamasma2025',
        loadingText: '☁️ Mengambil data santri SMA 2025...',
        errorText: '❌ Gagal mengambil data SMA 2025 dari server.',
        emptyText: 'ℹ️ Tidak ada data santri SMA 2025 yang diterima.',
        noImportableText: 'ℹ️ Tidak ada data yang dapat diimport dari SMA 2025.',
        previewTitle: 'Import Santri SMA 2025',
        successSuffix: 'SMA 2025',
        catchErrorText: '❌ Terjadi kesalahan saat import dari SMA 2025.',
        logPrefix: 'Error importFromSmaApi'
    });
}

async function importFromMtaApi() {
    sdApiDefaultLembaga = 'MTA';
    return importFromJenjangApi({
        url: 'https://asia-southeast1-mootabaah.cloudfunctions.net/api/listnamamta2025',
        loadingText: '☁️ Mengambil data santri MTA 2025...',
        errorText: '❌ Gagal mengambil data MTA 2025 dari server.',
        emptyText: 'ℹ️ Tidak ada data santri MTA 2025 yang diterima.',
        noImportableText: 'ℹ️ Tidak ada data yang dapat diimport dari MTA 2025.',
        previewTitle: 'Import Santri MTA 2025',
        successSuffix: 'MTA 2025',
        catchErrorText: '❌ Terjadi kesalahan saat import dari MTA 2025.',
        logPrefix: 'Error importFromMtaApi'
    });
}

async function importTotalHafalanSdFromGuru() {
    try {
        const jenjangSelect = document.getElementById('hafalan-jenjang');
        const lembagaKey = jenjangSelect ? jenjangSelect.value : 'SDITA';

        let jenjangSlug = 'sd';
        if (lembagaKey === 'SMPITA') {
            jenjangSlug = 'smp';
        } else if (lembagaKey === 'SMAITA') {
            jenjangSlug = 'sma';
        } else if (lembagaKey === 'MTA') {
            jenjangSlug = 'mta';
        }

        const url = `https://asia-southeast1-mootabaah.cloudfunctions.net/api/totalHafalan2025/${jenjangSlug}`;

        console.log('[DEBUG] Import Total Hafalan:');
        console.log('  - Lembaga:', lembagaKey);
        console.log('  - Jenjang Slug:', jenjangSlug);
        console.log('  - URL:', url);

        showNotification(`☁️ Mengambil total hafalan ${lembagaKey} 2025...`, 'info');

        const res = await fetch(url);
        console.log('[DEBUG] Response status:', res.status, res.statusText);
        
        if (!res.ok) {
            console.error('[DEBUG] Response not OK:', res.status, res.statusText);
            showNotification(`❌ Gagal mengambil data total hafalan dari server. (${res.status})`, 'error');
            return;
        }

        const json = await res.json();
        console.log('[DEBUG] Response JSON:', json);
        
        const allGuruData = json?.data || {};
        console.log('[DEBUG] Guru found:', Object.keys(allGuruData));

        if (Object.keys(allGuruData).length === 0) {
            showNotification('ℹ️ Tidak ada data hafalan yang diterima.', 'info');
            return;
        }

        let updatedCount = 0;
        let notFoundCount = 0;
        let invalidCount = 0;

        const normalizeName = (name) => {
            if (!name) return '';
            // Remove dots after single letters (M. → M, A. → A)
            let normalized = String(name).replace(/\b([A-Z])\.\s*/g, '$1 ');
            // Normalize whitespace
            normalized = normalized.toLowerCase().replace(/[\s\u00A0]+/g, ' ').trim();
            return normalized;
        };

        const levenshteinDistance = (str1, str2) => {
            const matrix = [];
            for (let i = 0; i <= str2.length; i++) {
                matrix[i] = [i];
            }
            for (let j = 0; j <= str1.length; j++) {
                matrix[0][j] = j;
            }
            for (let i = 1; i <= str2.length; i++) {
                for (let j = 1; j <= str1.length; j++) {
                    if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                        matrix[i][j] = matrix[i - 1][j - 1];
                    } else {
                        matrix[i][j] = Math.min(
                            matrix[i - 1][j - 1] + 1,
                            matrix[i][j - 1] + 1,
                            matrix[i - 1][j] + 1
                        );
                    }
                }
            }
            return matrix[str2.length][str1.length];
        };

        const calculateSimilarity = (str1, str2) => {
            const longer = str1.length > str2.length ? str1 : str2;
            const shorter = str1.length > str2.length ? str2 : str1;
            if (longer.length === 0) return 100;
            const editDistance = levenshteinDistance(longer, shorter);
            return ((longer.length - editDistance) / longer.length) * 100;
        };

        const students = Array.isArray(dashboardData.students)
            ? dashboardData.students.filter(s => s && studentBelongsToJenjang(s, lembagaKey))
            : [];

        if (students.length === 0) {
            showNotification(
                `ℹ️ Tidak ada santri di aplikasi untuk jenjang ${lembagaKey}. Import santri dulu, atau samakan penulisan Lembaga (SD / SDITA, dll.).`,
                'warning'
            );
            return;
        }

        const forEachStudentInGuru = (guruStudents, fn) => {
            if (!guruStudents) return;
            if (Array.isArray(guruStudents)) {
                guruStudents.forEach((studentData, i) => fn(`row_${i}`, studentData));
            } else if (typeof guruStudents === 'object') {
                Object.entries(guruStudents).forEach(([studentKey, studentData]) => fn(studentKey, studentData));
            }
        };

        // Process each guru's data
        Object.entries(allGuruData).forEach(([guruName, guruStudents]) => {
            const count = Array.isArray(guruStudents)
                ? guruStudents.length
                : (guruStudents && typeof guruStudents === 'object' ? Object.keys(guruStudents).length : 0);
            console.log(`[${jenjangSlug.toUpperCase()}] Processing guru: ${guruName}, students:`, count);

            forEachStudentInGuru(guruStudents, (studentKey, studentData) => {
                if (!studentData || typeof studentData !== 'object') {
                    invalidCount++;
                    return;
                }

                // Get student name (use key as primary, fallback to namaSiswa/nama)
                const name = String(studentData.namaSiswa || studentData.nama || studentKey).trim();
                if (!name) {
                    invalidCount++;
                    return;
                }

                // Get total hafalan (beberapa versi API pakai nama field berbeda)
                const rawTotal = studentData.totalHafalan ?? studentData.total_hafalan ?? studentData.totalJuz ?? studentData.juz;
                if (rawTotal === undefined || rawTotal === null || rawTotal === '') {
                    invalidCount++;
                    return;
                }

                // Parse total hafalan (handle both number and string)
                let total = 0;
                if (typeof rawTotal === 'number') {
                    total = rawTotal;
                } else if (typeof rawTotal === 'string') {
                    const parsed = parseFloat(rawTotal);
                    if (isNaN(parsed)) {
                        invalidCount++;
                        console.log(`[${jenjangSlug.toUpperCase()}] Cannot parse totalHafalan for "${name}": "${rawTotal}"`);
                        return;
                    }
                    total = parsed;
                } else {
                    invalidCount++;
                    console.log(`[${jenjangSlug.toUpperCase()}] Tipe total hafalan tidak dikenal untuk "${name}":`, typeof rawTotal);
                    return;
                }

                const targetNorm = normalizeName(name);

                // Try exact match first
                let match = students.find(s => normalizeName(s.name) === targetNorm);

                // If not found, try fuzzy match
                if (!match) {
                    const fuzzyMatches = students.map(s => ({
                        student: s,
                        similarity: calculateSimilarity(targetNorm, normalizeName(s.name))
                    })).filter(m => m.similarity > 75); // Lowered from 80 to 75 for better matching

                    if (fuzzyMatches.length > 0) {
                        fuzzyMatches.sort((a, b) => b.similarity - a.similarity);
                        match = fuzzyMatches[0].student;
                        console.log(`[${jenjangSlug.toUpperCase()}] Fuzzy match: "${name}" → "${match.name}" (${fuzzyMatches[0].similarity.toFixed(1)}%)`);
                    }
                }

                if (!match) {
                    notFoundCount++;
                    console.log(`[${jenjangSlug.toUpperCase()}] Not found: "${name}"`);
                    return;
                }

                // Update total hafalan
                const oldValue = match.total_hafalan || 0;
                match.total_hafalan = total;
                updatedCount++;
                
                // Log update for debugging
                if (oldValue !== total) {
                    console.log(`[${jenjangSlug.toUpperCase()}] Updated: "${match.name}" from ${oldValue} to ${total} juz`);
                } else {
                    console.log(`[${jenjangSlug.toUpperCase()}] No change: "${match.name}" = ${total} juz`);
                }
            });
        });

        if (updatedCount === 0) {
            showNotification('ℹ️ Tidak ada santri yang berhasil diupdate.', 'info');
            return;
        }

        // Save to localStorage
        StorageManager.save();
        
        // Sync to Supabase to prevent data being overwritten on refresh
        console.log(`[${jenjangSlug.toUpperCase()}] Syncing to Supabase...`);
        if (typeof window.syncStudentsToSupabase === 'function') {
            try {
                await window.syncStudentsToSupabase();
                console.log(`[${jenjangSlug.toUpperCase()}] Supabase sync completed`);
            } catch (syncError) {
                console.error(`[${jenjangSlug.toUpperCase()}] Supabase sync failed:`, syncError);
                // Continue anyway, data is saved to localStorage
            }
        }
        
        // Refresh UI
        refreshAllData();

        let message = `✅ Berhasil mengupdate total hafalan ${updatedCount} santri ${lembagaKey}.`;
        if (notFoundCount > 0 || invalidCount > 0) {
            message += ` (${notFoundCount} tidak ditemukan, ${invalidCount} data invalid)`;
        }
        showNotification(message, 'success');

    } catch (error) {
        console.error('Error importTotalHafalanSdFromGuru:', error);
        showNotification(`❌ Gagal sinkron total hafalan: ${error.message}`, 'error');
    }
}

function showSdApiImportPreview() {
    if (!Array.isArray(sdApiImportData) || sdApiImportData.length === 0) {
        showNotification('ℹ️ Tidak ada data untuk di-preview.', 'info');
        return;
    }
    const canImportCount = sdApiImportData.filter(r => r.canImport).length;
    const existingCount = sdApiImportData.filter(r => r.exists).length;
    const autoCreateHalaqahCount = sdApiImportData.filter(r => r.canImport && !r.halaqahExists).length;

    const rowsHtml = sdApiImportData.map((item, idx) => {
        const selectable = item.canImport;
        const disabledAttr = selectable ? '' : 'disabled';
        const checkedAttr = selectable ? 'checked' : '';
        const status = item.reason || (selectable ? 'Siap diimport' : 'Tidak dapat diimport');
        const statusColor = selectable ? (item.exists ? 'text-blue-700' : 'text-emerald-700') : 'text-slate-500';
        let badge = 'bg-emerald-100 text-emerald-700';
        let badgeText = 'Baru';
        if (item.exists) {
            badge = 'bg-blue-100 text-blue-700';
            badgeText = 'Update';
        } else if (selectable && !item.halaqahExists) {
            badge = 'bg-amber-100 text-amber-800';
            badgeText = 'Buat halaqah';
        }
        return `
            <tr class="border-b border-slate-100">
                <td class="p-2 align-top">
                    <input type="checkbox" class="sd-api-row-check" data-index="${idx}" ${checkedAttr} ${disabledAttr}>
                </td>
                <td class="p-2 align-top text-xs text-slate-500">${idx + 1}</td>
                <td class="p-2 align-top">
                    <div class="font-semibold text-slate-800 text-sm">${item.name || '-'}</div>
                    <div class="text-xs text-slate-500">${item.halaqahName || '-'}</div>
                </td>
                <td class="p-2 align-top text-xs">
                    <div class="${statusColor}">${status}</div>
                    <div class="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${badge}">
                        ${badgeText}
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    const content = `
        <div class="p-6">
            <div class="mb-4">
                <h3 class="text-2xl font-bold text-slate-800 mb-1">${sdApiImportTitle || 'Import Santri'}</h3>
                <p class="text-sm text-slate-500">Pilih santri yang akan ditambahkan ke sistem.</p>
            </div>
            <div class="grid grid-cols-3 gap-3 mb-4 text-sm">
                <div class="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                    <div class="text-xs text-emerald-700">Siap diimport</div>
                    <div class="text-xl font-bold text-emerald-800">${canImportCount}</div>
                </div>
                <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <div class="text-xs text-slate-600">Sudah ada di sistem</div>
                    <div class="text-xl font-bold text-slate-800">${existingCount}</div>
                </div>
                <div class="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <div class="text-xs text-amber-800">Halaqah baru (otomatis)</div>
                    <div class="text-xl font-bold text-amber-900">${autoCreateHalaqahCount}</div>
                </div>
            </div>
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2 text-xs text-slate-600">
                    <input type="checkbox" id="sdApiSelectAll" class="rounded border-slate-300">
                    <label for="sdApiSelectAll" class="cursor-pointer">Pilih semua yang siap diimport</label>
                </div>
            </div>
            <div class="border border-slate-200 rounded-xl max-h-80 overflow-y-auto">
                <table class="w-full text-left text-sm">
                    <thead class="bg-slate-50 text-xs text-slate-500 uppercase">
                        <tr>
                            <th class="p-2 w-8"></th>
                            <th class="p-2 w-10">No</th>
                            <th class="p-2">Santri</th>
                            <th class="p-2 w-40">Status</th>
                        </tr>
                    </thead>
                    <tbody id="sdApiImportTableBody">
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>
            <div class="flex gap-3 mt-5">
                <button onclick="confirmSdApiImport()" class="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors">
                    Import Terpilih
                </button>
                <button onclick="closeModal()" class="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                    Batal
                </button>
            </div>
        </div>
    `;

    createModal(content, false);

    const selectAll = document.getElementById('sdApiSelectAll');
    if (selectAll) {
        selectAll.addEventListener('change', () => {
            const checks = document.querySelectorAll('.sd-api-row-check');
            checks.forEach(c => {
                if (c.disabled) return;
                c.checked = selectAll.checked;
            });
        });
    }
}

function confirmSdApiImport() {
    if (!Array.isArray(sdApiImportData) || sdApiImportData.length === 0) {
        showNotification('ℹ️ Tidak ada data untuk diimport.', 'info');
        return;
    }
    const checks = document.querySelectorAll('.sd-api-row-check');
    const selectedIndices = [];
    checks.forEach(c => {
        if (c.checked && !c.disabled && c.dataset.index !== undefined) {
            const idx = parseInt(c.dataset.index, 10);
            if (!Number.isNaN(idx)) selectedIndices.push(idx);
        }
    });
    if (selectedIndices.length === 0) {
        showNotification('ℹ️ Tidak ada santri yang dipilih untuk diimport.', 'info');
        return;
    }

    let created = 0;

    // Calculate next ID
    let nextId = dashboardData.students.reduce((max, s) => {
        const id = parseInt(s.id);
        return !isNaN(id) && id < 1000000000 ? Math.max(max, id) : max; // Only consider valid int IDs
    }, 0) + 1;

    // Safety check: if nextId is too small (empty DB), start at 1
    if (nextId < 1) nextId = 1;

    selectedIndices.forEach(idx => {
        const item = sdApiImportData[idx];
        if (!item || !item.canImport || !item.row) return;
        const row = item.row;
        const name = item.name;
        
        // Normalize Gender to L/P if possible
        let jk = row.jenis_kelamin ? String(row.jenis_kelamin).trim() : '';
        if (jk.toLowerCase().startsWith('l')) jk = 'L';
        else if (jk.toLowerCase().startsWith('p')) jk = 'P';

        if (item.exists && item.existingStudentId) {
            // UPDATE existing student - overwrite semua field dari API
            const existing = dashboardData.students.find(s => s.id === item.existingStudentId);
            if (existing) {
                if (row.nisn && String(row.nisn).trim()) existing.nisn = String(row.nisn).trim();
                if (row.nik && String(row.nik).trim()) existing.nik = String(row.nik).trim();
                if (jk) existing.jenis_kelamin = jk;
                if (row.tempat_lahir && String(row.tempat_lahir).trim()) existing.tempat_lahir = String(row.tempat_lahir).trim();
                if (row.tanggal_lahir && String(row.tanggal_lahir).trim()) existing.tanggal_lahir = String(row.tanggal_lahir).trim();
                if (row.alamat && String(row.alamat).trim()) existing.alamat = String(row.alamat).trim();
                if (row.hp && String(row.hp).trim()) existing.hp = String(row.hp).trim();
                if (row.nama_ayah && String(row.nama_ayah).trim()) existing.nama_ayah = String(row.nama_ayah).trim();
                if (row.nama_ibu && String(row.nama_ibu).trim()) existing.nama_ibu = String(row.nama_ibu).trim();
                if (row.sekolah_asal && String(row.sekolah_asal).trim()) existing.sekolah_asal = String(row.sekolah_asal).trim();
                
                console.log(`[IMPORT API] Updated data for existing student: ${name}`);
            }
        } else {
            // CREATE new student
            const kelasStr = row.kelas ? String(row.kelas).trim() : '';
            const santriHalaqah = ensureHalaqahForApiImport(
                item.halaqahName,
                item.guruHalaqoh || '',
                kelasStr
            );
            if (!santriHalaqah) return;

            dashboardData.students.push({
                id: nextId++,
                name: name,
                halaqah: santriHalaqah,
                nisn: row.nisn ? String(row.nisn).trim() : '',
                nik: row.nik ? String(row.nik).trim() : '',
                lembaga: (row.lembaga && String(row.lembaga).trim()) || sdApiDefaultLembaga,
                kelas: row.kelas ? String(row.kelas).trim() : '',
                jenis_kelamin: jk,
                tempat_lahir: row.tempat_lahir ? String(row.tempat_lahir).trim() : '',
                tanggal_lahir: row.tanggal_lahir ? String(row.tanggal_lahir).trim() : '',
                alamat: row.alamat ? String(row.alamat).trim() : '',
                hp: row.hp ? String(row.hp).trim() : '',
                nama_ayah: row.nama_ayah ? String(row.nama_ayah).trim() : '',
                nama_ibu: row.nama_ibu ? String(row.nama_ibu).trim() : '',
                sekolah_asal: row.sekolah_asal ? String(row.sekolah_asal).trim() : '',
                total_points: 0,
                daily_ranking: dashboardData.students.length + 1,
                overall_ranking: dashboardData.students.length + 1,
                streak: 0,
                lastActivity: 'Baru ditambahkan',
                achievements: [],
                setoran: [],
                lastSetoranDate: ''
            });
            created++;
        }
    });

    if (created > 0) {
        recalculateRankings();
        localStorage.removeItem('_deleteJustDone');
        StorageManager.save();

        // SYNC TO SUPABASE - Critical for persistence
        if (navigator.onLine) {
            showNotification('☁️ Menyimpan data ke database...', 'info');
            const sdSyncPromises = [];
            // Sync halaqah dulu (kalau ada halaqah baru)
            if (typeof window.syncHalaqahsToSupabase === 'function') {
                sdSyncPromises.push(window.syncHalaqahsToSupabase());
            }
            // Sync santri
            if (typeof window.syncStudentsToSupabase === 'function') {
                sdSyncPromises.push(window.syncStudentsToSupabase());
            } else {
                console.error('[IMPORT API] window.syncStudentsToSupabase not found!');
            }

            Promise.all(sdSyncPromises).then(sdResults => {
                console.log('[IMPORT API] Sync results:', sdResults);
                const studentSync = sdResults.find(r => r && r.status);
                if (studentSync && studentSync.status === 'success') {
                    showNotification('✅ Data berhasil tersimpan permanen.', 'success');
                } else if (studentSync && studentSync.status === 'skipped_in_progress') {
                    // Auto-sync sedang berjalan - tunggu lalu retry
                    console.log('[IMPORT API] Sync diblokir karena sync lain sedang berjalan. Auto-retry setelah selesai...');
                    showNotification('⏳ Menunggu sinkronisasi selesai, lalu menyimpan data baru...', 'info');
                    waitAndSyncAfterImport().then(retryResult => {
                        console.log('[IMPORT API] Retry result:', retryResult);
                        if (retryResult && retryResult.status === 'success') {
                            showNotification('✅ Data berhasil tersimpan permanen ke server.', 'success');
                        } else {
                            showNotification('⚠️ Data tersimpan lokal. Status: ' + (retryResult && retryResult.status || 'unknown'), 'warning');
                        }
                    }).catch(err => {
                        console.error('[IMPORT API] Retry failed:', err);
                        showNotification('⚠️ Gagal menyimpan ke server setelah retry.', 'warning');
                    });
                } else if (studentSync && studentSync.status === 'skipped_permission') {
                    console.warn('[IMPORT API] Sync diblokir - user bukan admin/guru. Profile:', window.currentProfile);
                    showNotification('⚠️ Sync gagal: pastikan Anda login sebagai Admin atau Guru.', 'warning');
                } else if (studentSync && studentSync.status && studentSync.status.startsWith('skipped_')) {
                    console.log('[IMPORT API] Sync skipped:', studentSync.status);
                    showNotification('⚠️ Data tersimpan lokal, belum tersimpan di server.', 'warning');
                } else {
                    showNotification('✅ Proses sinkronisasi selesai.', 'success');
                }
            }).catch(err => {
                console.error('[IMPORT API] Sync failed:', err);
                showNotification('⚠️ Data tersimpan lokal, tapi gagal sync ke server.', 'warning');
            });
        } else {
            showNotification('✅ Data tersimpan lokal (offline).', 'success');
        }

        if (window.autoSync) autoSync();
        refreshAllData();
        closeModal();
        const suffix = sdApiImportSuccessSuffix || '';
        showNotification(`✅ Import ${suffix} selesai. Ditambahkan ${created} santri baru.`, 'success');
    } else {
        showNotification('ℹ️ Tidak ada santri baru yang diimport.', 'info');
    }

    sdApiImportData = null;
}

// Direct Upload Helper (without intermediate modal)
function triggerDirectExcelUpload() {
    // Pastikan elemen preview ada di DOM.
    // Jika user klik import dari halaman Data Induk Santri, modal showImportExcel() mungkin belum dibuka,
    // sehingga showPreview() tidak menemukan `excelPreview` dan upload terlihat "tidak berfungsi".
    const hasPreview = !!(document.getElementById('excelPreview') && document.getElementById('previewContent'));
    if (!hasPreview && typeof showImportExcel === 'function') {
        showImportExcel();
    }

    let input = document.getElementById('directExcelInput');
    if (!input) {
        input = document.createElement('input');
        input.type = 'file';
        input.id = 'directExcelInput';
        input.className = 'hidden';
        input.accept = '.xlsx, .xls';
        input.onchange = (e) => handleExcelUpload(e);
        document.body.appendChild(input);
    }
    input.value = ''; // Reset to allow re-upload of same file
    input.click();
}

window.triggerDirectExcelUpload = triggerDirectExcelUpload;

async function handleExcelUpload(event) {
    if (typeof XLSX === 'undefined') {
        showNotification('❌ Library Excel belum dimuat. Periksa koneksi internet.', 'error');
        return;
    }

    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: false });

            if (jsonData.length < 2) {
                showNotification('❌ File Excel kosong atau tidak valid');
                return;
            }

            processExcelData(jsonData);
        } catch (error) {
            console.error(error);
            showNotification('❌ Error membaca file Excel: ' + error.message);
        }
    };

    reader.readAsArrayBuffer(file);
}

function processExcelData(data) {
    // Try to find the header row
    let headerRowIndex = 0;
    let headers = data[0];

    // Simple heuristic: look for "Nama" or "No" or "Halaqah" in the first few rows
    for (let i = 0; i < Math.min(5, data.length); i++) {
        const rowStr = JSON.stringify(data[i]).toLowerCase();
        if (rowStr.includes('nama') || rowStr.includes('santri') || rowStr.includes('halaqah')) {
            headerRowIndex = i;
            headers = data[i];
            break;
        }
    }

    console.log('Headers detected:', headers);

    const rows = data.slice(headerRowIndex + 1);

    // Validate headers - Flexible matching
    const santriKeywords = ['nama santri', 'nama lengkap', 'nama siswa', 'santri', 'nama'];
    const hasSantriColumn = headers.some(header => {
        if (!header) return false;
        const h = header.toString().toLowerCase().trim();
        return santriKeywords.some(k => h.includes(k));
    });

    if (!hasSantriColumn) {
        console.error('Available headers:', headers);
        showNotification('❌ Format Excel tidak sesuai. Tidak ditemukan kolom "Nama Santri" (atau Nama/Siswa).', 'error');
        return;
    }

    // findColExact: cocokkan header yang persis sama dengan salah satu keyword (setelah trim+lowercase)
    const findColExact = (keywords) => headers.findIndex(h => {
        if (!h) return false;
        const headerStr = h.toString().toLowerCase().trim();
        return keywords.some(k => headerStr === k);
    });

    // findColContains: cocokkan header yang mengandung keyword (fallback)
    const findColContains = (keywords) => headers.findIndex(h => {
        if (!h) return false;
        const headerStr = h.toString().toLowerCase().trim();
        return keywords.some(k => headerStr.includes(k));
    });

    const colMap = {
        halaqah: findColContains(['nama halaqah', 'halaqah', 'kelompok']),
        guru: findColContains(['guru halaqah', 'ustadz halaqah', 'musyrif', 'pembimbing']),
        kelas: findColExact(['kelas', 'tingkat']) !== -1
            ? findColExact(['kelas', 'tingkat'])
            : findColContains(['kelas', 'tingkat']),
        santri: (() => {
            // Prioritas: exact match dulu
            const exactIdx = findColExact(['nama santri', 'nama lengkap', 'nama siswa', 'nama murid', 'santri', 'siswa', 'murid']);
            if (exactIdx !== -1) return exactIdx;
            // Fallback: contains, tapi exclude kolom yang bukan nama santri
            return headers.findIndex(h => {
                if (!h) return false;
                const str = h.toString().toLowerCase().trim();
                if (['nama santri', 'nama lengkap', 'nama siswa', 'santri', 'siswa', 'murid'].some(k => str.includes(k))) return true;
                if (str === 'nama') return true;
                return false;
            });
        })(),
        nisn: (() => {
            // Prioritas NISN dulu, baru NIS
            const nisnIdx = findColExact(['nisn']);
            if (nisnIdx !== -1) return nisnIdx;
            const nisnContains = findColContains(['nisn']);
            if (nisnContains !== -1) return nisnContains;
            return findColExact(['nis']);
        })(),
        nik: findColExact(['nik']) !== -1
            ? findColExact(['nik'])
            : findColContains(['no nik', 'nomor nik', 'ktp']),
        lembaga: findColExact(['lembaga', 'jenjang', 'unit']) !== -1
            ? findColExact(['lembaga', 'jenjang', 'unit'])
            : findColContains(['lembaga', 'jenjang', 'unit', 'lembaga/sekolah', 'asal lembaga']),
        alumni: findColContains(['alumni/non alumni', 'alumni / non alumni', 'status alumni', 'alumni']),
        jenis_kelamin: findColContains(['jenis kelamin', 'jenis_kelamin', 'l/p', 'gender']),
        tempat_lahir: findColExact(['tempat lahir', 'tempat_lahir']) !== -1
            ? findColExact(['tempat lahir', 'tempat_lahir'])
            : findColContains(['tempat lahir']),
        tanggal_lahir: findColExact(['tanggal lahir', 'tgl lahir', 'tanggal_lahir']) !== -1
            ? findColExact(['tanggal lahir', 'tgl lahir', 'tanggal_lahir'])
            : findColContains(['tanggal lahir', 'tgl lahir']),
        ttl: findColContains(['ttl', 'tempat tanggal lahir', 'tempat, tanggal lahir']),
        alamat: findColExact(['alamat']) !== -1
            ? findColExact(['alamat'])
            : findColContains(['alamat']),
        hp: (() => {
            // Coba exact dulu (termasuk "HP Ortu"), lalu contains
            const exact = findColExact([
                'hp ortu', 'hp orang tua', 'hp wali',
                'no hp ortu', 'no. hp ortu', 'nomor hp ortu',
                'no wa ortu', 'wa ortu', 'whatsapp ortu',
                'hp', 'no hp', 'no. hp', 'nohp', 'nomor hp',
                'whatsapp', 'wa', 'telepon', 'telp'
            ]);
            if (exact !== -1) return exact;
            return findColContains([
                'hp ortu', 'hp orang tua', 'hp wali',
                'no hp', 'nomor hp',
                'no wa', 'wa ortu', 'whatsapp',
                'telepon', 'telp', 'phone', 'hp'
            ]);
        })(),
        nama_ayah: findColExact(['nama ayah', 'nama_ayah']) !== -1
            ? findColExact(['nama ayah', 'nama_ayah'])
            : findColContains(['nama ayah']),
        nama_ibu: findColExact(['nama ibu', 'nama_ibu']) !== -1
            ? findColExact(['nama ibu', 'nama_ibu'])
            : findColContains(['nama ibu']),
        sekolah_asal: findColContains(['sekolah asal', 'asal sekolah', 'sekolah_asal'])
    };

    // Fallback: jika guru belum ketemu, coba keyword lebih luas
    if (colMap.guru === -1) {
        colMap.guru = findColContains(['guru', 'ustadz', 'ustadzah']);
    }

    console.log('[DEBUG] Column mapping:', colMap);
    console.log('[DEBUG] Tanggal Lahir column index:', colMap.tanggal_lahir);
    // Log header yang tidak terpetakan untuk membantu debug
    headers.forEach((h, i) => {
        const mapped = Object.entries(colMap).find(([, v]) => v === i);
        if (!mapped && h) console.log(`[DEBUG] Header tidak terpetakan - index ${i}: "${h}"`);
    });

    // Helper to format date
    const formatDate = (dateVal) => {
        if (!dateVal) return '';

        console.log('[DEBUG] formatDate input:', dateVal, 'type:', typeof dateVal);

        // If it's a number (Excel date), convert to YYYY-MM-DD
        if (typeof dateVal === 'number') {
            const date = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
            try {
                const formatted = date.toISOString().split('T')[0];
                console.log('[DEBUG] Excel number date converted to:', formatted);
                return formatted;
            } catch (e) {
                console.error('[DEBUG] Error converting Excel date:', e);
                return String(dateVal);
            }
        }

        // If it's a string, try to parse different formats
        const dateStr = String(dateVal).trim();

        // Format: DD/MM/YYYY
        if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                const day = parts[0].padStart(2, '0');
                const month = parts[1].padStart(2, '0');
                const year = parts[2];
                const formatted = `${year}-${month}-${day}`;
                console.log('[DEBUG] DD/MM/YYYY converted to:', formatted);
                return formatted; // Convert to YYYY-MM-DD
            }
        }

        // Format: DD-MM-YYYY
        if (dateStr.includes('-') && dateStr.split('-')[0].length <= 2) {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                const day = parts[0].padStart(2, '0');
                const month = parts[1].padStart(2, '0');
                const year = parts[2];
                const formatted = `${year}-${month}-${day}`;
                console.log('[DEBUG] DD-MM-YYYY converted to:', formatted);
                return formatted; // Convert to YYYY-MM-DD
            }
        }

        // Already in YYYY-MM-DD format or other format
        console.log('[DEBUG] Date kept as is:', dateStr);
        return dateStr;
    };

    // Process data
    const halaqahs = new Map();
    const students = [];
    const errors = [];
    const nisnMap = new Map(); // Track NISN to find duplicates

    rows.forEach((row, index) => {
        const rowNum = index + headerRowIndex + 2; // Real Excel row number
        const santriName = row[colMap.santri];

        // Strict Validation: Name is mandatory
        if (!santriName) {
            // Check if row is completely empty (common in Excel)
            const hasData = Object.values(colMap).some(idx => idx !== -1 && row[idx]);
            if (hasData) {
                errors.push({
                    row: rowNum,
                    data: row,
                    message: "Kolom Nama Santri kosong, namun baris memiliki data lain."
                });
            }
            return; // Skip empty/invalid name rows
        }

        const halaqahName = (colMap.halaqah !== -1 && row[colMap.halaqah]) ? String(row[colMap.halaqah]).trim() : '';
        const guruName = (colMap.guru !== -1 && row[colMap.guru]) ? String(row[colMap.guru]).trim() : '';
        const kelas = row[colMap.kelas] || '';
        const nisn = (colMap.nisn !== -1 && row[colMap.nisn]) ? String(row[colMap.nisn]).trim() : '';

        // Track NISN for duplicates
        if (nisn) {
            if (!nisnMap.has(nisn)) {
                nisnMap.set(nisn, []);
            }
            nisnMap.get(nisn).push(rowNum);
        }

        // Add halaqah - only if halaqah info is present
        if (halaqahName && !halaqahs.has(halaqahName)) {
            halaqahs.set(halaqahName, {
                name: `Halaqah ${halaqahName}`,
                guru: guruName,
                kelas: kelas,
                members: 0
            });
        }

        // Derive TTL values (support separate or combined TTL column)
        let derivedTempatLahir = (colMap.tempat_lahir !== -1 && row[colMap.tempat_lahir]) ? String(row[colMap.tempat_lahir]).trim() : '';
        let derivedTanggalLahir = (colMap.tanggal_lahir !== -1) ? formatDate(row[colMap.tanggal_lahir]) : '';
        const ttlCombined = (colMap.ttl !== -1) ? row[colMap.ttl] : null;

        if (ttlCombined && (!derivedTempatLahir || !derivedTanggalLahir)) {
            const raw = String(ttlCombined).trim();
            if (raw && raw !== '-' && raw !== '- , -') {
                const parts = raw.split(',').map(p => p.trim());
                if (parts.length >= 2) {
                    if (!derivedTempatLahir) derivedTempatLahir = parts[0];
                    const dateStr = parts.slice(1).join(' ');
                    if (!derivedTanggalLahir) derivedTanggalLahir = formatDate(dateStr);
                } else {
                    // Coba ekstrak format gabungan tanpa koma: "Bandung 12-05-2012" / "Bandung 12/05/2012"
                    const dateMatch = raw.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/);
                    if (dateMatch) {
                        const datePart = dateMatch[1];
                        const placePart = raw.replace(datePart, '').replace(/[,.\-]+$/g, '').trim();
                        if (!derivedTanggalLahir) derivedTanggalLahir = formatDate(datePart);
                        if (!derivedTempatLahir && placePart) derivedTempatLahir = placePart;
                    } else if (/\d/.test(raw)) {
                        // Heuristic: jika ada angka anggap tanggal
                        if (!derivedTanggalLahir) derivedTanggalLahir = formatDate(raw);
                    } else {
                        if (!derivedTempatLahir) derivedTempatLahir = raw;
                    }
                }
            }
            console.log(`[DEBUG] Parsed TTL combined at row ${rowNum}:`, { raw: ttlCombined, tempat: derivedTempatLahir, tanggal: derivedTanggalLahir });
        }

        // Alumni / Non Alumni parsing
        let rawAlumni = (colMap.alumni !== -1 && row[colMap.alumni]) ? String(row[colMap.alumni]).trim() : '';
        let isAlumni = false;
        let kategori = '';
        if (rawAlumni) {
            const lower = rawAlumni.toLowerCase();
            const hasAlumni = lower.includes('alumni');
            const hasNon = lower.includes('non') || lower.includes('bukan');
            if (hasAlumni && !hasNon) {
                isAlumni = true;
            }
            kategori = rawAlumni;
        }

        // Add student data to processing list
        students.push({
            rowNum: rowNum,
            name: String(santriName).trim(),
            halaqah: halaqahName || '',
            nisn: nisn,
            nik: (colMap.nik !== -1 && row[colMap.nik]) ? String(row[colMap.nik]).trim() : '',
            lembaga: (() => {
                const rawLembaga = (colMap.lembaga !== -1 && row[colMap.lembaga]) ? String(row[colMap.lembaga]).trim() : '';
                if (rawLembaga && typeof window.normalizeLembagaKey === 'function') {
                    return window.normalizeLembagaKey(rawLembaga);
                }
                return rawLembaga || inferLembagaFromKelas(kelas) || inferLembagaFromKelas(halaqahName);
            })(),
            kelas: kelas,
            // New fields
            jenis_kelamin: (() => {
                let jk = (colMap.jenis_kelamin !== -1 && row[colMap.jenis_kelamin]) ? String(row[colMap.jenis_kelamin]).trim() : '';
                if (jk.toLowerCase().startsWith('l')) return 'L';
                if (jk.toLowerCase().startsWith('p')) return 'P';
                return jk;
            })(),
            tempat_lahir: derivedTempatLahir,
            tanggal_lahir: derivedTanggalLahir,
            alamat: (colMap.alamat !== -1 && row[colMap.alamat]) ? String(row[colMap.alamat]).trim() : '',
            hp: (colMap.hp !== -1 && row[colMap.hp] != null) ? String(row[colMap.hp]).trim() : '',
            nama_ayah: (colMap.nama_ayah !== -1 && row[colMap.nama_ayah]) ? String(row[colMap.nama_ayah]).trim() : '',
            nama_ibu: (colMap.nama_ibu !== -1 && row[colMap.nama_ibu]) ? String(row[colMap.nama_ibu]).trim() : '',
            sekolah_asal: (colMap.sekolah_asal !== -1 && row[colMap.sekolah_asal]) ? String(row[colMap.sekolah_asal]).trim() : '',
            is_alumni: isAlumni,
            kategori: kategori
        });

        if (halaqahName && halaqahs.has(halaqahName)) {
            halaqahs.get(halaqahName).members++;
        }
    });

    // Process duplicates
    const duplicates = [];
    nisnMap.forEach((rows, nisn) => {
        if (rows.length > 1) {
            duplicates.push({ nisn, rows });
        }
    });

    importedData = {
        halaqahs: Array.from(halaqahs.values()),
        students: students,
        errors: errors,
        duplicates: duplicates,
        metadata: {
            hasLembagaColumn: colMap.lembaga !== -1,
            hasHalaqahColumn: colMap.halaqah !== -1,
            hasTTLCombined: colMap.ttl !== -1,
            hasHpColumn: colMap.hp !== -1
        }
    };

    showPreview(importedData);
}

function showPreview(data) {
    const preview = document.getElementById('excelPreview');
    const content = document.getElementById('previewContent');

    if (!preview || !content) return;

    let warningHtml = '';
    const hpRowsMissing = (data.students || []).filter(s => !String(s.hp || '').trim());
    const hpRowsInvalid = (data.students || []).filter(s => {
        const raw = String(s.hp || '').trim();
        if (!raw) return false;
        const digits = raw.replace(/\D/g, '');
        return digits.length > 0 && digits.length < 9;
    });
    if (data.metadata && !data.metadata.hasHalaqahColumn) {
        warningHtml += `
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 text-sm text-blue-800">
                <strong>ℹ️ Tidak ada kolom Halaqah di file Excel.</strong>
                <div class="mt-1">Santri akan diimport tanpa halaqah. Anda bisa assign halaqah secara manual setelah import, atau tambahkan kolom <strong>Nama Halaqah</strong> di file Excel.</div>
            </div>
        `;
    }
    if (data.metadata && !data.metadata.hasHpColumn) {
        warningHtml += `
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 text-sm text-amber-800">
                <strong>⚠️ Tidak ada kolom HP Ortu di file Excel.</strong>
                <div class="mt-1">Data santri tetap bisa diimport, tetapi field <strong>HP Ortu</strong> akan kosong.</div>
            </div>
        `;
    }
    if (hpRowsMissing.length > 0) {
        warningHtml += `
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 text-sm text-amber-800">
                <strong>⚠️ ${hpRowsMissing.length} santri tanpa HP Ortu.</strong>
                <div class="mt-1">Contoh: ${hpRowsMissing.slice(0, 3).map(s => s.name).join(', ')}${hpRowsMissing.length > 3 ? ' ...' : ''}</div>
            </div>
        `;
    }
    if (hpRowsInvalid.length > 0) {
        warningHtml += `
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 text-sm text-amber-800">
                <strong>⚠️ ${hpRowsInvalid.length} HP Ortu kemungkinan tidak valid.</strong>
                <div class="mt-1">Pastikan nomor minimal 9 digit.</div>
            </div>
        `;
    }
    if (data.errors.length > 0) {
        warningHtml += `
            <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 text-sm text-red-800">
                <strong>⚠️ ${data.errors.length} Baris Bermasalah:</strong>
                <ul class="list-disc pl-5 mt-1">
                    ${data.errors.slice(0, 3).map(e => `<li>Baris ${e.row}: ${e.message}</li>`).join('')}
                    ${data.errors.length > 3 ? `<li>... dan ${data.errors.length - 3} lainnya</li>` : ''}
                </ul>
            </div>
        `;
    }

    if (data.duplicates && data.duplicates.length > 0) {
        warningHtml += `
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 text-sm text-amber-800">
                <strong>⚠️ Duplikasi NISN dalam file:</strong>
                <ul class="list-disc pl-5 mt-1">
                    ${data.duplicates.slice(0, 3).map(d => `<li>NISN ${d.nisn} (Baris: ${d.rows.join(', ')})</li>`).join('')}
                    ${data.duplicates.length > 3 ? `<li>... dan ${data.duplicates.length - 3} lainnya</li>` : ''}
                </ul>
            </div>
        `;
    }

    let html = `
        <div class="space-y-4">
            ${warningHtml}
            <div class="bg-white rounded-lg p-4">
                <h4 class="font-bold text-slate-800 mb-2">📚 Halaqah (${data.halaqahs.length})</h4>
                <div class="space-y-2">
                    ${data.halaqahs.map(h => `
                        <div class="text-sm text-slate-600">
                            • ${h.name} - ${h.guru} (${h.kelas}) - ${h.members} santri
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="bg-white rounded-lg p-4">
                <h4 class="font-bold text-slate-800 mb-2">👥 Santri (${data.students.length})</h4>
                <div class="max-h-48 overflow-y-auto space-y-1">
                    ${data.students.slice(0, 10).map(s => `
                        <div class="text-sm text-slate-600">
                            • ${s.name} - ${s.halaqah} (${s.nisn || 'Tanpa NISN'})
                        </div>
                    `).join('')}
                    ${data.students.length > 10 ? `<div class="text-sm text-slate-400 italic">... dan ${data.students.length - 10} santri lainnya</div>` : ''}
                </div>
            </div>
        </div>
    `;

    content.innerHTML = html;
    preview.classList.remove('hidden');
}

// Helper for fuzzy matching
function normalizeNameString(name) {
    if (!name) return '';
    // Replace multiple spaces/tabs/newlines/NBSP with single space, and trim
    return name.toLowerCase().replace(/[\s\u00A0]+/g, ' ').trim();
}

function inferLembagaFromKelas(kelasRaw) {
    const normalize = (typeof window.normalizeLembagaKey === 'function')
        ? window.normalizeLembagaKey
        : (v) => String(v || '').trim().toUpperCase();
    const kelasStr = String(kelasRaw || '').trim().toUpperCase();
    if (!kelasStr) return '';
    if (kelasStr.includes('MTA')) return normalize('MTA');
    if (kelasStr.includes('SDITA') || /\bSD\b/.test(kelasStr)) return normalize('SDITA');
    if (kelasStr.includes('SMPITA') || /\bSMP\b/.test(kelasStr)) return normalize('SMPITA');
    if (kelasStr.includes('SMAITA') || /\bSMA\b/.test(kelasStr)) return normalize('SMAITA');

    const match = kelasStr.match(/\d+/);
    if (!match) return '';
    const kelasNum = parseInt(match[0], 10);
    if (Number.isNaN(kelasNum)) return '';

    if (kelasNum >= 1 && kelasNum <= 6) return normalize('SDITA');
    if (kelasNum >= 7 && kelasNum <= 9) return normalize('SMPITA');
    if (kelasNum >= 10 && kelasNum <= 12) return normalize('SMAITA');
    return '';
}

function levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    // increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1  // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

function confirmImport() {
    if (!importedData) {
        console.error('[IMPORT] Tidak ada data yang di-import (importedData is null)');
        showNotification('❌ Tidak ada data untuk di-import. Harap pilih file kembali.', 'error');
        return;
    }

    try {
        showNotification('⏳ Memproses import santri...', 'info');
        console.log('[IMPORT] Starting confirmImport process...');

        let newHalaqahs = 0;
        let updatedHalaqahs = 0;
        let newStudents = 0;
        let updatedStudents = 0;

        // Calculate next ID for safe integer generation
        let nextId = (dashboardData.students || []).reduce((max, s) => {
            const id = parseInt(s.id);
            return !isNaN(id) && id < 1000000000 ? Math.max(max, id) : max;
        }, 0) + 1;
        if (nextId < 1) nextId = 1;

        const results = {
            success: [],
            failed: [...(importedData.errors || []).map(e => ({ ...e, type: 'parse_error' }))], 
            warnings: []
        };

        // Add file-level duplicates to warnings
        if (importedData.duplicates && importedData.duplicates.length > 0) {
            importedData.duplicates.forEach(d => {
                results.warnings.push({
                    nisn: d.nisn,
                    message: `NISN ${d.nisn} duplikat di baris: ${d.rows.join(', ')}. Data terakhir yang akan digunakan.`
                });
            });
        }

        // Import halaqahs - UPDATE or ADD
        (importedData.halaqahs || []).forEach(h => {
            const existing = (dashboardData.halaqahs || []).find(existing =>
                existing.name && h.name && existing.name.toLowerCase() === h.name.toLowerCase()
            );

            if (existing) {
                // UPDATE existing halaqah
                existing.guru = h.guru;
                existing.kelas = h.kelas;
                updatedHalaqahs++;
            } else {
                // ADD new halaqah
                dashboardData.halaqahs.push({
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    name: h.name,
                    points: 0,
                    rank: dashboardData.halaqahs.length + 1,
                    status: 'BARU',
                    members: h.members,
                    avgPoints: 0,
                    trend: 0,
                    guru: h.guru,
                    kelas: h.kelas
                });
                newHalaqahs++;
            }
        });

        // Import students - UPDATE or ADD
        (importedData.students || []).forEach(s => {
            let existing = null;

            // Priority 1: Match by NISN
            if (s.nisn && String(s.nisn).trim() !== '') {
                existing = (dashboardData.students || []).find(existing =>
                    existing.nisn && String(existing.nisn) === String(s.nisn)
                );
            }

            // Priority 2: Match by exact name
            if (!existing) {
                const sNameNorm = normalizeNameString(s.name);
                const nameMatches = (dashboardData.students || []).filter(existing =>
                    normalizeNameString(existing.name) === sNameNorm
                );
                if (nameMatches.length >= 1) {
                    existing = nameMatches[0];
                }
            }

            if (existing) {
                // UPDATE existing student
                existing.name = s.name.trim();
                if (s.halaqah) existing.halaqah = s.halaqah.trim();
                if (s.nisn && String(s.nisn).trim() !== '') existing.nisn = String(s.nisn).trim();
                if (s.nik && String(s.nik).trim() !== '') existing.nik = String(s.nik).trim();
                
                // Update lembaga hanya jika kolom Lembaga ada di file Excel.
                if (importedData.metadata && importedData.metadata.hasLembagaColumn) {
                    existing.lembaga = (typeof window.normalizeLembagaKey === 'function')
                        ? window.normalizeLembagaKey(s.lembaga)
                        : s.lembaga;
                }
                if (s.kelas) existing.kelas = s.kelas;
                if (s.jenis_kelamin) existing.jenis_kelamin = s.jenis_kelamin;
                if (s.tempat_lahir) existing.tempat_lahir = s.tempat_lahir;
                if (s.tanggal_lahir) existing.tanggal_lahir = s.tanggal_lahir;
                if (s.alamat) existing.alamat = s.alamat;
                if (s.hp) existing.hp = s.hp;
                if (s.nama_ayah) existing.nama_ayah = s.nama_ayah;
                if (s.nama_ibu) existing.nama_ibu = s.nama_ibu;
                if (s.sekolah_asal) existing.sekolah_asal = s.sekolah_asal;
                if (typeof s.is_alumni === 'boolean') existing.is_alumni = s.is_alumni;
                if (s.kategori) existing.kategori = s.kategori;

                updatedStudents++;
                results.success.push({ name: s.name, action: 'Updated' });
            } else {
                // ADD new student
                dashboardData.students.push({
                    id: nextId++,
                    name: s.name.trim(),
                    halaqah: s.halaqah ? s.halaqah.trim() : '',
                    nisn: s.nisn ? String(s.nisn).trim() : '',
                    nik: s.nik ? String(s.nik).trim() : '',
                    lembaga: (() => {
                        const raw = s.lembaga || '';
                        if (raw && typeof window.normalizeLembagaKey === 'function') {
                            return window.normalizeLembagaKey(raw);
                        }
                        return raw || inferLembagaFromKelas(s.kelas);
                    })(),
                    kelas: s.kelas || '',
                    jenis_kelamin: s.jenis_kelamin || '',
                    tempat_lahir: s.tempat_lahir || '',
                    tanggal_lahir: s.tanggal_lahir || '',
                    alamat: s.alamat || '',
                    hp: s.hp || '',
                    nama_ayah: s.nama_ayah || '',
                    nama_ibu: s.nama_ibu || '',
                    sekolah_asal: s.sekolah_asal || '',
                    is_alumni: !!s.is_alumni,
                    kategori: s.kategori || '',
                    total_points: 0,
                    daily_ranking: dashboardData.students.length + 1,
                    overall_ranking: dashboardData.students.length + 1,
                    streak: 0,
                    lastActivity: 'Baru ditambahkan',
                    achievements: [],
                    setoran: [],
                    lastSetoranDate: ''
                });
                newStudents++;
                results.success.push({ name: s.name, action: 'Created' });
            }
        });

        // Finalize state
        if (typeof recalculateRankings === 'function') recalculateRankings();
        StorageManager.save();

        // Close modal and show results
        closeModal();
        showImportResultModal(results, newHalaqahs, updatedHalaqahs, newStudents, updatedStudents);
        
        // SYNC TO SUPABASE
        if (navigator.onLine) {
            showNotification('☁️ Menyimpan data ke database server...', 'info');
            const syncPromises = [];
            if (typeof window.syncHalaqahsToSupabase === 'function') syncPromises.push(window.syncHalaqahsToSupabase());
            if (typeof window.syncStudentsToSupabase === 'function') syncPromises.push(window.syncStudentsToSupabase());

            if (syncPromises.length > 0) {
                Promise.all(syncPromises)
                    .then((results) => {
                        const studentResult = results.find(r => r && r.status);
                        if (studentResult && studentResult.status === 'skipped_in_progress') {
                            // Sync sedang berjalan, tunggu lalu retry
                            console.log('[IMPORT] Sync sedang berjalan, retry dalam 3 detik...');
                            setTimeout(() => {
                                if (typeof window.syncStudentsToSupabase === 'function') {
                                    window.syncStudentsToSupabase().then(r => {
                                        if (r && r.status === 'success') {
                                            showNotification('✅ Data berhasil tersimpan di server.', 'success');
                                        } else {
                                            showNotification('⚠️ Data tersimpan lokal. Akan dicoba sync ulang otomatis.', 'warning');
                                        }
                                    });
                                }
                            }, 3000);
                        } else {
                            console.log('[IMPORT] Sync completed successfully');
                            showNotification('✅ Data berhasil tersimpan di server.', 'success');
                        }
                        if (typeof refreshAllData === 'function') refreshAllData();
                    })
                    .catch(err => {
                        console.error('[IMPORT] Sync failed:', err);
                        showNotification('⚠️ Data tersimpan lokal, tapi GAGAL kirim ke server.', 'warning');
                        if (typeof refreshAllData === 'function') refreshAllData();
                    });
            } else {
                if (typeof refreshAllData === 'function') refreshAllData();
            }
        } else {
            if (typeof refreshAllData === 'function') refreshAllData();
        }

        // Clean up
        importedData = null;

    } catch (error) {
        console.error('[IMPORT] Error in confirmImport:', error);
        showNotification('❌ Terjadi kesalahan saat memproses data: ' + error.message, 'error');
    }
}

function showImportResultModal(results, newHalaqahs, updatedHalaqahs, newStudents, updatedStudents) {
    const failedCount = results.failed.length;
    const successCount = results.success.length;
    const warningCount = results.warnings ? results.warnings.length : 0;

    const content = `
        <div class="p-6">
            <div class="text-center mb-6">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-full ${failedCount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'} mb-4">
                    <span class="text-3xl">${failedCount > 0 ? '⚠️' : '✅'}</span>
                </div>
                <h3 class="text-2xl font-bold text-slate-800">Laporan Import</h3>
                <p class="text-slate-500">
                    Berhasil: <span class="font-bold text-green-600">${successCount}</span> | 
                    Gagal: <span class="font-bold text-red-600">${failedCount}</span>
                    ${warningCount > 0 ? ` | Peringatan: <span class="font-bold text-amber-600">${warningCount}</span>` : ''}
                </p>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div class="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">📚 Halaqah</div>
                    <div class="text-sm">Baru: <span class="font-bold">${newHalaqahs}</span></div>
                    <div class="text-sm">Update: <span class="font-bold">${updatedHalaqahs}</span></div>
                </div>
                <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div class="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">👥 Santri</div>
                    <div class="text-sm">Baru: <span class="font-bold">${newStudents}</span></div>
                    <div class="text-sm">Update: <span class="font-bold">${updatedStudents}</span></div>
                </div>
            </div>

            ${failedCount > 0 ? `
                <div class="mb-6">
                    <h4 class="font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <span class="text-red-500">❌</span> Baris Gagal (${failedCount})
                    </h4>
                    <div class="bg-red-50 border border-red-100 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-red-100 text-red-800 font-bold">
                                <tr>
                                    <th class="p-3 w-20">Baris</th>
                                    <th class="p-3">Masalah</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-red-200">
                                ${results.failed.map(f => `
                                    <tr>
                                        <td class="p-3 font-mono text-xs text-red-700 align-top">Row ${f.row}</td>
                                        <td class="p-3 text-red-800">
                                            ${f.name ? `<div class="font-bold">${f.name}</div>` : ''}
                                            <div class="opacity-90">${f.message}</div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            ` : ''}

            <button onclick="closeModal()" class="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors">
                Tutup Laporan
            </button>
        </div>
    `;

    createModal(content, false);
}

function cancelImport() {
    importedData = null;
    document.getElementById('excelPreview').classList.add('hidden');
    document.getElementById('excelFileInput').value = '';
}

function exportToExcel() {
    if (typeof XLSX === 'undefined') {
        showNotification('❌ Library Excel belum dimuat. Periksa koneksi internet.', 'error');
        return;
    }

    const data = [];

    // Header
    data.push(['Nama Halaqah', 'Guru Halaqah', 'Kelas', 'Nama Santri', 'NISN', 'NIK', 'Lembaga', 'Jenis Kelamin', 'Tempat Lahir', 'Tanggal Lahir', 'Alamat', 'HP Ortu', 'Nama Ayah', 'Nama Ibu', 'Sekolah Asal', 'Total Poin', 'Ranking', 'Hari Beruntun']);

    // Data rows
    dashboardData.students.forEach(student => {
        const halaqah = dashboardData.halaqahs.find(h =>
            h.name.includes(student.halaqah)
        );

        data.push([
            student.halaqah,
            halaqah?.guru || '',
            student.kelas || '',
            student.name,
            student.nisn || '',
            student.nik || '',
            student.lembaga || 'MTA',
            student.jenis_kelamin || '',
            student.tempat_lahir || '',
            student.tanggal_lahir || '',
            student.alamat || '',
            student.hp || '',
            student.nama_ayah || '',
            student.nama_ibu || '',
            student.sekolah_asal || '',
            student.total_points,
            student.overall_ranking,
            student.streak
        ]);
    });

    // Create Workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths (auto-width rough estimation)
    const wscols = data[0].map(() => ({ wch: 15 }));
    // Specific overrides
    wscols[0] = { wch: 20 }; // Halaqah
    wscols[3] = { wch: 30 }; // Nama
    wscols[4] = { wch: 15 }; // NISN
    wscols[5] = { wch: 20 }; // NIK
    wscols[10] = { wch: 30 }; // Alamat

    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, "Data Santri");

    // Download
    const fileName = `Data_Santri_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

    showNotification('📤 Data berhasil diexport ke Excel!');
}

// Make functions globally accessible
window.showImportExcel = showImportExcel;
window.downloadExcelTemplate = downloadExcelTemplate;
window.handleExcelUpload = handleExcelUpload;
window.confirmImport = confirmImport;
window.cancelImport = cancelImport;
window.exportToExcel = exportToExcel;
window.importFromSdApi = importFromSdApi;
window.importFromSmpApi = importFromSmpApi;
window.importFromSmaApi = importFromSmaApi;
window.importFromMtaApi = importFromMtaApi;
