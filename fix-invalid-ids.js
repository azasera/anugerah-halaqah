// Fix Invalid IDs in localStorage
// Run this in browser console to fix IDs with decimals

(function fixInvalidIds() {
    console.log('🔧 Fixing invalid IDs...');
    
    // Load data from localStorage
    const savedData = localStorage.getItem('halaqahData');
    if (!savedData) {
        console.log('❌ No data found in localStorage');
        return;
    }
    
    const data = JSON.parse(savedData);
    let fixed = 0;
    
    // Fix student IDs
    if (data.students) {
        data.students.forEach(student => {
            // If ID has decimal, convert to integer
            if (student.id % 1 !== 0) {
                const oldId = student.id;
                student.id = Math.floor(student.id);
                console.log(`Fixed student ID: ${oldId} → ${student.id}`);
                fixed++;
            }
            
            // Fix setoran IDs
            if (student.setoran) {
                student.setoran.forEach(s => {
                    if (s.id % 1 !== 0) {
                        s.id = Math.floor(s.id);
                        fixed++;
                    }
                });
            }
        });
    }
    
    // Fix halaqah IDs
    if (data.halaqahs) {
        data.halaqahs.forEach(halaqah => {
            if (halaqah.id % 1 !== 0) {
                const oldId = halaqah.id;
                halaqah.id = Math.floor(halaqah.id);
                console.log(`Fixed halaqah ID: ${oldId} → ${halaqah.id}`);
                fixed++;
            }
        });
    }
    
    // Save back to localStorage
    localStorage.setItem('halaqahData', JSON.stringify(data));
    
    console.log(`✅ Fixed ${fixed} invalid IDs`);
    console.log('🔄 Please refresh the page now');
})();
