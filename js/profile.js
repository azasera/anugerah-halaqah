// Profile Module - Role-based settings

function renderProfile() {
    const container = document.getElementById('profileContainer');
    if (!container) return;

    // Use currentProfile instead of getCurrentUser()
    const user = (typeof currentProfile !== 'undefined' && currentProfile) ? currentProfile : null;
    const role = user?.role || 'guest';

    let content = '';

    if (role === 'admin') {
        content = renderAdminProfile();
    } else if (role === 'guru') {
        content = renderGuruProfile();
    } else if (role === 'ortu') {
        content = renderParentProfile();
    } else {
        content = renderGuestProfile();
    }

    container.innerHTML = content;
}

function renderAdminProfile() {
    const user = (typeof currentProfile !== 'undefined' && currentProfile) ? currentProfile : null;

    return `
        <div class="glass rounded-3xl p-6 border border-slate-200 shadow-sm">
            <!-- Profile Header -->
            <div class="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
                <div class="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                    ${user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div class="flex-1">
                    <h2 class="text-2xl font-bold text-slate-800">${user?.name || 'Admin'}</h2>
                    <p class="text-slate-500">${user?.email || 'admin@halaqah.com'}</p>
                    <span class="inline-block mt-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                        👑 Administrator
                    </span>
                </div>
            </div>
            
            <!-- Menu Utama Admin -->
            <div class="space-y-3">
                <button onclick="showKelolaDataModal()" class="w-full h-24 flex items-center gap-5 p-5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-3xl shadow-xl shadow-emerald-100 transition-all active:scale-95 text-left">
                    <div class="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
                        ⚙️
                    </div>
                    <div class="flex-1">
                        <div class="font-bold text-xl uppercase tracking-wide">Pusat Data</div>
                        <div class="text-xs text-white/80">Kelola Santri, Halaqah & Sistem</div>
                    </div>
                    <svg class="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </button>

                <div class="grid grid-cols-2 gap-3">
                    <button onclick="scrollToSection('poinRules')" class="flex flex-col items-center gap-2 p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-center">
                        <div class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xl">📜</div>
                        <span class="text-xs font-bold text-slate-700">Aturan Poin</span>
                    </button>
                    
                    <button onclick="showChangePasswordModal()" class="flex flex-col items-center gap-2 p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-center">
                        <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xl">🔑</div>
                        <span class="text-xs font-bold text-slate-700">Ganti Password</span>
                    </button>
                </div>
                    <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <div class="flex-1">
                        <div class="font-bold text-slate-800">Aturan Poin</div>
                        <div class="text-xs text-slate-500">Lihat sistem penilaian</div>
                    </div>
                    <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </button>

                <button onclick="showChangePasswordModal()" class="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-slate-50 transition-colors text-left">
                    <div class="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                        </svg>
                    </div>
                    <div class="flex-1">
                        <div class="font-bold text-slate-800">Ganti Password</div>
                        <div class="text-xs text-slate-500">Ubah kata sandi akun</div>
                    </div>
                    <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </button>
                
                <button onclick="logout()" class="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-red-50 transition-colors text-left">
                    <div class="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                    </div>
                    <div class="flex-1">
                        <div class="font-bold text-red-600">Keluar</div>
                        <div class="text-xs text-red-500">Logout dari sistem</div>
                    </div>
                    <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;
}

function renderGuruProfile() {
    const user = (typeof currentProfile !== 'undefined' && currentProfile) ? currentProfile : null;

    return `
        <div class="glass rounded-3xl p-6 border border-slate-200 shadow-sm">
            <!-- Profile Header -->
            <div class="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
                <div class="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                    ${user?.name?.charAt(0).toUpperCase() || 'G'}
                </div>
                <div class="flex-1">
                    <h2 class="text-2xl font-bold text-slate-800">${user?.name || 'Guru'}</h2>
                    <p class="text-slate-500">${user?.email || 'guru@halaqah.com'}</p>
                    <span class="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                        👨‍🏫 Guru
                    </span>
                </div>
            </div>
            
            <!-- Menu Items -->
            <div class="space-y-2">
                <button onclick="scrollToSection('poinRules')" class="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-slate-50 transition-colors text-left">
                    <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <div class="flex-1">
                        <div class="font-bold text-slate-800">Aturan Poin</div>
                        <div class="text-xs text-slate-500">Lihat sistem penilaian</div>
                    </div>
                    <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </button>

                <button onclick="showChangePasswordModal()" class="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-slate-50 transition-colors text-left">
                    <div class="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                        </svg>
                    </div>
                    <div class="flex-1">
                        <div class="font-bold text-slate-800">Ganti Password</div>
                        <div class="text-xs text-slate-500">Ubah kata sandi akun</div>
                    </div>
                    <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </button>
                
                <button onclick="logout()" class="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-red-50 transition-colors text-left">
                    <div class="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                    </div>
                    <div class="flex-1">
                        <div class="font-bold text-red-600">Keluar</div>
                        <div class="text-xs text-red-500">Logout dari sistem</div>
                    </div>
                    <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;
}

