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

    console.log('🔍 [getSantriIdsForCurrentUser] User:', user?.full_name, 'Role:', user?.role);

    // Admin can see all santri
    if (!user || user.role === 'admin') {
        const allIds = dashboardData.students.map(s => s.id);
        console.log('👑 Admin - returning all students:', allIds.length);
        return allIds;
    }

    // Get santri IDs for this user (relasi manual)
    const relationships = userSantriData.relationships.filter(r => r.userId === user.id);
    const manualIds = relationships.map(r => r.santriId);
    console.log('📋 Manual relationships:', manualIds.length);

    // Also include auto-linked child from auth (Parent Login via NIK)
    if (window.getCurrentUserChild && typeof window.getCurrentUserChild === 'function') {
        const autoChild = window.getCurrentUserChild();
        console.log('👶 Auto-linked child:', autoChild?.name);
        if (autoChild && autoChild.id) {
            manualIds.push(autoChild.id);
            console.log('✅ Added auto-linked child ID:', autoChild.id);
        }
    }

    // Check window.currentUserChild directly as fallback
    if (typeof window.currentUserChild !== 'undefined' && window.currentUserChild && window.currentUserChild.id) {
        if (!manualIds.includes(window.currentUserChild.id)) {
            manualIds.push(window.currentUserChild.id);
            console.log('✅ Added currentUserChild ID:', window.currentUserChild.id);
        }
    }

    // CRITICAL: Also check global currentUserChild variable
    if (typeof currentUserChild !== 'undefined' && currentUserChild && currentUserChild.id) {
        if (!manualIds.includes(currentUserChild.id)) {
            manualIds.push(currentUserChild.id);
            console.log('✅ Added global currentUserChild ID:', currentUserChild.id);
        }
    }

    const uniqueIds = [...new Set(manualIds)];
    console.log('🔗 Unique IDs after auto-link:', uniqueIds);

    // Parent fallback: match by NIK/NISN using currentUser email prefix
    if (user.role === 'ortu' && uniqueIds.length === 0 && window.currentUser && window.currentUser.email) {
        console.log('🔍 Parent fallback: searching by NIK/NISN...');
        const nikOrNisn = window.currentUser.email.split('@')[0].trim();
        console.log('Looking for NIK/NISN:', nikOrNisn);
        console.log('Total students available:', dashboardData.students.length);
        
        if (Array.isArray(dashboardData.students) && dashboardData.students.length > 0) {
            const matched = dashboardData.students.find(s =>
                (s.nik && String(s.nik).trim() === nikOrNisn) ||
                (s.nisn && String(s.nisn).trim() === nikOrNisn)
            );
            
            if (matched) {
                console.log('✅ Found matching student:', matched.name, 'ID:', matched.id);
                uniqueIds.push(matched.id);
            } else {
                console.warn('❌ No student found with NIK/NISN:', nikOrNisn);
                console.log('Available NIKs:', dashboardData.students.map(s => s.nik).filter(Boolean));
                console.log('Available NISNs:', dashboardData.students.map(s => s.nisn).filter(Boolean));
            }
        }
    }

    // AUTO-LINK FOR GURU: Include students in Halaqahs where this user is the teacher
    if (user.role === 'guru' && Array.isArray(dashboardData.halaqahs) && dashboardData.halaqahs.length > 0) {
        console.log('👨‍🏫 Guru detected, checking halaqahs...');
        const rawName = user.full_name || user.name || '';
        const guruName = String(rawName).toLowerCase().replace(/^(ustadz|ust|u\.)\s*/i, '').trim();
        console.log('Guru name (processed):', guruName);

        if (guruName && guruName.length >= 3) {
            // Try exact match first
            let taughtHalaqahs = dashboardData.halaqahs.filter(h => {
                if (!h || !h.guru) return false;
                const hGuru = String(h.guru).toLowerCase().replace(/^(ustadz|ust|u\.)\s*/i, '').trim();
                const match = hGuru === guruName;
                if (match) console.log('✅ Exact match:', h.name, 'Guru:', h.guru);
                return match;
            });

            // If no exact match, try partial match (contains)
            if (taughtHalaqahs.length === 0) {
                console.log('No exact match, trying partial match...');
                taughtHalaqahs = dashboardData.halaqahs.filter(h => {
                    if (!h || !h.guru) return false;
                    const hGuru = String(h.guru).toLowerCase().replace(/^(ustadz|ust|u\.)\s*/i, '').trim();
                    const match = hGuru.includes(guruName) || guruName.includes(hGuru);
                    if (match) console.log('✅ Partial match:', h.name, 'Guru:', h.guru);
                    return match;
                });
            }

            console.log('Taught halaqahs:', taughtHalaqahs.length);

            if (taughtHalaqahs.length > 0 && Array.isArray(dashboardData.students)) {
                const taughtHalaqahNames = taughtHalaqahs.map(h => {
                    const name = h && h.name ? String(h.name) : '';
                    return name.replace(/^Halaqah\s+/i, '').trim().toLowerCase();
                });

                console.log('Halaqah names:', taughtHalaqahNames);

                const studentIdsInHalaqah = dashboardData.students
                    .filter(s => taughtHalaqahNames.includes(String(s.halaqah).trim().toLowerCase()))
                    .map(s => s.id);

                console.log('Students in taught halaqahs:', studentIdsInHalaqah.length);

                studentIdsInHalaqah.forEach(id => {
                    if (!uniqueIds.includes(id)) {
                        uniqueIds.push(id);
                    }
                });
            }
        }
    }
    
    console.log('📊 Final unique IDs for user:', uniqueIds);
    return uniqueIds;
}

