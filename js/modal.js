// Modal Management Module
//
function formatHafalan(value) {
    const n = Number(value);
    if (Number.isNaN(n) || n <= 0) return '0';
    const fixed = n.toFixed(2);
    return fixed.replace(/\.?0+$/, '');
}

function getHafalanProgressPercent(value, targetJuz = 30) {
    const n = Number(value);
    const target = Number(targetJuz) || 30;
    if (Number.isNaN(n) || n <= 0) return 0;
    const percent = (n / target) * 100;
    if (percent < 0) return 0;
    if (percent > 100) return 100;
    return Math.round(percent);
}

function getTargetHafalanJuz(student) {
    if (!student) return 30;

    const lembaga = (student.lembaga || 'MTA').toUpperCase();
    const kelasRaw = (student.kelas || '').toString().toLowerCase();
    const match = kelasRaw.match(/\d+/);
    const kelasNum = match ? parseInt(match[0], 10) : null;

    if (lembaga === 'SDITA') {
        if (kelasNum === 1) return 0.55;
        if (kelasNum === 2) return 1.3;
        if (kelasNum === 3) return 2.15;
        if (kelasNum === 4) return 3.3;
        if (kelasNum === 5) return 4.45;
        if (kelasNum === 6) return 5;
        return 5;
    }

    if (lembaga === 'SMPITA') {
        if (kelasNum === 7) return 1.5;
        if (kelasNum === 8) return 3.5;
        if (kelasNum === 9) return 5;
        return 5;
    }

    if (lembaga === 'SMAITA') {
        const kategoriStr = String(student.kategori || '').toLowerCase();
        const statusStr = String(student.status || '').toLowerCase();
        const kategoriHasAlumni = kategoriStr.includes('alumni');
        const kategoriHasNon = kategoriStr.includes('non') || kategoriStr.includes('bukan');
        const statusHasAlumni = statusStr.includes('alumni');
        const statusHasNon = statusStr.includes('non') || statusStr.includes('bukan');
        const isAlumni = student.is_alumni === true ||
            ((kategoriHasAlumni || statusHasAlumni) && !(kategoriHasNon || statusHasNon));

        if (kelasNum === 10) return isAlumni ? 6.5 : 1.5;
        if (kelasNum === 11) return isAlumni ? 8.5 : 3.5;
        if (kelasNum === 12) return isAlumni ? 10 : 5;
        return isAlumni ? 10 : 5;
    }

    return 30;
}

