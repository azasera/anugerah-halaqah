// Forms and CRUD Operations Module

let sdNameSuggestionsLoaded = false;
let sdNameSuggestionRows = [];
let sdNameAutoFillAttached = false;

async function attachSdNameSuggestions() {
    try {
        const input = document.querySelector('input[name="name"]');
        if (!input) return;

        let datalist = document.getElementById('sd-name-suggestions');
        if (!datalist) {
            datalist = document.createElement('datalist');
            datalist.id = 'sd-name-suggestions';
            document.body.appendChild(datalist);
        }

        input.setAttribute('list', 'sd-name-suggestions');
        if (!sdNameAutoFillAttached) {
            const handler = () => autoFillStudentFromSdName(input);
            input.addEventListener('change', handler);
            input.addEventListener('blur', handler);
            sdNameAutoFillAttached = true;
        }

        if (sdNameSuggestionsLoaded) return;
        sdNameSuggestionsLoaded = true;

        const res = await fetch('https://asia-southeast1-mootabaah.cloudfunctions.net/api/listnamasd2025');
        if (!res.ok) {
            console.error('Failed to load SD name suggestions');
            return;
        }
        const json = await res.json();
        const rows = Array.isArray(json.data) ? json.data : [];
        sdNameSuggestionRows = rows;

        datalist.innerHTML = '';
        rows.forEach(row => {
            if (!row || !row.namaSiswa) return;
            const option = document.createElement('option');
            option.value = row.namaSiswa;
            option.label = `${row.namaSiswa} - ${row.namaHalaqoh || ''} ${row.kelas ? '(' + row.kelas + ')' : ''}`.trim();
            datalist.appendChild(option);
        });
    } catch (e) {
        console.error('Error loading SD name suggestions', e);
    }
}

function autoFillStudentFromSdName(input) {
    try {
        if (!input) return;
        const rawName = input.value;
        if (!rawName) return;

        const name = String(rawName).trim().toLowerCase();
        if (!name || !Array.isArray(sdNameSuggestionRows) || sdNameSuggestionRows.length === 0) return;

        const row = sdNameSuggestionRows.find(r => {
            if (!r || !r.namaSiswa) return false;
            return String(r.namaSiswa).trim().toLowerCase() === name;
        });

        if (!row) return;

        const form = input.closest('form');
        if (!form) return;

        const halaqahSelect = form.querySelector('select[name="halaqah"]');
        if (halaqahSelect && row.namaHalaqoh) {
            const normalized = String(row.namaHalaqoh).replace(/^Halaqah\s+/i, '').trim();
            if (!normalized) return;

            const hasOption = Array.from(halaqahSelect.options || []).some(opt => opt.value === normalized);
            if (hasOption) {
                halaqahSelect.value = normalized;
            }
        }
    } catch (e) {
        console.error('Error in autoFillStudentFromSdName', e);
    }
}

function showAddStudentForm() {
    const content = `
        <div class="p-8">
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="font-display font-bold text-3xl text-slate-800 mb-2">Tambah Santri Baru</h2>
                    <p class="text-slate-500">Masukkan data santri yang akan ditambahkan</p>
                </div>
                <button onclick="closeModal()" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <form onsubmit="handleAddStudent(event)" class="space-y-4">
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Nama Santri</label>
                    <input type="text" name="name" required 
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        placeholder="Masukkan nama lengkap (ketik untuk menampilkan daftar SD 2025)">
                </div>
                
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Halaqah</label>
                    <select name="halaqah" required 
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all">
                        <option value="">Pilih Halaqah</option>
                        ${dashboardData.halaqahs.map(h => `
                            <option value="${h.name.replace('Halaqah ', '')}">${h.name}</option>
                        `).join('')}
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">NIS / NISN</label>
                        <input type="text" name="nisn" 
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            placeholder="Nomor Induk Siswa">
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">NIK</label>
                        <input type="text" name="nik" 
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            placeholder="Nomor Induk Kependudukan">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">Jenis Kelamin</label>
                        <select name="jenis_kelamin" 
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all">
                            <option value="">Pilih...</option>
                            <option value="L">Laki-laki</option>
                            <option value="P">Perempuan</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">No. HP / WA</label>
                        <input type="text" name="hp" 
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            placeholder="08...">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">Tempat Lahir</label>
                        <input type="text" name="tempat_lahir" 
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            placeholder="Kota Lahir">
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">Tanggal Lahir</label>
                        <input type="date" name="tanggal_lahir" 
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all">
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Alamat Lengkap</label>
                    <textarea name="alamat" rows="2"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
                        placeholder="Alamat domisili saat ini"></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">Nama Ayah</label>
                        <input type="text" name="nama_ayah" 
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            placeholder="Nama Ayah Kandung">
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">Nama Ibu</label>
                        <input type="text" name="nama_ibu" 
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            placeholder="Nama Ibu Kandung">
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Sekolah Asal</label>
                    <input type="text" name="sekolah_asal" 
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        placeholder="Nama Sekolah Asal">
                </div>
                
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Poin Awal</label>
                    <input type="number" name="points" value="0" min="0" required 
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        placeholder="0">
                </div>
                
                <div class="flex gap-3 pt-4">
                    <button type="submit" 
                        class="flex-1 bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200">
                        Tambah Santri
                    </button>
                    <button type="button" onclick="closeModal()" 
                        class="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                        Batal
                    </button>
                </div>
            </form>
        </div>
    `;

    createModal(content, false);

    attachSdNameSuggestions();
}

