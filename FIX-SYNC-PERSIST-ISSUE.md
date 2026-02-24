# Fix: Data Tidak Persist Setelah Refresh

## Problem
Data total hafalan berhasil diupdate dari API ke localStorage, tapi setelah refresh halaman kembali ke nilai awal.

## Root Cause
Data di localStorage tidak tersync ke Supabase, sehingga saat page load, fungsi `loadStudentsFromSupabase()` mengoverwrite localStorage dengan data lama dari Supabase.

## Flow yang Terjadi:
1. User klik "Sinkron Total Hafalan" → Data diupdate di localStorage ✅
2. Fungsi `syncStudentsToSupabase()` dipanggil → Tapi mungkin gagal atau tidak jalan ❌
3. User refresh page → `loadStudentsFromSupabase()` load data lama dari Supabase ❌
4. Data di localStorage di-overwrite dengan data lama → Total hafalan kembali ke nilai awal ❌

## Possible Causes

### 1. Auth Check Blocking Sync
Fungsi `syncStudentsToSupabase()` di `js/supabase.js` line 170-174 memblokir sync jika user bukan admin atau guru:

```javascript
const profile = ensureProfileLoaded();
if (!profile || (profile.role !== 'admin' && profile.role !== 'guru')) {
    console.warn('⛔ Sync blocked: User is not admin or guru');
    return { status: 'skipped_permission' };
}
```

**Solution**: Pastikan user login sebagai admin atau guru.

### 2. Sync In Progress
Jika ada sync yang sedang berjalan, sync baru akan di-skip (line 177-180):

```javascript
if (window.syncInProgress) {
    console.log('⏭️ Sync already in progress, skipping...');
    return { status: 'skipped_in_progress' };
}
```

**Solution**: Tunggu hingga sync selesai sebelum melakukan sync baru.

### 3. Network Error
Sync ke Supabase bisa gagal karena network error, timeout, atau rate limiting.

**Solution**: Check console log untuk error messages.

## Tools untuk Debug

### 1. debug-sync-issue.html (RECOMMENDED)
Tool komprehensif untuk mendiagnosis dan memperbaiki masalah sync:

**Langkah-langkah:**
1. Buka `debug-sync-issue.html` di browser
2. Klik "Step 1: Cek Status" → Cek currentProfile dan data di localStorage
3. Klik "Step 2: Sync dari API" → Update data di localStorage dari API
4. Klik "Step 3: Cek Supabase" → Bandingkan data localStorage vs Supabase
5. Klik "Step 4: Force Sync" → Paksa sync semua data ke Supabase
6. Refresh halaman
7. Klik "Step 5: Verify Persist" → Verifikasi data sudah persist

### 2. force-sync-to-supabase.html
Tool sederhana untuk force sync data MTA ke Supabase:

**Langkah-langkah:**
1. Buka `force-sync-to-supabase.html` di browser
2. Klik "Step 1: Sync dari API ke localStorage"
3. Klik "Step 2: Cek Data di localStorage"
4. Klik "Step 3: Force Sync ke Supabase"
5. Refresh dashboard untuk melihat perubahan

## Fixes Applied

### 1. Fixed Syntax Errors in force-sync-to-supabase.html
- Changed `const supabaseClient` to `const supabase` (line 75)
- Removed duplicate variable declaration
- All functions now properly defined in global scope

### 2. Added Sync Call in js/excel.js
Fungsi `importTotalHafalanSdFromGuru()` sudah memanggil sync (line 713-720):

```javascript
if (typeof window.syncStudentsToSupabase === 'function') {
    try {
        await window.syncStudentsToSupabase();
        console.log(`[${jenjangSlug.toUpperCase()}] Supabase sync completed`);
    } catch (syncError) {
        console.error(`[${jenjangSlug.toUpperCase()}] Supabase sync failed:`, syncError);
    }
}
```

## Verification Steps

1. **Check Console Log**
   - Buka browser console (F12)
   - Cari pesan: `[MTA] Syncing to Supabase...`
   - Cari pesan: `[MTA] Supabase sync completed` atau error messages

2. **Check currentProfile**
   ```javascript
   // Di console:
   JSON.parse(localStorage.getItem('currentProfile'))
   ```
   - Pastikan role adalah 'admin' atau 'guru'

3. **Check Sync Status**
   ```javascript
   // Di console:
   window.syncInProgress
   ```
   - Harus `false` atau `undefined` sebelum sync baru

4. **Manual Force Sync**
   ```javascript
   // Di console:
   await window.syncStudentsToSupabase()
   ```
   - Check return value: `{ status: 'success', count: X }`

## Next Steps

1. **Gunakan debug-sync-issue.html** untuk diagnosa lengkap
2. **Check console log** saat klik "Sinkron Total Hafalan"
3. **Verify user role** adalah admin atau guru
4. **Force sync** jika perlu menggunakan tool yang disediakan
5. **Test persistence** dengan refresh halaman setelah sync

## Files Modified
- `force-sync-to-supabase.html` - Fixed syntax errors
- `debug-sync-issue.html` - NEW: Comprehensive debugging tool
- `FIX-SYNC-PERSIST-ISSUE.md` - NEW: This documentation

## Status
✅ Syntax errors fixed
✅ Debugging tools created
⏳ Waiting for user to test and verify

## Important Notes

1. **Only admin and guru can sync to Supabase** - This is by design for security
2. **Sync is async** - May take a few seconds to complete
3. **Check console for errors** - All sync operations log to console
4. **Use debugging tools** - Don't guess, use the tools to diagnose