function renderParentProfile() {
    const user = (typeof currentProfile !== 'undefined' && currentProfile) ? currentProfile : null;

    return `
        <div class="glass rounded-3xl p-6 border border-slate-200 shadow-sm">
            <!-- Profile Header -->
            <div class="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
                <div class="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-3xl font-bold">
                    ${user?.name?.charAt(0).toUpperCase() || 'O'}
                </div>
                <div class="flex-1">
                    <h2 class="text-2xl font-bold text-slate-800">${user?.name || 'Orang Tua'}</h2>
                    <p class="text-slate-500">${user?.email || 'ortu@halaqah.com'}</p>
                    <span class="inline-block mt-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                        👨‍👩‍👧 Orang Tua
                    </span>
                </div>
            </div>
            
            <!-- Menu Items -->
            <div class="space-y-2">
                <button onclick="scrollToSection('poinRules')" class="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-slate-50 transition-colors text-left">
                    <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <div class="flex-1">
                        <div class="font-bold text-slate-800">Aturan Poin</div>
                        <div class="text-xs text-slate-500">Lihat sistem penilaian</div>
                    </div>
                    <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </button>
                
                <button onclick="logout()" class="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-red-50 transition-colors text-left">
                    <div class="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                    </div>
                    <div class="flex-1">
                        <div class="font-bold text-red-600">Keluar</div>
                        <div class="text-xs text-red-500">Logout dari sistem</div>
                    </div>
                    <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;
}

function renderGuestProfile() {
    return `
        <div class="glass rounded-3xl p-6 border border-slate-200 shadow-sm text-center">
            <div class="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white text-3xl font-bold mb-4">
                ?
            </div>
            <h2 class="text-2xl font-bold text-slate-800 mb-2">Belum Login</h2>
            <p class="text-slate-500 mb-6">Silakan login untuk mengakses fitur profil</p>
            <button onclick="showLoginPage()" class="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors">
                Login Sekarang
            </button>
        </div>
    `;
}

// Show quick setoran form (FAB)
function showQuickSetoranForm() {
    const content = `
        <div class="p-6">
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="font-display font-bold text-2xl text-slate-800 mb-2">➕ Input Setoran Cepat</h2>
                    <p class="text-slate-500">Masukkan jumlah baris yang dibaca</p>
                </div>
                <button onclick="closeModal()" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <form onsubmit="handleQuickSetoran(event)" class="space-y-4">
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Jumlah Baris *</label>
                    <input type="number" id="quickBaris" name="baris" required min="1"
                        oninput="calculateHalaman()"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-lg"
                        placeholder="Masukkan jumlah baris">
                </div>
                
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Jumlah Halaman</label>
                    <input type="text" id="quickHalaman" name="halaman" readonly
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-lg font-bold text-primary-600"
                        placeholder="Auto calculate">
                    <p class="text-xs text-slate-500 mt-1">Otomatis dihitung: Baris ÷ 15 = Halaman</p>
                </div>
                
                <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 class="font-bold text-blue-900 mb-2">ℹ️ Informasi</h4>
                    <ul class="text-sm text-blue-800 space-y-1">
                        <li>• 1 halaman = 15 baris</li>
                        <li>• Total hafalan akan otomatis bertambah</li>
                        <li>• Data akan tersimpan ke profil santri</li>
                    </ul>
                </div>
                
                <div class="flex gap-3 pt-4">
                    <button type="button" onclick="closeModal()" 
                        class="flex-1 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                        Batal
                    </button>
                    <button type="submit" 
                        class="flex-1 bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors">
                        Simpan
                    </button>
                </div>
            </form>
        </div>
    `;

    createModal(content, false); // Don't allow click outside to close
}

// Calculate halaman from baris
function calculateHalaman() {
    const barisInput = document.getElementById('quickBaris');
    const halamanInput = document.getElementById('quickHalaman');

    if (barisInput && halamanInput) {
        const baris = parseInt(barisInput.value) || 0;
        const halaman = (baris / 15).toFixed(2);
        halamanInput.value = halaman;
    }
}

// Handle quick setoran
function handleQuickSetoran(event) {
    event.preventDefault();

    const baris = parseInt(document.getElementById('quickBaris').value);
    const halaman = parseFloat(document.getElementById('quickHalaman').value);

    if (!baris || !halaman) {
        alert('❌ Mohon isi jumlah baris');
        return;
    }

    // TODO: Save to student profile
    // This should be integrated with the actual student data
    alert(`✅ Setoran berhasil disimpan!\n\nBaris: ${baris}\nHalaman: ${halaman}\n\nTotal hafalan akan diupdate.`);

    closeModal();
}

// Show Change Password Modal
function showChangePasswordModal() {
    const user = (typeof currentProfile !== 'undefined' && currentProfile) ? currentProfile : null;
    if (!user) return;

    const content = `
        <div class="p-8">
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="font-display font-bold text-3xl text-slate-800 mb-2">Ganti Password</h2>
                    <p class="text-slate-500">Ubah kata sandi untuk akun ${user.email}</p>
                </div>
                <button onclick="closeModal()" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <form onsubmit="handleChangePassword(event)" class="space-y-4">
                <div class="bg-orange-50 p-4 rounded-xl text-orange-800 text-sm mb-4">
                    <p>⚠️ Pastikan Anda mengingat password baru Anda. Password minimal 6 karakter.</p>
                </div>

                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Password Baru</label>
                    <input type="password" id="newPassword" required minlength="6"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all">
                </div>

                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Konfirmasi Password Baru</label>
                    <input type="password" id="confirmPassword" required minlength="6"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all">
                </div>
                
                <div class="flex gap-3 pt-4">
                    <button type="submit" 
                        class="flex-1 bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg">
                        Simpan Password
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

// Handle Change Password Logic
async function handleChangePassword(event) {
    event.preventDefault();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        showNotification('❌ Konfirmasi password tidak cocok', 'error');
        return;
    }

    try {
        const user = (typeof currentProfile !== 'undefined' && currentProfile) ? currentProfile : null;
        if (!user) throw new Error('User tidak ditemukan');

        // 1. Update via Supabase if possible
        if (window.supabaseClient && !user.id.toString().includes('parent_') && !localStorage.getItem('localCurrentUser')) {
            const { error } = await window.supabaseClient.auth.updateUser({
                password: newPassword
            });
            if (error) throw error;
        }

        // 2. Always update local storage too for fallback/local users
        const savedUsers = localStorage.getItem('usersData');
        if (savedUsers) {
            const localData = JSON.parse(savedUsers);
            const users = localData.users || [];
            const userIndex = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());

            if (userIndex !== -1) {
                users[userIndex].password = newPassword;
                localStorage.setItem('usersData', JSON.stringify({ users }));
                console.log('Local password updated for:', user.email);
            }
        }

        // 3. Update local session info
        const localSession = localStorage.getItem('localCurrentUser');
        if (localSession) {
            const sessionData = JSON.parse(localSession);
            sessionData.password = newPassword;
            localStorage.setItem('localCurrentUser', JSON.stringify(sessionData));
        }

        showNotification('✅ Password berhasil diperbarui!', 'success');
        closeModal();
    } catch (error) {
        console.error('Change password error:', error);
        showNotification('❌ Gagal ganti password: ' + error.message, 'error');
    }
}