function showEditStudentForm(student, fromAdmin = false) {
    const deleteButton = fromAdmin
        ? `<button type="button" onclick="confirmDeleteStudent(${student.id}, true); showAdminSettings(); switchAdminTab('santri')" 
            class="px-6 py-3 rounded-xl font-bold text-red-600 hover:bg-red-50 transition-colors">
            Hapus
        </button>`
        : `<button type="button" onclick="confirmDeleteStudent(${student.id})" 
            class="px-6 py-3 rounded-xl font-bold text-red-600 hover:bg-red-50 transition-colors">
            Hapus
        </button>`;

    const content = `
        <div class="p-8">
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="font-display font-bold text-3xl text-slate-800 mb-2">Edit Data Santri</h2>
                    <p class="text-slate-500">Perbarui informasi santri</p>
                </div>
                <button onclick="closeModal()" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <form onsubmit="handleEditStudent(event, ${student.id}, ${fromAdmin})" class="space-y-4">
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Nama Santri</label>
                    <input type="text" name="name" value="${student.name}" required 
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all">
                </div>
                
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Halaqah</label>
                    <select name="halaqah" required 
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all">
                        ${dashboardData.halaqahs.map(h => `
                            <option value="${h.name.replace('Halaqah ', '')}" ${student.halaqah === h.name.replace('Halaqah ', '') ? 'selected' : ''}>
                                ${h.name}
                            </option>
                        `).join('')}
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">NIS / NISN</label>
                        <input type="text" name="nisn" value="${student.nisn || ''}"
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            placeholder="Nomor Induk Siswa">
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">NIK</label>
                        <input type="text" name="nik" value="${student.nik || ''}"
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            placeholder="Nomor Induk Kependudukan">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">Jenis Kelamin</label>
                        <select name="jenis_kelamin" 
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all">
                            <option value="">Pilih...</option>
                            <option value="L" ${student.jenis_kelamin === 'L' ? 'selected' : ''}>Laki-laki</option>
                            <option value="P" ${student.jenis_kelamin === 'P' ? 'selected' : ''}>Perempuan</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">No. HP / WA</label>
                        <input type="text" name="hp" value="${student.hp || ''}"
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            placeholder="08...">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">Tempat Lahir</label>
                        <input type="text" name="tempat_lahir" value="${student.tempat_lahir || ''}"
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            placeholder="Kota Lahir">
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">Tanggal Lahir</label>
                        <input type="date" name="tanggal_lahir" value="${student.tanggal_lahir || ''}"
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all">
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Alamat Lengkap</label>
                    <textarea name="alamat" rows="2"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
                        placeholder="Alamat domisili saat ini">${student.alamat || ''}</textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">Nama Ayah</label>
                        <input type="text" name="nama_ayah" value="${student.nama_ayah || ''}"
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            placeholder="Nama Ayah Kandung">
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">Nama Ibu</label>
                        <input type="text" name="nama_ibu" value="${student.nama_ibu || ''}"
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            placeholder="Nama Ibu Kandung">
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Sekolah Asal</label>
                    <input type="text" name="sekolah_asal" value="${student.sekolah_asal || ''}"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        placeholder="Nama Sekolah Asal">
                </div>
                
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Total Poin</label>
                    <div class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-500 font-bold text-2xl text-center">
                        ${student.total_points}
                    </div>
                    <p class="text-xs text-slate-500 mt-1">💡 Poin dihitung otomatis dari history setoran</p>
                </div>
                
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Istiqomah</label>
                    <div class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-500 font-bold text-2xl text-center flex items-center justify-center gap-2">
                        🔥 ${student.streak}
                    </div>
                    <p class="text-xs text-slate-500 mt-1">💡 Dihitung otomatis dari history setoran istiqomah</p>
                </div>
                
                <div class="flex gap-3 pt-4">
                    <button type="submit" 
                        class="flex-1 bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200">
                        Simpan Perubahan
                    </button>
                    ${deleteButton}
                    <button type="button" onclick="closeModal()" 
                        class="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                        Batal
                    </button>
                </div>
            </form>
        </div>
    `;

    createModal(content, false);
}

