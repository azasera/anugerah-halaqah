# RINGKASAN APLIKASI BUKU REKAP SETORAN & POIN HALAQAH

## 1. TUJUAN APLIKASI

Aplikasi ini dibuat untuk **memaksa disiplin setoran hafalan** melalui:
- Pencatatan real-time
- Perhitungan poin otomatis
- Transparansi ranking
- Tekanan sosial yang sehat

**Bukan untuk laporan. Bukan untuk formalitas. Untuk mengubah perilaku.**

---

## 2. AKSES APLIKASI

### 🌐 PUBLIK (Tanpa Login)
**Siapa:** Siapa saja (guru, santri, wali, pimpinan)
**Akses:**
- Dashboard real-time
- Ranking halaqah
- Ranking santri
- Statistik live
- Banner "Halaqah Terbaik Hari Ini"

**Tujuan:** Transparansi penuh. Semua orang bisa lihat performa halaqah kapan saja.

### 👨‍🏫 GURU / MUSYRIF (Login Required)
**Akses:**
- Input setoran halaqah mereka
- Lihat data halaqah mereka
- Input hari itu juga
- **Tidak bisa edit atau hapus**

**Aturan Keras:**
- Input harus hari itu
- Tidak ada susulan
- Tidak ada koreksi

### 👨‍👩‍👧 ORANG TUA (Login dengan NIK)
**Akses:**
- Lihat laporan anak sendiri
- Lihat ranking anak
- Lihat histori setoran anak
- **Tidak bisa input atau edit**

**Login:** Menggunakan NIK anak + tanggal lahir

### 👑 ADMIN (Full Control)
**Akses:**
- Kelola data master (santri, halaqah, lembaga)
- Import/Export Excel
- Lihat audit log
- Hapus data (jika diperlukan)
- **Tidak input setoran** (itu tugas guru)

---

## 3. ALUR DARI AWAL SAMPAI AKHIR

### Langkah 1 — Setoran Terjadi
Santri menyetor hafalan kepada guru halaqah.

### Langkah 2 — Input Real-Time
Guru halaqah langsung mencatat setoran di aplikasi:
- Nama santri
- Waktu setor
- Poin otomatis (sistem hitung)

**Jika tidak diinput hari itu, sistem menganggap tidak setor.**

### Langkah 3 — Data Dikunci
Sistem:
- Data tersimpan
- Tidak bisa diubah
- Tercatat siapa yang input

**Ini menutup peluang manipulasi.**

### Langkah 4 — Perhitungan Otomatis
Sistem otomatis:
- Menghitung poin santri
- Mengakumulasi poin halaqah
- Menyusun ranking harian

**Tanpa campur tangan manusia.**

### Langkah 5 — Transparansi Publik Internal
Setiap hari tampil:
- Ranking santri
- Ranking halaqah
- Banner "Halaqah Terbaik Hari Ini"

**Semua berbasis data. Bisa diakses siapa saja tanpa login.**

### Langkah 6 — Tekanan & Respons
- Halaqah naik → diapresiasi
- Halaqah turun → terpantau
- Santri bermasalah → ditindaklanjuti

**Tanpa marah. Tanpa teriak. Sistem yang bekerja.**

### Langkah 7 — Audit & Evaluasi
Semua aktivitas:
- Siapa input
- Kapan
- Data apa

**Bisa diaudit kapan saja. Evaluasi dilakukan berdasarkan data, bukan perasaan.**

---

## 4. ATURAN POIN (Otomatis oleh Sistem)

### ✅ POIN +2
- TEPAT WAKTU (sesuai sesi)
- LANCAR (tidak ada salah)
- CAPAI TARGET (sesuai lembaga)

### ✅ POIN +1
- TEPAT WAKTU (sesuai sesi)
- TIDAK LANCAR (maksimal 3 salah)
- CAPAI TARGET (sesuai lembaga)

### ⚠️ POIN 0 (Kondisi 1)
- TEPAT WAKTU
- LANCAR
- TIDAK CAPAI TARGET

### ⚠️ POIN 0 (Kondisi 2)
- TIDAK TEPAT WAKTU
- LANCAR
- CAPAI TARGET

### ❌ POIN -1
- TIDAK SETOR sama sekali

**Sistem yang hitung. Guru hanya input data.**

---

## 5. ATURAN PENTING SISTEM

- ❌ Tidak ada input susulan
- ❌ Tidak ada koreksi manual
- ❌ Tidak ada kebijakan pribadi
- ✅ Semua lewat aplikasi

**Satu pelanggaran = sistem rusak.**

---

## 6. FITUR UTAMA

### 📊 Dashboard Real-Time (Publik)
- Statistik live
- Ranking halaqah
- Ranking santri
- Grafik performa
- **Tidak perlu login**

### 📝 Input Setoran (Guru)
- Form sederhana
- Poin otomatis
- Validasi waktu
- Tidak bisa edit

### 👨‍👩‍👧 Portal Orang Tua
- Login dengan NIK
- Lihat anak sendiri
- Histori lengkap
- Notifikasi (opsional)

### 👑 Admin Panel
- Kelola master data
- Import/Export Excel
- Audit log
- User management

### 📱 Mobile-First Design
- Responsive
- Touch-friendly
- Fast loading
- Offline-capable

---

## 7. TEKNOLOGI

### Frontend
- HTML5, CSS3 (Tailwind)
- JavaScript (Vanilla)
- Real-time updates

### Backend
- Supabase (Database + Auth)
- PostgreSQL
- Row Level Security (RLS)

### Deployment
- Static hosting
- CDN ready
- PWA capable

---

## 8. OUTPUT AKHIR APLIKASI

✅ Disiplin setoran terbentuk
✅ Guru lebih terlibat
✅ Halaqah lebih hidup
✅ Evaluasi objektif
✅ Konflik berkurang
✅ Transparansi penuh

---

## 9. KESIMPULAN

**Aplikasi ini bukan alat IT. Ini alat manajemen disiplin.**

- Kalau dijalankan konsisten → **berhasil**
- Kalau ditawar-tawar → **gagal**

**Dashboard publik memastikan:**
- Tidak ada yang bisa sembunyi
- Semua orang tahu performa halaqah
- Tekanan sosial bekerja otomatis
- Apresiasi langsung terlihat

**Login hanya untuk yang perlu input/edit:**
- Guru → input setoran
- Orang tua → lihat anak
- Admin → kelola sistem

**Sisanya? Lihat saja. Tidak perlu login.**

---

## 10. IMPLEMENTASI

### Fase 1: Setup (1 hari)
- Install aplikasi
- Setup database
- Import data master

### Fase 2: Training (1 hari)
- Training guru
- Training admin
- Simulasi input

### Fase 3: Go Live (Hari H)
- Mulai input real
- Monitor sistem
- Evaluasi harian

### Fase 4: Maintenance (Ongoing)
- Backup rutin
- Monitor performa
- Update jika perlu

---

**Dibuat dengan fokus pada disiplin, transparansi, dan efektivitas.**
**Bukan untuk laporan. Untuk mengubah perilaku.**
