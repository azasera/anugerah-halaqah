# 🔧 Fix All Errors - Simple Guide

## 🔴 Errors You're Getting
- ❌ Error 400 when syncing students
- ❌ Error 400 when syncing halaqahs
- ❌ Error 500 infinite recursion (if you see this)

## ✅ Solution

### Option 1: Fix Columns Only (RECOMMENDED - Safest)

**Run This File: `supabase-fix-columns-only.sql`**

This ONLY adds missing columns. No policy changes.

**Steps:**
1. Open Supabase Dashboard: https://app.supabase.com
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy ALL content from file: **`supabase-fix-columns-only.sql`**
5. Paste into SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for success message

### Option 2: Fix Everything (If you also have recursion error)

**Run This File: `supabase-fix-all.sql`**

This fixes columns AND policies.

**Note:** If you get error "policy already exists", use Option 1 instead.

### After Running SQL

1. Open your app in browser
2. Press **F12** (open Developer Tools)
3. Go to **Console** tab
4. Type this and press Enter:
   ```javascript
   localStorage.clear()
   ```
5. Refresh page (F5)

## ✅ Done!

Errors should be gone. Check Console - no more 400 or 500 errors.

## 📁 Files Explained

- **`supabase-fix-columns-only.sql`** ⭐ - SAFEST - Only adds columns
- **`supabase-fix-all.sql`** - Fixes columns + policies (use if you have recursion error)
- **`FIX-ERROR-400.md`** - Detailed troubleshooting guide
- **`supabase-add-nik-simple.sql`** - Minimal fix (only NIK column)
- **`supabase-fix-rls-policies.sql`** - Only fixes recursion error
- **`supabase-migration-complete.sql`** - Full migration (for fresh install)

## 🆘 Still Having Issues?

### Check if NIK column exists:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'students' AND column_name = 'nik';
```

Should return: `nik`

### Check all students columns:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'students';
```

Should have: `id`, `name`, `halaqah`, `nisn`, `nik`, `lembaga`, `kelas`, etc.

## 💡 Why This Happens

Your Supabase database was created before we added the `nik` column. The app tries to send `nik` data, but the database doesn't have that column yet. Running the SQL adds the missing column.
