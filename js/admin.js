// Admin Settings Module - Part 1

function showAdminSettings() {
    if (typeof currentProfile === 'undefined' || !currentProfile || currentProfile.role !== 'admin') {
        if (typeof showNotification === 'function') {
            showNotification('⛔ Akses ditolak. Hanya admin yang bisa mengakses halaman ini.', 'error');
        } else {
            alert('⛔ Akses ditolak. Hanya admin yang bisa mengakses halaman ini.');
        }
        return;
    }

    const santriList = dashboardData.students.map(student => {
        const studentJson = JSON.stringify(student).replace(/"/g, '&quot;');
        return `
            <div class="santri-admin-item flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors" data-name="${student.name.toLowerCase()}">
                <div class="flex-1">
                    <div class="font-semibold text-slate-800">${student.name}</div>
                    <div class="text-xs text-slate-500">Halaqah ${student.halaqah} • ${student.total_points} poin • Rank #${student.overall_ranking}</div>
                </div>
                <div class="flex gap-2">
                    <button onclick='closeModal(); showEditStudentForm(${studentJson}, true)' 
                        class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button onclick="confirmDeleteStudent(${student.id}, true)" 
                        class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    const halaqahList = dashboardData.halaqahs.map(halaqah => {
        const halaqahJson = JSON.stringify(halaqah).replace(/"/g, '&quot;');
        return `
            <div class="halaqah-admin-item flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors" data-name="${halaqah.name.toLowerCase()}">
                <div class="flex-1">
                    <div class="font-semibold text-slate-800">${halaqah.name}</div>
                    <div class="text-xs text-slate-500">${halaqah.members} anggota • ${halaqah.points} poin • Rank #${halaqah.rank}</div>
                </div>
                <div class="flex gap-2">
                    <button onclick='closeModal(); showEditHalaqahForm(${halaqahJson})' 
                        class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button onclick="confirmDeleteHalaqah(${halaqah.id})" 
                        class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    const sesiList = appSettings.sesiHalaqah.map((sesi) => `
        <div class="bg-slate-50 rounded-xl p-4">
            <div class="flex items-center justify-between mb-3">
                <div class="font-bold text-slate-800">${sesi.name}</div>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" ${sesi.active ? 'checked' : ''} 
                        onchange="toggleSesi(${sesi.id})" class="sr-only peer">
                    <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="text-xs text-slate-600 font-bold">Waktu Mulai</label>
                    <input type="time" value="${sesi.startTime}" 
                        onchange="updateSesiTime(${sesi.id}, 'start', this.value)"
                        class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                </div>
                <div>
                    <label class="text-xs text-slate-600 font-bold">Waktu Selesai</label>
                    <input type="time" value="${sesi.endTime}" 
                        onchange="updateSesiTime(${sesi.id}, 'end', this.value)"
                        class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                </div>
            </div>
        </div>
    `).join('');
    
    const lembagaList = Object.keys(appSettings.lembaga).map(key => {
        const l = appSettings.lembaga[key];
        return `
            <div class="bg-slate-50 rounded-xl p-4">
                <div class="font-bold text-slate-800 mb-3">${l.name}</div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="text-xs text-slate-600 font-bold">Baris/Halaman</label>
                        <input type="number" value="${l.barisPerHalaman}" min="1"
                            onchange="updateLembaga('${key}', 'barisPerHalaman', this.value)"
                            class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                    </div>
                    <div>
                        <label class="text-xs text-slate-600 font-bold">Target Baris</label>
                        <input type="number" value="${l.targetBaris}" min="1"
                            onchange="updateLembaga('${key}', 'targetBaris', this.value)"
                            class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                    </div>
                    <div>
                        <label class="text-xs text-slate-600 font-bold"></div>`n                </div>`n                <div class="mt-3 text-xs text-slate-500 bg-blue-50 p-2 rounded">`n                    ? Poin dihitung dari kondisi setoran (tepat waktu, lancar, capai target), bukan dari jumlah baris`n                </div>`n            </div>
        `;
    }).join('');

    const content = `
        <div class="p-8">
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="font-display font-bold text-3xl text-slate-800 mb-2">⚙️ Pengaturan Admin</h2>
                    <p class="text-slate-500">Kelola lembaga, sesi halaqah, santri, dan halaqah</p>
                </div>
                <button onclick="closeModal()" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <div class="flex gap-2 mb-6 border-b border-slate-200 overflow-x-auto">
                <button onclick="switchAdminTab('santri')" id="tab-santri" class="admin-tab active px-4 py-2 font-bold text-sm border-b-2 border-primary-600 text-primary-600 whitespace-nowrap">
                    Kelola Santri
                </button>
                <button onclick="switchAdminTab('halaqah')" id="tab-halaqah" class="admin-tab px-4 py-2 font-bold text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-700 whitespace-nowrap">
                    Kelola Halaqah
                </button>
                <button onclick="switchAdminTab('import')" id="tab-import" class="admin-tab px-4 py-2 font-bold text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-700 whitespace-nowrap">
                    Import/Export
                </button>
                <button onclick="switchAdminTab('sesi')" id="tab-sesi" class="admin-tab px-4 py-2 font-bold text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-700 whitespace-nowrap">
                    Sesi Halaqah
                </button>
                <button onclick="switchAdminTab('lembaga')" id="tab-lembaga" class="admin-tab px-4 py-2 font-bold text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-700 whitespace-nowrap">
                    Lembaga
                </button>
                <button onclick="switchAdminTab('data')" id="tab-data" class="admin-tab px-4 py-2 font-bold text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-700 whitespace-nowrap">
                    Hapus Data
                </button>
            </div>
            
            <div class="space-y-6">
                <div id="content-santri" class="admin-tab-content">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-bold text-xl text-slate-800">Kelola Santri</h3>
                        <div class="flex gap-2">
                            <button onclick="showBulkAddStudents()" 
                                class="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors text-sm">
                                ➕ Tambah Massal
                            </button>
                            <button onclick="closeModal(); showAddStudentForm()" 
                                class="px-4 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-colors text-sm">
                                ➕ Tambah Santri
                            </button>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <input type="text" id="searchSantriAdmin" placeholder="Cari santri..." 
                            oninput="filterAdminList('santri', this.value)"
                            class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none">
                    </div>
                    
                    <div class="bg-slate-50 rounded-lg p-3 mb-3">
                        <div class="text-sm text-slate-600">
                            Total: <span class="font-bold text-slate-800">${dashboardData.students.length} santri</span>
                        </div>
                    </div>
                    
                    <div class="space-y-2 max-h-96 overflow-y-auto custom-scrollbar" id="santriAdminList">
                        ${santriList}
                    </div>
                </div>

                <div id="content-halaqah" class="admin-tab-content hidden">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-bold text-xl text-slate-800">Kelola Halaqah</h3>
                        <div class="flex gap-2">
                            <button onclick="showBulkAddHalaqahs()" 
                                class="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors text-sm">
                                ➕ Tambah Massal
                            </button>
                            <button onclick="closeModal(); showAddHalaqahForm()" 
                                class="px-4 py-2 bg-accent-teal text-white rounded-lg font-bold hover:bg-accent-teal/90 transition-colors text-sm">
                                ➕ Tambah Halaqah
                            </button>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <input type="text" id="searchHalaqahAdmin" placeholder="Cari halaqah..." 
                            oninput="filterAdminList('halaqah', this.value)"
                            class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none">
                    </div>
                    
                    <div class="bg-slate-50 rounded-lg p-3 mb-3">
                        <div class="text-sm text-slate-600">
                            Total: <span class="font-bold text-slate-800">${dashboardData.halaqahs.length} halaqah</span>
                        </div>
                    </div>
                    
                    <div class="space-y-2 max-h-96 overflow-y-auto custom-scrollbar" id="halaqahAdminList">
                        ${halaqahList}
                    </div>
                </div>
                
                <div id="content-import" class="admin-tab-content hidden">
                    <h3 class="font-bold text-xl text-slate-800 mb-4">Import & Export Data</h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <button onclick="closeModal(); showImportExcel()" 
                            class="flex flex-col items-center gap-3 p-6 bg-green-50 border-2 border-green-200 rounded-2xl hover:bg-green-100 transition-colors">
                            <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                            <div class="text-center">
                                <div class="font-bold text-green-800 text-lg">📥 Import Excel</div>
                                <div class="text-sm text-green-600 mt-1">Upload file Excel untuk import data</div>
                            </div>
                        </button>
                        
                        <button onclick="exportToExcel()" 
                            class="flex flex-col items-center gap-3 p-6 bg-blue-50 border-2 border-blue-200 rounded-2xl hover:bg-blue-100 transition-colors">
                            <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <div class="text-center">
                                <div class="font-bold text-blue-800 text-lg">📤 Export Excel</div>
                                <div class="text-sm text-blue-600 mt-1">Download semua data ke Excel</div>
                            </div>
                        </button>
                    </div>
                    
                    <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <h4 class="font-bold text-amber-900 mb-2 flex items-center gap-2">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                            </svg>
                            Informasi Import/Export
                        </h4>
                        <ul class="text-sm text-amber-800 space-y-1">
                            <li>• <strong>Import Excel</strong>: Upload file Excel dengan format template untuk menambah/update data santri dan halaqah</li>
                            <li>• <strong>Export Excel</strong>: Download semua data santri, halaqah, poin, dan ranking ke file Excel</li>
                            <li>• <strong>Aturan Import</strong>: Data baru akan ditambahkan, data yang sudah ada akan diupdate (prioritas: NISN > Nama)</li>
                            <li>• <strong>Poin & Setoran</strong>: Tidak akan berubah saat update, hanya info santri (halaqah, kelas, lembaga) yang diupdate</li>
                            <li>• <strong>NISN Wajib</strong>: Isi NISN untuk menghindari duplikat santri dengan nama sama</li>
                            <li>• Format file: .xlsx atau .csv</li>
                        </ul>
                    </div>
                </div>
                
                <div id="content-sesi" class="admin-tab-content hidden">
                    <h3 class="font-bold text-xl text-slate-800 mb-4">Sesi Halaqah</h3>
                    <div class="space-y-3">
                        ${sesiList}
                    </div>
                </div>
                
                <div id="content-lembaga" class="admin-tab-content hidden">
                    <h3 class="font-bold text-xl text-slate-800 mb-4">Pengaturan Lembaga</h3>
                    <div class="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                        ${lembagaList}
                    </div>
                </div>
                
                <div id="content-data" class="admin-tab-content hidden">
                    <div class="bg-red-50 border border-red-200 rounded-xl p-6">
                        <h4 class="font-bold text-red-800 mb-2 flex items-center gap-2 text-xl">
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                            </svg>
                            Zona Bahaya
                        </h4>
                        <p class="text-sm text-red-700 mb-4">Tindakan berikut tidak dapat dibatalkan!</p>
                        <button onclick="confirmDeleteAllData()" 
                            class="w-full bg-red-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors">
                            🗑️ Hapus Semua Data
                        </button>
                    </div>
                </div>
                
                <div class="flex gap-3 pt-4 border-t border-slate-200">
                    <button onclick="resetSettings()" 
                        class="px-6 py-3 rounded-xl font-bold text-amber-600 hover:bg-amber-50 transition-colors">
                        Reset Pengaturan
                    </button>
                    <button onclick="showDebugPanel()" 
                        class="px-6 py-3 rounded-xl font-bold text-blue-600 hover:bg-blue-50 transition-colors">
                        🔍 Debug Panel
                    </button>
                    <button onclick="closeModal()" 
                        class="flex-1 bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors">
                        Selesai
                    </button>
                </div>
            </div>
        </div>
    `;
    
    createModal(content);
}

// Render Admin Settings Inline (not modal)
function renderAdminSettings(force = false) {
    const container = document.getElementById('settingsContainer');
    if (!container) return;
    
    // Use same content generation as showAdminSettings but without modal wrapper
    const content = generateAdminSettingsContent();
    container.innerHTML = content;
}

// Generate admin settings content (reusable)
function generateAdminSettingsContent() {
    const santriList = dashboardData.students.map(student => {
        const studentJson = JSON.stringify(student).replace(/"/g, '&quot;');
        return `
            <div class="santri-admin-item flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors" data-name="${student.name.toLowerCase()}">
                <div class="flex-1">
                    <div class="font-semibold text-slate-800">${student.name}</div>
                    <div class="text-xs text-slate-500">Halaqah ${student.halaqah} • ${student.total_points} poin • Rank #${student.overall_ranking}</div>
                </div>
                <div class="flex gap-2">
                    <button onclick='showEditStudentForm(${studentJson}, false)' 
                        class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button onclick="confirmDeleteStudent(${student.id}, false)" 
                        class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    const halaqahList = dashboardData.halaqahs.map(halaqah => {
        const halaqahJson = JSON.stringify(halaqah).replace(/"/g, '&quot;');
        return `
            <div class="halaqah-admin-item flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors" data-name="${halaqah.name.toLowerCase()}">
                <div class="flex-1">
                    <div class="font-semibold text-slate-800">${halaqah.name}</div>
                    <div class="text-xs text-slate-500">${halaqah.members} anggota • ${halaqah.points} poin • Rank #${halaqah.rank}</div>
                </div>
                <div class="flex gap-2">
                    <button onclick='showEditHalaqahForm(${halaqahJson})' 
                        class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button onclick="confirmDeleteHalaqah(${halaqah.id})" 
                        class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    const sesiList = appSettings.sesiHalaqah.map((sesi) => `
        <div class="bg-slate-50 rounded-xl p-4">
            <div class="flex items-center justify-between mb-3">
                <div class="font-bold text-slate-800">${sesi.name}</div>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" ${sesi.active ? 'checked' : ''} 
                        onchange="toggleSesi(${sesi.id})" class="sr-only peer">
                    <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="text-xs text-slate-600 font-bold">Waktu Mulai</label>
                    <input type="time" value="${sesi.startTime}" 
                        onchange="updateSesiTime(${sesi.id}, 'start', this.value)"
                        class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                </div>
                <div>
                    <label class="text-xs text-slate-600 font-bold">Waktu Selesai</label>
                    <input type="time" value="${sesi.endTime}" 
                        onchange="updateSesiTime(${sesi.id}, 'end', this.value)"
                        class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                </div>
            </div>
        </div>
    `).join('');
    
    const lembagaList = Object.keys(appSettings.lembaga).map(key => {
        const l = appSettings.lembaga[key];
        return `
            <div class="bg-slate-50 rounded-xl p-4">
                <div class="font-bold text-slate-800 mb-3">${l.name}</div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="text-xs text-slate-600 font-bold">Baris/Halaman</label>
                        <input type="number" value="${l.barisPerHalaman}" min="1"
                            onchange="updateLembaga('${key}', 'barisPerHalaman', this.value)"
                            class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                    </div>
                    <div>
                        <label class="text-xs text-slate-600 font-bold">Target Baris</label>
                        <input type="number" value="${l.targetBaris}" min="1"
                            onchange="updateLembaga('${key}', 'targetBaris', this.value)"
                            class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                    </div>
                    <div>
                        <label class="text-xs text-slate-600 font-bold"></div>`n                </div>`n                <div class="mt-3 text-xs text-slate-500 bg-blue-50 p-2 rounded">`n                    ? Poin dihitung dari kondisi setoran (tepat waktu, lancar, capai target), bukan dari jumlah baris`n                </div>`n            </div>
        `;
    }).join('');

    return `
        <div class="glass rounded-3xl p-8 border border-slate-200 shadow-sm">
            <div class="flex items-center justify-between mb-6">
                <h3 class="font-display font-bold text-2xl text-slate-800 flex items-center gap-2">
                    <span class="w-2 h-8 bg-slate-500 rounded-full"></span>
                    ⚙️ Pengaturan Admin
                </h3>
            </div>
            
            <div class="flex gap-2 mb-6 border-b border-slate-200 overflow-x-auto">
                <button onclick="switchAdminTabInline('santri')" id="tab-inline-santri" class="admin-tab-inline active px-4 py-2 font-bold text-sm border-b-2 border-primary-600 text-primary-600 whitespace-nowrap">
                    Kelola Santri
                </button>
                <button onclick="switchAdminTabInline('halaqah')" id="tab-inline-halaqah" class="admin-tab-inline px-4 py-2 font-bold text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-700 whitespace-nowrap">
                    Kelola Halaqah
                </button>
                <button onclick="switchAdminTabInline('import')" id="tab-inline-import" class="admin-tab-inline px-4 py-2 font-bold text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-700 whitespace-nowrap">
                    Import/Export
                </button>
                <button onclick="switchAdminTabInline('sesi')" id="tab-inline-sesi" class="admin-tab-inline px-4 py-2 font-bold text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-700 whitespace-nowrap">
                    Sesi Halaqah
                </button>
                <button onclick="switchAdminTabInline('lembaga')" id="tab-inline-lembaga" class="admin-tab-inline px-4 py-2 font-bold text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-700 whitespace-nowrap">
                    Lembaga
                </button>
                <button onclick="switchAdminTabInline('data')" id="tab-inline-data" class="admin-tab-inline px-4 py-2 font-bold text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-700 whitespace-nowrap">
                    Hapus Data
                </button>
            </div>
            
            <div class="space-y-6">
                <div id="content-inline-santri" class="admin-tab-inline-content">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="font-bold text-xl text-slate-800">Kelola Santri</h4>
                        <div class="flex gap-2">
                            <button onclick="showImportExcel()" 
                                class="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors text-sm">
                                ➕ Tambah Massal
                            </button>
                            <button onclick="showAddStudentForm()" 
                                class="px-4 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-colors text-sm">
                                ➕ Tambah Santri
                            </button>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <input type="text" id="searchSantriAdminInline" placeholder="Cari santri..." 
                            oninput="filterAdminListInline('santri', this.value)"
                            class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none">
                    </div>
                    
                    <div class="bg-slate-50 rounded-lg p-3 mb-3">
                        <div class="text-sm text-slate-600">
                            Total: <span class="font-bold text-slate-800">${dashboardData.students.length} santri</span>
                        </div>
                    </div>
                    
                    <div class="space-y-2 max-h-96 overflow-y-auto custom-scrollbar" id="santriAdminListInline">
                        ${santriList}
                    </div>
                </div>

                <div id="content-inline-halaqah" class="admin-tab-inline-content hidden">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="font-bold text-xl text-slate-800">Kelola Halaqah</h4>
                        <div class="flex gap-2">
                            <button onclick="showImportExcel()" 
                                class="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors text-sm">
                                ➕ Tambah Massal
                            </button>
                            <button onclick="showAddHalaqahForm()" 
                                class="px-4 py-2 bg-accent-teal text-white rounded-lg font-bold hover:bg-accent-teal/90 transition-colors text-sm">
                                ➕ Tambah Halaqah
                            </button>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <input type="text" id="searchHalaqahAdminInline" placeholder="Cari halaqah..." 
                            oninput="filterAdminListInline('halaqah', this.value)"
                            class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none">
                    </div>
                    
                    <div class="bg-slate-50 rounded-lg p-3 mb-3">
                        <div class="text-sm text-slate-600">
                            Total: <span class="font-bold text-slate-800">${dashboardData.halaqahs.length} halaqah</span>
                        </div>
                    </div>
                    
                    <div class="space-y-2 max-h-96 overflow-y-auto custom-scrollbar" id="halaqahAdminListInline">
                        ${halaqahList}
                    </div>
                </div>
                
                <div id="content-inline-import" class="admin-tab-inline-content hidden">
                    <h4 class="font-bold text-xl text-slate-800 mb-4">Import & Export Data</h4>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <button onclick="showImportExcel()" 
                            class="flex flex-col items-center gap-3 p-6 bg-green-50 border-2 border-green-200 rounded-2xl hover:bg-green-100 transition-colors">
                            <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                            <div class="text-center">
                                <div class="font-bold text-green-800 text-lg">📥 Import Excel</div>
                                <div class="text-sm text-green-600 mt-1">Upload file Excel untuk import data</div>
                            </div>
                        </button>
                        
                        <button onclick="exportToExcel()" 
                            class="flex flex-col items-center gap-3 p-6 bg-blue-50 border-2 border-blue-200 rounded-2xl hover:bg-blue-100 transition-colors">
                            <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <div class="text-center">
                                <div class="font-bold text-blue-800 text-lg">📤 Export Excel</div>
                                <div class="text-sm text-blue-600 mt-1">Download semua data ke Excel</div>
                            </div>
                        </button>
                    </div>
                    
                    <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <h5 class="font-bold text-amber-900 mb-2 flex items-center gap-2">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                            </svg>
                            Informasi Import/Export
                        </h5>
                        <ul class="text-sm text-amber-800 space-y-1">
                            <li>• <strong>Import Excel</strong>: Upload file Excel dengan format template untuk menambah/update data santri dan halaqah</li>
                            <li>• <strong>Export Excel</strong>: Download semua data santri, halaqah, poin, dan ranking ke file Excel</li>
                            <li>• <strong>Aturan Import</strong>: Data baru akan ditambahkan, data yang sudah ada akan diupdate (prioritas: NISN > Nama)</li>
                            <li>• <strong>Poin & Setoran</strong>: Tidak akan berubah saat update, hanya info santri (halaqah, kelas, lembaga) yang diupdate</li>
                            <li>• <strong>NISN Wajib</strong>: Isi NISN untuk menghindari duplikat santri dengan nama sama</li>
                            <li>• Format file: .xlsx atau .csv</li>
                        </ul>
                    </div>
                </div>
                
                <div id="content-inline-sesi" class="admin-tab-inline-content hidden">
                    <h4 class="font-bold text-xl text-slate-800 mb-4">Sesi Halaqah</h4>
                    <div class="space-y-3">
                        ${sesiList}
                    </div>
                </div>
                
                <div id="content-inline-lembaga" class="admin-tab-inline-content hidden">
                    <h4 class="font-bold text-xl text-slate-800 mb-4">Pengaturan Lembaga</h4>
                    <div class="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                        ${lembagaList}
                    </div>
                </div>
                
                <div id="content-inline-data" class="admin-tab-inline-content hidden">
                    <div class="bg-red-50 border border-red-200 rounded-xl p-6">
                        <h5 class="font-bold text-red-800 mb-2 flex items-center gap-2 text-xl">
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                            </svg>
                            Zona Bahaya
                        </h5>
                        <p class="text-sm text-red-700 mb-4">Tindakan berikut tidak dapat dibatalkan!</p>
                        <button onclick="confirmDeleteAllData()" 
                            class="w-full bg-red-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors">
                            🗑️ Hapus Semua Data
                        </button>
                    </div>
                </div>
                
                <div class="flex gap-3 pt-4 border-t border-slate-200">
                    <button onclick="resetSettings()" 
                        class="px-6 py-3 rounded-xl font-bold text-amber-600 hover:bg-amber-50 transition-colors">
                        Reset Pengaturan
                    </button>
                </div>
            </div>
        </div>
    `;
}

function switchAdminTabInline(tab) {
    document.querySelectorAll('.admin-tab-inline').forEach(btn => {
        btn.classList.remove('active', 'border-primary-600', 'text-primary-600');
        btn.classList.add('border-transparent', 'text-slate-500');
    });
    
    const activeTab = document.getElementById(`tab-inline-${tab}`);
    if (activeTab) {
        activeTab.classList.add('active', 'border-primary-600', 'text-primary-600');
        activeTab.classList.remove('border-transparent', 'text-slate-500');
    }
    
    document.querySelectorAll('.admin-tab-inline-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    const activeContent = document.getElementById(`content-inline-${tab}`);
    if (activeContent) {
        activeContent.classList.remove('hidden');
    }
}

function filterAdminListInline(type, searchTerm) {
    const items = document.querySelectorAll(`.${type}-admin-item`);
    const search = searchTerm.toLowerCase();
    
    items.forEach(item => {
        const name = item.getAttribute('data-name');
        if (name.includes(search)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Bulk Add Students - Using Excel Import
function showBulkAddStudents() {
    showImportExcel();
}

// Bulk Add Halaqahs - Using Excel Import  
function showBulkAddHalaqahs() {
    showImportExcel();
}


// Helper Functions
function toggleSesi(sesiId) {
    const sesi = appSettings.sesiHalaqah.find(s => s.id === sesiId);
    if (sesi) {
        sesi.active = !sesi.active;
        saveSettings();
        showNotification(`Sesi ${sesi.name} ${sesi.active ? 'diaktifkan' : 'dinonaktifkan'}`);
    }
}

function updateSesiTime(sesiId, type, value) {
    const sesi = appSettings.sesiHalaqah.find(s => s.id === sesiId);
    if (sesi) {
        if (type === 'start') {
            sesi.startTime = value;
        } else {
            sesi.endTime = value;
        }
        saveSettings();
        showNotification('⏰ Waktu sesi diperbarui');
    }
}

function updateLembaga(key, field, value) {
    if (appSettings.lembaga[key]) {
        appSettings.lembaga[key][field] = parseInt(value);
        saveSettings();
        showNotification('✅ Pengaturan lembaga diperbarui');
    }
}

function resetSettings() {
    if (confirm('Reset semua pengaturan ke default? Ini tidak akan menghapus data santri.')) {
        localStorage.removeItem('appSettings');
        location.reload();
    }
}

function switchAdminTab(tab) {
    document.querySelectorAll('.admin-tab').forEach(btn => {
        btn.classList.remove('active', 'border-primary-600', 'text-primary-600');
        btn.classList.add('border-transparent', 'text-slate-500');
    });
    
    const activeTab = document.getElementById(`tab-${tab}`);
    if (activeTab) {
        activeTab.classList.add('active', 'border-primary-600', 'text-primary-600');
        activeTab.classList.remove('border-transparent', 'text-slate-500');
    }
    
    document.querySelectorAll('.admin-tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    const activeContent = document.getElementById(`content-${tab}`);
    if (activeContent) {
        activeContent.classList.remove('hidden');
    }
}

function filterAdminList(type, searchTerm) {
    const items = document.querySelectorAll(`.${type}-admin-item`);
    const search = searchTerm.toLowerCase();
    
    items.forEach(item => {
        const name = item.getAttribute('data-name');
        if (name.includes(search)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function confirmDeleteHalaqah(halaqahId) {
    console.log('confirmDeleteHalaqah called with ID:', halaqahId);
    
    const halaqah = dashboardData.halaqahs.find(h => h.id === halaqahId);
    if (!halaqah) {
        console.error('Halaqah not found with ID:', halaqahId);
        return;
    }
    
    console.log('Halaqah found:', halaqah);
    
    const membersCount = dashboardData.students.filter(s => 
        s.halaqah === halaqah.name.replace('Halaqah ', '')
    ).length;
    
    console.log('Members count:', membersCount);
    
    if (membersCount > 0) {
        if (!confirm(`Halaqah ${halaqah.name} memiliki ${membersCount} anggota. Yakin ingin menghapus? Semua santri di halaqah ini akan kehilangan referensi halaqah mereka.`)) {
            console.log('Delete cancelled by user');
            return;
        }
    } else {
        if (!confirm(`Yakin ingin menghapus ${halaqah.name}?`)) {
            console.log('Delete cancelled by user');
            return;
        }
    }
    
    console.log('Deleting halaqah...');
    
    // Set flag to prevent realtime listener from reloading
    window.deleteOperationInProgress = true;
    
    // Delete from Supabase first
    if (window.deleteHalaqahFromSupabase) {
        console.log('Calling deleteHalaqahFromSupabase...');
        deleteHalaqahFromSupabase(halaqahId).then(() => {
            // After Supabase delete completes, delete locally
            performLocalHalaqahDelete(halaqahId, halaqah);
        }).catch((error) => {
            console.error('Supabase delete failed:', error);
            window.deleteOperationInProgress = false;
            // Do NOT delete locally if Supabase fails
        });
    } else {
        // If Supabase not available, just delete locally
        performLocalHalaqahDelete(halaqahId, halaqah);
    }
}

function performLocalHalaqahDelete(halaqahId, halaqah) {
    console.log('Performing local delete...');
    
    // Delete from local data
    dashboardData.halaqahs = dashboardData.halaqahs.filter(h => h.id !== halaqahId);
    
    const halaqahName = halaqah.name.replace('Halaqah ', '');
    dashboardData.students.forEach(student => {
        if (student.halaqah === halaqahName) {
            student.halaqah = 'Tidak Ada';
        }
    });
    
    console.log('Recalculating rankings...');
    recalculateRankings();
    
    console.log('Saving to storage...');
    StorageManager.save();
    
    console.log('Refreshing all data...');
    refreshAllData();
    
    // Update list tanpa refresh modal
    console.log('Updating admin lists...');
    if (typeof updateAdminHalaqahList === 'function') {
        updateAdminHalaqahList();
    }
    if (typeof updateAdminSantriList === 'function') {
        updateAdminSantriList();
    }
    
    // Update inline lists if they exist
    if (typeof updateAdminHalaqahListInline === 'function') {
        updateAdminHalaqahListInline();
    }
    if (typeof updateAdminSantriListInline === 'function') {
        updateAdminSantriListInline();
    }
    
    // Clear the delete flag after a delay
    setTimeout(() => {
        window.deleteOperationInProgress = false;
        console.log('Delete operation completed');
    }, 2000);
    
    console.log('Delete halaqah completed');
}

async function confirmDeleteAllData() {
    const confirmation = prompt(
        `⚠️ PERINGATAN KERAS!\n\nAnda akan menghapus SEMUA data santri, halaqah, dan setoran.\nTindakan ini TIDAK DAPAT DIBATALKAN!\n\nKetik "HAPUS SEMUA" untuk konfirmasi:`
    );
    
    if (confirmation === 'HAPUS SEMUA') {
        console.log('=== DELETE ALL DATA ===');
        
        // Set flag to prevent realtime listener from reloading
        window.deleteOperationInProgress = true;
        
        // Delete from Supabase first
        let supabaseSuccess = true;
        if (window.deleteAllStudentsFromSupabase && window.deleteAllHalaqahsFromSupabase) {
            console.log('Deleting all data from Supabase...');
            
            // Delete students first
            const studentsDeleted = await deleteAllStudentsFromSupabase();
            // Delete halaqahs
            const halaqahsDeleted = await deleteAllHalaqahsFromSupabase();
            
            supabaseSuccess = studentsDeleted && halaqahsDeleted;
            
            if (supabaseSuccess) {
                console.log('✅ All data deleted from Supabase');
            } else {
                console.warn('⚠️ Some Supabase deletes failed, continuing with local delete');
            }
        }
        
        // Delete from local storage
        console.log('Deleting local data...');
        dashboardData.students = [];
        dashboardData.halaqahs = [];
        dashboardData.stats = {
            totalStudents: 0,
            totalHalaqahs: 0,
            totalPoints: 0,
            avgPointsPerStudent: 0
        };
        
        StorageManager.save();
        
        console.log('Refreshing UI...');
        refreshAllData();
        
        // Update lists tanpa refresh modal
        if (typeof updateAdminSantriList === 'function') {
            updateAdminSantriList();
        }
        if (typeof updateAdminHalaqahList === 'function') {
            updateAdminHalaqahList();
        }
        
        // Update inline lists if they exist
        if (typeof updateAdminSantriListInline === 'function') {
            updateAdminSantriListInline();
        }
        if (typeof updateAdminHalaqahListInline === 'function') {
            updateAdminHalaqahListInline();
        }
        
        // Clear the delete flag after a delay
        setTimeout(() => {
            window.deleteOperationInProgress = false;
            console.log('Delete all operation completed');
        }, 3000);
        
        console.log('✅ All data deleted successfully');
    } else if (confirmation !== null) {
        // User salah ketik, tidak perlu notifikasi
    }
}

function showPoinRulesInfo() {
    const content = `
        <div class="p-8">
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="font-display font-bold text-3xl text-slate-800 mb-2">📜 Aturan Poin</h2>
                    <p class="text-slate-500">Sistem penilaian setoran hafalan</p>
                </div>
                <button onclick="closeModal()" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <div class="space-y-4">
                <div class="bg-green-50 border-l-4 border-green-500 rounded-xl p-4">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-3xl font-bold text-green-600">+2</span>
                        <span class="font-bold text-green-800">POIN</span>
                    </div>
                    <ul class="text-sm text-green-700 space-y-1">
                        <li>✅ TEPAT WAKTU (sesuai sesi)</li>
                        <li>✅ LANCAR (tidak ada salah)</li>
                        <li>✅ CAPAI TARGET (sesuai lembaga)</li>
                    </ul>
                </div>
                
                <div class="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-4">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-3xl font-bold text-amber-600">+1</span>
                        <span class="font-bold text-amber-800">POIN</span>
                    </div>
                    <ul class="text-sm text-amber-700 space-y-1">
                        <li>✅ TEPAT WAKTU (sesuai sesi)</li>
                        <li>⚠️ TIDAK LANCAR (maksimal 3 salah)</li>
                        <li>✅ CAPAI TARGET (sesuai lembaga)</li>
                    </ul>
                </div>
                
                <div class="bg-slate-50 border-l-4 border-slate-400 rounded-xl p-4">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-3xl font-bold text-slate-600">0</span>
                        <span class="font-bold text-slate-800">POIN</span>
                    </div>
                    <div class="text-sm text-slate-700 space-y-2">
                        <div>
                            <div class="font-bold mb-1">Kondisi 1:</div>
                            <ul class="space-y-1 ml-4">
                                <li>✅ TEPAT WAKTU</li>
                                <li>✅ LANCAR</li>
                                <li>❌ TIDAK CAPAI TARGET</li>
                            </ul>
                        </div>
                        <div class="border-t border-slate-200 pt-2">
                            <div class="font-bold mb-1">Kondisi 2:</div>
                            <ul class="space-y-1 ml-4">
                                <li>❌ TIDAK TEPAT WAKTU</li>
                                <li>✅ LANCAR</li>
                                <li>✅ CAPAI TARGET</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="bg-red-50 border-l-4 border-red-500 rounded-xl p-4">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-3xl font-bold text-red-600">-1</span>
                        <span class="font-bold text-red-800">POIN</span>
                    </div>
                    <ul class="text-sm text-red-700 space-y-1">
                        <li>❌ TIDAK SETOR sama sekali</li>
                    </ul>
                </div>
            </div>
            
            <div class="mt-6 pt-4 border-t border-slate-200">
                <button onclick="closeModal()" 
                    class="w-full bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors">
                    Mengerti
                </button>
            </div>
        </div>
    `;
    
    createModal(content);
}

// Export functions
window.showAdminSettings = showAdminSettings;
window.showBulkAddStudents = showBulkAddStudents;
window.showBulkAddHalaqahs = showBulkAddHalaqahs;
window.toggleSesi = toggleSesi;
window.updateSesiTime = updateSesiTime;
window.updateLembaga = updateLembaga;
window.resetSettings = resetSettings;
window.switchAdminTab = switchAdminTab;
window.filterAdminList = filterAdminList;
window.confirmDeleteHalaqah = confirmDeleteHalaqah;
window.performLocalHalaqahDelete = performLocalHalaqahDelete;
window.confirmDeleteAllData = confirmDeleteAllData;
window.showPoinRulesInfo = showPoinRulesInfo;


// Update admin lists without refreshing modal
function updateAdminSantriList() {
    const container = document.getElementById('santriAdminList');
    if (!container) return;
    
    const santriList = dashboardData.students.map(student => {
        const studentJson = JSON.stringify(student).replace(/"/g, '&quot;');
        return `
            <div class="santri-admin-item flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors" data-name="${student.name.toLowerCase()}">
                <div class="flex-1">
                    <div class="font-semibold text-slate-800">${student.name}</div>
                    <div class="text-xs text-slate-500">Halaqah ${student.halaqah} • ${student.total_points} poin • Rank #${student.overall_ranking}</div>
                </div>
                <div class="flex gap-2">
                    <button onclick='closeModal(); showEditStudentForm(${studentJson}, true)' 
                        class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button onclick="confirmDeleteStudent(${student.id}, true)" 
                        class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = santriList;
    
    // Update total count
    const totalEl = container.previousElementSibling?.querySelector('.font-bold');
    if (totalEl) {
        totalEl.textContent = `${dashboardData.students.length} santri`;
    }
}

function updateAdminHalaqahList() {
    const container = document.getElementById('halaqahAdminList');
    if (!container) return;
    
    const halaqahList = dashboardData.halaqahs.map(halaqah => {
        const halaqahJson = JSON.stringify(halaqah).replace(/"/g, '&quot;');
        return `
            <div class="halaqah-admin-item flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors" data-name="${halaqah.name.toLowerCase()}">
                <div class="flex-1">
                    <div class="font-semibold text-slate-800">${halaqah.name}</div>
                    <div class="text-xs text-slate-500">${halaqah.members} anggota • ${halaqah.points} poin • Rank #${halaqah.rank}</div>
                </div>
                <div class="flex gap-2">
                    <button onclick='closeModal(); showEditHalaqahForm(${halaqahJson})' 
                        class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button onclick="confirmDeleteHalaqah(${halaqah.id})" 
                        class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = halaqahList;
    
    // Update total count
    const totalEl = container.previousElementSibling?.querySelector('.font-bold');
    if (totalEl) {
        totalEl.textContent = `${dashboardData.halaqahs.length} halaqah`;
    }
}

window.updateAdminSantriList = updateAdminSantriList;
window.updateAdminHalaqahList = updateAdminHalaqahList;
window.renderAdminSettings = renderAdminSettings;
window.switchAdminTabInline = switchAdminTabInline;
window.filterAdminListInline = filterAdminListInline;

// Update inline admin lists (for when data changes while viewing inline)
function updateAdminSantriListInline() {
    const container = document.getElementById('santriAdminListInline');
    if (!container) return;
    
    const santriList = dashboardData.students.map(student => {
        const studentJson = JSON.stringify(student).replace(/"/g, '&quot;');
        return `
            <div class="santri-admin-item flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors" data-name="${student.name.toLowerCase()}">
                <div class="flex-1">
                    <div class="font-semibold text-slate-800">${student.name}</div>
                    <div class="text-xs text-slate-500">Halaqah ${student.halaqah} • ${student.total_points} poin • Rank #${student.overall_ranking}</div>
                </div>
                <div class="flex gap-2">
                    <button onclick='showEditStudentForm(${studentJson}, false)' 
                        class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button onclick="confirmDeleteStudent(${student.id}, false)" 
                        class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = santriList;
}

function updateAdminHalaqahListInline() {
    const container = document.getElementById('halaqahAdminListInline');
    if (!container) return;
    
    const halaqahList = dashboardData.halaqahs.map(halaqah => {
        const halaqahJson = JSON.stringify(halaqah).replace(/"/g, '&quot;');
        return `
            <div class="halaqah-admin-item flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors" data-name="${halaqah.name.toLowerCase()}">
                <div class="flex-1">
                    <div class="font-semibold text-slate-800">${halaqah.name}</div>
                    <div class="text-xs text-slate-500">${halaqah.members} anggota • ${halaqah.points} poin • Rank #${halaqah.rank}</div>
                </div>
                <div class="flex gap-2">
                    <button onclick='showEditHalaqahForm(${halaqahJson})' 
                        class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button onclick="confirmDeleteHalaqah(${halaqah.id})" 
                        class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = halaqahList;
}

window.updateAdminSantriListInline = updateAdminSantriListInline;
window.updateAdminHalaqahListInline = updateAdminHalaqahListInline;

