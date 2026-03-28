// Admin Settings Module - Part 1

function getSchoolBreakPanelHtml() {
    const sb = appSettings.schoolBreak;
    const active = sb && sb.start && sb.end;
    const inRange = typeof isSchoolBreakActive === 'function' && isSchoolBreakActive();
    return `
        <div class="bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-200 rounded-xl p-4 mb-4">
            <h4 class="font-bold text-slate-800 mb-1">📅 Libur sekolah (semua lembaga)</h4>
            <p class="text-xs text-slate-600 mb-3">Atur rentang tanggal libur (misalnya libur semester). Selama periode ini, tracking absensi dan penalty tidak berlaku.</p>
            <div class="flex flex-wrap gap-3 items-end">
                <div>
                    <label class="text-xs font-bold text-slate-600 block mb-1">Mulai</label>
                    <input type="date" data-school-break="start" value="${active ? sb.start : ''}"
                        class="school-break-input px-3 py-2 rounded-lg border border-slate-200 text-sm">
                </div>
                <div>
                    <label class="text-xs font-bold text-slate-600 block mb-1">Selesai</label>
                    <input type="date" data-school-break="end" value="${active ? sb.end : ''}"
                        class="school-break-input px-3 py-2 rounded-lg border border-slate-200 text-sm">
                </div>
                <button type="button" onclick="applySchoolBreak()"
                    class="px-4 py-2 bg-sky-600 text-white rounded-lg font-bold text-sm hover:bg-sky-700 transition-colors">
                    Simpan
                </button>
                <button type="button" onclick="clearSchoolBreak()"
                    class="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors">
                    Hapus
                </button>
            </div>
            ${active ? `<p class="text-xs mt-3 ${inRange ? 'text-sky-800 font-bold' : 'text-slate-500'}">Terjadwal: ${sb.start} s/d ${sb.end}${inRange ? ' — hari ini termasuk libur' : ''}</p>` : '<p class="text-xs mt-2 text-slate-500">Belum ada jadwal libur sekolah.</p>'}
        </div>
    `;
}

function refreshAdminSettingsUi() {
    if (document.getElementById('settingsContainer')) {
        renderAdminSettings(true);
    } else if (document.getElementById('detailModal') && typeof showAdminSettings === 'function') {
        closeModal();
        showAdminSettings();
    }
}

/** Modal admin + panel Pengaturan di dashboard bisa ada bersamaan; getElementById ambil input salah (kosong). */
function getSchoolBreakInputElements() {
    const modal = document.getElementById('detailModal');
    if (modal) {
        const start = modal.querySelector('[data-school-break="start"]');
        const end = modal.querySelector('[data-school-break="end"]');
        if (start && end) return { start, end };
    }
    const settingsWrap = document.getElementById('settingsContainer');
    if (settingsWrap) {
        const start = settingsWrap.querySelector('[data-school-break="start"]');
        const end = settingsWrap.querySelector('[data-school-break="end"]');
        if (start && end) return { start, end };
    }
    const start = document.querySelector('[data-school-break="start"]');
    const end = document.querySelector('[data-school-break="end"]');
    return { start, end };
}

function applySchoolBreak() {
    const { start: startEl, end: endEl } = getSchoolBreakInputElements();
    const start = startEl?.value?.trim();
    const end = endEl?.value?.trim();
    if (!start || !end) {
        showNotification('Isi tanggal mulai dan tanggal selesai', 'warning');
        return;
    }
    if (start > end) {
        showNotification('Tanggal mulai harus sebelum atau sama dengan tanggal selesai', 'warning');
        return;
    }
    appSettings.schoolBreak = { start, end };
    saveSettings();
    showNotification('Libur sekolah disimpan. Semua lembaga dianggap libur pada rentang ini.', 'success');
    refreshAdminSettingsUi();
    if (typeof refreshAllData === 'function') refreshAllData();
}

function clearSchoolBreak() {
    if (!appSettings.schoolBreak) {
        showNotification('Tidak ada jadwal libur sekolah', 'info');
        return;
    }
    if (!confirm('Hapus jadwal libur sekolah? Absensi akan normal lagi setelah tanggal hari ini di luar rentang (atau segera jika dihapus).')) return;
    appSettings.schoolBreak = null;
    saveSettings();
    showNotification('Jadwal libur sekolah dihapus', 'info');
    refreshAdminSettingsUi();
    if (typeof refreshAllData === 'function') refreshAllData();
}

