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
                        <li>• <strong>NISN</strong>: Nomor Induk Siswa Nasional</li>
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
                    </ul>
                </div>
                
                <div class="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                    <h4 class="font-bold text-red-900 mb-2 flex items-center gap-2">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                        </svg>
                        Penting: Hindari Duplikat
                    </h4>
                    <ul class="text-sm text-red-800 space-y-1">
                        <li>• <strong>NISN wajib diisi</strong> untuk menghindari duplikat santri</li>
                        <li>• Jika ada 2+ santri dengan nama sama tanpa NISN, data akan dilewati</li>
                        <li>• Prioritas pencocokan: NISN > Nama</li>
                        <li>• Pastikan NISN unik untuk setiap santri</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    createModal(content);
}

let importedData = null;

function downloadExcelTemplate() {
    const template = [
        ['Nama Halaqah', 'Guru Halaqah', 'Kelas', 'Nama Santri', 'NISN', 'NIK', 'Lembaga'],
        ['Alim Aswari', 'Ustadz Alim', 'MTA 1', 'Abercio Nabil Arazzak', '2526.03.0001', '3201123456780001', 'MTA'],
        ['Alim Aswari', 'Ustadz Alim', 'MTA 1', 'Ahmad Fatih Rizqie Qetama', '2526.03.0002', '3201123456780002', 'MTA'],
        ['Alim Aswari', 'Ustadz Alim', 'MTA 1', 'Umar Zhafran Yazid', '2526.03.0003', '3201123456780003', 'MTA'],
        ['Harziki', 'Ustadz Harziki', 'MTA 3', 'Zyan Fitra', '2425.03.0007', '', 'MTA'],
        ['Harziki', 'Ustadz Harziki', 'MTA 3', 'Nizam Fahrezi', '2425.03.0008', '', 'MTA'],
        ['Naufal', 'Ustadz Naufal H', 'MTA 4', 'Hafiz Nuzril Ilham', '2223.03.0006', '', 'MTA']
    ];
    
    // Create CSV content
    const csvContent = template.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'Template_Halaqah_Santri.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('📥 Template Excel berhasil didownload!');
}

function handleExcelUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            
            if (jsonData.length < 2) {
                showNotification('❌ File Excel kosong atau tidak valid');
                return;
            }
            
            processExcelData(jsonData);
        } catch (error) {
            showNotification('❌ Error membaca file Excel: ' + error.message);
        }
    };
    
    reader.readAsBinaryString(file);
}

function processExcelData(data) {
    const headers = data[0];
    const rows = data.slice(1);
    
    // Validate headers
    const requiredHeaders = ['Nama Halaqah', 'Guru Halaqah', 'Kelas', 'Nama Santri', 'NISN', 'Lembaga'];
    const hasAllHeaders = requiredHeaders.every(h => 
        headers.some(header => header && header.toString().toLowerCase().includes(h.toLowerCase()))
    );
    
    if (!hasAllHeaders) {
        showNotification('❌ Format Excel tidak sesuai. Pastikan semua kolom ada.');
        return;
    }
    
    // Map column indices
    const colMap = {
        halaqah: headers.findIndex(h => h && h.toString().toLowerCase().includes('nama halaqah')),
        guru: headers.findIndex(h => h && h.toString().toLowerCase().includes('guru')),
        kelas: headers.findIndex(h => h && h.toString().toLowerCase().includes('kelas')),
        santri: headers.findIndex(h => h && h.toString().toLowerCase().includes('nama santri')),
        nisn: headers.findIndex(h => h && h.toString().toLowerCase().includes('nisn')),
        nik: headers.findIndex(h => h && h.toString().toLowerCase().includes('nik')),
        lembaga: headers.findIndex(h => h && h.toString().toLowerCase().includes('lembaga'))
    };
    
    // Process data
    const halaqahs = new Map();
    const students = [];
    
    rows.forEach((row, index) => {
        if (!row[colMap.santri]) return; // Skip empty rows
        
        const halaqahName = row[colMap.halaqah] || 'Unknown';
        const guruName = row[colMap.guru] || 'Unknown';
        const kelas = row[colMap.kelas] || '';
        
        // Add halaqah
        if (!halaqahs.has(halaqahName)) {
            halaqahs.set(halaqahName, {
                name: `Halaqah ${halaqahName}`,
                guru: guruName,
                kelas: kelas,
                members: 0
            });
        }
        
        // Add student
        students.push({
            name: row[colMap.santri],
            halaqah: halaqahName,
            nisn: row[colMap.nisn] || '',
            nik: (colMap.nik !== -1 ? row[colMap.nik] : '') || '',
            lembaga: row[colMap.lembaga] || 'MTA',
            kelas: kelas
        });
        
        halaqahs.get(halaqahName).members++;
    });
    
    importedData = {
        halaqahs: Array.from(halaqahs.values()),
        students: students
    };
    
    showPreview(importedData);
}