function createModal(content, allowClickOutside = true) {
    const modal = document.createElement('div');
    modal.id = 'detailModal';
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm';

    // Only allow closing by clicking outside if allowClickOutside is true
    if (allowClickOutside) {
        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };
    }

    modal.innerHTML = `
        <div class="glass rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl border border-slate-200 animate-scale-in">
            ${content}
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('detailModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

function showStudentDetail(studentOrId) {
    // Resolve student object from ID if needed
    let student = studentOrId;
    if (typeof studentOrId === 'number' || typeof studentOrId === 'string') {
        student = dashboardData.students.find(s => s.id == studentOrId);
    }
    if (!student) return;

    console.log('[DEBUG] Rendering student details:', student.name);
    console.log('[DEBUG] TTL Data:', student.tempat_lahir, student.tanggal_lahir);

    const isAuthorized = typeof currentProfile !== 'undefined' &&
        (currentProfile.role === 'guru' || currentProfile.role === 'admin');

    // Determine default tab
    const defaultTab = isAuthorized ? 'input' : 'profil';

    // Determine current session
    let currentSessionId = '';
    let isCurrentSessionActive = false;

    const lembagaKey = student.lembaga || 'MTA';
    const hafalanTargetJuz = getTargetHafalanJuz(student);
    const hafalanPercent = getHafalanProgressPercent(student.total_hafalan, hafalanTargetJuz);

    if (typeof getCurrentSession === 'function') {
        const activeSession = getCurrentSession(lembagaKey);
        if (activeSession) {
            currentSessionId = activeSession.id;
            isCurrentSessionActive = true;
        }
    } else {
        // Fallback if helper not available
        const sessions = appSettings.lembaga[lembagaKey]?.sesiHalaqah || [];
        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        const activeSession = sessions.find(s =>
            s.active && currentTime >= s.startTime && currentTime <= s.endTime
        );
        if (activeSession) {
            currentSessionId = activeSession.id;
            isCurrentSessionActive = true;
        }
    }

    // Generate tabs HTML
    const tabs = `
        <div class="flex border-b border-slate-200 mb-6">
            ${isAuthorized ? `
            <button onclick="switchDetailTab('input')" id="tab-btn-input" class="flex-1 py-3 text-sm font-bold text-primary-600 border-b-2 border-primary-600 transition-colors">
                📝 Input Setoran
            </button>
            ` : ''}
            <button onclick="switchDetailTab('profil')" id="tab-btn-profil" class="flex-1 py-3 text-sm font-bold ${!isAuthorized ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-500 border-transparent'} transition-colors">
                👤 Profil
            </button>
            <button onclick="switchDetailTab('riwayat')" id="tab-btn-riwayat" class="flex-1 py-3 text-sm font-bold text-slate-500 border-b-2 border-transparent transition-colors">
                📜 Riwayat
            </button>
        </div>
    `;

    // Input Content
    let inputContent = '';
    if (isAuthorized) {
        // Get Lembaga Target
        const lembagaKey = student.lembaga || 'MTA';
        const lembagaSettings = appSettings.lembaga[lembagaKey] || appSettings.lembaga['MTA'];
        const targetBaris = lembagaSettings.targetBaris || 15;
        const barisPerHalaman = lembagaSettings.barisPerHalaman || 15;
        const sessions = lembagaSettings.sesiHalaqah || [];

        // Generate Sesi Options
        const sesiOptions = sessions.map(s =>
            `<option value="${s.id}" ${s.id === currentSessionId ? 'selected' : ''}>${s.name.replace(/ - (Pagi|Siang|Sore)/gi, '')} (${s.startTime}-${s.endTime})</option>`
        ).join('');

        inputContent = `
            <div id="tab-content-input" class="animate-fade-in">
                <form onsubmit="handleQuickSetoranDetail(event, ${student.id})" class="space-y-4">
                    <input type="hidden" id="target-baris-val" value="${targetBaris}">
                    <input type="hidden" id="lines-per-page-val" value="${barisPerHalaman}">
                    <input type="hidden" id="active-session-id" value="${currentSessionId}">
                    <input type="hidden" id="student-lembaga-val" value="${lembagaKey}">
                    
                    <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                        <!-- Sesi & Waktu Grid -->
                        <div class="grid grid-cols-2 gap-4">
                            <!-- Sesi Selection -->
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-2">Sesi Halaqah</label>
                                <select id="quick-sesi" name="sesi" class="w-full px-2 py-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none bg-white font-medium truncate" onchange="calculateAutoPoin()">
                                    <option value="" disabled ${!currentSessionId ? 'selected' : ''}>Pilih Sesi...</option>
                                    ${sesiOptions}
                                </select>
                            </div>

                             <!-- Tepat Waktu (Auto & Readonly) -->
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-2">Status Waktu</label>
                                <div id="status-tepat-waktu" class="flex items-center justify-between px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 transition-colors h-[50px]">
                                    <div class="flex items-center gap-2">
                                        <span id="icon-waktu" class="text-xl">⏱️</span>
                                        <div id="text-waktu" class="font-bold text-sm text-slate-700 truncate">Mengecek...</div>
                                    </div>
                                    <input type="hidden" id="check-tepat-waktu" name="tepat_waktu" value="false">
                                </div>
                            </div>
                        </div>

                        <!-- Baris & Halaman Grid -->
                        <div class="grid grid-cols-2 gap-4">
                            <!-- Baris Input -->
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-2 flex justify-between items-center">
                                    <span>Jml Baris</span>
                                    <span class="text-[10px] text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">T: ${targetBaris}</span>
                                </label>
                                <div class="relative">
                                    <input type="number" id="quick-baris" name="baris" min="0" placeholder="0" 
                                        onfocus="if(this.value=='0') this.value=''" 
                                        onblur="if(this.value=='') this.value='0'" 
                                        oninput="calculateHalamanDetail(this.value); calculateAutoPoin()"
                                        class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-center text-lg">
                                    <div id="badge-target" class="absolute -top-2 -right-2 hidden">
                                        <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 shadow-sm">🎯</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Auto-calculated Halaman -->
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-2 truncate" title="Konversi Halaman">Halaman (/${barisPerHalaman})</label>
                                <input type="number" id="quick-halaman" name="halaman" step="0.01" min="0" value="0" readonly
                                    class="w-full px-4 py-3 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl font-bold text-center text-lg">
                            </div>
                        </div>
                        <!-- Kelancaran & Kesalahan -->
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-2">Kelancaran</label>
                                <select id="select-kelancaran" name="kelancaran" onchange="calculateAutoPoin()"
                                    class="w-full px-2 py-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none bg-white font-medium">
                                    <option value="lancar">✅ Lancar</option>
                                    <option value="tidak_lancar">⚠️ Tidak Lancar</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-2">Jml Kesalahan</label>
                                <input type="number" id="input-kesalahan" name="kesalahan" min="0" value="0" 
                                    onfocus="if(this.value=='0') this.value=''" 
                                    onblur="if(this.value=='') this.value='0'"
                                    oninput="calculateAutoPoin()"
                                    class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-center">
                            </div>
                        </div>
                    </div>

                    <!-- Result Poin -->
                    <div class="bg-primary-50 p-4 rounded-xl border border-primary-100 text-center">
                        <div class="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">Hasil Penilaian</div>
                        <div id="poin-display" class="text-2xl font-black text-primary-700">Menunggu Input...</div>
                        <input type="hidden" id="quick-poin" name="poin" value="">
                    </div>

                    <div>
                         <label class="block text-sm font-bold text-slate-700 mb-2">Catatan (Opsional)</label>
                         <input type="text" name="keterangan" placeholder="Juz, Surat, Ayat..." class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none">
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                         <button type="button" onclick="setTidakSetor()" class="py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                            ❌ Ghaib (-1)
                        </button>
                        <button type="submit" class="py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 transition-transform hover:scale-[1.02] shadow-lg shadow-primary-200">
                            💾 Simpan
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    // Profil Content (Existing)
    const profilContent = `
        <div id="tab-content-profil" class="${isAuthorized ? 'hidden' : ''} animate-fade-in">
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-primary-50 rounded-2xl p-4">
                    <div class="text-primary-600 text-sm font-bold mb-1">Ranking Keseluruhan</div>
                    <div class="text-3xl font-bold text-primary-700">#${student.overall_ranking}</div>
                </div>
                <div class="bg-accent-teal/10 rounded-2xl p-4">
                    <div class="text-accent-teal text-sm font-bold mb-1">Total Poin</div>
                    <div class="text-3xl font-bold text-accent-teal">${student.total_points}</div>
                </div>
                <div class="bg-orange-50 rounded-2xl p-4">
                    <div class="text-orange-600 text-sm font-bold mb-1">Istiqomah</div>
                    <div class="text-3xl font-bold text-orange-600 flex items-center gap-2">
                        🔥 ${student.streak}
                    </div>
                </div>
                ${(typeof currentProfile !== 'undefined' && currentProfile && (currentProfile.role === 'admin' || currentProfile.role === 'guru')) ? `
                <div class="bg-purple-50 rounded-2xl p-4 cursor-pointer hover:bg-purple-100 transition-colors" onclick="closeModal(); showEditHafalanForm(${JSON.stringify(student).replace(/"/g, '&quot;')})" title="Klik untuk update total hafalan awal">
                    <div class="text-purple-600 text-sm font-bold mb-1 flex items-center gap-1">
                        Total Hafalan
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </div>
                    <div class="text-3xl font-bold text-purple-700 mb-2">${formatHafalan(student.total_hafalan)} Juz</div>
                    <div class="h-1.5 w-full bg-purple-100 rounded-full overflow-hidden">
                        <div class="h-full bg-purple-500 rounded-full" style="width: ${hafalanPercent}%;"></div>
                    </div>
                    <div class="text-xs text-purple-700 mt-1">
                        ${hafalanPercent}% dari ${hafalanTargetJuz} Juz
                    </div>
                </div>
                ` : `
                <div class="bg-purple-50 rounded-2xl p-4">
                    <div class="text-purple-600 text-sm font-bold mb-1">Total Hafalan</div>
                    <div class="text-3xl font-bold text-purple-700 mb-2">${formatHafalan(student.total_hafalan)} Juz</div>
                    <div class="h-1.5 w-full bg-purple-100 rounded-full overflow-hidden">
                        <div class="h-full bg-purple-500 rounded-full" style="width: ${hafalanPercent}%;"></div>
                    </div>
                    <div class="text-xs text-purple-700 mt-1">
                        ${hafalanPercent}% dari ${hafalanTargetJuz} Juz
                    </div>
                </div>
                `}
            </div>

            <!-- Data Pribadi Section -->
            <div class="mb-6 bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span class="text-xl">📋</span> Data Pribadi
                </h3>
                <div class="space-y-3">
                    <div class="grid grid-cols-3 gap-2 text-sm border-b border-slate-200 pb-2">
                        <div class="text-slate-500 font-medium">NISN / NIK</div>
                        <div class="col-span-2 font-bold text-slate-700">${student.nisn || '-'} / ${student.nik || '-'}</div>
                    </div>
                    <div class="grid grid-cols-3 gap-2 text-sm border-b border-slate-200 pb-2">
                        <div class="text-slate-500 font-medium">TTL</div>
                        <div class="col-span-2 font-bold text-slate-700">
                            ${(() => {
            const tempat = (student.tempat_lahir || '').trim();
            const tanggal = student.tanggal_lahir ? new Date(student.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
            if (tempat && tanggal) return `${tempat}, ${tanggal}`;
            if (tempat) return tempat;
            if (tanggal) return tanggal;
            return '-';
        })()}
                        </div>
                    </div>
                    <div class="grid grid-cols-3 gap-2 text-sm border-b border-slate-200 pb-2">
                        <div class="text-slate-500 font-medium">Jenis Kelamin</div>
                        <div class="col-span-2 font-bold text-slate-700">${student.jenis_kelamin === 'L' ? 'Laki-laki' : (student.jenis_kelamin === 'P' ? 'Perempuan' : '-')}</div>
                    </div>
                    <div class="grid grid-cols-3 gap-2 text-sm border-b border-slate-200 pb-2">
                        <div class="text-slate-500 font-medium">Alamat</div>
                        <div class="col-span-2 font-bold text-slate-700">${student.alamat || '-'}</div>
                    </div>
                    <div class="grid grid-cols-3 gap-2 text-sm border-b border-slate-200 pb-2">
                        <div class="text-slate-500 font-medium">No. HP</div>
                        <div class="col-span-2 font-bold text-slate-700">${student.hp || '-'}</div>
                    </div>
                    <div class="grid grid-cols-3 gap-2 text-sm border-b border-slate-200 pb-2">
                        <div class="text-slate-500 font-medium">Orang Tua</div>
                        <div class="col-span-2 font-bold text-slate-700">
                            Ayah: ${student.nama_ayah || '-'}<br>
                            Ibu: ${student.nama_ibu || '-'}
                        </div>
                    </div>
                    <div class="grid grid-cols-3 gap-2 text-sm">
                        <div class="text-slate-500 font-medium">Sekolah Asal</div>
                        <div class="col-span-2 font-bold text-slate-700">${student.sekolah_asal || '-'}</div>
                    </div>
                </div>
            </div>
            
            <div class="mb-6">
                <h3 class="font-bold text-slate-800 mb-3">Pencapaian</h3>
                <div class="flex gap-2 flex-wrap">
                    ${student.achievements.length > 0
            ? student.achievements.map(a => `<span class="text-4xl">${a}</span>`).join('')
            : '<span class="text-slate-400 text-sm">Belum ada pencapaian</span>'
        }
                </div>
            </div>

             ${(typeof currentProfile !== 'undefined' && currentProfile && currentProfile.role === 'admin') ? `
            <div class="flex flex-col gap-3 pt-4 border-t border-slate-100">
                 <button onclick="closeModal(); showEditStudentForm(${JSON.stringify(student).replace(/"/g, '&quot;')})" 
                    class="w-full py-3 bg-slate-50 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    Edit Data Santri
                </button>
                
                <div class="grid grid-cols-2 gap-3">
                    <button onclick="resetSingleStudent(${student.id})" 
                        class="py-3 bg-amber-50 text-amber-700 rounded-xl font-bold hover:bg-amber-100 transition-colors flex items-center justify-center gap-2 border border-amber-200">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Reset Poin
                    </button>
                    
                    <button onclick="confirmDeleteStudent(${student.id}); closeModal();" 
                        class="py-3 bg-red-50 text-red-700 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2 border border-red-200">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Hapus
                    </button>
                </div>
            </div>
            ` : ''}
        </div>
    `;

    // Riwayat Content (Placeholder - loaded dynamically usually)
    const riwayatContent = `
        <div id="tab-content-riwayat" class="hidden animate-fade-in">
             <div class="text-center py-8">
                <button onclick="closeModal(); showSetoranHistory(${student.id})" class="px-6 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200">
                    Buka Riwayat Lengkap
                </button>
             </div>
        </div>
    `;

    const content = `
        <div class="p-6 md:p-8">
            <div class="flex items-start justify-between mb-2">
                <div>
                    <h2 class="font-display font-bold text-2xl md:text-3xl text-slate-800 mb-1">${student.name}</h2>
                    <p class="text-slate-500 font-medium">Halaqah ${student.halaqah}</p>
                </div>
                <button onclick="closeModal()" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            ${tabs}
            ${inputContent}
            ${profilContent}
            ${riwayatContent}
        </div>
    `;

    createModal(content, false);

    // Initialize auto poin logic if input tab is active
    if (isAuthorized) {
        setTimeout(calculateAutoPoin, 100);
    }
}

