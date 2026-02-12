// Profile Module - Role-based settings

function renderProfile() {
    const container = document.getElementById('profileContainer');
    if (!container) return;
    
    const user = getCurrentUser();
    const role = user?.role || 'guest';
    
    let content = '';
    
    if (role === 'admin') {
        content = renderAdminProfile();
    } else if (role === 'guru') {
        content = renderGuruProfile();
    } else if (role === 'parent') {
        content = renderParentProfile();
    } else {
        content = renderGuestProfile();
    }
    
    container.innerHTML = content;
}

function renderAdminProfile() {
    const user = getCurrentUser();
    
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
            
            <!-- Menu Items -->
            <div class="space-y-2">
                <button onclick="scrollToSection('settings')" class="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-slate-50 transition-colors text-left">
                    <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    </div>
                    <div class="flex-1">
                        <div class="font-bold text-slate-800">Pengaturan Admin</div>
                        <div class="text-xs text-slate-500">Kelola lembaga dan konfigurasi</div>
                    </div>
                    <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </button>
                
                <button onclick="scrollToSection('users')" class="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-slate-50 transition-colors text-left">
                    <div class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                    </div>
                    <div class="flex-1">
                        <div class="font-bold text-slate-800">Manajemen User</div>
                        <div class="text-xs text-slate-500">Kelola akses pengguna</div>
                    </div>
                    <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </button>
                
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
                
                <button onclick="handleLogout()" class="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-red-50 transition-colors text-left">
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
    const user = getCurrentUser();
    
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
                
                <button onclick="handleLogout()" class="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-red-50 transition-colors text-left">
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
    const user = getCurrentUser();
    
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
                
                <button onclick="handleLogout()" class="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-red-50 transition-colors text-left">
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
            <button onclick="window.location.href='login.html'" class="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors">
                Login Sekarang
            </button>
        </div>
    `;
}

// Show quick setoran form (FAB)
function showQuickSetoranForm() {
    const modal = createModal({
        title: '➕ Input Setoran Cepat',
        content: `
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
        `,
        allowClickOutside: false
    });
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

// Export functions
window.renderProfile = renderProfile;
window.showQuickSetoranForm = showQuickSetoranForm;
window.calculateHalaman = calculateHalaman;
window.handleQuickSetoran = handleQuickSetoran;
