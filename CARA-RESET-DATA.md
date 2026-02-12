# Cara Reset Data Aplikasi

## Masalah
Data sudah ada dengan poin negatif padahal belum ada aktivitas input data.

## Penyebab
- Auto-penalty yang berjalan sebelumnya
- Sync loop yang menyebabkan duplikasi penalty
- Cache lama yang corrupt

## Solusi

### Opsi 1: Reset Data Lokal (Cepat)
1. Login sebagai Admin
2. Buka **Pengaturan Admin** (dari sidebar)
3. Scroll ke bawah, klik **"🔍 Debug Panel"**
4. Klik tombol **"🗑️ Hapus Cache Lokal & Reload"**
5. Halaman akan reload otomatis dengan data fresh dari server

### Opsi 2: Reset Total Database (Hati-hati!)
Jika Anda ingin mulai dari awal total:

1. Login sebagai Admin
2. Buka **Pengaturan Admin**
3. Klik **"🔍 Debug Panel"**
4. Klik tombol **"⚠️ Hapus SEMUA Data di Server (Reset Total)"**
5. Konfirmasi 2x
6. Database akan kosong total

### Opsi 3: Manual via Supabase Dashboard
1. Login ke https://supabase.com
2. Pilih project Anda
3. Buka **Table Editor**
4. Pilih tabel `students`
5. Klik **"Delete all rows"** atau hapus satu per satu
6. Lakukan hal yang sama untuk tabel `halaqahs`
7. Refresh aplikasi

### Opsi 4: Perbaiki Data yang Ada
Jika Anda ingin mempertahankan data santri tapi reset poin:

1. Buka Debug Panel
2. Klik **"📈 Ringkasan Data"**
3. Lihat apakah ada duplikat
4. Jika ada, klik **"Hapus Duplikat"**

Atau manual:
1. Buka setiap santri
2. Edit data santri
3. Set poin ke 0
4. Hapus history setoran yang salah

## Rekomendasi
Gunakan **Opsi 1** untuk reset cepat dan mulai fresh dengan data dari server.

## Setelah Reset
1. Import data santri dari Excel (jika ada)
2. Mulai input setoran normal
3. Auto-penalty sudah dinonaktifkan, jadi tidak akan ada penalty otomatis lagi
4. Admin harus manual trigger penalty dari menu "Tracking Absensi"