// Helper functions for the new modal
function switchDetailTab(tabName) {
    // Update buttons
    document.querySelectorAll('[id^="tab-btn-"]').forEach(btn => {
        btn.classList.remove('text-primary-600', 'border-primary-600');
        btn.classList.add('text-slate-500', 'border-transparent');
    });
    const activeBtn = document.getElementById(`tab-btn-${tabName}`);
    if (activeBtn) {
        activeBtn.classList.add('text-primary-600', 'border-primary-600');
        activeBtn.classList.remove('text-slate-500', 'border-transparent');
    }

    // Update content
    document.querySelectorAll('[id^="tab-content-"]').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(`tab-content-${tabName}`).classList.remove('hidden');
}

function calculateHalamanDetail(baris) {
    const input = document.getElementById('quick-halaman');
    const linesPerPageInput = document.getElementById('lines-per-page-val');

    if (input) {
        let val = parseInt(baris) || 0;
        let divisor = 15; // Default fallback

        if (linesPerPageInput) {
            divisor = parseInt(linesPerPageInput.value) || 15;
        }

        let halaman = val / divisor;
        // Format to max 2 decimal places, but remove trailing zeros
        input.value = parseFloat(halaman.toFixed(2));
    }
}

function adjustBarisInput(amount) {
    const input = document.getElementById('quick-baris');
    if (input) {
        let val = parseInt(input.value) || 0;
        let newVal = val + amount;
        if (newVal < 0) newVal = 0;
        input.value = newVal;
        calculateHalamanDetail(newVal);
    }
}

