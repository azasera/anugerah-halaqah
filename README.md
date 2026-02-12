# 📚 Halaqah Tracker - Sistem Rekap Setoran & Poin

Aplikasi web modern untuk tracking setoran hafalan Al-Qur'an dengan sistem poin otomatis, terintegrasi dengan Supabase untuk real-time sync.

## ✨ Fitur Utama

### 📊 Dashboard & Statistik
- Real-time ranking santri dan halaqah
- Statistik lengkap (total santri, halaqah, poin, rata-rata)
- Filter dan sorting multi-kriteria
- Search santri dengan instant result

### 📖 Input Setoran
- Input jumlah baris hafalan
- Auto-konversi baris ke halaman
- Sistem poin otomatis berdasarkan:
  - ✅ Ketepatan waktu (sesuai sesi)
  - ✅ Kelancaran (lancar/tidak lancar)
  - ✅ Pencapaian target
- Tracking kesalahan (max 3 salah)
- Riwayat setoran lengkap per santri

### 🎯 Sistem Poin
- **+2 Poin**: Tepat waktu + Lancar + Capai target
- **+1 Poin**: Tepat waktu + Tidak lancar (≤3 salah) + Capai target
- **0 Poin**: Tepat waktu + Lancar + Tidak capai target ATAU Tidak tepat waktu
- **-1 Poin**: Tidak setor sama sekali

### ⏰ Manajemen Sesi
- 3 Sesi halaqah dengan waktu custom
- Deteksi sesi aktif otomatis
- Enable/disable sesi per kebutuhan

### 🏫 Multi-Lembaga
- **MTA**: 15 baris/halaman
- **SDITA** (Kelas 1-6): 5-15 baris/halaman
- **SMPITA**: 10 baris/halaman
- **SMAITA**: 10 baris/halaman
- Target dan poin dapat disesuaikan

### 📥 Import/Export Excel
- Download template Excel
- Upload data massal (santri & halaqah)
- Preview sebelum import
- Export data ke Excel/CSV

### 👥 Manajemen Data
- Tambah/edit/hapus santri
- Tambah/edit/hapus halaqah
- Tracking absensi dengan penalti
- Bulk delete dengan konfirmasi

### 📱 Mobile-First Design
- Bottom navigation untuk mobile
- Sidebar menu untuk desktop
- Burger menu dengan slide animation
- Quick actions modal
- Responsive di semua device

### ☁️ Cloud Sync (Supabase)
- Real-time synchronization
- Offline mode dengan localStorage backup
- Auto-sync setiap 30 detik
- Multi-device support
- Sync status indicator

## 🚀 Setup

### 1. Supabase Setup
1. Buat project di [Supabase](https://supabase.com)
2. Jalankan SQL schema dari `supabase-schema.sql`
3. Copy URL dan Anon Key ke `js/supabase.js`

### 2. Local Development
```bash
# Jalankan local server
npx serve -l 8000

# Atau gunakan Python
python -m http.server 8000

# Atau PHP
php -S localhost:8000
```

### 3. Akses Aplikasi
Buka browser: `http://localhost:8000`

## 📁 Struktur File

```
├── index.html              # Main HTML
├── css/
│   └── styles.css         # Custom styles
├── js/
│   ├── settings.js        # App settings & poin rules
│   ├── data.js            # Data management
│   ├── supabase.js        # Supabase integration
│   ├── ui.js              # UI rendering
│   ├── modal.js           # Modal management
│   ├── forms.js           # Form handlers (CRUD)
│   ├── setoran.js         # Setoran input & history
│   ├── absence.js         # Absence tracking
│   ├── admin.js           # Admin settings
│   ├── excel.js           # Excel import/export
│   └── app.js             # App initialization
├── supabase-schema.sql    # Database schema
└── README.md              # Documentation
```

## 🎨 Tech Stack

- **Frontend**: HTML5, TailwindCSS, Vanilla JavaScript
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Libraries**:
  - Supabase JS Client
  - SheetJS (xlsx) for Excel
  - Google Fonts (Outfit, Plus Jakarta Sans)

## 🔐 Security

- Row Level Security (RLS) enabled
- Public access policies (customize as needed)
- Input validation
- Confirmation dialogs for destructive actions

## 📝 Aturan Poin Detail

### Kondisi Poin +2
- Setor tepat waktu (dalam sesi aktif)
- Hafalan lancar (0 kesalahan)
- Mencapai target baris sesuai lembaga

### Kondisi Poin +1
- Setor tepat waktu (dalam sesi aktif)
- Hafalan tidak lancar (maksimal 3 kesalahan)
- Mencapai target baris sesuai lembaga

### Kondisi Poin 0
- **Kondisi 1**: Tepat waktu + Lancar + Tidak capai target
- **Kondisi 2**: Tidak tepat waktu (meskipun lancar & capai target)

### Kondisi Poin -1
- Tidak setor sama sekali (tracking absensi)

## 🎯 Fitur Mendatang

- [ ] Authentication & user roles
- [ ] Laporan PDF
- [ ] Grafik progress
- [ ] Notifikasi push
- [ ] Mobile app (PWA)
- [ ] Multi-language support

## 📞 Support

Untuk pertanyaan atau bantuan, silakan buat issue di repository ini.

## 📄 License

MIT License - bebas digunakan untuk keperluan pendidikan dan non-komersial.

---

**Dibuat dengan ❤️ untuk kemudahan tracking hafalan Al-Qur'an**
