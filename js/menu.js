// Menu Management Module

function toggleSubmenu(menuId) {
    const submenu = document.getElementById(`submenu-${menuId}`);
    const arrow = event.currentTarget.querySelector('.submenu-arrow');
    
    if (submenu.classList.contains('hidden')) {
        // Close all other submenus
        document.querySelectorAll('.submenu').forEach(s => {
            s.classList.add('hidden');
            s.classList.remove('show');
        });
        document.querySelectorAll('.submenu-arrow').forEach(a => {
            a.classList.remove('rotate');
        });
        
        // Open this submenu
        submenu.classList.remove('hidden');
        setTimeout(() => submenu.classList.add('show'), 10);
        arrow.classList.add('rotate');
    } else {
        // Close this submenu
        submenu.classList.remove('show');
        arrow.classList.remove('rotate');
        setTimeout(() => submenu.classList.add('hidden'), 300);
    }
}

function showStudentList() {
    const content = `
        <div class="p-8">
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="font-display font-bold text-3xl text-slate-800 mb-2">📋 Kelola Santri</h2>
                    <p class="text-slate-500">Daftar lengkap semua santri</p>
                </div>
                <button onclick="closeModal()" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <div class="mb-4 flex gap-3">
                <input type="text" id="searchStudentList" placeholder="Cari santri..." 
                    oninput="filterStudentList(this.value)"
                    class="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none">
                ${(typeof currentProfile !== 'undefined' && currentProfile && currentProfile.role === 'admin') ? `
                <button onclick="closeModal(); showAddStudentForm()" 
                    class="px-4 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-colors whitespace-nowrap">
                    ➕ Tambah
                </button>
                ` : ''}
            </div>
            
            <div class="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar" id="studentListContainer">
                ${dashboardData.students.map(student => `
                    <div class="student-list-item flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors" data-name="${student.name.toLowerCase()}">
                        <div class="flex items-center gap-4 flex-1">
                            <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                ${student.name.charAt(0).toUpperCase()}
                            </div>
                            <div class="flex-1">
                                <div class="font-bold text-slate-800">${student.name}</div>
                                <div class="text-sm text-slate-500">
                                    Halaqah ${student.halaqah} • ${student.total_points} poin • Rank #${student.overall_ranking}
                                </div>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="closeModal(); showStudentDetail(${JSON.stringify(student).replace(/"/g, '&quot;')})" 
                                class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Detail">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                </svg>
                            </button>
                            ${(typeof currentProfile !== 'undefined' && currentProfile && currentProfile.role === 'admin') ? `
                            <button onclick="closeModal(); showEditStudentForm(${JSON.stringify(student).replace(/"/g, '&quot;')})" 
                                class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Edit">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                            </button>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    createModal(content, false);
}

function showHalaqahList() {
    const content = `
        <div class="p-8">
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="font-display font-bold text-3xl text-slate-800 mb-2">📚 Kelola Halaqah</h2>
                    <p class="text-slate-500">Daftar lengkap semua halaqah</p>
                </div>
                <button onclick="closeModal()" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <div class="mb-4 flex gap-3">
                <input type="text" id="searchHalaqahList" placeholder="Cari halaqah..." 
                    oninput="filterHalaqahList(this.value)"
                    class="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none">
                <button onclick="closeModal(); showAddHalaqahForm()" 
                    class="px-4 py-2 bg-accent-teal text-white rounded-lg font-bold hover:bg-accent-teal/90 transition-colors whitespace-nowrap">
                    ➕ Tambah
                </button>
            </div>
            
            <div class="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar" id="halaqahListContainer">
                ${dashboardData.halaqahs.map(halaqah => `
                    <div class="halaqah-list-item flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors" data-name="${halaqah.name.toLowerCase()}">
                        <div class="flex items-center gap-4 flex-1">
                            <div class="w-10 h-10 rounded-full bg-accent-teal/10 flex items-center justify-center text-accent-teal font-bold">
                                #${halaqah.rank}
                            </div>
                            <div class="flex-1">
                                <div class="font-bold text-slate-800">${halaqah.name}</div>
                                <div class="text-sm text-slate-500">
                                    ${halaqah.members} anggota • ${halaqah.points} poin • Avg: ${halaqah.avgPoints}
                                </div>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="closeModal(); showHalaqahDetail(${JSON.stringify(halaqah).replace(/"/g, '&quot;')})" 
                                class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Detail">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                </svg>
                            </button>
                            <button onclick="closeModal(); showEditHalaqahForm(${JSON.stringify(halaqah).replace(/"/g, '&quot;')})" 
                                class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Edit">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    createModal(content, false);
}

function showEditHalaqahForm(halaqah) {
    const content = `
        <div class="p-8">
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="font-display font-bold text-3xl text-slate-800 mb-2">Edit Halaqah</h2>
                    <p class="text-slate-500">Perbarui informasi halaqah</p>
                </div>
                <button onclick="closeModal()" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <form onsubmit="handleEditHalaqah(event, ${halaqah.id})" class="space-y-4">
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Nama Halaqah</label>
                    <input type="text" name="name" value="${halaqah.name.replace('Halaqah ', '')}" required 
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none">
                    <p class="text-xs text-slate-500 mt-1">Tanpa kata "Halaqah" di depan</p>
                </div>
                
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Guru Halaqah</label>
                    <input type="text" name="guru" value="${halaqah.guru || ''}" 
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        placeholder="Nama guru">
                </div>
                
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Kelas</label>
                    <input type="text" name="kelas" value="${halaqah.kelas || ''}" 
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        placeholder="Contoh: MTA 1">
                </div>
                
                <div class="flex gap-3 pt-4">
                    <button type="submit" 
                        class="flex-1 bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200">
                        Simpan Perubahan
                    </button>
                    <button type="button" onclick="confirmDeleteHalaqah(${halaqah.id})" 
                        class="px-6 py-3 rounded-xl font-bold text-red-600 hover:bg-red-50 transition-colors">
                        Hapus
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

function handleEditHalaqah(event, halaqahId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const halaqah = dashboardData.halaqahs.find(h => h.id === halaqahId);
    if (halaqah) {
        // Get old and new names (without "Halaqah" prefix)
        const oldName = halaqah.name.replace('Halaqah ', '');
        const newName = formData.get('name');
        
        console.log('🔄 Updating halaqah:', oldName, '→', newName);
        
        // Update halaqah data
        halaqah.name = `Halaqah ${newName}`;
        halaqah.guru = formData.get('guru');
        halaqah.kelas = formData.get('kelas');
        
        // IMPORTANT: Update halaqah name in all students
        if (oldName !== newName) {
            console.log('📝 Updating student halaqah references...');
            let updatedCount = 0;
            
            dashboardData.students.forEach(student => {
                if (student.halaqah === oldName) {
                    student.halaqah = newName;
                    updatedCount++;
                    console.log(`  ✅ Updated: ${student.name} → ${newName}`);
                }
            });
            
            console.log(`✅ Updated ${updatedCount} students`);
        }
        
        // Recalculate rankings to update halaqah stats
        recalculateRankings();
        
        StorageManager.save();
        if (window.autoSync) autoSync();
        
        closeModal();
        refreshAllData();
        showNotification('✅ Halaqah berhasil diperbarui!');
    }
}

function filterStudentList(searchTerm) {
    const items = document.querySelectorAll('.student-list-item');
    const search = searchTerm.toLowerCase();
    
    items.forEach(item => {
        const name = item.getAttribute('data-name');
        item.style.display = name.includes(search) ? 'flex' : 'none';
    });
}

function filterHalaqahList(searchTerm) {
    const items = document.querySelectorAll('.halaqah-list-item');
    const search = searchTerm.toLowerCase();
    
    items.forEach(item => {
        const name = item.getAttribute('data-name');
        item.style.display = name.includes(search) ? 'flex' : 'none';
    });
}

// Export functions
window.toggleSubmenu = toggleSubmenu;
window.showStudentList = showStudentList;
window.showHalaqahList = showHalaqahList;
window.showEditHalaqahForm = showEditHalaqahForm;
window.handleEditHalaqah = handleEditHalaqah;
window.filterStudentList = filterStudentList;
window.filterHalaqahList = filterHalaqahList;