function adjustHalamanInput(amount) {
    const input = document.getElementById('quick-halaman');
    if (input) {
        let val = parseFloat(input.value) || 0;
        input.value = (val + amount).toFixed(1);
    }
}

async function handleQuickSetoranDetail(event, studentId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const halaman = parseFloat(formData.get('halaman')) || 0;
    const poin = parseInt(formData.get('poin'));
    let keterangan = formData.get('keterangan') || '';

    // Append details to keterangan
    const kelancaran = formData.get('kelancaran');
    const kesalahan = formData.get('kesalahan');

    const details = [];
    if (kelancaran) details.push(kelancaran === 'lancar' ? 'Lancar' : 'Tidak Lancar');
    if (kesalahan && parseInt(kesalahan) > 0) details.push(`${kesalahan} Salah`);

    if (details.length > 0) {
        keterangan += (keterangan ? ' - ' : '') + `[${details.join(', ')}]`;
    }

    if (isNaN(poin)) {
        showNotification('❌ Pilih kondisi setoran!', 'error');
        return;
    }

    try {
        const student = dashboardData.students.find(s => s.id === studentId);
        if (!student) throw new Error('Santri not found');

        // 1. Update Points & Streak (via SetoranHarian API if available)
        const halaqah = dashboardData.halaqahs.find(h => h.name === student.halaqah);

        if (window.SetoranHarian && halaqah) {
            await SetoranHarian.create(studentId, halaqah.id, poin, keterangan);
            await updateStudentStreak(studentId);
        } else {
            // Fallback logic
            student.total_points += poin;
            student.streak = (student.streak || 0) + 1;
        }

        // 2. Update Hafalan (Manual Update)
        if (halaman > 0) {
            if (!student.total_hafalan) student.total_hafalan = 0;
            const juzIncrement = halaman / 20;
            student.total_hafalan += juzIncrement;
            student.total_hafalan = Math.round(student.total_hafalan * 100) / 100;
        }

        // 3. Save Setoran Data for Ziyadah Count
        const baris = parseInt(formData.get('baris')) || 0;
        console.log('[DEBUG ZIYADAH] === SAVING SETORAN ===');
        console.log('[DEBUG ZIYADAH] FormData baris:', formData.get('baris'));
        console.log('[DEBUG ZIYADAH] Parsed baris:', baris);
        console.log('[DEBUG ZIYADAH] Halaman:', halaman);
        console.log('[DEBUG ZIYADAH] Student:', student.name);
        console.log('[DEBUG ZIYADAH] Student.setoran before:', student.setoran);
        
        // Always initialize setoran array if not exists
        if (!student.setoran) {
            student.setoran = [];
            console.log('[DEBUG ZIYADAH] Initialized setoran array');
        }
        
        // Save setoran data (even if baris is 0, for tracking)
        const today = new Date().toISOString().split('T')[0];
        const sesi = formData.get('sesi') || '';
        
        const setoranData = {
            id: `set_${Date.now()}`,
            date: today,
            baris: baris,
            halaman: halaman,
            poin: poin,
            sesi: sesi,
            kelancaran: kelancaran,
            kesalahan: parseInt(kesalahan) || 0,
            keterangan: keterangan,
            timestamp: new Date().toISOString()
        };
        
        student.setoran.push(setoranData);
        console.log('[DEBUG ZIYADAH] Setoran saved:', setoranData);
        console.log('[DEBUG ZIYADAH] Total setoran for student:', student.setoran.length);
        console.log('[DEBUG ZIYADAH] Student.setoran after:', student.setoran);

        // 4. Save & Refresh
        recalculateRankings();
        StorageManager.save();
        
        console.log('[DEBUG ZIYADAH] === AFTER SAVE ===');
        console.log('[DEBUG ZIYADAH] Student.setoran final:', student.setoran);
        console.log('[DEBUG ZIYADAH] Calling refreshAllData...');

        // Sync to Supabase if available
        if (typeof syncStudentsToSupabase === 'function') {
            syncStudentsToSupabase().catch(err => console.error('Auto-sync error:', err));
        }

        refreshAllData();

        // Explicitly refresh Mutaba'ah Dashboard if it's open
        console.log('[DEBUG ZIYADAH] Checking if Mutabaah section is open...');
        if (typeof renderMutabaahDashboard === 'function') {
            const mutabaahSection = document.getElementById('mutabaah');
            if (mutabaahSection && !mutabaahSection.classList.contains('hidden')) {
                console.log('[DEBUG ZIYADAH] Calling renderMutabaahDashboard...');
                renderMutabaahDashboard();
            } else {
                console.log('[DEBUG ZIYADAH] Mutabaah section not open or not found');
            }
        } else {
            console.log('[DEBUG ZIYADAH] renderMutabaahDashboard function not found');
        }

        showNotification(`✅ Setoran berhasil! (+${poin} poin, +${halaman} hal)`);
        closeModal();

    } catch (error) {
        console.error('Error:', error);
        showNotification('❌ Gagal menyimpan: ' + error.message, 'error');
    }
}