function showAddHalaqahForm() {
    const content = `
        <div class="p-8">
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="font-display font-bold text-3xl text-slate-800 mb-2">Tambah Halaqah Baru</h2>
                    <p class="text-slate-500">Buat halaqah baru untuk santri</p>
                </div>
                <button onclick="closeModal()" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <form onsubmit="handleAddHalaqah(event)" class="space-y-4">
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Nama Halaqah</label>
                    <input type="text" name="name" required 
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        placeholder="Contoh: Al-Biruni">
                    <p class="text-xs text-slate-500 mt-1">Tanpa kata "Halaqah" di depan</p>
                </div>
                
                <div class="flex gap-3 pt-4">
                    <button type="submit" 
                        class="flex-1 bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200">
                        Tambah Halaqah
                    </button>
                    <button type="button" onclick="closeModal()" 
                        class="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                        Batal
                    </button>
                </div>
            </form>
        </div>
    `;

    createModal(content, false);
}

function showAddPointsForm(student) {
    const content = `
        <div class="p-8">
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="font-display font-bold text-3xl text-slate-800 mb-2">Tambah Poin</h2>
                    <p class="text-slate-500">${student.name} - Halaqah ${student.halaqah}</p>
                </div>
                <button onclick="closeModal()" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <div class="bg-primary-50 rounded-2xl p-4 mb-6">
                <div class="text-primary-600 text-sm font-bold mb-1">Poin Saat Ini</div>
                <div class="text-3xl font-bold text-primary-700">${student.total_points} pts</div>
            </div>
            
            <form onsubmit="handleAddPoints(event, ${student.id})" class="space-y-4">
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Jumlah Poin</label>
                    <input type="number" name="points" min="1" required 
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-2xl font-bold text-center"
                        placeholder="0" autofocus>
                </div>
                
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Keterangan (Opsional)</label>
                    <textarea name="note" rows="3"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
                        placeholder="Contoh: Hafalan Juz 1"></textarea>
                </div>
                
                <div class="flex gap-3 pt-4">
                    <button type="submit" 
                        class="flex-1 bg-accent-teal text-white px-6 py-3 rounded-xl font-bold hover:bg-accent-teal/90 transition-colors shadow-lg">
                        ➕ Tambah Poin
                    </button>
                    <button type="button" onclick="closeModal()" 
                        class="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                        Batal
                    </button>
                </div>
            </form>
        </div>
    `;

    createModal(content, false);
}

// Event Handlers
function handleAddStudent(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    const newStudent = {
        id: Date.now(),
        name: formData.get('name'),
        nisn: formData.get('nisn')?.trim() || '',
        nik: formData.get('nik')?.trim() || '',
        halaqah: formData.get('halaqah'),
        total_points: parseInt(formData.get('points')),

        // New Fields
        jenis_kelamin: formData.get('jenis_kelamin'),
        tempat_lahir: formData.get('tempat_lahir').trim(),
        tanggal_lahir: formData.get('tanggal_lahir'),
        alamat: formData.get('alamat'),
        hp: formData.get('hp'),
        nama_ayah: formData.get('nama_ayah'),
        nama_ibu: formData.get('nama_ibu'),
        sekolah_asal: formData.get('sekolah_asal'),

        daily_ranking: dashboardData.students.length + 1,
        overall_ranking: dashboardData.students.length + 1,
        streak: 0,
        lastActivity: 'Baru saja',
        achievements: []
    };

    dashboardData.students.push(newStudent);
    recalculateRankings();
    StorageManager.save();

    closeModal();
    refreshAllData();
    showNotification('✅ Santri berhasil ditambahkan!');
}

