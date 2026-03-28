// FIX DELETE SANTRI - Patch untuk memastikan delete berfungsi dengan benar
// Load file ini SETELAH semua file JS lainnya di dashboard.html

console.log('🔧 Loading fix-delete-santri.js patch...');

// Override handleRealtimeUpdate untuk fix DELETE event
if (typeof handleRealtimeUpdate !== 'undefined') {
    const originalHandleRealtimeUpdate = handleRealtimeUpdate;
    
    window.handleRealtimeUpdate = function(payload) {
        // Prevent processing updates during delete operations
        if (window.deleteOperationInProgress) {
            return;
        }

        // Skip realtime updates if we have pending local changes
        if (window.hasPendingLocalChanges) {
            console.log('⏭️ Skipping realtime update - pending local changes');
            return;
        }

        // Prevent processing updates during sync operations to avoid loops
        if (window.syncInProgress) {
            return;
        }
        
        console.log('🔄 Realtime update received:', payload.eventType);
        
        // Helper to normalize student data
        const normalizeStudent = (s) => ({
            ...s,
            setoran: Array.isArray(s.setoran) ? s.setoran : [],
            achievements: Array.isArray(s.achievements) ? s.achievements : [],
            streak: s.streak || 0,
            total_points: s.total_points || 0
        });

        if (payload.eventType === 'INSERT') {
            const newStudent = payload.new ? normalizeStudent(payload.new) : null;
            if (newStudent) {
                const exists = dashboardData.students.some(s => parseInt(s.id) === parseInt(newStudent.id));
                if (!exists) {
                    dashboardData.students.push(newStudent);
                    if (typeof recalculateRankings === 'function') recalculateRankings();
                    if (typeof refreshAllData === 'function') refreshAllData();
                }
            }
        } else if (payload.eventType === 'UPDATE') {
            const updatedStudent = payload.new ? normalizeStudent(payload.new) : null;
            if (updatedStudent) {
                const index = dashboardData.students.findIndex(s => parseInt(s.id) === parseInt(updatedStudent.id));
                if (index !== -1) {
                    dashboardData.students[index] = updatedStudent;
                    if (typeof recalculateRankings === 'function') recalculateRankings();
                    if (typeof refreshAllData === 'function') refreshAllData();
                } else {
                    dashboardData.students.push(updatedStudent);
                    if (typeof recalculateRankings === 'function') recalculateRankings();
                    if (typeof refreshAllData === 'function') refreshAllData();
                }
            }
        } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id;
            if (deletedId) {
                console.log('🗑️ DELETE event - ID:', deletedId, 'Type:', typeof deletedId);
                
                // Convert both to numbers for consistent comparison
                const numericDeletedId = parseInt(deletedId);
                const beforeCount = dashboardData.students.length;
                
                dashboardData.students = dashboardData.students.filter(s => {
                    const studentNumericId = parseInt(s.id);
                    const shouldKeep = studentNumericId !== numericDeletedId;
                    if (!shouldKeep) {
                        console.log('  Removing student from realtime DELETE:', s.name, 'ID:', s.id);
                    }
                    return shouldKeep;
                });
                
                const afterCount = dashboardData.students.length;
                console.log('Students after DELETE event:', afterCount, '(removed:', beforeCount - afterCount, ')');
                
                if (typeof recalculateRankings === 'function') recalculateRankings();
                if (typeof StorageManager !== 'undefined') StorageManager.save();
                if (typeof refreshAllData === 'function') refreshAllData();
            }
        }
    };
    
    console.log('✅ handleRealtimeUpdate patched');
}

// Override performLocalStudentDelete untuk memastikan delete lokal berfungsi
if (typeof performLocalStudentDelete !== 'undefined') {
    window.performLocalStudentDelete = function(studentId, keepModalOpen) {
        console.log('🗑️ Performing local student delete...');
        console.log('Student ID to delete:', studentId, 'Type:', typeof studentId);

        // Set guard flag
        localStorage.setItem('_deleteJustDone', Date.now().toString());

        // Convert to number for consistent comparison
        const numericId = parseInt(studentId);
        console.log('Numeric ID:', numericId);
        console.log('Students before delete:', dashboardData.students.length);
        
        // Log all student IDs for debugging
        console.log('All student IDs:', dashboardData.students.map(s => ({ id: s.id, type: typeof s.id, name: s.name })));

        // Hapus dari array lokal - compare both as numbers
        dashboardData.students = dashboardData.students.filter(s => {
            const studentNumericId = parseInt(s.id);
            const shouldKeep = studentNumericId !== numericId;
            if (!shouldKeep) {
                console.log('  Removing student:', s.name, 'ID:', s.id);
            }
            return shouldKeep;
        });

        console.log('Students after delete:', dashboardData.students.length);

        if (typeof recalculateRankings === 'function') recalculateRankings();
        if (typeof StorageManager !== 'undefined') StorageManager.save();
        if (typeof refreshAllData === 'function') refreshAllData();

        if (keepModalOpen) {
            if (typeof updateAdminSantriList === 'function') {
                updateAdminSantriList();
            }
        } else {
            if (typeof updateAdminSantriListInline === 'function') {
                updateAdminSantriListInline();
            }
            if (typeof closeModal === 'function') closeModal();
        }

        setTimeout(() => {
            window.deleteOperationInProgress = false;
            console.log('Delete student operation completed');
        }, 2000);

        if (typeof showNotification === 'function') {
            showNotification('✅ Data santri berhasil dihapus');
        }
    };
    
    console.log('✅ performLocalStudentDelete patched');
}

// Add helper function to force clear deleted student from UI
window.forceRemoveStudentFromUI = function(studentId) {
    console.log('🔨 Force removing student from UI:', studentId);
    
    const numericId = parseInt(studentId);
    const beforeCount = dashboardData.students.length;
    
    dashboardData.students = dashboardData.students.filter(s => {
        const studentNumericId = parseInt(s.id);
        return studentNumericId !== numericId;
    });
    
    const afterCount = dashboardData.students.length;
    console.log('Removed:', beforeCount - afterCount, 'students');
    
    if (typeof recalculateRankings === 'function') recalculateRankings();
    if (typeof StorageManager !== 'undefined') StorageManager.save();
    if (typeof refreshAllData === 'function') refreshAllData();
    
    console.log('✅ Force remove completed');
};

console.log('✅ fix-delete-santri.js loaded successfully');
console.log('💡 Jika santri masih tampil setelah delete, gunakan: forceRemoveStudentFromUI(ID_SANTRI)');