function calculateAutoPoin() {
    const barisInput = document.getElementById('quick-baris');
    const targetInput = document.getElementById('target-baris-val');
    const selectKelancaran = document.getElementById('select-kelancaran');
    const inputKesalahan = document.getElementById('input-kesalahan');
    const poinInput = document.getElementById('quick-poin');
    const poinDisplay = document.getElementById('poin-display');
    const sesiSelect = document.getElementById('quick-sesi');

    // UI Elements for feedback
    const badgeTarget = document.getElementById('badge-target');
    const statusTepatWaktu = document.getElementById('status-tepat-waktu');
    const iconWaktu = document.getElementById('icon-waktu');
    const textWaktu = document.getElementById('text-waktu');
    const checkTepatWaktuInput = document.getElementById('check-tepat-waktu'); // hidden input

    if (!barisInput || !targetInput || !selectKelancaran || !inputKesalahan || !poinInput || !poinDisplay || !sesiSelect) return;

    // 1. Calculate Target Reached
    const baris = parseInt(barisInput.value) || 0;
    const target = parseInt(targetInput.value) || 15;
    const isTargetReached = baris >= target;

    // Update Target Badge
    if (badgeTarget) {
        if (isTargetReached) {
            badgeTarget.classList.remove('hidden');
        } else {
            badgeTarget.classList.add('hidden');
        }
    }

    // 2. Calculate Tepat Waktu (Strict Mode)
    let isTepatWaktu = false;
    const selectedSesiId = parseInt(sesiSelect.value);
    const lembagaKey = document.getElementById('student-lembaga-val')?.value || 'MTA';

    // Auto-lock session logic
    const currentSessionId = document.getElementById('active-session-id')?.value;
    if (currentSessionId && currentSessionId !== 'undefined' && currentSessionId !== '') {
        // If active session exists, force select it
        if (sesiSelect.value != currentSessionId) {
            sesiSelect.value = currentSessionId;
        }
        sesiSelect.disabled = true;
    } else {
        sesiSelect.disabled = false;
    }

    if (selectedSesiId && typeof appSettings !== 'undefined') {
        const settings = appSettings.lembaga[lembagaKey] || appSettings.lembaga['MTA'];
        const sessions = settings.sesiHalaqah || [];
        const sesi = sessions.find(s => s.id === selectedSesiId);

        if (sesi) {
            const now = new Date();
            const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
            // Check if current time is within session time
            if (currentTime >= sesi.startTime && currentTime <= sesi.endTime) {
                isTepatWaktu = true;
            }
        }
    }

    // Update Tepat Waktu UI
    if (statusTepatWaktu && iconWaktu && textWaktu) {
        if (isTepatWaktu) {
            statusTepatWaktu.className = "flex items-center justify-between p-4 border border-green-200 rounded-xl bg-green-50 transition-colors";
            iconWaktu.textContent = "✅";
            textWaktu.textContent = "Tepat Waktu";
            textWaktu.className = "font-bold text-green-700";
        } else {
            statusTepatWaktu.className = "flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50 transition-colors opacity-75";
            iconWaktu.textContent = "⏰";
            textWaktu.textContent = "Terlambat";
            textWaktu.className = "font-bold text-slate-500";
        }
    }
    if (checkTepatWaktuInput) checkTepatWaktuInput.value = isTepatWaktu;

    // 3. Calculate Poin
    let kelancaran = selectKelancaran.value;
    const kesalahan = parseInt(inputKesalahan.value) || 0;

    // UX: Auto-update select state based on mistakes input
    // Only update if mistakes > 0 and current selection is 'lancar'
    if (kesalahan > 0 && kelancaran === 'lancar') {
        selectKelancaran.value = 'tidak_lancar';
        kelancaran = 'tidak_lancar';
    }
    // Only update if mistakes == 0 and current selection is 'tidak_lancar' 
    // AND user hasn't explicitly set it to tidak_lancar (hard to detect intent here, so maybe just force update for consistency)
    else if (kesalahan === 0 && kelancaran === 'tidak_lancar') {
        selectKelancaran.value = 'lancar';
        kelancaran = 'lancar';
    }

    // Logic Poin
    const isLancar = (kelancaran === 'lancar' && kesalahan === 0);
    // Tidak Lancar: Valid if mistakes are between 1 and 3 (inclusive)
    // Note: If mistakes > 3, it is definitely not Lancar and not valid for "Tidak Lancar (+1)" point either.
    const isTidakLancar = (kelancaran === 'tidak_lancar' && kesalahan > 0 && kesalahan <= 3);

    let poin = 0;
    let label = "😐 Maqbul (0)";

    if (!isTepatWaktu) {
        poin = 0;
        label = "😐 Maqbul (0) - Terlambat";
    } else {
        if (isLancar && isTargetReached) {
            poin = 2;
            label = "✅ Mumtaz (+2)";
        } else if (isTidakLancar && isTargetReached) {
            poin = 1;
            label = "⚠️ Jayyid (+1)";
        } else {
            // Valid but 0 points scenarios
            if (isTargetReached) {
                // Target met but too many mistakes
                label = "😐 Maqbul (0) - Byk Salah";
            } else {
                label = "😐 Maqbul (0) - Kurang Target";
            }
            poin = 0;
        }
    }

    poinInput.value = poin;
    poinDisplay.textContent = label;

    // Color coding
    poinDisplay.className = "text-2xl font-black transition-colors " +
        (poin === 2 ? "text-green-600" :
            poin === 1 ? "text-amber-600" :
                "text-slate-600");
}

