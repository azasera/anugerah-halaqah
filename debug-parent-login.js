// Debug Helper untuk Parent Login
// Jalankan di Console (F12) untuk debugging

console.log('=== DEBUG PARENT LOGIN ===');

// 1. Check Current User
console.log('\n1️⃣ CURRENT USER:');
console.log('window.currentUser:', window.currentUser);
console.log('window.currentProfile:', window.currentProfile);
console.log('window.currentUserChild:', window.currentUserChild);

// 2. Check Data Students
console.log('\n2️⃣ DATA STUDENTS:');
console.log('Total students:', dashboardData.students.length);
if (dashboardData.students.length > 0) {
    console.log('Sample student:', dashboardData.students[0]);
    console.log('All NIKs:', dashboardData.students.map(s => s.nik).filter(Boolean));
    console.log('All NISNs:', dashboardData.students.map(s => s.nisn).filter(Boolean));
}

// 3. Check NIK/NISN Match
if (window.currentUser && window.currentUser.email) {
    console.log('\n3️⃣ NIK/NISN MATCH:');
    const nikOrNisn = window.currentUser.email.split('@')[0].trim();
    console.log('Looking for:', nikOrNisn);
    
    const matched = dashboardData.students.find(s =>
        (s.nik && String(s.nik).trim() === nikOrNisn) ||
        (s.nisn && String(s.nisn).trim() === nikOrNisn)
    );
    
    if (matched) {
        console.log('✅ FOUND:', matched.name, 'ID:', matched.id);
    } else {
        console.log('❌ NOT FOUND');
        console.log('Checking partial matches...');
        dashboardData.students.forEach(s => {
            if (s.nik && String(s.nik).includes(nikOrNisn)) {
                console.log('  Partial NIK match:', s.name, 'NIK:', s.nik);
            }
            if (s.nisn && String(s.nisn).includes(nikOrNisn)) {
                console.log('  Partial NISN match:', s.name, 'NISN:', s.nisn);
            }
        });
    }
}

// 4. Check getSantriIdsForCurrentUser
console.log('\n4️⃣ GET SANTRI IDS:');
if (typeof getSantriIdsForCurrentUser === 'function') {
    const ids = getSantriIdsForCurrentUser();
    console.log('Santri IDs for current user:', ids);
    console.log('Students for these IDs:');
    ids.forEach(id => {
        const student = dashboardData.students.find(s => s.id === id);
        if (student) {
            console.log('  -', student.name, '(ID:', id, ')');
        }
    });
} else {
    console.log('❌ Function not available');
}

// 5. Check getStudentsForCurrentUser
console.log('\n5️⃣ GET STUDENTS FOR CURRENT USER:');
if (typeof getStudentsForCurrentUser === 'function') {
    const students = getStudentsForCurrentUser();
    console.log('Students:', students.length);
    students.forEach(s => {
        console.log('  -', s.name, 'NIK:', s.nik, 'NISN:', s.nisn);
    });
} else {
    console.log('❌ Function not available');
}

// 6. Manual Fix Commands
console.log('\n6️⃣ MANUAL FIX COMMANDS:');
console.log('Run these commands to manually fix:');
console.log('');
console.log('// Refresh parent-child link:');
console.log('window.refreshUserChildLink()');
console.log('');
console.log('// Refresh UI:');
console.log('renderSantri()');
console.log('');
console.log('// Force set child (replace ID with actual student ID):');
console.log('window.currentUserChild = dashboardData.students.find(s => s.id === YOUR_STUDENT_ID)');
console.log('renderSantri()');

console.log('\n=== END DEBUG ===');