function handleEditStudent(event, studentId, fromAdmin = false) {
    event.preventDefault();
    const formData = new FormData(event.target);

    const student = dashboardData.students.find(s => s.id === studentId);
    if (student) {
        student.name = formData.get('name');
        student.nisn = (formData.get('nisn') || '').trim();
        student.nik = (formData.get('nik') || '').trim();
        student.halaqah = formData.get('halaqah');

        // Update New Fields
        student.jenis_kelamin = formData.get('jenis_kelamin');
        student.tempat_lahir = formData.get('tempat_lahir').trim();
        student.tanggal_lahir = formData.get('tanggal_lahir');
        student.alamat = formData.get('alamat');
        student.hp = formData.get('hp');
        student.nama_ayah = formData.get('nama_ayah');
        student.nama_ibu = formData.get('nama_ibu');
        student.sekolah_asal = formData.get('sekolah_asal');

        recalculateRankings();
        StorageManager.save();
        if (window.autoSync) autoSync();

        closeModal();
        refreshAllData();

        if (fromAdmin) {
            // Kembali ke admin settings
            showAdminSettings();
            switchAdminTab('santri');
        }
    }
}

function handleAddPoints(event, studentId) {
    event.preventDefault();
    const formData = new FormData(event.target);

    const student = dashboardData.students.find(s => s.id === studentId);
    if (student) {
        const points = parseInt(formData.get('points'));
        student.total_points += points;
        student.lastActivity = 'Baru saja';

        recalculateRankings();
        StorageManager.save();

        closeModal();
        refreshAllData();
        showNotification(`✅ +${points} poin untuk ${student.name}!`);
    }
}

function handleAddHalaqah(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    const newHalaqah = {
        id: Date.now(),
        name: `Halaqah ${formData.get('name')}`,
        points: 0,
        rank: dashboardData.halaqahs.length + 1,
        status: 'BARU',
        members: 0,
        avgPoints: 0,
        trend: 0
    };

    dashboardData.halaqahs.push(newHalaqah);
    StorageManager.save();

    closeModal();
    refreshAllData();
    showNotification('✅ Halaqah baru berhasil ditambahkan!');
}

function confirmDeleteStudent(studentId, keepModalOpen = false) {
    const student = dashboardData.students.find(s => s.id === studentId);
    if (!student) return;

    console.log('Attempting to delete student:', studentId, 'Name:', student.name);

    if (confirm(`Yakin ingin menghapus ${student.name}? Data tidak dapat dikembalikan.`)) {
        // Set flag to prevent realtime listener from reloading
        window.deleteOperationInProgress = true;

        // Hapus dari database Supabase (jika online)
        console.log('Calling deleteStudentFromSupabase for ID:', studentId);
        if (window.deleteStudentFromSupabase) {
            deleteStudentFromSupabase(studentId).then(() => {
                // After Supabase delete completes, delete locally
                performLocalStudentDelete(studentId, keepModalOpen);
            }).catch((error) => {
                console.error('Supabase delete failed:', error);
                window.deleteOperationInProgress = false;
                // Do NOT delete locally if Supabase fails
            });
        } else {
            // If Supabase not available, just delete locally
            performLocalStudentDelete(studentId, keepModalOpen);
        }
    }
}

function performLocalStudentDelete(studentId, keepModalOpen) {
    console.log('Performing local student delete...');

    // Hapus dari array lokal
    dashboardData.students = dashboardData.students.filter(s => s.id !== studentId);

    recalculateRankings();
    StorageManager.save();

    refreshAllData();

    if (keepModalOpen) {
        // Update list tanpa refresh modal
        if (typeof updateAdminSantriList === 'function') {
            updateAdminSantriList();
        }
    } else {
        // Update inline list if it exists
        if (typeof updateAdminSantriListInline === 'function') {
            updateAdminSantriListInline();
        }
        closeModal();
    }

    // Clear the delete flag after a delay
    setTimeout(() => {
        window.deleteOperationInProgress = false;
        console.log('Delete student operation completed');
    }, 2000);

    showNotification('✅ Data santri berhasil dihapus');
}

// Make globally accessible
// Note: confirmDeleteHalaqah is defined in admin.js (more complete version)

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 z-[200] glass rounded-xl px-6 py-4 shadow-2xl border border-slate-200 animate-scale-in';
    notification.innerHTML = `
        <div class="flex items-center gap-3">
            <span class="text-lg">${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        notification.style.transition = 'all 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Make functions globally accessible
window.showAddStudentForm = showAddStudentForm;
window.showEditStudentForm = showEditStudentForm;
window.showAddHalaqahForm = showAddHalaqahForm;
window.showAddPointsForm = showAddPointsForm;
window.handleAddStudent = handleAddStudent;
window.handleEditStudent = handleEditStudent;
window.handleAddPoints = handleAddPoints;
window.handleAddHalaqah = handleAddHalaqah;
window.confirmDeleteStudent = confirmDeleteStudent;
window.performLocalStudentDelete = performLocalStudentDelete;
