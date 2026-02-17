// Quick Check Guru Filter - Versi Sederhana
// Copy-paste script ini di Console (F12)

(function checkGuruFilter() {
    console.clear();
    console.log('%c=== GURU FILTER CHECK ===', 'color: blue; font-size: 16px; font-weight: bold');
    console.log('');
    
    // 1. Cek user info
    console.log('%c1. USER INFO:', 'color: green; font-weight: bold');
    console.log('   Name:', currentProfile?.full_name || currentProfile?.name || 'N/A');
    console.log('   Role:', currentProfile?.role || 'N/A');
    console.log('');
    
    // 2. Cek halaqah yang diajar
    console.log('%c2. HALAQAH YANG DIAJAR:', 'color: green; font-weight: bold');
    const guruName = (currentProfile?.full_name || currentProfile?.name || '')
        .toLowerCase()
        .replace(/^(ustadz|ust|u\.)\s*/i, '')
        .trim();
    console.log('   Processed name:', guruName);
    
    const taughtHalaqahs = dashboardData.halaqahs.filter(h => {
        const hGuru = (h.guru || '').toLowerCase().replace(/^(ustadz|ust|u\.)\s*/i, '').trim();
        return hGuru === guruName || hGuru.includes(guruName) || guruName.includes(hGuru);
    });
    
    console.log('   Halaqah yang cocok:', taughtHalaqahs.length);
    taughtHalaqahs.forEach(h => {
        console.log('   -', h.name, '| Guru:', h.guru);
    });
    console.log('');
    
    // 3. Cek santri yang seharusnya terlihat
    console.log('%c3. SANTRI YANG SEHARUSNYA TERLIHAT:', 'color: green; font-weight: bold');
    const halaqahNames = taughtHalaqahs.map(h => h.name.replace(/^Halaqah\s+/i, '').trim());
    const expectedStudents = dashboardData.students.filter(s => 
        halaqahNames.includes(s.halaqah)
    );
    console.log('   Jumlah:', expectedStudents.length);
    console.log('');
    
    // 4. Cek santri yang benar-benar terlihat
    console.log('%c4. SANTRI YANG BENAR-BENAR TERLIHAT:', 'color: green; font-weight: bold');
    const actualStudents = getStudentsForCurrentUser();
    console.log('   Jumlah:', actualStudents.length);
    console.log('');
    
    // 5. Kesimpulan
    console.log('%c5. KESIMPULAN:', 'color: green; font-weight: bold');
    if (expectedStudents.length === actualStudents.length) {
        console.log('%c   ✅ FILTER BEKERJA DENGAN BAIK', 'color: green; font-weight: bold');
    } else {
        console.log('%c   ❌ FILTER TIDAK BEKERJA', 'color: red; font-weight: bold');
        console.log('   Expected:', expectedStudents.length);
        console.log('   Actual:', actualStudents.length);
        console.log('   Difference:', Math.abs(expectedStudents.length - actualStudents.length));
    }
    console.log('');
    
    // 6. Detail santri yang terlihat
    console.log('%c6. DETAIL SANTRI (10 pertama):', 'color: green; font-weight: bold');
    actualStudents.slice(0, 10).forEach((s, i) => {
        console.log(`   ${i+1}. ${s.name} - Halaqah ${s.halaqah}`);
    });
    if (actualStudents.length > 10) {
        console.log(`   ... dan ${actualStudents.length - 10} santri lainnya`);
    }
    console.log('');
    
    // 7. Tabel perbandingan
    console.log('%c7. TABEL PERBANDINGAN:', 'color: green; font-weight: bold');
    console.table({
        'Expected Students': expectedStudents.length,
        'Actual Students': actualStudents.length,
        'Difference': Math.abs(expectedStudents.length - actualStudents.length),
        'Filter Status': expectedStudents.length === actualStudents.length ? '✅ OK' : '❌ ERROR'
    });
    
    // Return result for further inspection
    return {
        guruName,
        taughtHalaqahs,
        expectedStudents,
        actualStudents,
        filterWorking: expectedStudents.length === actualStudents.length
    };
})();
