// User-Santri Relationship Module
// Manages which santri belong to which user (guru/parent)

const userSantriData = {
    relationships: []
    // Format: { userId: 1, santriId: 123, role: 'guru' }
};

// Load relationships from localStorage
function loadUserSantriRelationships() {
    const saved = localStorage.getItem('userSantriRelationships');
    if (saved) {
        const data = JSON.parse(saved);
        userSantriData.relationships = data.relationships || [];
    }
}

// Save relationships to localStorage
function saveUserSantriRelationships() {
    localStorage.setItem('userSantriRelationships', JSON.stringify(userSantriData));
}

// Get santri IDs for current user
function getSantriIdsForCurrentUser() {
    const user = (typeof currentProfile !== 'undefined' && currentProfile) ? currentProfile : null;

    // Admin can see all santri
    if (!user || user.role === 'admin') {
        return dashboardData.students.map(s => s.id);
    }

    // Get santri IDs for this user
    const relationships = userSantriData.relationships.filter(r => r.userId === user.id);
    const manualIds = relationships.map(r => r.santriId);

    // Also include auto-linked child from auth (Parent Login via NIK)
    if (window.getCurrentUserChild && typeof window.getCurrentUserChild === 'function') {
        const autoChild = window.getCurrentUserChild();
        if (autoChild && autoChild.id) {
            manualIds.push(autoChild.id);
        }
    }

    // Return unique IDs
    return [...new Set(manualIds)];
}

// Filter students based on current user
function getStudentsForCurrentUser() {
    const user = (typeof currentProfile !== 'undefined' && currentProfile) ? currentProfile : null;

    // Admin can see all students
    if (!user || user.role === 'admin') {
        return dashboardData.students;
    }

    // Get santri IDs for this user
    const santriIds = getSantriIdsForCurrentUser();

    // Filter students
    return dashboardData.students.filter(s => santriIds.includes(s.id));
}

// Assign santri to user
function assignSantriToUser(userId, santriId) {
    // Check if relationship already exists
    const exists = userSantriData.relationships.some(
        r => r.userId === userId && r.santriId === santriId
    );

    if (!exists) {
        userSantriData.relationships.push({
            userId: userId,
            santriId: santriId,
            assignedAt: new Date().toISOString()
        });
        saveUserSantriRelationships();
        return true;
    }
    return false;
}

// Remove santri from user
function removeSantriFromUser(userId, santriId) {
    const index = userSantriData.relationships.findIndex(
        r => r.userId === userId && r.santriId === santriId
    );

    if (index !== -1) {
        userSantriData.relationships.splice(index, 1);
        saveUserSantriRelationships();
        return true;
    }
    return false;
}

// Get users assigned to a santri
function getUsersForSantri(santriId) {
    return userSantriData.relationships
        .filter(r => r.santriId === santriId)
        .map(r => r.userId);
}

// Show assign santri dialog (for admin)
function showAssignSantriDialog(userId) {
    const user = usersData.users.find(u => u.id === userId);
    if (!user) return;

    // Get currently assigned santri
    const assignedIds = userSantriData.relationships
        .filter(r => r.userId === userId)
        .map(r => r.santriId);

    const content = `
        <div class="p-6">
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="font-display font-bold text-2xl text-slate-800 mb-2">Kelola Santri</h2>
                    <p class="text-slate-500">${user.name} (${user.role})</p>
                </div>
                <button onclick="closeModal()" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <div class="mb-4">
                <input type="text" id="searchSantriAssign" placeholder="Cari santri..." 
                    oninput="filterSantriAssignList(this.value)"
                    class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none">
            </div>
            
            <div class="max-h-96 overflow-y-auto space-y-2" id="santriAssignList">
                ${dashboardData.students.map(santri => {
        const isAssigned = assignedIds.includes(santri.id);
        return `
                        <div class="santri-assign-item flex items-center justify-between p-3 rounded-xl border ${isAssigned ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}" data-name="${santri.name.toLowerCase()}">
                            <div>
                                <div class="font-bold text-slate-800">${santri.name}</div>
                                <div class="text-xs text-slate-500">Halaqah ${santri.halaqah}</div>
                            </div>
                            <button onclick="toggleSantriAssignment(${userId}, ${santri.id})" 
                                class="px-3 py-1 rounded-lg font-bold text-sm ${isAssigned ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'} transition-colors">
                                ${isAssigned ? '✕ Hapus' : '✓ Tambah'}
                            </button>
                        </div>
                    `;
    }).join('')}
            </div>
            
            <div class="mt-6 pt-4 border-t border-slate-200">
                <button onclick="closeModal(); renderUserManagement()" 
                    class="w-full px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors">
                    Selesai
                </button>
            </div>
        </div>
    `;

    createModal(content, false);
}

// Filter santri in assign list
function filterSantriAssignList(search) {
    const items = document.querySelectorAll('.santri-assign-item');
    const searchLower = search.toLowerCase();

    items.forEach(item => {
        const name = item.getAttribute('data-name');
        if (name.includes(searchLower)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Toggle santri assignment
function toggleSantriAssignment(userId, santriId) {
    const exists = userSantriData.relationships.some(
        r => r.userId === userId && r.santriId === santriId
    );

    if (exists) {
        removeSantriFromUser(userId, santriId);
    } else {
        assignSantriToUser(userId, santriId);
    }

    // Refresh the dialog
    showAssignSantriDialog(userId);
}

// Initialize
loadUserSantriRelationships();

// Export functions
window.getSantriIdsForCurrentUser = getSantriIdsForCurrentUser;
window.getStudentsForCurrentUser = getStudentsForCurrentUser;
window.assignSantriToUser = assignSantriToUser;
window.removeSantriFromUser = removeSantriFromUser;
window.getUsersForSantri = getUsersForSantri;
window.showAssignSantriDialog = showAssignSantriDialog;
window.filterSantriAssignList = filterSantriAssignList;
window.toggleSantriAssignment = toggleSantriAssignment;
