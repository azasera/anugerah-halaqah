// Mutaba'ah Quran (Unified Tilawah, Ziyadah, & Murojaah) Management Module
// Mobile-first, professional UI for recording daily Quranic activities as a unified concept.

const prayerConfigs = [
    { id: 'subuh', name: 'Subuh', icon: '🌅', time: '04:00 - 06:00' },
    { id: 'zhuhur', name: 'Zhuhur', icon: '☀️', time: '11:30 - 13:00' },
    { id: 'ashar', name: 'Ashar', icon: '🌤️', time: '15:00 - 17:30' },
    { id: 'maghrib', name: 'Maghrib', icon: '🌇', time: '17:45 - 19:00' },
    { id: 'isya', name: 'Isya', icon: '🌙', time: '19:00 - 21:00' }
];

function initMutabaahData() {
    if (!dashboardData.tilawah) {
        dashboardData.tilawah = [];
    }
    // We reuse tilawah key for background historical data to preserve previous work
}

function showMutabaahSection() {
    const container = document.getElementById('mutabaahContainer');
    if (!container) {
        // Create container if it doesn't exist in the section
        const section = document.getElementById('mutabaah');
        if (section) {
            section.innerHTML = '<div id="mutabaahContainer"></div>';
        }
    }

    renderMutabaahDashboard();
}

