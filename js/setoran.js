// Setoran (Hafalan) Management Module

function showSetoranForm(student) {
    const currentSession = getCurrentSession();
    const isOnTime = currentSession !== null;
    
    const sessionInfo = currentSession 
        ? `<div class="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
            <div class="flex items-center gap-2 text-green-700">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                </svg>
                <span class="font-bold text-sm">✅ Sesi Aktif: ${currentSession.name} (TEPAT WAKTU)</span>
            </div>
        </div>`
        : `<div class="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
            <div class="flex items-center gap-2 text-amber-700">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                <span class="font-bold text-sm">⚠️ Tidak ada sesi aktif (TIDAK TEPAT WAKTU - Poin 0)</span>
            </div>
        </div>`;

    const lembagaOptions = Object.keys(appSettings.lembaga).map(key => {
        const l = appSettings.lembaga[key];
        return `<option value="${key}">${l.name}</option>`;
    }).join('');

    const sesiOptions = appSettings.sesiHalaqah.map(s => 
        `<option value="${s.id}" ${currentSession && currentSession.id === s.id ? 'selected' : ''}>
            ${s.name} (${s.startTime} - ${s.endTime}) ${!s.active ? '- NONAKTIF' : ''}
        </option>`
    ).join('');

    const content = `
        <div class="p-8">
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="font-display font-bold text-3xl text-slate-800 mb-2">Input Setoran</h2>
                    <p class="text-slate-500">${student.name} - Halaqah ${student.halaqah}</p>
                </div>
                <button onclick="closeModal()" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            ${sessionInfo}
            
            <form onsubmit="handleSetoran(event, ${student.id})" class="space-y-4">
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Lembaga / Tingkat</label>
                    <select name="lembaga" id="lembagaSelect" required onchange="updateSetoranPreview()"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all">
                        <option value="">Pilih Lembaga</option>
                        ${lembagaOptions}
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Sesi Halaqah</label>
                    <select name="sesi" id="sesiSelect" required onchange="updateSetoranPreview()"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all">
                        ${sesiOptions}
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Jumlah Baris</label>
                    <input type="number" name="baris" id="barisInput" min="1" required oninput="updateSetoranPreview()"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-2xl font-bold text-center"
                        placeholder="0" autofocus>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">Kelancaran</label>
                        <select name="kelancaran" id="kelancaranSelect" required onchange="updateSetoranPreview()"
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all">
                            <option value="lancar">✅ Lancar (Tidak ada salah)</option>
                            <option value="tidak_lancar">⚠️ Tidak Lancar (Max 3 salah)</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">Jumlah Kesalahan</label>
                        <input type="number" name="kesalahan" id="kesalahanInput" min="0" value="0" onchange="updateSetoranPreview()"
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-center"
                            placeholder="0">
                    </div>
                </div>
                
                <div id="setoranPreview" class="hidden">
                    <div class="bg-gradient-to-br from-primary-50 to-accent-teal/10 rounded-2xl p-6 space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="bg-white/80 backdrop-blur rounded-xl p-4">
                                <div class="text-slate-600 text-xs font-bold uppercase mb-1">Konversi Halaman</div>
                                <div id="halamanPreview" class="text-3xl font-bold text-primary-600">0</div>
                            </div>
                            <div class="bg-white/80 backdrop-blur rounded-xl p-4">
                                <div class="text-slate-600 text-xs font-bold uppercase mb-1">Poin Didapat</div>
                                <div id="poinPreview" class="text-3xl font-bold text-accent-teal">0</div>
                            </div>
                        </div>
                        <div id="targetInfo" class="text-sm text-slate-600 text-center"></div>
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Catatan (Opsional)</label>
                    <textarea name="note" rows="2"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
                        placeholder="Contoh: Surat Al-Baqarah ayat 1-5"></textarea>
                </div>
                
                <div class="flex gap-3 pt-4">
                    <button type="submit" 
                        class="flex-1 bg-accent-teal text-white px-6 py-3 rounded-xl font-bold hover:bg-accent-teal/90 transition-colors shadow-lg">
                        📖 Simpan Setoran
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

function updateSetoranPreview() {
    const lembagaSelect = document.getElementById('lembagaSelect');
    const barisInput = document.getElementById('barisInput');
    const kelancaranSelect = document.getElementById('kelancaranSelect');
    const kesalahanInput = document.getElementById('kesalahanInput');
    const preview = document.getElementById('setoranPreview');
    
    if (!lembagaSelect || !barisInput || !preview) return;
    
    const lembagaKey = lembagaSelect.value;
    const baris = parseInt(barisInput.value) || 0;
    const kelancaran = kelancaranSelect?.value || 'lancar';
    const kesalahan = parseInt(kesalahanInput?.value) || 0;
    
    if (!lembagaKey || baris === 0) {
        preview.classList.add('hidden');
        return;
    }
    
    preview.classList.remove('hidden');
    
    const halaman = barisToHalaman(baris, lembagaKey);
    const lembaga = appSettings.lembaga[lembagaKey];
    
    // Calculate poin based on new rules
    const currentSession = getCurrentSession();
    const isOnTime = currentSession !== null;
    const targetsMet = baris >= lembaga.targetBaris;
    const isLancar = kelancaran === 'lancar' && kesalahan === 0;
    const isTidakLancar = kelancaran === 'tidak_lancar' && kesalahan <= 3;
    
    let poin = 0;
    let poinExplanation = '';
    
    if (isOnTime) {
        if (isLancar && targetsMet) {
            poin = poinRules.tepatWaktuLancarTarget;
            poinExplanation = '✅ Tepat Waktu + Lancar + Capai Target = 2 Poin';
        } else if (isTidakLancar && targetsMet) {
            poin = poinRules.tepatWaktuTidakLancarTarget;
            poinExplanation = '⚠️ Tepat Waktu + Tidak Lancar (≤3 salah) + Capai Target = 1 Poin';
        } else if (isLancar && !targetsMet) {
            poin = poinRules.tepatWaktuLancarTidakTarget;
            poinExplanation = '❌ Tepat Waktu + Lancar + Tidak Capai Target = 0 Poin';
        } else {
            poin = 0;
            poinExplanation = '❌ Tidak memenuhi kriteria poin';
        }
    } else {
        poin = poinRules.tidakTepatWaktu;
        poinExplanation = '⏰ Tidak Tepat Waktu = 0 Poin';
    }
    
    document.getElementById('halamanPreview').textContent = halaman + ' hal';
    document.getElementById('poinPreview').textContent = poin + ' poin';
    
    const remaining = baris % lembaga.targetBaris;
    
    let targetInfo = poinExplanation + '<br/>';
    if (targetsMet) {
        targetInfo += `<span class="text-green-600">✅ Target ${lembaga.targetBaris} baris tercapai!</span>`;
    } else {
        targetInfo += `<span class="text-amber-600">Kurang ${lembaga.targetBaris - baris} baris untuk capai target.</span>`;
    }
    
    document.getElementById('targetInfo').innerHTML = targetInfo;
}

function handleSetoran(event, studentId) {
    event.preventDefault();

    // Security check: Only Guru and Admin can input setoran
    if (typeof currentProfile === 'undefined' || !currentProfile || (currentProfile.role !== 'guru' && currentProfile.role !== 'admin')) {
        showNotification('⛔ Akses ditolak: Hanya Guru dan Admin yang dapat input setoran', 'error');
        return;
    }

    const formData = new FormData(event.target);
    
    const student = dashboardData.students.find(s => s.id === studentId);
    if (!student) return;
    
    const lembagaKey = formData.get('lembaga');
    const sesiId = parseInt(formData.get('sesi'));
    const baris = parseInt(formData.get('baris'));
    const kelancaran = formData.get('kelancaran');
    const kesalahan = parseInt(formData.get('kesalahan'));
    const note = formData.get('note');
    
    const halaman = barisToHalaman(baris, lembagaKey);
    const lembaga = appSettings.lembaga[lembagaKey];
    
    // Calculate poin based on new rules
    const currentSession = getCurrentSession();
    const isOnTime = currentSession !== null;
    const targetsMet = baris >= lembaga.targetBaris;
    const isLancar = kelancaran === 'lancar' && kesalahan === 0;
    const isTidakLancar = kelancaran === 'tidak_lancar' && kesalahan <= 3;
    
    let poin = 0;
    let status = '';
    
    if (isOnTime) {
        if (isLancar && targetsMet) {
            poin = poinRules.tepatWaktuLancarTarget;
            status = 'Tepat Waktu, Lancar, Capai Target';
        } else if (isTidakLancar && targetsMet) {
            poin = poinRules.tepatWaktuTidakLancarTarget;
            status = 'Tepat Waktu, Tidak Lancar, Capai Target';
        } else if (isLancar && !targetsMet) {
            poin = poinRules.tepatWaktuLancarTidakTarget;
            status = 'Tepat Waktu, Lancar, Tidak Capai Target';
        } else {
            poin = 0;
            status = 'Tidak Memenuhi Kriteria';
        }
    } else {
        poin = poinRules.tidakTepatWaktu;
        status = 'Tidak Tepat Waktu';
    }
    
    // Create setoran record
    if (!student.setoran) student.setoran = [];
    
    const setoran = {
        id: Date.now(),
        date: new Date().toISOString(),
        lembaga: appSettings.lembaga[lembagaKey].name,
        sesi: appSettings.sesiHalaqah.find(s => s.id === sesiId).name,
        baris: baris,
        halaman: parseFloat(halaman),
        kelancaran: kelancaran,
        kesalahan: kesalahan,
        tepatWaktu: isOnTime,
        capaiTarget: targetsMet,
        poin: poin,
        status: status,
        note: note || '',
        timestamp: new Date().toLocaleString('id-ID')
    };
    
    student.setoran.push(setoran);
    student.total_points += poin;
    student.lastActivity = 'Baru saja';
    
    // Update streak
    const today = new Date().toDateString();
    const lastSetoranDate = student.lastSetoranDate || '';
    
    if (lastSetoranDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastSetoranDate === yesterday.toDateString()) {
            student.streak += 1;
        } else if (lastSetoranDate === '') {
            student.streak = 1;
        } else {
            student.streak = 1;
        }
        
        student.lastSetoranDate = today;
    }
    
    // Update Total Hafalan
    if (!student.total_hafalan) student.total_hafalan = 0;
    student.total_hafalan += parseFloat(halaman);
    // Round to 2 decimal places to avoid floating point issues
    student.total_hafalan = Math.round(student.total_hafalan * 100) / 100;

    recalculateRankings();
    StorageManager.save();
    
    // Sync to Supabase immediately for real-time updates
    if (typeof syncStudentsToSupabase === 'function') {
        syncStudentsToSupabase().catch(err => console.error('Auto-sync error:', err));
    }
    
    closeModal();
    refreshAllData();
    showNotification(`✅ Setoran ${baris} baris (+${poin} poin) berhasil disimpan!`);
}

function showSetoranHistory(student) {
    if (!student.setoran || student.setoran.length === 0) {
        showNotification('📝 Belum ada riwayat setoran');
        return;
    }
    
    const totalBaris = student.setoran.reduce((sum, s) => sum + s.baris, 0);
    const totalHalaman = student.setoran.reduce((sum, s) => sum + s.halaman, 0);
    const isAdmin = typeof currentProfile !== 'undefined' && currentProfile && currentProfile.role === 'admin';
    
    const content = `
        <div class="p-8">
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="font-display font-bold text-3xl text-slate-800 mb-2">Riwayat Setoran</h2>
                    <p class="text-slate-500">${student.name} - Halaqah ${student.halaqah}</p>
                </div>
                <button onclick="closeModal()" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="bg-primary-50 rounded-2xl p-4 text-center">
                    <div class="text-primary-600 text-xs font-bold uppercase mb-1">Total Baris</div>
                    <div class="text-2xl font-bold text-primary-700">${totalBaris}</div>
                </div>
                <div class="bg-accent-teal/10 rounded-2xl p-4 text-center">
                    <div class="text-accent-teal text-xs font-bold uppercase mb-1">Total Halaman</div>
                    <div class="text-2xl font-bold text-accent-teal">${totalHalaman.toFixed(2)}</div>
                </div>
                <div class="bg-amber-50 rounded-2xl p-4 text-center">
                    <div class="text-amber-600 text-xs font-bold uppercase mb-1">Setoran</div>
                    <div class="text-2xl font-bold text-amber-600">${student.setoran.length}x</div>
                </div>
            </div>
            
            <div class="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                ${student.setoran.slice().reverse().map(s => {
                    const poinColor = s.poin === 2 ? 'text-green-600' : s.poin === 1 ? 'text-amber-600' : s.poin === 0 ? 'text-slate-500' : 'text-red-600';
                    const statusBadge = s.tepatWaktu ? 
                        '<span class="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">⏰ Tepat Waktu</span>' : 
                        '<span class="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">⏰ Terlambat</span>';
                    const lancarBadge = s.kelancaran === 'lancar' ? 
                        '<span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">✅ Lancar</span>' : 
                        `<span class="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">⚠️ ${s.kesalahan} salah</span>`;
                    const targetBadge = s.capaiTarget ? 
                        '<span class="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">🎯 Target</span>' : 
                        '<span class="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">Belum Target</span>';
                    
                    return `
                        <div class="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors group relative">
                            ${isAdmin ? `
                            <button onclick="deleteSetoran(${student.id}, ${s.id})" 
                                class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200" title="Hapus Setoran">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                            ` : ''}
                            <div class="flex items-start justify-between mb-2 pr-10">
                                <div>
                                    <div class="font-bold text-slate-800">${s.lembaga}</div>
                                    <div class="text-xs text-slate-500">${s.sesi}</div>
                                </div>
                                <div class="text-right">
                                    <div class="font-bold ${poinColor} text-xl">${s.poin >= 0 ? '+' : ''}${s.poin} poin</div>
                                    <div class="text-xs text-slate-500">${s.timestamp}</div>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 mb-2 flex-wrap">
                                ${statusBadge}
                                ${lancarBadge}
                                ${targetBadge}
                            </div>
                            <div class="flex items-center gap-4 text-sm">
                                <span class="text-slate-600">📏 ${s.baris} baris</span>
                                <span class="text-slate-600">📖 ${s.halaman} halaman</span>
                            </div>
                            ${s.note ? `<div class="mt-2 text-sm text-slate-600 italic">"${s.note}"</div>` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    createModal(content, false);
}

function deleteSetoran(studentId, setoranId) {
    // Security check: Only Admin can delete setoran
    if (typeof currentProfile === 'undefined' || !currentProfile || currentProfile.role !== 'admin') {
        showNotification('⛔ Akses ditolak: Hanya Admin yang dapat menghapus setoran', 'error');
        return;
    }

    if (!confirm('Apakah Anda yakin ingin menghapus setoran ini? Poin akan dikurangi.')) return;
    
    const student = dashboardData.students.find(s => s.id === studentId);
    if (!student) return;
    
    const setoranIndex = student.setoran.findIndex(s => s.id === setoranId);
    if (setoranIndex === -1) return;
    
    const setoran = student.setoran[setoranIndex];
    
    // Revert points
    student.total_points -= setoran.poin;
    if (student.total_points < 0) student.total_points = 0;
    
    // Revert hafalan
    student.total_hafalan -= setoran.halaman;
    if (student.total_hafalan < 0) student.total_hafalan = 0;
    // Fix floating point issues
    student.total_hafalan = Math.round(student.total_hafalan * 100) / 100;

    // Remove setoran
    student.setoran.splice(setoranIndex, 1);
    
    // Recalculate everything
    recalculateRankings();
    StorageManager.save();
    
    refreshAllData();
    showNotification('🗑️ Setoran berhasil dihapus');
    
    // Re-open modal to show updated history
    closeModal();
    setTimeout(() => showSetoranHistory(student), 300);
}

// Make functions globally accessible
window.showSetoranForm = showSetoranForm;
window.updateSetoranPreview = updateSetoranPreview;
window.handleSetoran = handleSetoran;
window.showSetoranHistory = showSetoranHistory;