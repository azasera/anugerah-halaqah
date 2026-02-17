const dashboardData = {
    students: [
        { id: 1, name: 'Santri A', halaqah: 'Naufal', nisn: '111', nik: '', lembaga: 'MTA', kelas: '3' },
        { id: 2, name: 'Santri B', halaqah: 'Naufal', nisn: '222', nik: '999', lembaga: 'MTA', kelas: '3' }
    ]
};

function mapFromSupabaseRecord(s, existing) {
    const getField = (field, fallback = '') => {
        const remoteVal = s[field];
        const localVal = existing ? existing[field] : undefined;
        if (remoteVal !== undefined && remoteVal !== null && remoteVal !== '') {
            return remoteVal;
        }
        if (localVal !== undefined && localVal !== null && localVal !== '') {
            return localVal;
        }
        return fallback;
    };

    return {
        id: s.id,
        name: s.name,
        halaqah: s.halaqah,
        nisn: getField('nisn'),
        nik: getField('nik', ''),
        lembaga: s.lembaga,
        kelas: s.kelas
    };
}

function mapRealtimeRecord(record, existing) {
    const getField = (field, fallback = '') => {
        const remoteVal = record[field];
        const localVal = existing ? existing[field] : undefined;
        if (remoteVal !== undefined && remoteVal !== null && remoteVal !== '') {
            return remoteVal;
        }
        if (localVal !== undefined && localVal !== null && localVal !== '') {
            return localVal;
        }
        return fallback;
    };

    return {
        id: record.id,
        name: record.name,
        halaqah: record.halaqah,
        nisn: getField('nisn'),
        nik: getField('nik', ''),
        lembaga: record.lembaga,
        kelas: record.kelas
    };
}

function runTest(title, fn) {
    try {
        fn();
        console.log('✅', title);
    } catch (e) {
        console.error('❌', title + ':', e.message);
    }
}

runTest('Preserve NISN when adding NIK via loadStudentsFromSupabase mapping', () => {
    const existing = dashboardData.students[0];
    const remote = {
        id: 1,
        name: 'Santri A',
        halaqah: 'Naufal',
        nisn: '',
        nik: '1234567890',
        lembaga: 'MTA',
        kelas: '3'
    };

    const mapped = mapFromSupabaseRecord(remote, existing);

    if (mapped.nisn !== '111') {
        throw new Error('NISN hilang saat update NIK');
    }
    if (mapped.nik !== '1234567890') {
        throw new Error('NIK tidak terupdate dengan benar');
    }
});

runTest('Preserve NISN when realtime update only changes NIK', () => {
    const existing = dashboardData.students[1];
    const realtimeRecord = {
        id: 2,
        name: 'Santri B',
        halaqah: 'Naufal',
        nisn: '',
        nik: '5555555555',
        lembaga: 'MTA',
        kelas: '3'
    };

    const mapped = mapRealtimeRecord(realtimeRecord, existing);

    if (mapped.nisn !== '222') {
        throw new Error('NISN hilang setelah realtime update');
    }
    if (mapped.nik !== '5555555555') {
        throw new Error('NIK tidak terupdate pada realtime update');
    }
});

runTest('Preserve NIK when adding NISN via loadStudentsFromSupabase mapping', () => {
    const existing = {
        id: 3,
        name: 'Santri C',
        halaqah: 'Naufal',
        nisn: '',
        nik: '7777777777',
        lembaga: 'MTA',
        kelas: '3'
    };

    const remote = {
        id: 3,
        name: 'Santri C',
        halaqah: 'Naufal',
        nisn: '3333333333',
        nik: '',
        lembaga: 'MTA',
        kelas: '3'
    };

    const mapped = mapFromSupabaseRecord(remote, existing);

    if (mapped.nisn !== '3333333333') {
        throw new Error('NISN baru tidak terupdate');
    }
    if (mapped.nik !== '7777777777') {
        throw new Error('NIK hilang saat update NISN');
    }
});

runTest('Preserve NIK when realtime update only changes NISN', () => {
    const existing = {
        id: 4,
        name: 'Santri D',
        halaqah: 'Naufal',
        nisn: '',
        nik: '8888888888',
        lembaga: 'MTA',
        kelas: '3'
    };

    const realtimeRecord = {
        id: 4,
        name: 'Santri D',
        halaqah: 'Naufal',
        nisn: '4444444444',
        nik: '',
        lembaga: 'MTA',
        kelas: '3'
    };

    const mapped = mapRealtimeRecord(realtimeRecord, existing);

    if (mapped.nisn !== '4444444444') {
        throw new Error('NISN baru tidak terupdate pada realtime update');
    }
    if (mapped.nik !== '8888888888') {
        throw new Error('NIK hilang setelah realtime update NISN');
    }
});
