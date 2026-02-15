// Excel Import/Export Module
// Using SheetJS (xlsx) library for Excel handling

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
}

let importedData = null;

function downloadExcelTemplate() {
    if (typeof XLSX === 'undefined') {
        showNotification('❌ Library Excel belum dimuat. Periksa koneksi internet.', 'error');
        return;
    }

    const template = [
        ['Nama Halaqah', 'Guru Halaqah', 'Kelas', 'Nama Santri', 'NISN', 'NIK', 'Lembaga', 'Jenis Kelamin', 'Tempat Lahir', 'Tanggal Lahir', 'Alamat', 'HP', 'Nama Ayah', 'Nama Ibu', 'Sekolah Asal'],
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

function handleExcelUpload(event) {
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

    // Map column indices with flexible matching
    const findCol = (keywords) => headers.findIndex(h => {
        if (!h) return false;
        const headerStr = h.toString().toLowerCase();
        return keywords.some(k => headerStr.includes(k));
    });

    const colMap = {
        halaqah: findCol(['nama halaqah', 'halaqah', 'kelompok']),
        guru: findCol(['guru', 'ustadz', 'musyrif', 'pembimbing']),
        kelas: findCol(['kelas', 'tingkat']),
        santri: headers.findIndex(h => {
            if (!h) return false;
            const str = h.toString().toLowerCase();
            // Specific keywords
            if (['nama santri', 'nama lengkap', 'nama siswa', 'santri', 'siswa', 'murid'].some(k => str.includes(k))) return true;
            // Generic 'nama' but exclude conflicting columns
            if (str.includes('nama') &&
                !str.includes('halaqah') &&
                !str.includes('guru') &&
                !str.includes('ustadz') &&
                !str.includes('ayah') &&
                !str.includes('ibu') &&
                !str.includes('wali') &&
                !str.includes('sekolah')) return true;
            return false;
        }),
        nisn: findCol(['nisn']),
        nik: findCol(['nik', 'ktp']),
        lembaga: findCol(['lembaga', 'sekolah', 'jenjang']),
        // New fields
        jenis_kelamin: findCol(['jenis kelamin', 'jk', 'l/p', 'gender']),
        tempat_lahir: findCol(['tempat lahir']),
        tanggal_lahir: findCol(['tanggal lahir', 'tgl lahir']),
        // Combined TTL column support
        ttl: findCol(['ttl', 'tempat tanggal lahir', 'tempat, tanggal lahir']),
        alamat: findCol(['alamat']),
        hp: findCol(['hp', 'no hp', 'wa', 'whatsapp', 'telepon']),
        nama_ayah: findCol(['nama ayah', 'ayah']),
        nama_ibu: findCol(['nama ibu', 'ibu']),
        sekolah_asal: findCol(['sekolah asal', 'asal sekolah'])
    };

    console.log('[DEBUG] Column mapping:', colMap);
    console.log('[DEBUG] Tanggal Lahir column index:', colMap.tanggal_lahir);

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

        const halaqahName = row[colMap.halaqah] || 'Unknown';
        const guruName = row[colMap.guru] || 'Unknown';
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
        if (halaqahName !== 'Unknown' && !halaqahs.has(halaqahName)) {
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
                    // Heuristic: if contains digits it's likely a date, else place
                    if (/\d/.test(raw)) {
                        if (!derivedTanggalLahir) derivedTanggalLahir = formatDate(raw);
                    } else {
                        if (!derivedTempatLahir) derivedTempatLahir = raw;
                    }
                }
            }
            console.log(`[DEBUG] Parsed TTL combined at row ${rowNum}:`, { raw: ttlCombined, tempat: derivedTempatLahir, tanggal: derivedTanggalLahir });
        }

        // Add student data to processing list
        students.push({
            rowNum: rowNum, // Store for error reporting later
            name: String(santriName).trim(),
            halaqah: halaqahName !== 'Unknown' ? halaqahName : '',
            nisn: nisn,
            nik: (colMap.nik !== -1 && row[colMap.nik]) ? String(row[colMap.nik]).trim() : '',
            lembaga: (colMap.lembaga !== -1 ? row[colMap.lembaga] : '') || 'MTA',
            kelas: kelas,
            // New fields
            jenis_kelamin: (colMap.jenis_kelamin !== -1 && row[colMap.jenis_kelamin]) ? String(row[colMap.jenis_kelamin]).trim() : '',
            tempat_lahir: derivedTempatLahir,
            tanggal_lahir: derivedTanggalLahir,
            alamat: (colMap.alamat !== -1 && row[colMap.alamat]) ? String(row[colMap.alamat]).trim() : '',

            // Debug Log for TTL
            _debug_ttl_raw: {
                tempat: row[colMap.tempat_lahir],
                tanggal: row[colMap.tanggal_lahir],
                ttl_combined: ttlCombined
            },
            hp: (colMap.hp !== -1 && row[colMap.hp]) ? String(row[colMap.hp]).trim() : '',
            nama_ayah: (colMap.nama_ayah !== -1 && row[colMap.nama_ayah]) ? String(row[colMap.nama_ayah]).trim() : '',
            nama_ibu: (colMap.nama_ibu !== -1 && row[colMap.nama_ibu]) ? String(row[colMap.nama_ibu]).trim() : '',
            sekolah_asal: (colMap.sekolah_asal !== -1 && row[colMap.sekolah_asal]) ? String(row[colMap.sekolah_asal]).trim() : ''
        });

        if (halaqahName !== 'Unknown' && halaqahs.has(halaqahName)) {
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
            hasTTLCombined: colMap.ttl !== -1
        }
    };

    showPreview(importedData);
}