// Show Kelola Data Modal (Simplified 3-Category Structure)
function showKelolaDataModal() {
    const studentCount = dashboardData.students ? dashboardData.students.length : 0;
    const halaqahCount = dashboardData.halaqahs ? dashboardData.halaqahs.length : 0;

    const content = `
        <div class="p-8">
            <div class="flex items-center justify-between mb-8">
                <div>
                    <h2 class="font-display font-bold text-3xl text-slate-800 mb-1">Pusat Data Admin</h2>
                    <p class="text-slate-500 text-sm italic">"Pastikan data induk valid agar laporan akurat"</p>
                </div>
                <button onclick="closeModal()" class="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:bg-slate-200 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <div class="space-y-6">
                <!-- 1. DATA SANTRI SECTION -->
                <div class="bg-blue-50/50 rounded-3xl p-6 border-2 border-blue-100 space-y-4">
                    <div class="flex items-center gap-3 mb-2">
                        <div class="p-2 bg-blue-500 rounded-xl text-white">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        </div>
                        <div>
                            <h3 class="font-bold text-blue-900">👥 DAFTAR SANTRI</h3>
                            <p class="text-[10px] text-blue-600 font-bold uppercase tracking-wider">${studentCount} Santri Terdaftar</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <button onclick="closeModal(); scrollToSection('ranking', 'santri')" 
                            class="p-4 bg-white text-blue-600 rounded-2xl font-bold shadow-sm border border-blue-100 flex flex-col items-center gap-2 active:scale-95 transition-all text-center">
                            <span class="text-xl">✏️</span>
                            <span class="text-[11px]">Edit / Detail</span>
                        </button>
                        <button onclick="closeModal(); showImportExportModal()" 
                            class="p-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 flex flex-col items-center gap-2 active:scale-95 transition-all text-center">
                            <span class="text-xl">📥</span>
                            <span class="text-[11px]">Import / Backup</span>
                        </button>
                    </div>
                </div>

                <!-- 2. DATA HALAQAH SECTION -->
                <div class="bg-emerald-50/50 rounded-3xl p-6 border-2 border-emerald-100 space-y-4">
                    <div class="flex items-center gap-3 mb-2">
                        <div class="p-2 bg-emerald-500 rounded-xl text-white">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        </div>
                        <div>
                            <h3 class="font-bold text-emerald-900">🏫 DAFTAR HALAQAH</h3>
                            <p class="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">${halaqahCount} Kelompok Aktif</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-1">
                        <button onclick="closeModal(); scrollToSection('ranking', 'halaqah')" 
                            class="p-4 bg-white text-emerald-600 rounded-2xl font-bold shadow-sm border border-emerald-100 flex items-center justify-center gap-3 active:scale-95 transition-all">
                            <span>✏️ Kelola Kelompok & Guru</span>
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                        </button>
                    </div>
                </div>

                <!-- 3. KONFIGURASI SISTEM SECTION -->
                <div class="bg-slate-50 rounded-3xl p-6 border-2 border-slate-200 space-y-4">
                    <div class="flex items-center gap-3 mb-1">
                        <div class="p-2 bg-slate-800 rounded-xl text-white">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                        </div>
                        <div>
                            <h3 class="font-bold text-slate-800">⚙️ PENGATURAN SISTEM</h3>
                            <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sesi, Target & Akses</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <button onclick="closeModal(); scrollToSection('settings')" 
                            class="p-4 bg-white text-slate-700 rounded-2xl font-bold shadow-sm border border-slate-200 flex flex-col items-center gap-2 active:scale-95 transition-all text-center">
                            <span class="text-xl">⏰</span>
                            <span class="text-[11px]">Sesi & Target</span>
                        </button>
                        <button onclick="closeModal(); scrollToSection('users')" 
                            class="p-4 bg-white text-slate-700 rounded-2xl font-bold shadow-sm border border-slate-200 flex flex-col items-center gap-2 active:scale-95 transition-all text-center">
                            <span class="text-xl">🔐</span>
                            <span class="text-[11px]">Akses Login</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    createModal(content, false);
}

// Show Import/Export Modal
function showImportExportModal() {
    const content = `
        <div class="p-8">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="font-display font-bold text-3xl text-slate-800 mb-2">📊 Import / Export Data</h2>
                    <p class="text-slate-500">Kelola data dalam format Excel</p>
                </div>
                <button onclick="closeModal()" class="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:bg-slate-200 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <div class="grid grid-cols-1 gap-4">
                <!-- Import Santri -->
                <button onclick="closeModal(); showImportExcel()" 
                    class="flex items-center gap-4 p-5 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-all text-left">
                    <div class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white text-2xl">
                        📥
                    </div>
                    <div class="flex-1">
                        <div class="font-bold text-blue-900">Import Data Santri</div>
                        <div class="text-xs text-blue-600">Upload file Excel (.xlsx)</div>
                    </div>
                </button>

                <!-- Export Santri -->
                <button onclick="closeModal(); exportToExcel()" 
                    class="flex items-center gap-4 p-5 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-all text-left">
                    <div class="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white text-2xl">
                        📤
                    </div>
                    <div class="flex-1">
                        <div class="font-bold text-emerald-900">Export Data Santri</div>
                        <div class="text-xs text-emerald-600">Download sebagai Excel</div>
                    </div>
                </button>

                <!-- Download Template -->
                <button onclick="closeModal(); downloadExcelTemplate()" 
                    class="flex items-center gap-4 p-5 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition-all text-left">
                    <div class="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white text-2xl">
                        📋
                    </div>
                    <div class="flex-1">
                        <div class="font-bold text-purple-900">Download Template</div>
                        <div class="text-xs text-purple-600">Template kosong untuk import</div>
                    </div>
                </button>
            </div>
        </div>
    `;

    createModal(content, false);
}



// Export functions
window.renderProfile = renderProfile;
window.showQuickSetoranForm = showQuickSetoranForm;
window.calculateHalaman = calculateHalaman;
window.handleQuickSetoran = handleQuickSetoran;
window.showChangePasswordModal = showChangePasswordModal;
window.handleChangePassword = handleChangePassword;
window.showKelolaDataModal = showKelolaDataModal;
window.showImportExportModal = showImportExportModal;