function setTidakSetor() {
    const poinInput = document.getElementById('quick-poin');
    const poinDisplay = document.getElementById('poin-display');
    const barisInput = document.getElementById('quick-baris');

    if (confirm("Tandai santri ini sebagai Ghaib / Tidak Setor (-1)?")) {
        poinInput.value = -1;
        poinDisplay.textContent = "❌ Ghaib (-1)";
        poinDisplay.className = "text-2xl font-black text-red-600";
        barisInput.value = 0; // Reset baris
        calculateHalamanDetail(0);

        // Reset manual toggles
        const checkLancar = document.getElementById('check-lancar');
        if (checkLancar) checkLancar.checked = false;

        // Update other indicators manually
        const badgeTarget = document.getElementById('badge-target');
        if (badgeTarget) {
            badgeTarget.className = "text-xs font-bold px-2 py-1 rounded-lg bg-red-100 text-red-700 transition-colors";
            badgeTarget.textContent = "❌ Ghaib";
        }
    }
}

// Make globally accessible
window.switchDetailTab = switchDetailTab;
window.adjustHalamanInput = adjustHalamanInput;
window.adjustBarisInput = adjustBarisInput;
window.calculateHalamanDetail = calculateHalamanDetail;
window.handleQuickSetoranDetail = handleQuickSetoranDetail;
window.calculateAutoPoin = calculateAutoPoin;
window.setTidakSetor = setTidakSetor;

