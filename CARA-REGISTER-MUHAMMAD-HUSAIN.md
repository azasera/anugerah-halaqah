# Cara Register Muhammad Husain - Manual via Supabase

## Masalah
Error: `email rate limit exceeded` - Supabase membatasi email konfirmasi

## Solusi 1: Register Manual via Supabase Dashboard (TERCEPAT)

### Langkah-langkah:

1. **Buka Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Login dengan akun Anda
   - Pilih project: `klhegwunosmryqozuahc`

2. **Buka Authentication > Users**
   - Klik menu "Authentication" di sidebar kiri
   - Klik tab "Users"

3. **Klik "Add User" atau "Invite User"**
   - Klik tombol hijau "Add User" di kanan atas

4. **Isi Form:**
   ```
   Email: 1971022102090001@sekolah.id
   Password: 21022009
   Auto Confirm User: ✅ (CENTANG INI!)
   ```

5. **Set User Metadata (Optional tapi recommended):**
   Klik "User Metadata" atau "Additional Data", lalu isi:
   ```json
   {
     "full_name": "Muhammad Husain",
     "role": "ortu",
     "student_id": 1771675116059,
     "nik": "1971022102090001"
   }
   ```

6. **Klik "Create User"**

7. **Selesai!** Muhammad Husain sekarang bisa login dengan:
   - NIK: `1971022102090001`
   - Password: `21022009`

---

## Solusi 2: Disable Email Confirmation (Permanent Fix)

Jika Anda sering mengalami masalah ini, disable email confirmation:

1. **Buka Supabase Dashboard**
2. **Authentication > Settings**
3. **Scroll ke "Email Auth"**
4. **Disable "Enable email confirmations"**
5. **Save**

Setelah ini, register via tool akan langsung berhasil tanpa perlu konfirmasi email.

---

## Solusi 3: Tunggu & Coba Lagi

Tunggu 5-10 menit, lalu buka `register-muhammad-husain.html` dan klik "Register Akun Sekarang" lagi.

---

## Verifikasi Login

Setelah register berhasil (via cara manapun), test login:

1. **Buka dashboard.html**
2. **Klik tombol Login**
3. **Masukkan:**
   - NIK: `1971022102090001`
   - Password: `21022009`
4. **Klik Login**

Atau test via tool: `register-muhammad-husain.html` > Klik "🔐 Test Login"

---

## Troubleshooting

### Login masih gagal setelah register?

**Cek di Supabase Dashboard > Authentication > Users:**
- Apakah email `1971022102090001@sekolah.id` ada?
- Apakah status "Confirmed"? (harus ✅)
- Jika belum confirmed, klik user > "Confirm Email"

### Password salah?

Reset password di Supabase Dashboard:
1. Buka Authentication > Users
2. Klik user `1971022102090001@sekolah.id`
3. Klik "Reset Password"
4. Set password baru: `21022009`

---

## SQL Alternative (Advanced)

Jika Anda familiar dengan SQL, bisa register via SQL Editor:

```sql
-- Note: Ini hanya contoh, password harus di-hash dengan bcrypt
-- Lebih mudah pakai Dashboard UI
```

**TIDAK RECOMMENDED** - Gunakan Dashboard UI saja (Solusi 1).

---

## Kontak Support

Jika masih gagal:
1. Screenshot error
2. Screenshot Supabase Dashboard > Authentication > Users
3. Kirim ke developer