function showPreview(data) {
    const preview = document.getElementById('excelPreview');
    const content = document.getElementById('previewContent');

    if (!preview || !content) return;

    let warningHtml = '';
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
    if (!importedData) return;

    let newHalaqahs = 0;
    let updatedHalaqahs = 0;
    let newStudents = 0;
    let updatedStudents = 0;

    // Detailed Result Tracking
    const results = {
        success: [],
        failed: [...importedData.errors.map(e => ({ ...e, type: 'parse_error' }))], // Include parse errors
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
    importedData.halaqahs.forEach(h => {
        const existing = dashboardData.halaqahs.find(existing =>
            existing.name.toLowerCase() === h.name.toLowerCase()
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

    // Import students - UPDATE or ADD with better duplicate detection
    importedData.students.forEach(s => {
        let existing = null;
        let fuzzyMatched = false;

        // Priority 1: Match by NISN (if NISN exists and not empty)
        if (s.nisn && s.nisn.trim() !== '') {
            existing = dashboardData.students.find(existing =>
                existing.nisn && existing.nisn === s.nisn
            );
        }

        // Priority 2: If no NISN match, check by exact name match (with normalization)
        if (!existing) {
            const sNameNorm = normalizeNameString(s.name);
            const nameMatches = dashboardData.students.filter(existing =>
                normalizeNameString(existing.name) === sNameNorm
            );

            // If multiple students with same name, skip to avoid wrong update
            if (nameMatches.length > 1) {
                results.failed.push({
                    row: s.rowNum,
                    name: s.name,
                    message: "Ditemukan >1 santri dengan nama sama di database. Mohon lengkapi NISN untuk membedakan."
                });
                return; // Skip this student
            } else if (nameMatches.length === 1) {
                existing = nameMatches[0];
            }
        }

        // Priority 3: Fuzzy Name Match (Levenshtein Distance)
        if (!existing) {
            // Only attempt fuzzy match for names with decent length to avoid false positives
            if (s.name.length >= 5) {
                const sNameNorm = normalizeNameString(s.name);
                const potentialMatches = dashboardData.students.map(existing => {
                    const existingNameNorm = normalizeNameString(existing.name);
                    const dist = levenshteinDistance(sNameNorm, existingNameNorm);
                    return { student: existing, distance: dist };
                }).filter(item => {
                    // Allow max 2 edits for normal names, or 3 for very long names (>15 chars)
                    const maxDist = item.student.name.length > 15 ? 3 : 2;
                    return item.distance <= maxDist;
                });

                if (potentialMatches.length === 1) {
                    // Single strong candidate found
                    existing = potentialMatches[0].student;
                    fuzzyMatched = true;

                    results.warnings.push({
                        message: `Fuzzy Match: Mencocokkan "${s.name}" dengan "${existing.name}" di database (Baris ${s.rowNum}).`
                    });
                }
            }
        }

        if (existing) {
            // UPDATE existing student
            if (!fuzzyMatched) {
                existing.name = s.name.trim(); // Update name only if not fuzzy matched (to preserve DB name preference if desired, or update it?)
                // Actually, usually we want to update to the latest name from Excel if it's a correction. 
                // But for fuzzy match, it might be a typo in Excel. Let's keep the DB name for fuzzy matches unless user wants otherwise.
                // Or better: Update it, but log it. The user seems to imply Excel is the source.
                // "Afroz Darussalam Arafzar" (Excel) vs "Arafsar" (DB).
                // Let's update it to match Excel, as Excel is usually the import source.
                existing.name = s.name.trim();
            } else {
                // For fuzzy match, let's update the name too, assuming Excel is the correction source.
                // But let's log the name change implicitly via the success message if needed.
                existing.name = s.name.trim();
            }

            if (s.halaqah) existing.halaqah = s.halaqah.trim();
            // Only update NISN if new NISN is not empty
            if (s.halaqah) existing.halaqah = s.halaqah.trim();
            // Only update NISN if new NISN is not empty
            if (s.nisn && s.nisn.trim() !== '') {
                existing.nisn = s.nisn.trim();
            }
            // Update NIK if provided
            if (s.nik && s.nik.toString().trim() !== '') {
                existing.nik = s.nik.toString().trim();
            }
            if (s.lembaga !== 'MTA' || (s.lembaga === 'MTA' && importedData.metadata && importedData.metadata.hasLembagaColumn)) {
                existing.lembaga = s.lembaga;
            }
            if (s.kelas) existing.kelas = s.kelas;

            // Update new fields - Only if provided in Excel (non-empty) to avoid wiping existing data
            if (s.jenis_kelamin) existing.jenis_kelamin = s.jenis_kelamin;

            if (s.tempat_lahir) {
                console.log(`[DEBUG] Updating Tempat Lahir for ${s.name}: ${s.tempat_lahir}`);
                existing.tempat_lahir = s.tempat_lahir;
            }

            if (s.tanggal_lahir) {
                console.log(`[DEBUG] Updating Tanggal Lahir for ${s.name}: ${s.tanggal_lahir}`);
                existing.tanggal_lahir = s.tanggal_lahir;
            }

            if (s.alamat) existing.alamat = s.alamat;
            if (s.hp) existing.hp = s.hp;
            if (s.nama_ayah) existing.nama_ayah = s.nama_ayah;
            if (s.nama_ibu) existing.nama_ibu = s.nama_ibu;
            if (s.sekolah_asal) existing.sekolah_asal = s.sekolah_asal;

            updatedStudents++;
            results.success.push({ name: s.name, action: 'Updated' });
        } else {
            // Check required fields for NEW student
            if (!s.halaqah || s.halaqah === '') {
                // Skip if new student but missing halaqah info (likely partial update file)
                results.failed.push({
                    row: s.rowNum,
                    name: s.name,
                    message: "Santri baru wajib memiliki Nama Halaqah."
                });
                return;
            }

            // ADD new student
            dashboardData.students.push({
                id: Date.now() + Math.floor(Math.random() * 1000),
                name: s.name.trim(),
                halaqah: s.halaqah.trim(),
                nisn: s.nisn ? s.nisn.trim() : '',
                nik: s.nik ? s.nik.toString().trim() : '',
                lembaga: s.lembaga,
                kelas: s.kelas,
                // New fields
                jenis_kelamin: s.jenis_kelamin || '',
                tempat_lahir: s.tempat_lahir || (console.log(`[DEBUG] No Tempat Lahir for new student ${s.name}`), ''),
                tanggal_lahir: s.tanggal_lahir || (console.log(`[DEBUG] No Tanggal Lahir for new student ${s.name}`), ''),
                alamat: s.alamat || '',
                hp: s.hp || '',
                nama_ayah: s.nama_ayah || '',
                nama_ibu: s.nama_ibu || '',
                sekolah_asal: s.sekolah_asal || '',

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

    recalculateRankings();
    StorageManager.save();
    if (window.autoSync) autoSync();

    closeModal();
    refreshAllData();

    // Show detailed Result Report
    showImportResultModal(results, newHalaqahs, updatedHalaqahs, newStudents, updatedStudents);
    importedData = null;
}

function showImportResultModal(results, newH, updH, newS, updS) {
    const failedCount = results.failed.length;
    const successCount = results.success.length;
    const warningCount = results.warnings ? results.warnings.length : 0;

    let content = `
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
                <div class="bg-blue-50 p-4 rounded-xl text-center">
                    <div class="text-2xl font-bold text-blue-700">${newS}</div>
                    <div class="text-xs text-blue-600 uppercase font-bold">Santri Baru</div>
                </div>
                <div class="bg-purple-50 p-4 rounded-xl text-center">
                    <div class="text-2xl font-bold text-purple-700">${updS}</div>
                    <div class="text-xs text-purple-600 uppercase font-bold">Update Data</div>
                </div>
            </div>

            ${warningCount > 0 ? `
                <div class="mb-4">
                    <h4 class="font-bold text-amber-800 mb-2 flex items-center gap-2">
                        <span>⚠️</span> Peringatan (${warningCount})
                    </h4>
                    <div class="bg-amber-50 border border-amber-100 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                        <table class="w-full text-left text-sm">
                            <tbody class="divide-y divide-amber-200">
                                ${results.warnings.map(w => `
                                    <tr>
                                        <td class="p-3 text-amber-800">
                                            <div class="opacity-90">${w.message}</div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            ` : ''}

            ${failedCount > 0 ? `
                <div class="mb-6">
                    <h4 class="font-bold text-red-800 mb-2 flex items-center gap-2">
                        <span>❌</span> Detail Masalah (${failedCount})
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
    data.push(['Nama Halaqah', 'Guru Halaqah', 'Kelas', 'Nama Santri', 'NISN', 'NIK', 'Lembaga', 'Jenis Kelamin', 'Tempat Lahir', 'Tanggal Lahir', 'Alamat', 'HP', 'Nama Ayah', 'Nama Ibu', 'Sekolah Asal', 'Total Poin', 'Ranking', 'Hari Beruntun']);

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
