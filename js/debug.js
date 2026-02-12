// Admin Debug Functions

function showDebugPanel() {
    const content = `
        <div class="p-8">
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="font-display font-bold text-3xl text-slate-800 mb-2">Debug Panel</h2>
                    <p class="text-slate-500">Alat debugging untuk developer</p>
                </div>
                <button onclick="closeModal()" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <div class="space-y-4">
                <button onclick="debugCheckSession()" 
                    class="w-full p-4 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-colors">
                    🔍 Cek Session User
                </button>
                
                <button onclick="debugCheckDataOrigin()" 
                    class="w-full p-4 bg-green-50 text-green-700 rounded-xl font-bold hover:bg-green-100 transition-colors">
                    📊 Cek Asal Data (Lokal vs Supabase)
                </button>
                
                <button onclick="debugShowDataSummary()" 
                    class="w-full p-4 bg-amber-50 text-amber-700 rounded-xl font-bold hover:bg-amber-100 transition-colors">
                    📈 Ringkasan Data
                </button>
                
                <button onclick="debugClearLocalData()" 
                    class="w-full p-4 bg-orange-50 text-orange-700 rounded-xl font-bold hover:bg-orange-100 transition-colors">
                    🗑️ Hapus Cache Lokal & Reload
                </button>
                
                <button onclick="debugReloadFromSupabase()" 
                    class="w-full p-4 bg-purple-50 text-purple-700 rounded-xl font-bold hover:bg-purple-100 transition-colors">
                    🔄 Reload Data dari Supabase
                </button>
                
                <button onclick="debugWipeSupabaseData()" 
                    class="w-full p-4 bg-red-100 text-red-800 rounded-xl font-bold hover:bg-red-200 transition-colors border border-red-200">
                    ⚠️ Hapus SEMUA Data di Server (Reset Total)
                </button>
            </div>
            
            <div id="debugOutput" class="mt-6 p-4 bg-slate-50 rounded-xl text-sm font-mono text-slate-700 hidden">
                <!-- Output akan muncul di sini -->
            </div>
        </div>
    `;
    
    createModal(content, false);
}

async function debugCheckSession() {
    const output = document.getElementById('debugOutput');
    
    try {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        
        const userInfo = {
            'Session Status': session ? '✅ Active' : '❌ No Session',
            'User ID': session?.user?.id || 'null',
            'User Email': session?.user?.email || 'null',
            'Access Token': session?.access_token ? '✅ Present' : '❌ Missing',
            'Token Expires At': session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'null'
        };
        
        output.innerHTML = Object.entries(userInfo).map(([key, value]) => 
            `<div class="mb-2"><strong>${key}:</strong> ${value}</div>`
        ).join('');
        
        output.classList.remove('hidden');
        
    } catch (error) {
        output.innerHTML = `<div class="text-red-600">❌ Error: ${error.message}</div>`;
        output.classList.remove('hidden');
    }
}

function debugCheckDataOrigin() {
    const output = document.getElementById('debugOutput');
    
    const dataInfo = {
        'Total Students (Lokal)': dashboardData.students.length,
        'Total Halaqahs (Lokal)': dashboardData.halaqahs.length,
        'Data Source': 'Local Storage + Supabase Sync',
        'Last Sync': localStorage.getItem('lastSync') || 'Never',
        'Storage Key': 'halaqahData'
    };
    
    output.innerHTML = Object.entries(dataInfo).map(([key, value]) => 
        `<div class="mb-2"><strong>${key}:</strong> ${value}</div>`
    ).join('');
    
    output.classList.remove('hidden');
}

function debugClearLocalData() {
    if (confirm('⚠️ Yakin ingin menghapus cache lokal dan reload halaman?\n\nData akan dimuat ulang dari server Supabase.')) {
        localStorage.removeItem('halaqahData');
        localStorage.removeItem('lastSync');
        localStorage.removeItem('userSantriRelationships');
        
        showNotification('✅ Cache lokal berhasil dihapus. Halaman akan reload...', 'success');
        
        // Reload halaman setelah 1 detik
        setTimeout(() => {
            window.location.reload(true); // Force reload from server
        }, 1000);
    }
}

