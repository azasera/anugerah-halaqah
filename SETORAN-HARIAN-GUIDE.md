# 📝 Setoran Harian - Implementation Guide

## Overview

Table `setoran_harian` adalah sistem tracking history setoran santri dengan timestamp lengkap. Ini menggantikan array `setoran` di table `students` dengan approach yang lebih scalable dan powerful.

## Keuntungan vs Array di Students Table

### ❌ Masalah dengan Array `students.setoran`:
- Sulit query by date range
- Tidak ada timestamp detail
- Tidak track siapa yang input
- Sulit untuk analytics
- Array size limit
- Tidak bisa join dengan table lain

### ✅ Keuntungan Table `setoran_harian`:
- ✅ Full history dengan timestamp
- ✅ Track created_by (accountability)
- ✅ Easy query by date, santri, halaqah
- ✅ Scalable (millions of records)
- ✅ Relational (join dengan students, halaqahs)
- ✅ Built-in views untuk ranking
- ✅ Functions untuk common queries
- ✅ Indexes untuk performance

## Database Schema

```sql
setoran_harian
├── id (BIGINT, PK)
├── santri_id (BIGINT, FK → students)
├── halaqah_id (BIGINT, FK → halaqahs)
├── tanggal (DATE)
├── waktu_setor (TIMESTAMP)
├── poin (INTEGER, -1 to 2)
├── keterangan (TEXT, optional)
├── created_by (UUID, FK → auth.users)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## Views

### 1. `v_ranking_harian`
Ranking halaqah per hari
```sql
SELECT * FROM v_ranking_harian 
WHERE tanggal = CURRENT_DATE
ORDER BY peringkat;
```

### 2. `v_top_setoran_harian`
Santri tercepat setor per hari
```sql
SELECT * FROM v_top_setoran_harian 
WHERE tanggal = CURRENT_DATE 
AND urutan <= 3;
```

## Functions

### 1. `get_santri_setoran_history(santri_id, limit)`
Get history setoran santri
```sql
SELECT * FROM get_santri_setoran_history(123, 30);
```

### 2. `get_halaqah_daily_stats(halaqah_id, tanggal)`
Get statistik halaqah per hari
```sql
SELECT * FROM get_halaqah_daily_stats(456, '2026-02-12');
```

## JavaScript API

### Import Module
```html
<script src="js/setoran-harian.js"></script>
```

### Create Setoran
```javascript
const setoran = await SetoranHarian.create(
    santriId,      // BIGINT
    halaqahId,     // BIGINT
    poin,          // -1, 0, 1, or 2
    'Lancar'       // keterangan (optional)
);
```

### Get History
```javascript
const history = await SetoranHarian.getHistory(santriId, 30);
// Returns last 30 setoran
```

### Get Daily Ranking
```javascript
const ranking = await SetoranHarian.getDailyRanking();
// Returns today's ranking
```

### Get Top Setoran (Fastest)
```javascript
const topSetoran = await SetoranHarian.getTopSetoranToday(3);
// Returns top 3 fastest setoran today
```

### Get Halaqah Stats
```javascript
const stats = await SetoranHarian.getHalaqahStats(halaqahId);
// Returns: total_setoran, total_poin, avg_poin, santri_setor, santri_tidak_setor
```

### Get by Date Range
```javascript
const setoran = await SetoranHarian.getByDateRange(
    '2026-02-01',
    '2026-02-12',
    halaqahId  // optional
);
```

### Delete Setoran (Admin)
```javascript
const success = await SetoranHarian.delete(setoranId);
```

## Migration Steps

### 1. Run SQL Migration
```bash
# Di Supabase SQL Editor
# Copy-paste isi file: supabase-migration-setoran-harian.sql
# Execute
```

### 2. Add Script to HTML
```html
<!-- Add before closing </body> -->
<script src="js/setoran-harian.js"></script>
```

### 3. Update Existing Code

**Before (Old Way):**
```javascript
// Add setoran to array
student.setoran.push({
    date: new Date().toISOString(),
    poin: 2
});
student.total_points += 2;
```

**After (New Way):**
```javascript
// Create setoran record
await SetoranHarian.create(
    student.id,
    student.halaqah_id,
    2,
    'Lancar, tepat waktu'
);
// Points auto-updated!
```

## Integration with TV Mode

Update `tv.html` to use new data:

```javascript
// Get today's ranking
const ranking = await SetoranHarian.getDailyRanking();

// Get top 3 fastest setoran
const topSetoran = await SetoranHarian.getTopSetoranToday(3);

// Render to UI
renderRankingTable(ranking);
renderTopSetoran(topSetoran);
```

## Performance

### Indexes Created:
- `idx_setoran_santri_id` - Query by santri
- `idx_setoran_halaqah_id` - Query by halaqah
- `idx_setoran_tanggal` - Query by date
- `idx_setoran_waktu` - Query by time
- `idx_setoran_santri_tanggal` - Composite for common queries
- `idx_setoran_halaqah_tanggal` - Composite for common queries

### Expected Performance:
- Insert: < 10ms
- Query by santri: < 20ms
- Query by date: < 30ms
- Ranking calculation: < 50ms

## Data Migration (Optional)

If you want to migrate existing `students.setoran` array to table:

```javascript
async function migrateSetoranToTable() {
    const { data: students } = await supabaseClient
        .from('students')
        .select('*');
    
    for (const student of students) {
        if (student.setoran && student.setoran.length > 0) {
            for (const s of student.setoran) {
                await SetoranHarian.create(
                    student.id,
                    student.halaqah_id,
                    s.poin || 0,
                    s.keterangan || ''
                );
            }
        }
    }
    
    console.log('Migration complete!');
}
```

## Troubleshooting

### Error: "relation setoran_harian does not exist"
- Run migration SQL first
- Check table created: `SELECT * FROM setoran_harian LIMIT 1;`

### Error: "permission denied"
- Check RLS policies enabled
- Verify user is authenticated

### Points not updating
- Check `updateStudentPoints()` and `updateHalaqahPoints()` functions
- Verify foreign keys correct

## Future Enhancements

Possible additions:
- [ ] Notification when santri tidak setor 3 hari berturut-turut
- [ ] Export setoran to Excel by date range
- [ ] Grafik trend setoran per santri
- [ ] Leaderboard all-time
- [ ] Badges/achievements based on streak
- [ ] SMS/WhatsApp notification to parents

## Support

Jika ada masalah atau pertanyaan, check:
1. Browser console untuk error messages
2. Supabase logs untuk database errors
3. Network tab untuk API call failures

---

**Status:** ✅ Ready to Implement
**Version:** 1.0.0
**Last Updated:** 2026-02-12
