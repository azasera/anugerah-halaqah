// Modal Management Module

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

function showStudentDetail(student) {
    const content = `
        <div class="p-8">
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="font-display font-bold text-3xl text-slate-800 mb-2">${student.name}</h2>
                    <p class="text-slate-500">Halaqah ${student.halaqah}</p>
                </div>
                <div class="flex gap-2">
                    ${(typeof currentProfile !== 'undefined' && currentProfile && (currentProfile.role === 'guru' || currentProfile.role === 'admin')) ? `
                    <button onclick="closeModal(); showSetoranFormV2(${JSON.stringify(student).replace(/"/g, '&quot;')})" 
                        class="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors" title="Input Setoran">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                        </svg>
                    </button>
                    ` : ''}
                    <button onclick="closeModal(); showSetoranHistory(${student.id})" 
                        class="p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors" title="Riwayat Setoran">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </button>
                    ${(typeof currentProfile !== 'undefined' && currentProfile && currentProfile.role === 'admin') ? `
                    <button onclick="closeModal(); showEditStudentForm(${JSON.stringify(student).replace(/"/g, '&quot;')})" 
                        class="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors" title="Edit">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    ` : ''}
                    <button onclick="closeModal()" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>
            
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
                    <div class="text-orange-600 text-sm font-bold mb-1">Hari Beruntun</div>
                    <div class="text-3xl font-bold text-orange-600 flex items-center gap-2">
                        🔥 ${student.streak}
                    </div>
                </div>
                ${(typeof currentProfile !== 'undefined' && currentProfile && currentProfile.role === 'admin') ? `
                <div class="bg-purple-50 rounded-2xl p-4 cursor-pointer hover:bg-purple-100 transition-colors" onclick="closeModal(); showEditHafalanForm(${JSON.stringify(student).replace(/"/g, '&quot;')})" title="Klik untuk update total hafalan awal">
                    <div class="text-purple-600 text-sm font-bold mb-1 flex items-center gap-1">
                        Total Hafalan
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </div>
                    <div class="text-3xl font-bold text-purple-700">${student.total_hafalan || 0} Hal</div>
                </div>
                ` : `
                <div class="bg-purple-50 rounded-2xl p-4">
                    <div class="text-purple-600 text-sm font-bold mb-1">Total Hafalan</div>
                    <div class="text-3xl font-bold text-purple-700">${student.total_hafalan || 0} Hal</div>
                </div>
                `}
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
            
            <div class="border-t border-slate-200 pt-4">
                <div class="flex items-center justify-between text-sm">
                    <span class="text-slate-500">Aktivitas terakhir</span>
                    <span class="font-semibold text-slate-700">${student.lastActivity}</span>
                </div>
            </div>
        </div>
    `;
    
    createModal(content);
}

function showHalaqahDetail(halaqah) {
    const members = getStudentsByHalaqah(halaqah.name.replace('Halaqah ', ''));
    
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
            
            <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="bg-primary-50 rounded-2xl p-4 text-center">
                    <div class="text-primary-600 text-sm font-bold mb-1">Total Poin</div>
                    <div class="text-2xl font-bold text-primary-700">${halaqah.points}</div>
                </div>
                <div class="bg-accent-teal/10 rounded-2xl p-4 text-center">
                    <div class="text-accent-teal text-sm font-bold mb-1">Rata-rata</div>
                    <div class="text-2xl font-bold text-accent-teal">${halaqah.avgPoints}</div>
                </div>
                <div class="bg-slate-50 rounded-2xl p-4 text-center">
                    <div class="text-slate-600 text-sm font-bold mb-1">Status</div>
                    <div class="text-lg font-bold text-slate-700">${halaqah.status}</div>
                </div>
            </div>
            
            <div>
                <h3 class="font-bold text-slate-800 mb-3">Daftar Anggota</h3>
                <div class="space-y-2">
                    ${members.map(m => `
                        <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                            <div>
                                <div class="font-semibold text-slate-800">${m.name}</div>
                                <div class="text-xs text-slate-500">Rank #${m.overall_ranking}</div>
                            </div>
                            <div class="text-right">
                                <div class="font-bold text-primary-600">${m.total_points} pts</div>
                                <div class="text-xs text-slate-500">🔥 ${m.streak} hari</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    createModal(content);
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
    
    createModal(content);
}

function handleEditHafalan(event, studentId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const totalHafalan = parseFloat(formData.get('total_hafalan'));
    
    const student = dashboardData.students.find(s => s.id === studentId);
    if (student) {
        student.total_hafalan = totalHafalan;
        StorageManager.save();
        refreshAllData();
        closeModal();
        showNotification('✅ Total hafalan berhasil diperbarui!');
        
        // Re-open detail to show changes
        setTimeout(() => showStudentDetail(student), 300);
    }
}

// Make functions globally accessible
window.closeModal = closeModal;
window.showStudentDetail = showStudentDetail;
window.showHalaqahDetail = showHalaqahDetail;
window.showEditHafalanForm = showEditHafalanForm;
window.handleEditHafalan = handleEditHafalan;
