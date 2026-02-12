// User Management Module

// Default users data
const usersData = {
    users: []
};

// Load users from localStorage
function loadUsers() {
    const saved = localStorage.getItem('usersData');
    if (saved) {
        const data = JSON.parse(saved);
        usersData.users = data.users || [];
    } else {
        // Only set default users if localStorage is empty (first time)
        usersData.users = [
            {
                id: 1,
                name: "Admin Utama",
                email: "admin@halaqah.com",
                role: "admin",
                phone: "081234567890",
                status: "active",
                createdAt: "2024-01-01",
                lastLogin: "2024-02-11 08:30"
            }
        ];
        // Save default users to localStorage
        saveUsers();
    }
}

// Save users to localStorage
function saveUsers() {
    localStorage.setItem('usersData', JSON.stringify(usersData));
}

// Render user management UI (mobile-first)
function renderUserManagement() {
    const container = document.getElementById('userManagementContainer');
    if (!container) return;

    
    const usersList = usersData.users.map(user => {
        const roleColors = {
            admin: 'bg-purple-100 text-purple-700',
            guru: 'bg-blue-100 text-blue-700',
            staff: 'bg-green-100 text-green-700'
        };
        
        const statusColors = {
            active: 'bg-green-100 text-green-700',
            inactive: 'bg-slate-100 text-slate-500'
        };
        
        const userJson = JSON.stringify(user).replace(/"/g, '&quot;');
        
        return `
            <div class="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-all">
                <!-- Mobile Layout -->
                <div class="flex items-start gap-3">
                    <!-- Avatar -->
                    <div class="flex-shrink-0">
                        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
                            ${user.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    
                    <!-- User Info -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between gap-2 mb-2">
                            <div class="flex-1 min-w-0">
                                <h4 class="font-bold text-slate-800 truncate">${user.name}</h4>
                                <p class="text-sm text-slate-500 truncate">${user.email}</p>
                            </div>
                            <span class="flex-shrink-0 px-2 py-1 rounded-lg text-xs font-bold ${statusColors[user.status]}">
                                ${user.status === 'active' ? 'Aktif' : 'Nonaktif'}
                            </span>
                        </div>
                        
                        <div class="flex flex-wrap items-center gap-2 mb-3">
                            <span class="px-2 py-1 rounded-lg text-xs font-bold ${roleColors[user.role]}">
                                ${user.role === 'admin' ? '👑 Admin' : user.role === 'guru' ? '👨‍🏫 Guru' : '👤 Staff'}
                            </span>
                            <span class="text-xs text-slate-500">📱 ${user.phone}</span>
                        </div>
                        
                        <div class="text-xs text-slate-400 mb-3">
                            Login terakhir: ${user.lastLogin}
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="flex gap-2">
                            <button onclick='showEditUserForm(${userJson})' 
                                class="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors">
                                ✏️ Edit
                            </button>
                            <button onclick="confirmDeleteUser(${user.id})" 
                                class="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors">
                                🗑️ Hapus
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    const content = `
        <div class="glass rounded-3xl p-4 md:p-8 border border-slate-200 shadow-sm">
            <!-- Header -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 class="font-display font-bold text-2xl text-slate-800 flex items-center gap-2">
                        <span class="w-2 h-8 bg-purple-500 rounded-full"></span>
                        👥 Manajemen User
                    </h3>
                    <p class="text-sm text-slate-500 mt-1">Kelola akses pengguna sistem</p>
                </div>
                <button onclick="showAddUserForm()" 
                    class="w-full md:w-auto px-4 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200">
                    ➕ Tambah User
                </button>
            </div>
            
            <!-- Search & Filter -->
            <div class="flex flex-col md:flex-row gap-3 mb-6">
                <div class="flex-1 relative">
                    <input type="text" id="searchUser" placeholder="Cari nama atau email..." 
                        oninput="filterUsers(this.value)"
                        class="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none">
                    <svg class="w-5 h-5 absolute left-3 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>
                <select onchange="filterUsersByRole(this.value)" 
                    class="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none font-semibold">
                    <option value="all">Semua Role</option>
                    <option value="admin">Admin</option>
                    <option value="guru">Guru</option>
                    <option value="staff">Staff</option>
                </select>
            </div>
            
            <!-- Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                    <div class="text-2xl font-bold text-purple-700">${usersData.users.length}</div>
                    <div class="text-xs text-purple-600 font-semibold">Total User</div>
                </div>
                <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                    <div class="text-2xl font-bold text-green-700">${usersData.users.filter(u => u.status === 'active').length}</div>
                    <div class="text-xs text-green-600 font-semibold">Aktif</div>
                </div>
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                    <div class="text-2xl font-bold text-blue-700">${usersData.users.filter(u => u.role === 'admin').length}</div>
                    <div class="text-xs text-blue-600 font-semibold">Admin</div>
                </div>
                <div class="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
                    <div class="text-2xl font-bold text-amber-700">${usersData.users.filter(u => u.role === 'guru').length}</div>
                    <div class="text-xs text-amber-600 font-semibold">Guru</div>
                </div>
            </div>
            
            <!-- Users List -->
            <div id="usersList" class="space-y-3">
                ${usersList}
            </div>
            
            ${usersData.users.length === 0 ? `
                <div class="text-center py-12">
                    <div class="text-6xl mb-4">👥</div>
                    <h4 class="font-bold text-slate-800 mb-2">Belum Ada User</h4>
                    <p class="text-slate-500 mb-4">Tambahkan user pertama untuk memulai</p>
                    <button onclick="showAddUserForm()" 
                        class="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors">
                        ➕ Tambah User
                    </button>
                </div>
            ` : ''}
        </div>
    `;
    
    container.innerHTML = content;
}


// Show add user form
function showAddUserForm() {
    const content = `
        <div class="p-4 md:p-8">
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="font-display font-bold text-2xl md:text-3xl text-slate-800 mb-2">➕ Tambah User Baru</h2>
                    <p class="text-slate-500">Isi form untuk menambahkan user</p>
                </div>
            </div>
            
            <form onsubmit="handleAddUser(event)" class="space-y-4">
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap *</label>
                    <input type="text" name="name" required 
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        placeholder="Masukkan nama lengkap">
                </div>
                
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Email *</label>
                    <input type="email" name="email" required 
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        placeholder="email@example.com">
                </div>
                
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">No. Telepon *</label>
                    <input type="tel" name="phone" required 
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        placeholder="081234567890">
                </div>
                
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Role *</label>
                    <select name="role" required 
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none">
                        <option value="">Pilih Role</option>
                        <option value="admin">👑 Admin</option>
                        <option value="guru">👨‍🏫 Guru</option>
                        <option value="staff">👤 Staff</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Status *</label>
                    <select name="status" required 
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none">
                        <option value="active">✅ Aktif</option>
                        <option value="inactive">❌ Nonaktif</option>
                    </select>
                </div>
                
                <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 class="font-bold text-blue-900 mb-2 flex items-center gap-2">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                        </svg>
                        Informasi Role
                    </h4>
                    <ul class="text-sm text-blue-800 space-y-1">
                        <li>• <strong>Admin</strong>: Akses penuh ke semua fitur</li>
                        <li>• <strong>Guru</strong>: Kelola santri dan setoran</li>
                        <li>• <strong>Staff</strong>: Lihat data saja</li>
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
    
    // Prevent closing modal by clicking outside (false = tidak bisa ditutup dengan klik di luar)
    createModal(content, false);
}

// Handle add user
function handleAddUser(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const newUser = {
        id: Date.now(),
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        role: formData.get('role'),
        status: formData.get('status'),
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: '-'
    };
    
    usersData.users.push(newUser);
    saveUsers();
    
    // Sync to Supabase if available
    if (window.syncUsersToSupabase) {
        syncUsersToSupabase();
    }
    
    renderUserManagement();
    closeModal();
    showNotification('✅ User berhasil ditambahkan');
}


// Show edit user form
function showEditUserForm(user) {
    const content = `
        <div class="p-4 md:p-8">
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="font-display font-bold text-2xl md:text-3xl text-slate-800 mb-2">✏️ Edit User</h2>
                    <p class="text-slate-500">Update informasi user</p>
                </div>
            </div>
            
            <form onsubmit="handleEditUser(event, ${user.id})" class="space-y-4">
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap *</label>
                    <input type="text" name="name" value="${user.name}" required 
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none">
                </div>
                
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Email *</label>
                    <input type="email" name="email" value="${user.email}" required 
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none">
                </div>
                
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">No. Telepon *</label>
                    <input type="tel" name="phone" value="${user.phone}" required 
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none">
                </div>
                
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Role *</label>
                    <select name="role" required 
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none">
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>👑 Admin</option>
                        <option value="guru" ${user.role === 'guru' ? 'selected' : ''}>👨‍🏫 Guru</option>
                        <option value="staff" ${user.role === 'staff' ? 'selected' : ''}>👤 Staff</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Status *</label>
                    <select name="status" required 
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none">
                        <option value="active" ${user.status === 'active' ? 'selected' : ''}>✅ Aktif</option>
                        <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>❌ Nonaktif</option>
                    </select>
                </div>
                
                <div class="bg-slate-50 rounded-xl p-4">
                    <div class="text-xs text-slate-500 space-y-1">
                        <div>Dibuat: ${user.createdAt}</div>
                        <div>Login terakhir: ${user.lastLogin}</div>
                    </div>
                </div>
                
                <div class="flex gap-3 pt-4">
                    <button type="button" onclick="closeModal()" 
                        class="flex-1 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                        Batal
                    </button>
                    <button type="submit" 
                        class="flex-1 bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors">
                        ✅ Selesai
                    </button>
                </div>
            </form>
        </div>
    `;
    
    // Prevent closing modal by clicking outside (false = tidak bisa ditutup dengan klik di luar)
    createModal(content, false);
}

// Handle edit user
function handleEditUser(event, userId) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const userIndex = usersData.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return;
    
    usersData.users[userIndex] = {
        ...usersData.users[userIndex],
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        role: formData.get('role'),
        status: formData.get('status')
    };
    
    saveUsers();
    
    // Sync to Supabase if available
    if (window.syncUsersToSupabase) {
        syncUsersToSupabase();
    }
    
    renderUserManagement();
    closeModal();
    showNotification('✅ User berhasil diupdate');
}

// Confirm delete user
function confirmDeleteUser(userId) {
    const user = usersData.users.find(u => u.id === userId);
    if (!user) return;
    
    if (confirm(`Yakin ingin menghapus user "${user.name}"?\nTindakan ini tidak dapat dibatalkan.`)) {
        usersData.users = usersData.users.filter(u => u.id !== userId);
        saveUsers();
        
        // Sync to Supabase if available
        if (window.syncUsersToSupabase) {
            syncUsersToSupabase();
        }
        
        renderUserManagement();
        showNotification('✅ User berhasil dihapus');
    }
}

// Filter users by search term
function filterUsers(searchTerm) {
    const items = document.querySelectorAll('#usersList > div');
    const search = searchTerm.toLowerCase();
    
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(search) ? 'block' : 'none';
    });
}

// Filter users by role
function filterUsersByRole(role) {
    if (role === 'all') {
        renderUserManagement();
        return;
    }
    
    const filtered = usersData.users.filter(u => u.role === role);
    const temp = { users: usersData.users };
    usersData.users = filtered;
    renderUserManagement();
    usersData.users = temp.users;
}

// Initialize
loadUsers();

// Export functions
window.renderUserManagement = renderUserManagement;
window.showAddUserForm = showAddUserForm;
window.showEditUserForm = showEditUserForm;
window.handleAddUser = handleAddUser;
window.handleEditUser = handleEditUser;
window.confirmDeleteUser = confirmDeleteUser;
window.filterUsers = filterUsers;
window.filterUsersByRole = filterUsersByRole;