async function debugReloadFromSupabase() {
    const output = document.getElementById('debugOutput');
    
    try {
        output.innerHTML = `<div class="text-blue-600">🔄 Memuat data dari Supabase...</div>`;
        output.classList.remove('hidden');
        
        // Kosongkan data lokal
        dashboardData.students = [];
        dashboardData.halaqahs = [];
        
        // Muat dari Supabase
        await window.loadStudentsFromSupabase();
        await window.loadHalaqahsFromSupabase();
        
        // Refresh tampilan
        window.refreshAllData();
        
        output.innerHTML = `<div class="text-green-600">✅ Data berhasil dimuat ulang dari Supabase</div>
            <div class="text-sm mt-2"><strong>Students:</strong> ${dashboardData.students.length}</div>
            <div class="text-sm"><strong>Halaqahs:</strong> ${dashboardData.halaqahs.length}</div>`;
        
    } catch (error) {
        output.innerHTML = `<div class="text-red-600">❌ Error: ${error.message}</div>`;
    }
}

async function debugWipeSupabaseData() {
    if (!confirm('⚠️ PERINGATAN KERAS! ⚠️\n\nAnda akan menghapus SEMUA data santri dan halaqah di Server Supabase.\nData yang dihapus TIDAK BISA DIKEMBALIKAN.\n\nKetik "HAPUS" untuk melanjutkan:')) {
        return;
    }
    
    // Double confirmation via prompt is tricky in some browsers/UI, using simple confirm for now but checking result
    // Actually, let's use a second confirm for safety
    if (!confirm('Yakin 100%? Tindakan ini akan mengosongkan database.')) {
        return;
    }

    const output = document.getElementById('debugOutput');
    output.innerHTML = `<div class="text-red-600">⏳ Sedang menghapus semua data...</div>`;
    output.classList.remove('hidden');
    
    try {
        // 1. Delete all students first (to avoid FK constraints)
        const { error: errorStudents } = await window.supabaseClient
            .from('students')
            .delete()
            .neq('id', 0); // Delete all rows where id is not 0 (which is all rows)
            
        if (errorStudents) throw new Error('Gagal menghapus students: ' + errorStudents.message);
        
        // 2. Delete all halaqahs
        const { error: errorHalaqahs } = await window.supabaseClient
            .from('halaqahs')
            .delete()
            .neq('id', 0);
            
        if (errorHalaqahs) throw new Error('Gagal menghapus halaqahs: ' + errorHalaqahs.message);
        
        // 3. Clear local data too
        dashboardData.students = [];
        dashboardData.halaqahs = [];
        StorageManager.save();
        refreshAllData();
        
        output.innerHTML = `<div class="text-green-600 font-bold">✅ DATABASE BERHASIL DI-RESET!</div>
            <div class="text-slate-600">Semua data santri dan halaqah telah dihapus dari server dan lokal.</div>`;
            
        showNotification('✅ Database berhasil di-reset total', 'success');
        
        // Explicit alert for user confirmation
        setTimeout(() => {
            alert('✅ DATABASE BERHASIL DI-RESET!\n\nSemua data santri dan halaqah telah dihapus dari server dan lokal.');
        }, 500);
        
    } catch (error) {
        console.error('Wipe error:', error);
        output.innerHTML = `<div class="text-red-600 font-bold">❌ Gagal Reset Database</div>
            <div class="text-red-500">${error.message}</div>
            <div class="text-slate-500 mt-2">Pastikan Anda login sebagai Admin dan memiliki izin delete.</div>`;
    }
}