window.getSchoolBreakPanelHtml = getSchoolBreakPanelHtml;
window.applySchoolBreak = applySchoolBreak;
window.clearSchoolBreak = clearSchoolBreak;

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
        // Format birth date if exists
        const birthDate = student.tanggal_lahir ? new Date(student.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

        return `
            <div class="santri-admin-item flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors" data-name="${student.name.toLowerCase()} ${student.nik ? student.nik : ''}">
                <div class="flex-1">
                    <div class="font-semibold text-slate-800">${student.name}</div>
                    <div class="text-xs text-slate-500">Halaqah ${student.halaqah} • ${student.total_points} poin • Rank #${student.overall_ranking}</div>
                    ${(student.nik || birthDate) ? `
                    <div class="text-[10px] text-slate-400 mt-0.5 flex gap-2">
                        ${student.nik ? `<span class="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">NIK: ${student.nik}</span>` : ''}
                        ${birthDate ? `<span class="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">🎂 ${birthDate}</span>` : ''}
                    </div>` : ''}
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

    // Default to first lembaga
    const firstLembagaKey = Object.keys(appSettings.lembaga)[0] || 'MTA';
    const sesiList = renderAdminSesiList(firstLembagaKey);

    // Generate Data Induk Table Rows
    const dataIndukRows = dashboardData.students.map((student, index) => {
        const birthDate = student.tanggal_lahir ? new Date(student.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

        // Status checks
        const hasNIK = !!student.nik;
        const hasTTL = !!student.tanggal_lahir;
        const isReady = hasNIK && hasTTL;

        return `
            <tr class="hover:bg-slate-50 border-b border-slate-100 text-sm">
                <td class="px-4 py-3 text-slate-500">${index + 1}</td>
                <td class="px-4 py-3 font-mono text-slate-600">${student.nisn || '-'}</td>
                <td class="px-4 py-3 font-mono text-slate-600">
                    ${student.nik || '-'}
                    ${!hasNIK ? '<span class="ml-1 text-xs text-red-500" title="Wajib untuk login">(Missing)</span>' : ''}
                </td>
                <td class="px-4 py-3 font-semibold text-slate-800">${student.name}</td>
                <td class="px-4 py-3 text-slate-600">${student.jenis_kelamin || '-'}</td>
                <td class="px-4 py-3 text-slate-600">
                    ${(() => {
                const birthDate = student.tanggal_lahir ? new Date(student.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
                const parts = [];
                if (student.tempat_lahir) parts.push(student.tempat_lahir);
                if (birthDate) parts.push(birthDate);
                return parts.length > 0 ? parts.join(', ') : '-';
            })()}
                    ${!hasTTL ? '<span class="ml-1 text-xs text-red-500" title="Wajib untuk password">(Missing TTL)</span>' : ''}
                </td>
                <td class="px-4 py-3 text-slate-600 max-w-xs truncate" title="${student.alamat || ''}">${student.alamat || '-'}</td>
                <td class="px-4 py-3 text-slate-600">
                    <div class="text-xs">Ayah: ${student.nama_ayah || '-'}</div>
                    <div class="text-xs">Ibu: ${student.nama_ibu || '-'}</div>
                </td>
                <td class="px-4 py-3 text-center">
                    ${isReady
                ? '<span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Siap Login</span>'
                : '<span class="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Data Kurang</span>'}
                </td>
            </tr>
        `;
    }).join('');

    // Generate Verification Stats
    const totalStudents = dashboardData.students.length;
    const readyStudents = dashboardData.students.filter(s => s.nik && s.tanggal_lahir).length;
    const missingData = totalStudents - readyStudents;
    const uniqueNiks = new Set(dashboardData.students.filter(s => s.nik).map(s => s.nik)).size;
    const duplicateNiks = dashboardData.students.filter(s => s.nik).length - uniqueNiks;

    // Add Verification Summary at top of Data Induk Tab
    const verificationSummary = `
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div class="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Santri</div>
                <div class="text-2xl font-black text-slate-800">${totalStudents}</div>
            </div>
            <div class="bg-green-50 p-4 rounded-xl border border-green-200 shadow-sm">
                <div class="text-green-600 text-xs font-bold uppercase tracking-wider mb-1">Siap Login (Akun)</div>
                <div class="text-2xl font-black text-green-700">${readyStudents}</div>
                <div class="text-xs text-green-600 mt-1">NIK & TTL Lengkap</div>
            </div>
            <div class="bg-red-50 p-4 rounded-xl border border-red-200 shadow-sm">
                <div class="text-red-600 text-xs font-bold uppercase tracking-wider mb-1">Data Kurang</div>
                <div class="text-2xl font-black text-red-700">${missingData}</div>
                <div class="text-xs text-red-600 mt-1">Belum bisa login</div>
            </div>
             <div class="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-sm">
                <div class="text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">Duplikasi NIK</div>
                <div class="text-2xl font-black text-amber-700">${duplicateNiks}</div>
                <div class="text-xs text-amber-600 mt-1">Perlu diperbaiki</div>
            </div>
        </div>
    `;

    // Generate lembaga options for dropdown
    const lembagaOptions = Object.keys(appSettings.lembaga).map(key =>
        `<option value="${key}">${appSettings.lembaga[key].name}</option>`
    ).join('');

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
                </div>
                <div class="mt-4 pt-3 border-t border-slate-200">
                    <button onclick="toggleHoliday('${key}')" id="btn-holiday-${key}"
                        class="w-full py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all transform hover:scale-[1.02] active:scale-[0.98] ${isHoliday(key) ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600'}">
                        ${isHoliday(key) ? '🎉 SEDANG LIBUR (Klik untuk Masuk)' : '📅 Setel Libur Hari Ini'}
                    </button>
                    <p class="text-[10px] text-slate-500 mt-2 text-center">Libur akan otomatis mematikan tracking absensi & penalty poin.</p>
                </div>
            </div>
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
                <button onclick="switchAdminTab('datainduk')" id="tab-datainduk" class="admin-tab px-4 py-2 font-bold text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-700 whitespace-nowrap">
                    🗃️ Data Induk
                </button>
                <button onclick="switchAdminTab('halaqah')" id="tab-halaqah" class="admin-tab px-4 py-2 font-bold text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-700 whitespace-nowrap">
                    Kelola Halaqah
                </button>
                <button onclick="switchAdminTab('autopoin')" id="tab-autopoin" class="admin-tab px-4 py-2 font-bold text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-700 whitespace-nowrap">
                    ⚡ Auto Poin
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
                <button onclick="switchAdminTab('danger-zone')" id="tab-danger-zone" class="admin-tab px-4 py-2 font-bold text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-700 whitespace-nowrap">
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

                <div id="content-datainduk" class="admin-tab-content hidden">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-bold text-xl text-slate-800">Data Induk Santri (Lengkap)</h3>
                        <button onclick="exportToExcel()" class="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors text-sm">
                            📥 Download Excel
                        </button>
                    </div>
                    
                    <div class="mb-3">
                        <input type="text" placeholder="Cari di data induk..." 
                            oninput="const term = this.value.toLowerCase(); document.querySelectorAll('#dataIndukTableBody tr').forEach(row => { row.style.display = row.innerText.toLowerCase().includes(term) ? '' : 'none'; })"
                            class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none">
                    </div>

                    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <div class="overflow-x-auto max-h-[500px]">
                            <table class="w-full text-left border-collapse relative">
                                <thead class="sticky top-0 z-10">
                                    <tr class="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold shadow-sm">
                                        <th class="px-4 py-3 bg-slate-50">No</th>
                                        <th class="px-4 py-3 bg-slate-50">NISN</th>
                                        <th class="px-4 py-3 bg-slate-50">NIK</th>
                                        <th class="px-4 py-3 bg-slate-50">Nama Lengkap</th>
                                        <th class="px-4 py-3 bg-slate-50">L/P</th>
                                        <th class="px-4 py-3 bg-slate-50">TTL</th>
                                        <th class="px-4 py-3 bg-slate-50">Alamat</th>
                                        <th class="px-4 py-3 bg-slate-50">Orang Tua</th>
                                        <th class="px-4 py-3 bg-slate-50 text-center">Status Login</th>
                                    </tr>
                                </thead>
                                <tbody id="dataIndukTableBody" class="bg-white">
                                    ${dataIndukRows}
                                </tbody>
                            </table>
                        </div>
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
                
                <div id="content-autopoin" class="admin-tab-content hidden">
                    <h3 class="font-bold text-xl text-slate-800 mb-4">⚡ Auto Kalkulasi Poin</h3>
                    
                    <div class="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                        <h4 class="font-bold text-blue-900 mb-3 flex items-center gap-2">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                            </svg>
                            Cara Kerja Auto Poin
                        </h4>
                        <ul class="text-sm text-blue-800 space-y-2">
                            <li>✅ <strong>Setoran Masuk</strong>: Poin otomatis dihitung berdasarkan aturan (+2, +1, atau 0)</li>
                            <li>❌ <strong>Tidak Setoran</strong>: Sistem otomatis kurangi -1 poin di akhir hari</li>
                            <li>⏰ <strong>Waktu Eksekusi</strong>: 30 menit setelah sesi terakhir selesai</li>
                            <li>🔄 <strong>Auto-Check</strong>: Sistem cek setiap 1 jam sekali</li>
                            <li>👨‍💼 <strong>Manual Trigger</strong>: Admin bisa trigger manual kapan saja</li>
                        </ul>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div class="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
                            <div class="text-green-600 text-sm font-bold mb-2">SUDAH SETORAN</div>
                            <div class="text-4xl font-black text-green-700 mb-2" id="autopoin-sudah">-</div>
                            <div class="text-xs text-green-600">Santri yang sudah input setoran hari ini</div>
                        </div>
                        
                        <div class="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-6">
                            <div class="text-red-600 text-sm font-bold mb-2">BELUM SETORAN</div>
                            <div class="text-4xl font-black text-red-700 mb-2" id="autopoin-belum">-</div>
                            <div class="text-xs text-red-600">Akan mendapat penalty -1 poin</div>
                        </div>
                    </div>
                    
                    <div class="space-y-3">
                        <button onclick="closeModal(); showPenaltyReport()" 
                            class="w-full flex items-center justify-center gap-3 p-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            📊 Lihat Laporan Detail
                        </button>
                        
                        <button onclick="updateAutoPoinStats()" 
                            class="w-full flex items-center justify-center gap-3 p-4 bg-slate-600 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                            🔄 Refresh Data
                        </button>
                    </div>
                    
                    <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6">
                        <h4 class="font-bold text-amber-900 mb-2 flex items-center gap-2">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                            </svg>
                            Catatan Penting
                        </h4>
                        <ul class="text-sm text-amber-800 space-y-1">
                            <li>• Penalty hanya diterapkan 1x per hari per santri</li>
                            <li>• Jika santri sudah dapat penalty, tidak akan dapat lagi hari itu</li>
                            <li>• Streak akan reset ke 0 jika tidak setoran</li>
                            <li>• Penalty tidak bisa dibatalkan (sesuai aturan sistem)</li>
                        </ul>
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
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-bold text-xl text-slate-800">Sesi Halaqah</h3>
                        <div class="flex items-center gap-2">
                            <label class="text-sm font-semibold text-slate-600">Pilih Lembaga:</label>
                            <select onchange="updateAdminSesiContainer(this.value)" 
                                class="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-primary-500 outline-none">
                                ${lembagaOptions}
                            </select>
                        </div>
                    </div>
                    <div id="adminSesiContainer" class="space-y-3">
                        ${sesiList}
                    </div>
                </div>
                
                <div id="content-lembaga" class="admin-tab-content hidden">
                    <h3 class="font-bold text-xl text-slate-800 mb-4">Pengaturan Lembaga</h3>
                    ${getSchoolBreakPanelHtml()}
                    <div class="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                        ${lembagaList}
                    </div>
                </div>
                
                <div id="content-danger-zone" class="admin-tab-content hidden">
                    <div class="bg-red-50 border border-red-200 rounded-xl p-6 mb-4">
                        <h4 class="font-bold text-red-800 mb-2 flex items-center gap-2 text-xl">
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                            </svg>
                            Zona Bahaya
                        </h4>
                        <p class="text-sm text-red-700 mb-4">Tindakan berikut tidak dapat dibatalkan!</p>
                        
                        <div class="space-y-3">
                            <button onclick="fixNegativePoints()" 
                                class="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                                🧹 Hapus Poin Negatif (Fix)
                            </button>
                            
                            <button onclick="closeModal(); showResetDataModal()" 
                                class="w-full bg-red-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                                🔧 Reset Data Lengkap
                            </button>
                        </div>
                    </div>
                    
                    <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <h4 class="font-bold text-blue-900 mb-2">ℹ️ Kapan Perlu Reset Data?</h4>
                        <ul class="text-sm text-blue-800 space-y-1">
                            <li>• Poin negatif atau tidak wajar</li>
                            <li>• Data duplikat atau corrupt</li>
                            <li>• Ingin mulai dari awal</li>
                            <li>• Setelah import data baru</li>
                        </ul>
                    </div>
                </div>
                
                <div class="flex gap-3 pt-4 border-t border-slate-200">
                    <button onclick="showResetDataModal()" 
                        class="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors">
                        🔧 Reset Data
                    </button>
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

    createModal(content, false);
}

// Render Admin Settings Inline (not modal)
function renderAdminSettings(force = false) {
    const container = document.getElementById('settingsContainer');
    if (!container) return;

    // Save currently active tab
    let activeTabId = 'santri';
    const currentActive = container.querySelector('.admin-tab-inline.active');
    if (currentActive) {
        activeTabId = currentActive.id.replace('tab-inline-', '');
    }

    // Use same content generation as showAdminSettings but without modal wrapper
    const content = generateAdminSettingsContent();
    container.innerHTML = content;

    // Restore active tab
    if (activeTabId && activeTabId !== 'santri') {
        switchAdminTabInline(activeTabId);
    }
}

// Generate admin settings content (reusable)
function generateAdminSettingsContent() {
    const dataIndukRows = dashboardData.students.map((student, index) => {
        return `
            <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3 text-sm text-slate-500">${index + 1}</td>
                <td class="px-4 py-3 text-sm font-medium text-slate-800">${student.nisn || '-'}</td>
                <td class="px-4 py-3 text-sm text-slate-600">${student.nik || '-'}</td>
                <td class="px-4 py-3 text-sm font-bold text-slate-800">${student.name}</td>
                <td class="px-4 py-3 text-sm text-slate-600">${student.jenis_kelamin || '-'}</td>
                <td class="px-4 py-3 text-sm text-slate-600">
                    ${(() => {
                const birthDate = student.tanggal_lahir ? new Date(student.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
                const parts = [];
                if (student.tempat_lahir) parts.push(student.tempat_lahir);
                if (birthDate) parts.push(birthDate);
                return parts.length > 0 ? parts.join(', ') : '-';
            })()}
                </td>
                <td class="px-4 py-3 text-sm text-slate-600 truncate max-w-[200px]" title="${student.alamat || ''}">${student.alamat || '-'}</td>
                <td class="px-4 py-3 text-sm text-slate-600">
                    <div class="flex flex-col">
                        <span class="text-xs text-slate-500">Ayah: ${student.nama_ayah || '-'}</span>
                        <span class="text-xs text-slate-500">Ibu: ${student.nama_ibu || '-'}</span>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

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

    // Default to first lembaga
    const firstLembagaKey = Object.keys(appSettings.lembaga)[0] || 'MTA';
    const sesiList = renderAdminSesiList(firstLembagaKey);

    // Generate lembaga options for dropdown
    const lembagaOptions = Object.keys(appSettings.lembaga).map(key =>
        `<option value="${key}">${appSettings.lembaga[key].name}</option>`
    ).join('');

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
                </div>
                <div class="mt-4 pt-3 border-t border-slate-200">
                    <button onclick="toggleHoliday('${key}')" id="btn-holiday-inline-${key}"
                        class="w-full py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all transform hover:scale-[1.02] active:scale-[0.98] ${isHoliday(key) ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600'}">
                        ${isHoliday(key) ? '🎉 SEDANG LIBUR (Klik untuk Masuk)' : '📅 Setel Libur Hari Ini'}
                    </button>
                    <p class="text-[10px] text-slate-500 mt-2 text-center">Libur akan otomatis mematikan tracking absensi & penalty poin.</p>
                </div>
            </div>
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
                <button onclick="switchAdminTabInline('datainduk')" id="tab-inline-datainduk" class="admin-tab-inline px-4 py-2 font-bold text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-700 whitespace-nowrap">
                    🗃️ Data Induk
                </button>
                <button onclick="switchAdminTabInline('halaqah')" id="tab-inline-halaqah" class="admin-tab-inline px-4 py-2 font-bold text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-700 whitespace-nowrap">
                    Kelola Halaqah
                </button>
                <button onclick="switchAdminTabInline('autopoin')" id="tab-inline-autopoin" class="admin-tab-inline px-4 py-2 font-bold text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-700 whitespace-nowrap">
                    ⚡ Auto Poin
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
                <button onclick="switchAdminTabInline('danger-zone')" id="tab-inline-danger-zone" class="admin-tab-inline px-4 py-2 font-bold text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-700 whitespace-nowrap">
                    Hapus Data
                </button>
            </div>
            
            <div class="space-y-6">
                <div id="content-inline-danger-zone" class="admin-tab-inline-content hidden min-h-[200px]">
                    <div class="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
                        <h5 class="font-bold text-red-800 mb-4 flex items-center gap-2 text-xl">
                            <span class="text-2xl">⚠️</span>
                            Zona Bahaya
                        </h5>
                        <p class="text-sm text-red-700 mb-6 font-medium">Tindakan berikut tidak dapat dibatalkan!</p>
                        
                        <div class="space-y-4">
                            <button onclick="if(typeof fixNegativePoints === 'function') { fixNegativePoints() } else { alert('Fungsi belum dimuat. Coba refresh halaman.') }" 
                                class="w-full bg-purple-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 transform hover:-translate-y-1">
                                <span class="text-2xl">🧹</span>
                                <div class="text-left">
                                    <div class="text-base">Hapus Poin Negatif (Fix)</div>
                                    <div class="text-xs font-normal opacity-80">Klik tombol ini untuk memperbaiki data</div>
                                </div>
                            </button>
                            
                            <button onclick="showResetDataModal()" 
                                class="w-full bg-amber-500 text-white px-6 py-4 rounded-xl font-bold hover:bg-amber-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 transform hover:-translate-y-1">
                                <span class="text-2xl">🔧</span>
                                <div class="text-left">
                                    <div class="text-base">Menu Reset Data</div>
                                    <div class="text-xs font-normal opacity-80">Reset poin 0, hapus cache, dll</div>
                                </div>
                            </button>
                            
                            <button onclick="confirmDeleteAllData()" 
                                class="w-full bg-red-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-red-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 transform hover:-translate-y-1">
                                <span class="text-2xl">🗑️</span>
                                <div class="text-left">
                                    <div class="text-base">Hapus Semua Data</div>
                                    <div class="text-xs font-normal opacity-80">Santri + halaqah (lokal & Supabase). Lalu: Excel → Import file baru.</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                <div id="content-inline-datainduk" class="admin-tab-inline-content hidden">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="font-bold text-xl text-slate-800">Data Induk Santri (Lengkap)</h4>
                        <button onclick="exportToExcel()" class="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors text-sm">
                            📥 Download Excel
                        </button>
                    </div>
                    
                    <div class="mb-3">
                        <input type="text" placeholder="Cari di data induk..." 
                            oninput="const term = this.value.toLowerCase(); document.querySelectorAll('#inlineDataIndukTableBody tr').forEach(row => { row.style.display = row.innerText.toLowerCase().includes(term) ? '' : 'none'; })"
                            class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none">
                    </div>

                    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <div class="overflow-x-auto max-h-[500px]">
                            <table class="w-full text-left border-collapse relative">
                                <thead class="sticky top-0 z-10">
                                    <tr class="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold shadow-sm">
                                        <th class="px-4 py-3 bg-slate-50">No</th>
                                        <th class="px-4 py-3 bg-slate-50">NISN</th>
                                        <th class="px-4 py-3 bg-slate-50">NIK</th>
                                        <th class="px-4 py-3 bg-slate-50">Nama Lengkap</th>
                                        <th class="px-4 py-3 bg-slate-50">L/P</th>
                                        <th class="px-4 py-3 bg-slate-50">TTL</th>
                                        <th class="px-4 py-3 bg-slate-50">Alamat</th>
                                        <th class="px-4 py-3 bg-slate-50">Orang Tua</th>
                                    </tr>
                                </thead>
                                <tbody id="inlineDataIndukTableBody" class="bg-white">
                                    ${dataIndukRows}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

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
                
                <div id="content-inline-autopoin" class="admin-tab-inline-content hidden">
                    <h4 class="font-bold text-xl text-slate-800 mb-4">⚡ Auto Kalkulasi Poin</h4>
                    
                    <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                        <h5 class="font-bold text-blue-900 mb-2 flex items-center gap-2 text-sm">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                            </svg>
                            Cara Kerja Auto Poin
                        </h5>
                        <ul class="text-xs text-blue-800 space-y-1">
                            <li>✅ Setoran: Poin auto dihitung (+2, +1, 0)</li>
                            <li>❌ Tidak Setoran: Auto -1 poin di akhir hari</li>
                            <li>⏰ Eksekusi: 30 menit setelah sesi terakhir</li>
                        </ul>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3 mb-4">
                        <div class="bg-green-50 border border-green-200 rounded-xl p-3">
                            <div class="text-green-600 text-xs font-bold mb-1">SUDAH SETORAN</div>
                            <div class="text-2xl font-black text-green-700" id="autopoin-inline-sudah">-</div>
                        </div>
                        
                        <div class="bg-red-50 border border-red-200 rounded-xl p-3">
                            <div class="text-red-600 text-xs font-bold mb-1">BELUM SETORAN</div>
                            <div class="text-2xl font-black text-red-700" id="autopoin-inline-belum">-</div>
                        </div>
                    </div>
                    
                    <div class="space-y-2">
                        <button onclick="showPenaltyReport()" 
                            class="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm">
                            📊 Lihat Laporan Detail
                        </button>
                        
                        <button onclick="updateAutoPoinStatsInline()" 
                            class="w-full flex items-center justify-center gap-2 p-3 bg-slate-600 text-white rounded-lg font-bold hover:bg-slate-700 transition-colors text-sm">
                            🔄 Refresh Data
                        </button>
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
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="font-bold text-xl text-slate-800">Sesi Halaqah</h4>
                        <div class="flex items-center gap-2">
                            <label class="text-sm font-semibold text-slate-600">Pilih Lembaga:</label>
                            <select onchange="updateAdminSesiContainer(this.value)" 
                                class="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-primary-500 outline-none">
                                ${lembagaOptions}
                            </select>
                        </div>
                    </div>
                    <div id="adminSesiContainerInline" class="space-y-3">
                        ${sesiList}
                    </div>
                </div>
                
                <div id="content-inline-lembaga" class="admin-tab-inline-content hidden">
                    <h4 class="font-bold text-xl text-slate-800 mb-4">Pengaturan Lembaga</h4>
                    ${getSchoolBreakPanelHtml()}
                    <div class="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                        ${lembagaList}
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
    console.log('Switching to inline tab:', tab);

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
        content.style.display = 'none'; // Ensure it's hidden
    });

    const activeContent = document.getElementById(`content-inline-${tab}`);
    if (activeContent) {
        console.log('Found content for tab:', tab);
        activeContent.classList.remove('hidden');
        activeContent.style.display = 'block';

        // Special check for danger-zone emptiness
        if (tab === 'danger-zone') {
            console.log('Danger zone content check:', activeContent.innerHTML.length, 'chars');
            if (activeContent.innerHTML.trim() === '' || activeContent.children.length === 0) {
                console.warn('Danger zone content is empty, injecting manually...');
                activeContent.innerHTML = `
                    <div class="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
                        <h5 class="font-bold text-red-800 mb-4 flex items-center gap-2 text-xl">
                            <span class="text-2xl">⚠️</span>
                            Zona Bahaya
                        </h5>
                        <p class="text-sm text-red-700 mb-6 font-medium">Tindakan berikut tidak dapat dibatalkan!</p>
                        
                        <div class="space-y-4">
                            <button onclick="if(typeof fixNegativePoints === 'function') { fixNegativePoints() } else { alert('Fungsi belum dimuat. Coba refresh halaman.') }" 
                                class="w-full bg-purple-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 transform hover:-translate-y-1">
                                <span class="text-2xl">🧹</span>
                                <div class="text-left">
                                    <div class="text-base">Hapus Poin Negatif (Fix)</div>
                                    <div class="text-xs font-normal opacity-80">Klik tombol ini untuk memperbaiki data</div>
                                </div>
                            </button>
                            
                            <button onclick="confirmDeleteAllData()" 
                                class="w-full bg-red-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-red-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 transform hover:-translate-y-1">
                                <span class="text-2xl">🗑️</span>
                                <div class="text-left">
                                    <div class="text-base">Hapus Semua Data</div>
                                    <div class="text-xs font-normal opacity-80">Santri + halaqah (lokal & Supabase). Lalu: Excel → Import file baru.</div>
                                </div>
                            </button>
                        </div>
                    </div>
                 `;
            }
        }
    } else {
        console.error('Content not found for tab:', tab);
        // Try to recover by re-rendering if content is missing
        const container = document.getElementById('settingsContainer');
        if (container) {
            console.log('Re-rendering admin settings due to missing tab content...');
            renderAdminSettings();

            // Try again
            setTimeout(() => {
                const retryContent = document.getElementById(`content-inline-${tab}`);
                if (retryContent) {
                    retryContent.classList.remove('hidden');
                    retryContent.style.display = 'block';

                    // Re-activate tab
                    const retryTab = document.getElementById(`tab-inline-${tab}`);
                    if (retryTab) {
                        retryTab.classList.add('active', 'border-primary-600', 'text-primary-600');
                        retryTab.classList.remove('border-transparent', 'text-slate-500');
                    }
                }
            }, 100);
        }
    }

    // Update auto poin stats when tab is opened
    if (tab === 'autopoin' && typeof updateAutoPoinStatsInline === 'function') {
        updateAutoPoinStatsInline();
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
function renderAdminSesiList(lembagaKey) {
    const sessions = appSettings.lembaga[lembagaKey]?.sesiHalaqah || [];
    return sessions.map((sesi) => `
        <div class="bg-slate-50 rounded-xl p-4">
            <div class="flex items-center justify-between mb-3">
                <div class="font-bold text-slate-800">${sesi.name.replace(/ - (Pagi|Siang|Sore)/gi, '')}</div>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" ${sesi.active ? 'checked' : ''} 
                        onchange="toggleSesi(${sesi.id}, '${lembagaKey}')" class="sr-only peer">
                    <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="text-xs text-slate-600 font-bold">Waktu Mulai</label>
                    <input type="time" value="${sesi.startTime}" 
                        onchange="updateSesiTime(${sesi.id}, 'start', this.value, '${lembagaKey}')"
                        class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                </div>
                <div>
                    <label class="text-xs text-slate-600 font-bold">Waktu Selesai</label>
                    <input type="time" value="${sesi.endTime}" 
                        onchange="updateSesiTime(${sesi.id}, 'end', this.value, '${lembagaKey}')"
                        class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                </div>
            </div>
        </div>
    `).join('');
}

function updateAdminSesiContainer(lembagaKey) {
    const container = document.getElementById('adminSesiContainer');
    if (container) {
        container.innerHTML = renderAdminSesiList(lembagaKey);
    }
    const inlineContainer = document.getElementById('adminSesiContainerInline');
    if (inlineContainer) {
        inlineContainer.innerHTML = renderAdminSesiList(lembagaKey);
    }
}

function toggleSesi(sesiId, lembagaKey) {
    if (!lembagaKey) {
        console.error('toggleSesi: lembagaKey is required');
        showNotification('❌ Error: Lembaga tidak valid', 'error');
        return;
    }

    if (!appSettings.lembaga[lembagaKey]) {
        console.error(`toggleSesi: Lembaga '${lembagaKey}' not found`);
        showNotification('❌ Error: Data lembaga tidak ditemukan', 'error');
        return;
    }

    const sesi = appSettings.lembaga[lembagaKey].sesiHalaqah.find(s => s.id === sesiId);
    if (sesi) {
        sesi.active = !sesi.active;
        saveSettings();
        showNotification(`Sesi ${sesi.name} ${sesi.active ? 'diaktifkan' : 'dinonaktifkan'}`);
    }
}

function updateSesiTime(sesiId, type, value, lembagaKey) {
    if (!lembagaKey) {
        console.error('updateSesiTime: lembagaKey is required');
        showNotification('❌ Error: Lembaga tidak valid', 'error');
        return;
    }

    if (!appSettings.lembaga[lembagaKey]) {
        console.error(`updateSesiTime: Lembaga '${lembagaKey}' not found`);
        showNotification('❌ Error: Data lembaga tidak ditemukan', 'error');
        return;
    }

    const sesi = appSettings.lembaga[lembagaKey].sesiHalaqah.find(s => s.id === sesiId);
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
    console.log('Switching to modal tab:', tab);
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
        console.log('Found content for modal tab:', tab);
        activeContent.classList.remove('hidden');
        activeContent.style.display = 'block';
    } else {
        console.error('Content not found for modal tab:', tab);
    }

    // Update auto poin stats when tab is opened
    if (tab === 'autopoin' && typeof updateAutoPoinStats === 'function') {
        updateAutoPoinStats();
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

    const membersCount = typeof getStudentsByHalaqah === 'function'
        ? getStudentsByHalaqah(halaqah.name).length
        : dashboardData.students.filter(s => s.halaqah === halaqah.name.replace('Halaqah ', '')).length;

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
        deleteHalaqahFromSupabase(halaqahId).then((result) => {
            // After Supabase delete completes, delete locally
            // Note: result might be true (success) or we might have thrown an error
            if (result === true) {
                performLocalHalaqahDelete(halaqahId, halaqah);
            }
        }).catch((error) => {
            console.error('Supabase delete failed:', error);
            window.deleteOperationInProgress = false;
            if (typeof showNotification === 'function') {
                showNotification(`❌ Gagal menghapus: ${error.message || 'Kesalahan server'}`);
            } else {
                alert(`❌ Gagal menghapus: ${error.message || 'Kesalahan server'}`);
            }
        });
    } else {
        // If Supabase not available, just delete locally
        performLocalHalaqahDelete(halaqahId, halaqah);
    }
}

function performLocalHalaqahDelete(halaqahId, halaqah) {
    console.log('Performing local delete...');

    // Set guard flag to prevent loadHalaqahsFromSupabase from overwriting local changes
    localStorage.setItem('_deleteJustDone', Date.now().toString());

    // Delete from local data
    dashboardData.halaqahs = dashboardData.halaqahs.filter(h => h.id !== halaqahId);

    dashboardData.students.forEach(student => {
        let match = false;
        if (typeof normalizeHalaqahLabel === 'function') {
            match = normalizeHalaqahLabel(student.halaqah) === normalizeHalaqahLabel(halaqah.name);
        } else {
            const shortName = halaqah.name.replace('Halaqah ', '');
            match = student.halaqah === shortName || student.halaqah === halaqah.name;
        }
        if (match) student.halaqah = 'Tidak Ada';
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

        // Set guard dulu (sync) sebelum await — supaya reload/parallel load tidak tarik data lama dari server
        localStorage.setItem('_deleteJustDone', Date.now().toString());
        window.deleteOperationInProgress = true;

        // Delete from Supabase first
        let supabaseSuccess = true;
        if (window.deleteAllStudentsFromSupabase && window.deleteAllHalaqahsFromSupabase) {
            console.log('Deleting all data from Supabase...');

            // Delete students first (hindari FK / orphan jika ada aturan)
            const studentsDeleted = await deleteAllStudentsFromSupabase();
            // Delete halaqahs
            const halaqahsDeleted = await deleteAllHalaqahsFromSupabase();

            supabaseSuccess = studentsDeleted && halaqahsDeleted;

            if (supabaseSuccess) {
                console.log('✅ All data deleted from Supabase');
            } else {
                console.warn('⚠️ Some Supabase deletes failed, continuing with local delete');
                if (typeof showNotification === 'function') {
                    showNotification('⚠️ Sebagian data mungkin masih di server (izin/RLS). Data lokal tetap dikosongkan.', 'warning');
                }
            }
        }

        // Delete from local storage
        console.log('Deleting local data...');

        localStorage.removeItem('lastSync');

        // Perbarui timestamp guard (sudah diset di awal; tetap segarkan)
        localStorage.setItem('_deleteJustDone', Date.now().toString());

        dashboardData.students = [];
        dashboardData.halaqahs = [];
        dashboardData.stats = {
            totalStudents: 0,
            totalHalaqahs: 0,
            totalPoints: 0,
            avgPointsPerStudent: 0
        };

        if (Array.isArray(dashboardData.tilawah)) {
            dashboardData.tilawah = [];
        }

        if (typeof recalculateRankings === 'function') {
            recalculateRankings();
        }

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

        if (typeof showNotification === 'function') {
            showNotification(
                '✅ Data dikosongkan. Halaman akan dimuat ulang. Berikutnya: buka jendela Import Data Excel dari menu/dashboard, unggah file, lalu konfirmasi — data baru tersimpan ke Supabase.',
                'success'
            );
        }

        setTimeout(() => {
            try {
                const url = new URL(window.location.href);
                url.searchParams.set('_cb', String(Date.now()));
                window.location.href = url.toString();
            } catch (e) {
                window.location.reload();
            }
        }, 900);

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

    // Ensure selection state
    if (!window._selectedHalaqahIds) window._selectedHalaqahIds = new Set();

    // Toolbar hapus multi (injected before container)
    const toolbarId = 'halaqahMultiToolbar';
    let toolbar = document.getElementById(toolbarId);
    if (!toolbar) {
        toolbar = document.createElement('div');
        toolbar.id = toolbarId;
        container.parentElement.insertBefore(toolbar, container);
    }
    toolbar.innerHTML = _buildHalaqahMultiToolbar('modal');

    const halaqahList = dashboardData.halaqahs.map(halaqah => {
        const halaqahJson = JSON.stringify(halaqah).replace(/"/g, '&quot;');
        const isChecked = window._selectedHalaqahIds.has(halaqah.id);
        return `
            <div class="halaqah-admin-item flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors ${isChecked ? 'ring-2 ring-red-300 bg-red-50' : ''}" data-name="${halaqah.name.toLowerCase()}" data-id="${halaqah.id}">
                <input type="checkbox" class="halaqah-cb w-4 h-4 accent-red-500 cursor-pointer flex-shrink-0"
                    ${isChecked ? 'checked' : ''}
                    onchange="toggleHalaqahSelection(${halaqah.id}, 'modal')">
                <div class="flex-1 min-w-0">
                    <div class="font-semibold text-slate-800 truncate">${halaqah.name}</div>
                    <div class="text-xs text-slate-500">${halaqah.members} anggota • ${halaqah.points} poin • Rank #${halaqah.rank}</div>
                </div>
                <div class="flex gap-1 flex-shrink-0">
                    <button onclick='closeModal(); showEditHalaqahForm(${halaqahJson})'
                        class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button onclick="confirmDeleteHalaqah(${halaqah.id})"
                        class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = halaqahList || '<p class="text-slate-400 text-sm text-center py-4">Belum ada halaqah</p>';

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

    // Ensure selection state
    if (!window._selectedHalaqahIds) window._selectedHalaqahIds = new Set();

    // Toolbar hapus multi
    const toolbarId = 'halaqahMultiToolbarInline';
    let toolbar = document.getElementById(toolbarId);
    if (!toolbar) {
        toolbar = document.createElement('div');
        toolbar.id = toolbarId;
        container.parentElement.insertBefore(toolbar, container);
    }
    toolbar.innerHTML = _buildHalaqahMultiToolbar('inline');

    const halaqahList = dashboardData.halaqahs.map(halaqah => {
        const halaqahJson = JSON.stringify(halaqah).replace(/"/g, '&quot;');
        const isChecked = window._selectedHalaqahIds.has(halaqah.id);
        return `
            <div class="halaqah-admin-item flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors ${isChecked ? 'ring-2 ring-red-300 bg-red-50' : ''}" data-name="${halaqah.name.toLowerCase()}" data-id="${halaqah.id}">
                <input type="checkbox" class="halaqah-cb w-4 h-4 accent-red-500 cursor-pointer flex-shrink-0"
                    ${isChecked ? 'checked' : ''}
                    onchange="toggleHalaqahSelection(${halaqah.id}, 'inline')">
                <div class="flex-1 min-w-0">
                    <div class="font-semibold text-slate-800 truncate">${halaqah.name}</div>
                    <div class="text-xs text-slate-500">${halaqah.members} anggota • ${halaqah.points} poin • Rank #${halaqah.rank}</div>
                </div>
                <div class="flex gap-1 flex-shrink-0">
                    <button onclick='showEditHalaqahForm(${halaqahJson})'
                        class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button onclick="confirmDeleteHalaqah(${halaqah.id})"
                        class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = halaqahList || '<p class="text-slate-400 text-sm text-center py-4">Belum ada halaqah</p>';
}

window.updateAdminSantriListInline = updateAdminSantriListInline;
window.updateAdminHalaqahListInline = updateAdminHalaqahListInline;

// ============================================================
// MULTI-HALAQAH SELECT & DELETE
// ============================================================

// State: selected halaqah IDs (shared antara modal & inline)
window._selectedHalaqahIds = new Set();

// Build toolbar HTML
function _buildHalaqahMultiToolbar(view) {
    const count = (window._selectedHalaqahIds || new Set()).size;
    const total = dashboardData.halaqahs.length;
    if (total === 0) return '';

    const allSelected = count === total && total > 0;
    return `
        <div class="flex items-center gap-2 mb-3 p-2 rounded-xl border ${count > 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'} transition-all">
            <input type="checkbox" id="halaqahSelectAll_${view}" class="w-4 h-4 accent-red-500 cursor-pointer"
                ${allSelected ? 'checked' : ''}
                onchange="toggleAllHalaqahSelection('${view}', this.checked)">
            <label for="halaqahSelectAll_${view}" class="text-sm font-semibold cursor-pointer select-none ${count > 0 ? 'text-red-700' : 'text-slate-600'}">
                ${count > 0 ? `${count} dipilih dari ${total}` : 'Pilih Semua'}
            </label>
            ${count > 0 ? `
            <div class="flex-1"></div>
            <button onclick="deleteSelectedHalaqahs('${view}')"
                class="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors shadow-sm">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Hapus ${count} Halaqah
            </button>
            <button onclick="clearHalaqahSelection('${view}')"
                class="px-2 py-1.5 text-slate-500 hover:text-slate-700 rounded-lg text-xs font-semibold transition-colors">
                ✕ Batal
            </button>
            ` : ''}
        </div>
    `;
}

// Toggle satu halaqah
function toggleHalaqahSelection(halaqahId, view) {
    if (!window._selectedHalaqahIds) window._selectedHalaqahIds = new Set();
    if (window._selectedHalaqahIds.has(halaqahId)) {
        window._selectedHalaqahIds.delete(halaqahId);
    } else {
        window._selectedHalaqahIds.add(halaqahId);
    }
    _refreshHalaqahListUI(view);
}

// Toggle semua
function toggleAllHalaqahSelection(view, checked) {
    if (!window._selectedHalaqahIds) window._selectedHalaqahIds = new Set();
    if (checked) {
        dashboardData.halaqahs.forEach(h => window._selectedHalaqahIds.add(h.id));
    } else {
        window._selectedHalaqahIds.clear();
    }
    _refreshHalaqahListUI(view);
}

// Bersihkan pilihan
function clearHalaqahSelection(view) {
    window._selectedHalaqahIds = new Set();
    _refreshHalaqahListUI(view);
}

// Refresh UI tanpa re-query Supabase
function _refreshHalaqahListUI(view) {
    if (view === 'modal') updateAdminHalaqahList();
    else updateAdminHalaqahListInline();
}

// Hapus semua yang dipilih
async function deleteSelectedHalaqahs(view) {
    const selectedIds = [...(window._selectedHalaqahIds || new Set())];
    if (selectedIds.length === 0) return;

    const selectedHalaqahs = dashboardData.halaqahs.filter(h => selectedIds.includes(h.id));
    const names = selectedHalaqahs.map(h => h.name).join(', ');

    if (!confirm(`🗑️ Hapus ${selectedIds.length} halaqah:\n${names}\n\nData halaqah akan dihapus permanen dari server.\nLanjutkan?`)) return;

    try {
        showNotification(`⏳ Menghapus ${selectedIds.length} halaqah...`, 'info');
        window.deleteOperationInProgress = true;

        // Hapus dari Supabase
        const { error } = await window.supabaseClient
            .from('halaqahs')
            .delete()
            .in('id', selectedIds);

        if (error) throw error;

        // Set guard flag
        localStorage.setItem('_deleteJustDone', Date.now().toString());

        // Hapus dari data lokal
        dashboardData.halaqahs = dashboardData.halaqahs.filter(h => !selectedIds.includes(h.id));
        StorageManager.save();

        // Reset selection
        window._selectedHalaqahIds = new Set();
        window.deleteOperationInProgress = false;

        showNotification(`✅ ${selectedIds.length} halaqah berhasil dihapus!`, 'success');

        // Refresh UI
        _refreshHalaqahListUI(view);
        if (typeof recalculateRankings === 'function') recalculateRankings();
        if (typeof refreshAllData === 'function') refreshAllData();

    } catch (error) {
        console.error('Delete selected halaqahs error:', error);
        window.deleteOperationInProgress = false;
        showNotification('❌ Gagal hapus: ' + error.message, 'error');
    }
}

window.toggleHalaqahSelection = toggleHalaqahSelection;
window.toggleAllHalaqahSelection = toggleAllHalaqahSelection;
window.clearHalaqahSelection = clearHalaqahSelection;
window.deleteSelectedHalaqahs = deleteSelectedHalaqahs;


// Update Auto Poin Stats
function updateAutoPoinStats() {
    if (!window.AutoPoin) {
        console.error('AutoPoin module not loaded');
        return;
    }

    const studentsWithoutSetoran = window.AutoPoin.getStudentsWithoutSetoranToday();
    const totalStudents = dashboardData.students.length;
    const studentsWithSetoran = totalStudents - studentsWithoutSetoran.length;

    const sudahEl = document.getElementById('autopoin-sudah');
    const belumEl = document.getElementById('autopoin-belum');

    if (sudahEl) sudahEl.textContent = studentsWithSetoran;
    if (belumEl) belumEl.textContent = studentsWithoutSetoran.length;

    console.log('✅ Auto Poin stats updated');
}

// Update Auto Poin Stats Inline
function updateAutoPoinStatsInline() {
    if (!window.AutoPoin) {
        console.error('AutoPoin module not loaded');
        return;
    }

    const studentsWithoutSetoran = window.AutoPoin.getStudentsWithoutSetoranToday();
    const totalStudents = dashboardData.students.length;
    const studentsWithSetoran = totalStudents - studentsWithoutSetoran.length;

    const sudahEl = document.getElementById('autopoin-inline-sudah');
    const belumEl = document.getElementById('autopoin-inline-belum');

    if (sudahEl) sudahEl.textContent = studentsWithSetoran;
    if (belumEl) belumEl.textContent = studentsWithoutSetoran.length;

    console.log('✅ Auto Poin inline stats updated');
}

// Make globally accessible
// Toggle Holiday for a Lembaga
function toggleHoliday(lembagaKey) {
    const today = new Date().toISOString().split('T')[0];
    const lembaga = appSettings.lembaga[lembagaKey];

    if (!lembaga) return;
    if (!lembaga.holidays) lembaga.holidays = [];

    const index = lembaga.holidays.indexOf(today);
    if (index === -1) {
        lembaga.holidays.push(today);
        showNotification(`🎉 ${lembaga.name} disetel LIBUR untuk hari ini`);
    } else {
        lembaga.holidays.splice(index, 1);
        showNotification(`📅 ${lembaga.name} disetel MASUK (Tidak Libur)`);
    }

    saveSettings();

    // Update button states in UI
    const btn = document.getElementById(`btn-holiday-${lembagaKey}`);
    const btnInline = document.getElementById(`btn-holiday-inline-${lembagaKey}`);

    const isLibur = isHoliday(lembagaKey);

    [btn, btnInline].forEach(b => {
        if (b) {
            b.className = `flex-1 py-2 rounded-lg font-bold text-xs transition-all ${isLibur ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`;
            b.innerHTML = isLibur ? '🎉 SEDANG LIBUR' : '📅 Setel Libur Hari Ini';
        }
    });

    // Refresh dashboard if visible
    if (typeof refreshAllData === 'function') refreshAllData();
}

window.toggleHoliday = toggleHoliday;
window.updateAutoPoinStats = updateAutoPoinStats;
window.updateAutoPoinStatsInline = updateAutoPoinStatsInline;