// Filter students based on current user
function getStudentsForCurrentUser() {
    const user = (typeof currentProfile !== 'undefined' && currentProfile) ? currentProfile : null;

    console.log('🔍 [getStudentsForCurrentUser] User:', user?.full_name, 'Role:', user?.role);

    // Admin can see all students
    if (!user || user.role === 'admin') {
        console.log('👑 Admin - returning all students:', dashboardData.students.length);
        return dashboardData.students;
    }

    // SPECIAL HANDLING FOR GURU: Filter by halaqah directly
    if (user.role === 'guru') {
        console.log('👨‍🏫 Guru - filtering by halaqah...');
        
        const guruName = (user.full_name || user.name || '')
            .toLowerCase()
            .replace(/^(ustadz|ust|u\.)\s*/i, '')
            .trim();
        
        console.log('   Guru name (processed):', guruName);
        
        // Find halaqahs taught by this guru
        const taughtHalaqahs = dashboardData.halaqahs.filter(h => {
            if (!h || !h.guru) return false;
            const hGuru = (h.guru || '').toLowerCase().replace(/^(ustadz|ust|u\.)\s*/i, '').trim();
            const match = hGuru === guruName || hGuru.includes(guruName) || guruName.includes(hGuru);
            if (match) console.log('   ✅ Match:', h.name, '| Guru:', h.guru);
            return match;
        });
        
        console.log('   Taught halaqahs:', taughtHalaqahs.length);
        
        if (taughtHalaqahs.length === 0) {
            console.log('   ⚠️ No halaqahs found for this guru');
            return [];
        }
        
        const halaqahNames = taughtHalaqahs.map(h => h.name.replace(/^Halaqah\s+/i, '').trim().toLowerCase());
        console.log('   Halaqah names:', halaqahNames);
        
        const filtered = dashboardData.students.filter(s => {
            const raw = String(s.halaqah || '').trim().toLowerCase();
            const nameWithoutPrefix = raw.replace(/^halaqah\s+/i, '').trim();

            if (halaqahNames.includes(raw) || halaqahNames.includes(nameWithoutPrefix)) {
                return true;
            }

            const hName = nameWithoutPrefix;
            const matchGuru = hName === guruName || hName.includes(guruName) || guruName.includes(hName);

            return matchGuru;
        });
        console.log('   ✅ Filtered students:', filtered.length);
        
        return filtered;
    }

    // For other roles (ortu, staff): Use santri IDs from relationships
    const santriIds = getSantriIdsForCurrentUser();
    console.log('📋 Santri IDs:', santriIds);

    // Filter students
    const filtered = dashboardData.students.filter(s => santriIds.includes(s.id));
    console.log('✅ Filtered students:', filtered.length);
    
    return filtered;
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