function showPreview(data) {
    const preview = document.getElementById('excelPreview');
    const content = document.getElementById('previewContent');
    
    if (!preview || !content) return;
    
    let html = `
        <div class="space-y-4">
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
                            • ${s.name} - ${s.halaqah} (${s.nisn})
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

function confirmImport() {
    if (!importedData) return;
    
    let newHalaqahs = 0;
    let updatedHalaqahs = 0;
    let newStudents = 0;
    let updatedStudents = 0;
    let skippedStudents = 0;
    
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
        
        // Priority 1: Match by NISN (if NISN exists and not empty)
        if (s.nisn && s.nisn.trim() !== '') {
            existing = dashboardData.students.find(existing => 
                existing.nisn && existing.nisn === s.nisn
            );
        }
        
        // Priority 2: If no NISN match, check by exact name match
        if (!existing) {
            const nameMatches = dashboardData.students.filter(existing => 
                existing.name.toLowerCase().trim() === s.name.toLowerCase().trim()
            );
            
            // If multiple students with same name, skip to avoid wrong update
            if (nameMatches.length > 1) {
                console.warn(`Multiple students found with name "${s.name}". Skipping to avoid wrong update. Please use unique NISN.`);
                skippedStudents++;
                return; // Skip this student
            } else if (nameMatches.length === 1) {
                existing = nameMatches[0];
            }
        }
        
        if (existing) {
            // UPDATE existing student
            existing.name = s.name.trim();
            existing.halaqah = s.halaqah.trim();
            // Only update NISN if new NISN is not empty
            if (s.nisn && s.nisn.trim() !== '') {
                existing.nisn = s.nisn.trim();
            }
            // Update NIK if provided
            if (s.nik && s.nik.toString().trim() !== '') {
                existing.nik = s.nik.toString().trim();
            }
            existing.lembaga = s.lembaga;
            existing.kelas = s.kelas;
            updatedStudents++;
        } else {
            // ADD new student
            dashboardData.students.push({
                id: Date.now() + Math.floor(Math.random() * 1000),
                name: s.name.trim(),
                halaqah: s.halaqah.trim(),
                nisn: s.nisn ? s.nisn.trim() : '',
                nik: s.nik ? s.nik.toString().trim() : '',
                lembaga: s.lembaga,
                kelas: s.kelas,
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
        }
    });
    
    recalculateRankings();
    StorageManager.save();
    if (window.autoSync) autoSync();
    
    closeModal();
    refreshAllData();
    
    // Show detailed notification
    const messages = [];
    if (newHalaqahs > 0) messages.push(`${newHalaqahs} halaqah baru`);
    if (updatedHalaqahs > 0) messages.push(`${updatedHalaqahs} halaqah diupdate`);
    if (newStudents > 0) messages.push(`${newStudents} santri baru`);
    if (updatedStudents > 0) messages.push(`${updatedStudents} santri diupdate`);
    if (skippedStudents > 0) messages.push(`${skippedStudents} santri dilewati (nama duplikat tanpa NISN)`);
    
    showNotification(`✅ Import berhasil: ${messages.join(', ')}!`);
    importedData = null;
}

function cancelImport() {
    importedData = null;
    document.getElementById('excelPreview').classList.add('hidden');
    document.getElementById('excelFileInput').value = '';
}

function exportToExcel() {
    const data = [];
    
    // Header
    data.push(['Nama Halaqah', 'Guru Halaqah', 'Kelas', 'Nama Santri', 'NISN', 'Lembaga', 'Total Poin', 'Ranking', 'Hari Beruntun']);
    
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
            student.lembaga || 'MTA',
            student.total_points,
            student.overall_ranking,
            student.streak
        ]);
    });
    
    // Create CSV
    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `Export_Halaqah_${date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('📤 Data berhasil diexport!');
}

// Make functions globally accessible
window.showImportExcel = showImportExcel;
window.downloadExcelTemplate = downloadExcelTemplate;
window.handleExcelUpload = handleExcelUpload;
window.confirmImport = confirmImport;
window.cancelImport = cancelImport;
window.exportToExcel = exportToExcel;