function debugShowDataSummary() {
    const output = document.getElementById('debugOutput');
    
    const students = dashboardData.students;
    const halaqahs = dashboardData.halaqahs;
    
    const summary = {
        'Total Santri': students.length,
        'Santri dengan Poin > 0': students.filter(s => s.total_points > 0).length,
        'Santri dengan Setoran': students.filter(s => s.setoran && s.setoran.length > 0).length,
        'Total Halaqah': halaqahs.length,
        'Halaqah dengan Anggota': halaqahs.filter(h => h.members > 0).length,
        'Total Poin Keseluruhan': students.reduce((sum, s) => sum + s.total_points, 0)
    };
    
    output.innerHTML = Object.entries(summary).map(([key, value]) => 
        `<div class="mb-2"><strong>${key}:</strong> ${value}</div>`
    ).join('');
    
    // Check for duplicates and invalid data
    const idMap = new Map();
    const nameMap = new Map();
    const duplicates = [];
    const invalidIds = [];
    
    students.forEach(s => {
        // Check for duplicates
        if (idMap.has(s.id)) {
            duplicates.push({ type: 'ID', value: s.id, name: s.name });
        } else {
            idMap.set(s.id, s.name);
        }
        
        const normalizedName = s.name.toLowerCase().trim();
        if (nameMap.has(normalizedName)) {
            duplicates.push({ type: 'Name', value: s.name, id: s.id });
        } else {
            nameMap.set(normalizedName, s.id);
        }

        // Check for invalid IDs
        if (!s.id || s.id === 0 || s.id === '0') {
            invalidIds.push({ name: s.name, id: s.id });
        }
    });
    
    if (invalidIds.length > 0) {
        output.innerHTML += `<div class="mt-4 pt-4 border-t border-amber-200">
            <div class="text-amber-600 font-bold mb-2">⚠️ Data dengan ID Tidak Valid:</div>
            <div class="text-sm text-amber-500 max-h-40 overflow-y-auto">
                ${invalidIds.map(d => `<div>${d.name} (ID: ${d.id})</div>`).join('')}
            </div>
        </div>`;
    }

    if (duplicates.length > 0) {
        output.innerHTML += `<div class="mt-4 pt-4 border-t border-red-200">
            <div class="text-red-600 font-bold mb-2">⚠️ Ditemukan Duplikasi Data:</div>
            <div class="text-sm text-red-500 max-h-40 overflow-y-auto">
                ${duplicates.map(d => `<div>${d.type}: ${d.value}</div>`).join('')}
            </div>
            <button onclick="debugRemoveDuplicates()" class="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">
                Hapus Duplikat
            </button>
        </div>`;
    }
    
    output.classList.remove('hidden');
}

function debugRemoveDuplicates() {
    if (!confirm('Yakin ingin menghapus data duplikat? (Data dengan ID/Nama yang sama akan disisakan satu)')) return;
    
    const students = dashboardData.students;
    const uniqueIds = new Set();
    const uniqueNames = new Set();
    const uniqueStudents = [];
    
    let removedCount = 0;
    
    students.forEach(s => {
        const normalizedName = s.name.toLowerCase().trim();
        
        if (!uniqueIds.has(s.id) && !uniqueNames.has(normalizedName)) {
            uniqueIds.add(s.id);
            uniqueNames.add(normalizedName);
            uniqueStudents.push(s);
        } else {
            removedCount++;
        }
    });
    
    dashboardData.students = uniqueStudents;
    StorageManager.save();
    recalculateRankings();
    refreshAllData();
    
    debugShowDataSummary();
    alert(`Berhasil menghapus ${removedCount} data duplikat.`);
}

// Export functions
window.debugWipeSupabaseData = debugWipeSupabaseData;
window.debugRemoveDuplicates = debugRemoveDuplicates;
window.debugShowDataSummary = debugShowDataSummary;

// Tambahkan tombol debug ke admin panel
function addDebugButtonToAdmin() {
    const adminPanel = document.querySelector('#settingsContainer');
    if (adminPanel) {
        const debugButton = document.createElement('button');
        debugButton.innerHTML = `<div class="flex items-center gap-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span>Debug Panel</span>
        </div>`;
        debugButton.className = "w-full flex items-center gap-3 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors mt-4";
        debugButton.onclick = showDebugPanel;
        adminPanel.appendChild(debugButton);
    }
}

// Export functions
window.showDebugPanel = showDebugPanel;
window.debugCheckSession = debugCheckSession;
window.debugCheckDataOrigin = debugCheckDataOrigin;
window.debugClearLocalData = debugClearLocalData;
window.debugReloadFromSupabase = debugReloadFromSupabase;
window.debugWipeSupabaseData = debugWipeSupabaseData;
window.debugShowDataSummary = debugShowDataSummary;
window.addDebugButtonToAdmin = addDebugButtonToAdmin;