function renderMutabaahDashboard() {
    const container = document.getElementById('mutabaahContainer');
    if (!container) return;

    // Determine current student context (Parent/Guru/Admin)
    const profile = window.currentProfile;
    const role = profile ? profile.role : null;
    let student = null;

    // 1. Check if we have a chosen student in "Guru/Admin Select Mode"
    if (window.selectedMutabaahStudentId) {
        student = dashboardData.students.find(s => s.id === window.selectedMutabaahStudentId);
    }

    // 2. If not, and user is Ortu, auto-select their child
    if (!student) {
        const child = window.currentUserChild;
        if (role === 'ortu' && child) {
            student = child;
        }
    }

    if (!student && (role === 'guru' || role === 'admin')) {
        renderStudentSelectionForMutabaah();
        return;
    }

    if (!student) {
        container.innerHTML = `
            <div class="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                <div class="text-6xl mb-4">📖</div>
                <h3 class="font-bold text-xl text-slate-800 mb-2">Pilih Santri Terlebih Dahulu</h3>
                <p class="text-slate-500 mb-6">Silakan pilih santri untuk melihat atau mengisi Mutaba'ah Quran.</p>
                <button onclick="scrollToSection('ranking'); showRankingSubSection('santri')" class="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold font-display">Cari Santri</button>
            </div>
        `;
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    const todayData = dashboardData.tilawah.find(t => String(t.studentId) === String(student.id) && t.date === today) || {
        studentId: student.id,
        date: today,
        entries: {},
        summary: { totalHalaman: 0 },
        approval: { ortu: { status: false }, guru: { status: false } }
    };

    // Calculate today's Ziyadah from student.setoran
    const todayStr = new Date().toDateString();
    const todayZiyadah = (student.setoran || []).filter(s => new Date(s.date).toDateString() === todayStr);
    const todayZiyadahCount = todayZiyadah.reduce((sum, s) => sum + s.baris, 0);

    // Calculate progress
    const progress = Math.min((todayData.summary?.totalHalaman || 0) / 20 * 100, 100);

    let content = `
        <div class="space-y-6 pb-20">
            <!-- Professional Header Card -->
            <div class="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                <div class="absolute top-0 right-0 p-4 opacity-10">
                    <svg class="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                </div>
                <div class="relative z-10">
                    <div class="flex items-center justify-between mb-4">
                         <div class="flex items-center gap-3">
                            <div class="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-xl">📖</div>
                            <div>
                                <h2 class="font-display font-bold text-2xl">Mutaba'ah Quran</h2>
                                <p class="text-emerald-100 text-sm opacity-90">${student.name}</p>
                            </div>
                        </div>
                        ${(role === 'guru' || role === 'admin') ? `
                            <button onclick="window.selectedMutabaahStudentId = null; renderMutabaahDashboard();" class="p-2 bg-white/20 rounded-lg text-xs font-bold">Ganti Santri</button>
                        ` : ''}
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4 mt-4">
                        <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                            <div class="flex justify-between items-end mb-2">
                                <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-100">Tilawah</span>
                                <span class="text-lg font-black">${todayData.summary?.totalHalaman || 0} / 20 <span class="text-[10px] font-normal text-emerald-200">hlm</span></span>
                            </div>
                            <div class="w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
                                <div class="bg-accent-gold h-full transition-all duration-1000" style="width: ${progress}%"></div>
                            </div>
                        </div>
                        <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                            <div class="flex justify-between items-end mb-2">
                                <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-100">Ziyadah</span>
                                <span class="text-lg font-black">${todayZiyadahCount} <span class="text-[10px] font-normal text-emerald-200">baris</span></span>
                            </div>
                            <div class="text-[10px] text-emerald-100 opacity-80">${todayZiyadahCount > 0 ? '✅ Sudah Setoran' : '⌛ Belum Setoran'}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Unified Activity Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Ziyadah & Murojaah Action Card -->
                <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 md:col-span-2">

                    <div class="grid grid-cols-3 gap-2">
                        <button onclick="showTilawahQuickInput(${student.id})" class="flex items-center justify-center flex-col gap-1.5 p-3 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-all border border-blue-100 active:scale-95">
                            <span class="text-xl text-blue-600">📖</span>
                            <span class="text-[10px]">Tilawah</span>
                        </button>
                        <button onclick="showStudentDetail(${student.id})" class="flex items-center justify-center flex-col gap-1.5 p-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold hover:bg-emerald-100 transition-all border border-emerald-100 active:scale-95">
                            <span class="text-xl text-emerald-600">➕</span>
                            <span class="text-[10px]">Ziyadah</span>
                        </button>
                        <button onclick="openMurojaahInputForm(${student.id})" class="flex items-center justify-center flex-col gap-1.5 p-3 bg-amber-50 text-amber-700 rounded-xl font-bold hover:bg-amber-100 transition-all border border-amber-100 active:scale-95">
                             <span class="text-xl text-amber-600">🔄</span>
                             <span class="text-[10px]">Murojaah</span>
                        </button>
                    </div>
                </div>


            </div>

            <!-- Approval Section -->
            <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div class="flex items-center justify-between">
                    <h3 class="font-bold text-slate-800 flex items-center gap-2">
                        <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Verifikasi Harian
                    </h3>
                </div>
                
                <div class="grid grid-cols-2 gap-3">
                    <div class="p-4 rounded-2xl border-2 ${todayData.approval.ortu.status ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-slate-50 text-slate-400'} flex flex-col items-center gap-2 text-center">
                        <div class="text-xl">${todayData.approval.ortu.status ? '✅' : '🏠'}</div>
                        <div class="text-[10px] font-bold uppercase tracking-wider">Orang Tua</div>
                        ${!todayData.approval.ortu.status && role === 'ortu' ? `
                            <button onclick="approveMutabaah('ortu', ${student.id})" class="mt-2 px-4 py-1.5 bg-emerald-600 text-white text-[10px] rounded-full font-bold shadow-lg shadow-emerald-200">Setujui</button>
                        ` : `
                            <div class="text-[9px] font-medium px-2 py-0.5 rounded-full ${todayData.approval.ortu.status ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}">${todayData.approval.ortu.status ? 'DIVERIFIKASI' : 'BELUM'}</div>
                        `}
                    </div>
                    
                    <div class="p-4 rounded-2xl border-2 ${todayData.approval.guru.status ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-slate-50 text-slate-400'} flex flex-col items-center gap-2 text-center">
                        <div class="text-xl">${todayData.approval.guru.status ? '✅' : '👨‍🏫'}</div>
                        <div class="text-[10px] font-bold uppercase tracking-wider">Guru Halaqah</div>
                        ${!todayData.approval.guru.status && (role === 'guru' || role === 'admin') ? `
                            <button onclick="approveMutabaah('guru', ${student.id})" class="mt-2 px-4 py-1.5 bg-emerald-600 text-white text-[10px] rounded-full font-bold shadow-lg shadow-emerald-200">Setujui</button>
                        ` : `
                            <div class="text-[9px] font-medium px-2 py-0.5 rounded-full ${todayData.approval.guru.status ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}">${todayData.approval.guru.status ? 'DIVERIFIKASI' : 'BELUM'}</div>
                        `}
                    </div>
                </div>
            </div>
            
            <!-- History Button -->
            <button onclick="showMutabaahHistory(${student.id})" class="w-full p-4 bg-slate-900 border-2 border-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
                <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                Grafik & Riwayat Quran
            </button>
        </div>
    `;

    container.innerHTML = content;
}

function openTilawahInputForm(prayerId, studentId) {
    const student = dashboardData.students.find(s => String(s.id) === String(studentId));
    if (!student) return;

    const prayer = prayerConfigs.find(p => p.id === prayerId);
    const today = new Date().toISOString().split('T')[0];
    const todayData = dashboardData.tilawah.find(t => String(t.studentId) === String(studentId) && t.date === today) || { entries: {} };
    const existingEntry = todayData.entries[prayerId] || {};

    const content = `
        <div class="p-8">
            <div class="flex items-center justify-between mb-8">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-4xl shadow-sm border border-emerald-100">
                        ${prayer.icon}
                    </div>
                    <div>
                        <h2 class="font-display font-bold text-3xl text-slate-800">Capaian ${prayer.name}</h2>
                        <p class="text-slate-500 text-sm">Target: 4 Halaman (1/5 Juz)</p>
                    </div>
                </div>
                <button onclick="closeModal()" class="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:bg-slate-200 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <form onsubmit="handleMutabaahSubmission(event, '${prayerId}', ${studentId})" class="space-y-6">
                <!-- Data Layout -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Juz</label>
                        <input type="number" name="juz" value="${existingEntry.juz || ''}" placeholder="1-30" required
                            class="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none text-2xl font-black text-slate-800 transition-all">
                    </div>
                    <div class="space-y-2">
                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Halaman</label>
                        <input type="number" name="hal" value="${existingEntry.hal || ''}" placeholder="1-604" required
                            class="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none text-2xl font-black text-slate-800 transition-all">
                    </div>
                </div>

                <div class="space-y-2">
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Surah</label>
                    <div class="relative">
                        <input type="text" name="surah" value="${existingEntry.surah || ''}" list="surahList" placeholder="Contoh: Al-Baqarah" required
                            class="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none font-bold text-slate-800 transition-all">
                        <div class="absolute right-4 top-4.5 opacity-20">📖</div>
                    </div>
                    ${generateSurahDatalist()}
                </div>

                <div class="space-y-2">
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Catatan Tadabbur/Kendala</label>
                    <textarea name="note" rows="3" placeholder="Contoh: Belum lancar di ayat 15-20..."
                        class="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none text-sm font-medium text-slate-700 transition-all">${existingEntry.note || ''}</textarea>
                </div>

                <div class="pt-6 grid grid-cols-2 gap-4">
                    <button type="button" onclick="closeModal()" 
                        class="px-6 py-4 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all">Batal</button>
                    <button type="submit" 
                        class="px-6 py-4 bg-emerald-600 text-white rounded-2xl font-display font-bold text-lg shadow-xl shadow-emerald-200 active:scale-95 transition-all">Simpan Capaian</button>
                </div>
            </form>
        </div>
    `;

    createModal(content, false);
}

function handleMutabaahSubmission(event, prayerId, studentId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const today = new Date().toISOString().split('T')[0];

    initMutabaahData();

    let todayDataIndex = dashboardData.tilawah.findIndex(t => String(t.studentId) === String(studentId) && t.date === today);
    let todayData;

    if (todayDataIndex === -1) {
        todayData = {
            id: `til_${Date.now()}`,
            studentId: studentId,
            date: today,
            entries: {},
            summary: { totalHalaman: 0 },
            approval: { ortu: { status: false }, guru: { status: false } }
        };
        dashboardData.tilawah.push(todayData);
        todayDataIndex = dashboardData.tilawah.length - 1;
    } else {
        todayData = dashboardData.tilawah[todayDataIndex];
    }

    const newEntry = {
        juz: parseInt(formData.get('juz')),
        hal: parseInt(formData.get('hal')),
        surah: formData.get('surah').trim(),
        note: formData.get('note').trim(),
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    todayData.entries[prayerId] = newEntry;

    // Recalculate summary (Total pages today)
    // We assume 4 pages per verified entry for simplified dashboard progress
    let totalEntries = Object.keys(todayData.entries).length;
    todayData.summary.totalHalaman = totalEntries * 4;

    StorageManager.save();
    if (window.autoSync) window.autoSync();

    closeModal();
    renderMutabaahDashboard();
    showNotification(`✅ Mutaba'ah Tilawah ${prayerId} berhasil disimpan!`, 'success');
}

function approveMutabaah(role, studentId) {
    const today = new Date().toISOString().split('T')[0];
    const todayData = dashboardData.tilawah.find(t => String(t.studentId) === String(studentId) && t.date === today);

    if (!todayData) {
        showNotification('❌ Isi tilawah terlebih dahulu!', 'error');
        return;
    }

    const profile = (typeof window.currentProfile === 'function') ? window.currentProfile() : (window.currentProfile || null);

    todayData.approval[role] = {
        status: true,
        timestamp: new Date().toISOString(),
        userId: profile ? profile.id : 'unknown'
    };

    StorageManager.save();
    if (window.autoSync) window.autoSync();

    renderMutabaahDashboard();
    showNotification(`✅ Terverifikasi oleh ${role === 'ortu' ? 'Orang Tua' : 'Guru'}`, 'success');
}

function renderStudentSelectionForMutabaah() {
    const container = document.getElementById('mutabaahContainer');
    let students = dashboardData.students;

    // REMOVED: Role-based filtering for parents - they can now see all students
    // Parents can now access full mutaba'ah data for context

    const content = `
        <div class="space-y-6">
            <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
                <div class="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">📖</div>
                <h2 class="font-display font-bold text-2xl text-slate-800 mb-2">Pilih Santri Tahfidz</h2>
                <p class="text-slate-500 mb-8 max-w-xs mx-auto text-sm">Silakan cari nama santri untuk dikelola mutaba'ahnya hari ini.</p>
                
                <div class="relative mb-6">
                    <input type="text" placeholder="Cari santri..." oninput="filterMutabaahStudentList(this.value)"
                        class="w-full px-5 py-4 pl-12 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium">
                    <svg class="w-6 h-6 absolute left-4 top-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>

                <div id="mutabaahStudentList" class="space-y-3 max-h-96 overflow-y-auto custom-scrollbar px-1">
                    ${students.length > 0 ? students.map(s => `
                        <div onclick="selectStudentForMutabaah(${s.id})" 
                            class="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-emerald-50 hover:border-emerald-200 transition-all cursor-pointer group shadow-sm bg-white">
                            <div class="text-left">
                                <div class="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">${s.name}</div>
                                <div class="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">Halaqah ${s.halaqah}</div>
                            </div>
                            <div class="w-8 h-8 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                            </div>
                        </div>
                    `).join('') : '<div class="py-8 text-slate-400 italic">Tidak ada data santri</div>'}
                </div>
            </div>
        </div>
    `;

    container.innerHTML = content;
}

function selectStudentForMutabaah(studentId) {
    window.selectedMutabaahStudentId = studentId;
    renderMutabaahDashboard();
}

function filterMutabaahStudentList(term) {
    const container = document.getElementById('mutabaahStudentList');
    if (!container) return;

    const termLower = term.toLowerCase();
    let students = dashboardData.students;

    // REMOVED: Role-based filtering for parents - they can now see all students

    container.innerHTML = students
        .filter(s => s.name.toLowerCase().includes(termLower) || s.halaqah.toLowerCase().includes(termLower))
        .map(s => `
            <div onclick="selectStudentForMutabaah(${s.id})" 
                class="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-emerald-50 hover:border-emerald-200 transition-all cursor-pointer group shadow-sm bg-white">
                <div class="text-left">
                    <div class="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">${s.name}</div>
                    <div class="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">Halaqah ${s.halaqah}</div>
                </div>
                <div class="w-8 h-8 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
            </div>
        `).join('');
}

function showMutabaahHistory(studentId) {
    const student = dashboardData.students.find(s => s.id === studentId);
    if (!student) return;

    const history = (dashboardData.tilawah || []).filter(t => String(t.studentId) === String(studentId)).sort((a, b) => new Date(b.date) - new Date(a.date));

    const content = `
        <div class="p-8">
            <div class="flex items-center justify-between mb-8">
                <div>
                     <div class="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-1">Historical Data</div>
                    <h2 class="font-display font-bold text-3xl text-slate-800">Laporan Mutaba'ah</h2>
                    <p class="text-slate-500">${student.name}</p>
                </div>
                <button onclick="closeModal()" class="p-3 bg-slate-100 rounded-2xl text-slate-400">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <div class="space-y-4">
                ${history.length > 0 ? history.map(h => `
                    <div class="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <div class="font-bold text-slate-800">${new Date(h.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                                <div class="text-[10px] text-emerald-600 font-black tracking-widest mt-1">CAPAIAN: ${h.summary.totalHalaman} HALAMAN</div>
                            </div>
                            <div class="flex gap-1.5">
                                <span class="px-2.5 py-1 ${h.approval.ortu.status ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'} text-[8px] font-black rounded-lg">ORTU</span>
                                <span class="px-2.5 py-1 ${h.approval.guru.status ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'} text-[8px] font-black rounded-lg">GURU</span>
                            </div>
                        </div>
                        <div class="grid grid-cols-5 gap-2">
                            ${prayerConfigs.map(p => {
        const entry = h.entries[p.id];
        return `<div class="p-2.5 rounded-2xl text-center border ${entry ? 'bg-emerald-50/50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-300'}">
                                    <div class="text-lg">${p.icon}</div>
                                    <div class="text-[7px] font-black mt-1 uppercase tracking-tighter">${p.name}</div>
                                </div>`;
    }).join('')}
                        </div>
                    </div>
                `).join('') : `
                    <div class="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <div class="text-6xl mb-4">📭</div>
                        <p class="text-slate-500 font-bold">Belum ada riwayat tercatat.</p>
                        <p class="text-xs text-slate-400 mt-1">Mulailah mengisi mutaba'ah hari ini.</p>
                    </div>
                `}
            </div>
        </div>
    `;

    createModal(content, false);
}

function generateSurahDatalist() {
    const surahs = ["Al-Fatihah", "Al-Baqarah", "Ali 'Imran", "An-Nusa'", "Al-Ma'idah", "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Taubah", "Yunus", "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra'", "Al-Kahf", "Maryam", "Thaha", "Al-Anbiya'", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan", "Asy-Syu'ara'", "An-Naml", "Al-Qashash", "Al-'Ankabut", "Ar-Rum", "Luqman", "As-Sajdah", "Al-Ahzab", "Saba'", "Fathir", "Yasin", "Ash-Shaffat", "Shad", "Az-Zumar", "Ghafir", "Fushshilat", "Asy-Syura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jatsiyah", "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf", "Adz-Dzariyat", "Ath-Thur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid", "Al-Mujadilah", "Al-Hasyr", "Al-Mumtahanah", "Ash-Shaff", "Al-Jumu'ah", "Al-Munafiqun", "At-Taghabun", "Ath-Thalaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij", "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddatstsir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba'", "An-Nazi'at", "'Abasa", "At-Takwir", "Al-Infithar", "Al-Muthaffifin", "Al-Insyiqaq", "Al-Buruj", "Ath-Thariq", "Al-A'la", "Al-Ghasyiyah", "Al-Fajr", "Al-Balad", "Asy-Syams", "Al-Lail", "Adh-Dhuha", "Asy-Syarh", "At-Tin", "Al-'Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-'Adiyat", "Al-Qari'ah", "At-Takatsur", "Al-'Ashr", "Al-Humazah", "Al-Fil", "Quraisy", "Al-Ma'un", "Al-Kautsar", "Al-Kafirun", "An-Nashr", "Al-Lahab", "Al-Ikhlash", "Al-Falaq", "An-Nas"];
    return `
        <datalist id="surahList">
            ${surahs.map(s => `<option value="${s}">`).join('')}
        </datalist>
    `;
}

// Wrapper function for quick Tilawah input (shows prayer time selector)
function showTilawahQuickInput(studentId) {
    const student = dashboardData.students.find(s => s.id === studentId);
    if (!student) return;

    const content = `
        <div class="p-8">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="font-display font-bold text-3xl text-slate-800 mb-2">Input Tilawah</h2>
                    <p class="text-slate-500">${student.name} - Pilih waktu sholat</p>
                </div>
                <button onclick="closeModal()" class="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:bg-slate-200 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                ${prayerConfigs.map(p => `
                    <button onclick="closeModal(); openTilawahInputForm('${p.id}', ${studentId})" 
                        class="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-2xl border-2 border-blue-200 transition-all active:scale-95">
                        <span class="text-4xl">${p.icon}</span>
                        <span class="font-bold text-blue-900">${p.name}</span>
                        <span class="text-xs text-blue-600">${p.time}</span>
                    </button>
                `).join('')}
            </div>
        </div>
    `;

    createModal(content, false);
}

// Function for Murojaah (Review) input
function openMurojaahInputForm(studentId) {
    const student = dashboardData.students.find(s => s.id === studentId);
    if (!student) return;

    const content = `
        <div class="p-8">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-4xl shadow-sm border border-amber-100">
                        🔄
                    </div>
                    <div>
                        <h2 class="font-display font-bold text-3xl text-slate-800">Input Murojaah</h2>
                        <p class="text-slate-500 text-sm">${student.name} - Mengulang hafalan lama</p>
                    </div>
                </div>
                <button onclick="closeModal()" class="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:bg-slate-200 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <form onsubmit="handleMurojaahSubmission(event, ${studentId})" class="space-y-6">
                <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p class="text-sm text-amber-800">
                        <strong>💡 Murojaah</strong> adalah mengulang hafalan yang sudah pernah dihafal agar tidak lupa.
                    </p>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label class="block text-xs font-bold text-slate-700">Juz Awal</label>
                        <input type="number" name="juzStart" min="1" max="30" required
                            class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-amber-500 outline-none text-xl font-bold text-slate-800">
                    </div>
                    <div class="space-y-2">
                        <label class="block text-xs font-bold text-slate-700">Juz Akhir</label>
                        <input type="number" name="juzEnd" min="1" max="30" required
                            class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-amber-500 outline-none text-xl font-bold text-slate-800">
                    </div>
                </div>

                <div class="space-y-2">
                    <label class="block text-xs font-bold text-slate-700">Kelancaran</label>
                    <select name="kelancaran" required
                        class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-amber-500 outline-none font-bold text-slate-800">
                        <option value="lancar">✅ Lancar</option>
                        <option value="kurang_lancar">⚠️ Kurang Lancar</option>
                        <option value="banyak_salah">❌ Banyak Salah</option>
                    </select>
                </div>

                <div class="space-y-2">
                    <label class="block text-xs font-bold text-slate-700">Catatan</label>
                    <textarea name="note" rows="3" placeholder="Catatan kendala atau ayat yang perlu diulang..."
                        class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-amber-500 outline-none text-sm text-slate-700"></textarea>
                </div>

                <div class="pt-4 grid grid-cols-2 gap-4">
                    <button type="button" onclick="closeModal()" 
                        class="px-6 py-4 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all">Batal</button>
                    <button type="submit" 
                        class="px-6 py-4 bg-amber-600 text-white rounded-xl font-bold shadow-xl shadow-amber-200 active:scale-95 transition-all">Simpan Murojaah</button>
                </div>
            </form>
        </div>
    `;

    createModal(content, false);
}

// Handle Murojaah submission
function handleMurojaahSubmission(event, studentId) {
    event.preventDefault();
    const formData = new FormData(event.target);

    const student = dashboardData.students.find(s => s.id === studentId);
    if (!student) return;

    const murojaahData = {
        id: `mur_${Date.now()}`,
        studentId: studentId,
        date: new Date().toISOString().split('T')[0],
        juzStart: parseInt(formData.get('juzStart')),
        juzEnd: parseInt(formData.get('juzEnd')),
        kelancaran: formData.get('kelancaran'),
        note: formData.get('note').trim(),
        timestamp: new Date().toISOString()
    };

    // Initialize murojaah array if not exists
    if (!student.murojaah) student.murojaah = [];

    student.murojaah.push(murojaahData);

    StorageManager.save();
    if (window.autoSync) window.autoSync();

    closeModal();
    renderMutabaahDashboard();
    showNotification(`✅ Murojaah Juz ${murojaahData.juzStart}-${murojaahData.juzEnd} berhasil disimpan!`, 'success');
}



// Global Exports
window.initMutabaahData = initMutabaahData;
window.showMutabaahSection = showMutabaahSection;
window.renderMutabaahDashboard = renderMutabaahDashboard;
window.openTilawahInputForm = openTilawahInputForm;
window.showTilawahQuickInput = showTilawahQuickInput;
window.openMurojaahInputForm = openMurojaahInputForm;
window.handleMutabaahSubmission = handleMutabaahSubmission;
window.handleMurojaahSubmission = handleMurojaahSubmission;
window.approveMutabaah = approveMutabaah;
window.selectStudentForMutabaah = selectStudentForMutabaah;
window.filterMutabaahStudentList = filterMutabaahStudentList;
window.showMutabaahHistory = showMutabaahHistory;

// Keep old names for compatibility during transition if needed
window.initTilawahData = initMutabaahData;
window.showTilawahSection = showMutabaahSection;
window.renderTilawahDashboard = renderMutabaahDashboard;
window.openTilawahInputForm = openTilawahInputForm;
window.handleTilawahSubmission = handleMutabaahSubmission;
window.approveTilawah = approveMutabaah;
window.selectStudentForTilawah = selectStudentForMutabaah;
window.filterTilawahStudentList = filterMutabaahStudentList;
window.showTilawahHistory = showMutabaahHistory;