// Keep existing showHalaqahDetail
function showHalaqahDetail(halaqah) {
    const members = getStudentsByHalaqah(halaqah.name.replace('Halaqah ', ''));
    
    // Calculate total hafalan for halaqah
    const totalHafalan = members.reduce((sum, m) => sum + (parseFloat(m.total_hafalan) || 0), 0);
    const avgHafalan = members.length > 0 ? (totalHafalan / members.length).toFixed(1) : 0;

    const content = `
        <div class="p-8">
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="font-display font-bold text-3xl text-slate-800 mb-2">${halaqah.name}</h2>
                    <p class="text-slate-500">Ranking #${halaqah.rank} • ${halaqah.members} Anggota</p>
                </div>
                <button onclick="closeModal()" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-primary-50 rounded-2xl p-4 text-center">
                    <div class="text-primary-600 text-sm font-bold mb-1">Total Poin</div>
                    <div class="text-2xl font-bold text-primary-700">${halaqah.points}</div>
                </div>
                <div class="bg-accent-teal/10 rounded-2xl p-4 text-center">
                    <div class="text-accent-teal text-sm font-bold mb-1">Rata-rata</div>
                    <div class="text-2xl font-bold text-accent-teal">${halaqah.avgPoints}</div>
                </div>
                <div class="bg-purple-50 rounded-2xl p-4 text-center">
                    <div class="text-purple-600 text-sm font-bold mb-1">Total Hafalan</div>
                    <div class="text-2xl font-bold text-purple-700">${totalHafalan.toFixed(1)} Juz</div>
                </div>
                <div class="bg-slate-50 rounded-2xl p-4 text-center">
                    <div class="text-slate-600 text-sm font-bold mb-1">Rata Hafalan</div>
                    <div class="text-2xl font-bold text-slate-700">${avgHafalan} Juz</div>
                </div>
            </div>
            
            <div>
                <h3 class="font-bold text-slate-800 mb-3">Daftar Anggota</h3>
                <div class="space-y-2">
                    ${members.map(m => `
                        <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                            <div class="flex-1">
                                <div class="font-semibold text-slate-800">${m.name}</div>
                                <div class="text-xs text-slate-500">Rank #${m.overall_ranking}</div>
                            </div>
                            <div class="flex items-center gap-4">
                                <div class="text-center">
                                    <div class="text-xs text-purple-600 font-semibold">Hafalan</div>
                                    <div class="font-bold text-purple-700">${(parseFloat(m.total_hafalan) || 0).toFixed(1)} Juz</div>
                                </div>
                                <div class="text-right">
                                    <div class="font-bold text-primary-600">${m.total_points} pts</div>
                                    <div class="text-xs text-slate-500">🔥 ${m.streak} hari</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    createModal(content, false);
}

