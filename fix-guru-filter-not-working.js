// Fix Guru Filter Not Working
// Jalankan script ini di Console untuk memperbaiki filter guru

(async function fixGuruFilter() {
    console.clear();
    console.log('%c🔧 FIX GURU FILTER', 'color: blue; font-size: 18px; font-weight: bold');
    console.log('');
    
    // Step 1: Diagnose
    console.log('%cStep 1: DIAGNOSE', 'color: orange; font-weight: bold');
    console.log('Current profile:', currentProfile?.full_name || currentProfile?.name);
    console.log('Role:', currentProfile?.role);
    
    const guruName = (currentProfile?.full_name || currentProfile?.name || '')
        .toLowerCase()
        .replace(/^(ustadz|ust|u\.)\s*/i, '')
        .trim();
    console.log('Processed guru name:', guruName);
    
    // Find taught halaqahs
    const taughtHalaqahs = dashboardData.halaqahs.filter(h => {
        const hGuru = (h.guru || '').toLowerCase().replace(/^(ustadz|ust|u\.)\s*/i, '').trim();
        return hGuru === guruName || hGuru.includes(guruName) || guruName.includes(hGuru);
    });
    
    console.log('Taught halaqahs:', taughtHalaqahs.length);
    taughtHalaqahs.forEach(h => console.log('  -', h.name));
    
    // Get expected students
    const halaqahNames = taughtHalaqahs.map(h => h.name.replace(/^Halaqah\s+/i, '').trim());
    const expectedStudents = dashboardData.students.filter(s => halaqahNames.includes(s.halaqah));
    console.log('Expected students:', expectedStudents.length);
    
    // Get actual students
    const actualStudents = getStudentsForCurrentUser();
    console.log('Actual students (from function):', actualStudents.length);
    console.log('');
    
    // Step 2: Check if filter is being applied
    console.log('%cStep 2: CHECK FILTER APPLICATION', 'color: orange; font-weight: bold');
    
    // Temporarily override getStudentsForCurrentUser to force correct behavior
    const originalGetStudents = window.getStudentsForCurrentUser;
    
    window.getStudentsForCurrentUser = function() {
        console.log('🔍 [OVERRIDE] getStudentsForCurrentUser called');
        
        const user = (typeof currentProfile !== 'undefined' && currentProfile) ? currentProfile : null;
        
        // Admin can see all students
        if (!user || user.role === 'admin') {
            console.log('  → Admin: returning all students');
            return dashboardData.students;
        }
        
        // For guru: filter by halaqah
        if (user.role === 'guru') {
            console.log('  → Guru: filtering by halaqah');
            
            const guruName = (user.full_name || user.name || '')
                .toLowerCase()
                .replace(/^(ustadz|ust|u\.)\s*/i, '')
                .trim();
            
            console.log('  → Guru name:', guruName);
            
            // Find taught halaqahs
            const taughtHalaqahs = dashboardData.halaqahs.filter(h => {
                const hGuru = (h.guru || '').toLowerCase().replace(/^(ustadz|ust|u\.)\s*/i, '').trim();
                const match = hGuru === guruName || hGuru.includes(guruName) || guruName.includes(hGuru);
                if (match) console.log('  → Match:', h.name);
                return match;
            });
            
            console.log('  → Taught halaqahs:', taughtHalaqahs.length);
            
            // Get halaqah names
            const halaqahNames = taughtHalaqahs.map(h => h.name.replace(/^Halaqah\s+/i, '').trim());
            console.log('  → Halaqah names:', halaqahNames);
            
            // Filter students
            const filtered = dashboardData.students.filter(s => halaqahNames.includes(s.halaqah));
            console.log('  → Filtered students:', filtered.length);
            
            return filtered;
        }
        
        // For ortu: return all (they can see full ranking)
        console.log('  → Ortu: returning all students');
        return dashboardData.students;
    };
    
    console.log('✅ Override applied');
    console.log('');
    
    // Step 3: Test the override
    console.log('%cStep 3: TEST OVERRIDE', 'color: orange; font-weight: bold');
    const testStudents = getStudentsForCurrentUser();
    console.log('Students after override:', testStudents.length);
    console.log('');
    
    // Step 4: Re-render UI
    console.log('%cStep 4: RE-RENDER UI', 'color: orange; font-weight: bold');
    
    if (typeof renderSantri === 'function') {
        renderSantri();
        console.log('✅ UI re-rendered');
    } else {
        console.log('❌ renderSantri function not found');
    }
    console.log('');
    
    // Step 5: Verify
    console.log('%cStep 5: VERIFY', 'color: orange; font-weight: bold');
    
    setTimeout(() => {
        const finalStudents = getStudentsForCurrentUser();
        console.log('Final student count:', finalStudents.length);
        
        if (finalStudents.length === expectedStudents.length) {
            console.log('%c✅ FILTER NOW WORKING!', 'color: green; font-size: 16px; font-weight: bold');
            console.log('');
            console.log('📝 NEXT STEPS:');
            console.log('1. Refresh halaman (F5)');
            console.log('2. Cek apakah filter masih bekerja');
            console.log('3. Jika tidak, jalankan script ini lagi');
        } else {
            console.log('%c❌ FILTER STILL NOT WORKING', 'color: red; font-size: 16px; font-weight: bold');
            console.log('Expected:', expectedStudents.length);
            console.log('Actual:', finalStudents.length);
            console.log('');
            console.log('🔍 ADDITIONAL DEBUG:');
            console.log('Original function:', originalGetStudents);
            console.log('Override function:', window.getStudentsForCurrentUser);
        }
    }, 1000);
    
})();