function showEditHafalanForm(student) {
    const content = `
        <div class="p-8">
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="font-display font-bold text-3xl text-slate-800 mb-2">Edit Total Hafalan</h2>
                    <p class="text-slate-500">${student.name}</p>
                </div>
                <button onclick="closeModal(); showStudentDetail(${JSON.stringify(student).replace(/"/g, '&quot;')})" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <form onsubmit="handleEditHafalan(event, ${student.id})" class="space-y-4">
                <div class="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm mb-4">
                    <p>ℹ️ Fitur ini digunakan untuk mengatur ulang atau memasukkan <strong>Total Hafalan Awal</strong> santri.</p>
                </div>

                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Total Hafalan (Halaman)</label>
                    <input type="number" step="0.01" name="total_hafalan" required
                        value="${student.total_hafalan || 0}"
                        onfocus="if(this.value=='0') this.value=''" 
                        onblur="if(this.value=='') this.value='0'"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-2xl font-bold text-center">
                </div>
                
                <div class="flex gap-3 pt-4">
                    <button type="submit" 
                        class="flex-1 bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg">
                        Simpan Perubahan
                    </button>
                    <button type="button" onclick="closeModal(); showStudentDetail(${JSON.stringify(student).replace(/"/g, '&quot;')})" 
                        class="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                        Batal
                    </button>
                </div>
            </form>
        </div>
    `;

    createModal(content, false);
}

function handleEditHafalan(event, studentId) {
    console.log('[EDIT HAFALAN] Function called! studentId:', studentId);
    event.preventDefault();
    const formData = new FormData(event.target);
    const totalHafalan = parseFloat(formData.get('total_hafalan'));
    console.log('[EDIT HAFALAN] Input value:', totalHafalan);

    const student = dashboardData.students.find(s => s.id === studentId);
    if (student) {
        console.log('[EDIT HAFALAN] Student found:', student.name);
        console.log('[EDIT HAFALAN] Before:', student.total_hafalan);
        student.total_hafalan = totalHafalan;
        console.log('[EDIT HAFALAN] After:', student.total_hafalan);
        
        StorageManager.save();
        console.log('[EDIT HAFALAN] Saved to localStorage');
        
        // Sync to Supabase
        if (window.autoSync) {
            console.log('[EDIT HAFALAN] Syncing to Supabase...');
            autoSync();
        } else {
            console.warn('[EDIT HAFALAN] autoSync not available!');
        }
        
        refreshAllData();
        closeModal();
        showNotification('✅ Total hafalan berhasil diperbarui!');

        // Re-open detail to show changes
        setTimeout(() => showStudentDetail(student), 300);
    } else {
        console.error('[EDIT HAFALAN] Student not found! ID:', studentId);
    }
}

// Make functions globally accessible
window.closeModal = closeModal;
window.showStudentDetail = showStudentDetail;
window.showHalaqahDetail = showHalaqahDetail;
window.showEditHafalanForm = showEditHafalanForm;
window.handleEditHafalan = handleEditHafalan;
