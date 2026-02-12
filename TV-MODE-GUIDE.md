# 📺 TV Dashboard Mode - Panduan

## Apa itu TV Mode?

Mode khusus untuk menampilkan dashboard di layar TV/proyektor di ruang guru atau kantor. Dashboard akan auto-rotate menampilkan 3 slide berbeda setiap 15 detik.

## Fitur Utama

### 📱 Mobile-First & Responsive Design

**Breakpoints:**
- Mobile: < 768px (default)
- Desktop/TV: ≥ 768px (md:)

**Responsive Features:**
- Font sizes scale dari mobile ke desktop
- Padding/spacing adjust otomatis
- Table horizontal scroll di mobile
- Grid 1 kolom di mobile, 3 kolom di desktop
- Exit button always visible di mobile, hover di desktop

### 🎮 Manual Navigation

**Progress Dots (Clickable):**
- Klik/tap pada dot untuk langsung ke slide tertentu
- Dot aktif berwarna kuning
- Hover effect untuk feedback visual

**Navigation Arrows (Desktop):**
- Tombol Previous (←) dan Next (→) di kiri/kanan layar
- Muncul saat hover
- Klik untuk pindah slide

**Swipe Gesture (Mobile/Touch):**
- Swipe left → Next slide
- Swipe right → Previous slide
- Minimum swipe distance: 50px

**Keyboard Shortcuts (Desktop):**
- Arrow Left (←) → Previous slide
- Arrow Right (→) → Next slide
- Number keys (1, 2, 3) → Jump to specific slide

**Auto-Rotate Reset:**
- Setiap interaksi manual akan reset timer auto-rotate
- Auto-rotate tetap berjalan setelah 15 detik idle

### 🔄 Auto-Rotating Slides (15 detik per slide)

**Slide 1: Ranking Halaqah Harian**
- Tabel ranking semua halaqah
- Sorted by total poin
- Medali 🥇🥈🥉 untuk top 3
- Font besar untuk visibility dari jauh

**Slide 2: Halaqah Terbaik Hari Ini**
- Hero banner dengan nama halaqah terbaik
- Total poin dalam ukuran super besar
- Glow effect & animasi
- Trophy icon

**Slide 3: Santri Terbaik**
- 3 cards untuk top 3 santri
- Nama, halaqah, dan total poin
- Medali untuk setiap posisi
- Layout grid 3 kolom

### ✨ Design Features

- **Dark Theme** - Background #0f172a (slate-950)
- **Huge Typography** - Font size hingga 14rem untuk emphasis
- **Glow Effects** - Border & shadow dengan accent colors
- **Blur Orbs** - Animated background decoration
- **Progress Dots** - Indicator slide yang aktif
- **Smooth Transitions** - Fade in/out animations

### 🔄 Auto-Refresh

- Data refresh otomatis setiap kali kembali ke slide pertama
- Sinkronisasi real-time dengan Supabase
- No manual refresh needed

## Cara Menggunakan

### 1. Akses TV Mode

**Dari Dashboard Utama:**
- Klik "📺 Mode TV Display" di sidebar (desktop)
- Atau klik "📺 Mode TV Display" di burger menu (mobile)

**Direct Access:**
- Buka `tv.html` langsung di browser
- Bookmark URL untuk akses cepat

### 2. Setup untuk TV/Proyektor

1. Buka `tv.html` di browser (Chrome/Edge recommended)
2. Tekan F11 untuk fullscreen mode
3. Biarkan berjalan otomatis
4. Dashboard akan auto-rotate setiap 15 detik

### 3. Tips Optimal Display

**Resolusi Recommended:**
- 1920x1080 (Full HD) - Optimal
- 2560x1440 (2K) - Excellent
- 3840x2160 (4K) - Perfect

**Browser Settings:**
- Disable sleep mode
- Disable screensaver
- Set browser to not auto-close tabs
- Enable hardware acceleration

**Display Settings:**
- Brightness: 80-100%
- Contrast: High
- Color mode: Vivid/Dynamic

## Keunggulan TV Mode

✅ **No Interaction Needed** - Fully automatic
✅ **High Visibility** - Font besar, high contrast
✅ **Real-time Updates** - Data selalu fresh
✅ **Professional Look** - Modern design dengan animasi
✅ **Motivational** - Transparansi ranking memotivasi santri
✅ **Public Display** - No login required

## Use Cases

### 1. Ruang Guru
Pasang di TV ruang guru untuk monitoring real-time performa halaqah

### 2. Kantor Admin
Display di kantor untuk transparansi dan accountability

### 3. Ruang Tunggu
Tampilkan di area publik untuk motivasi santri

### 4. Rapat Evaluasi
Gunakan saat presentasi evaluasi bulanan

### 5. Event/Acara
Display saat acara penutupan/wisuda untuk apresiasi

## Technical Details

**File:** `tv.html`

**Dependencies:**
- Tailwind CSS (CDN)
- Supabase JS Client (CDN)
- Google Fonts - Inter
- `js/settings.js` (Supabase config)

**Data Source:**
- Supabase tables: `students`, `halaqahs`
- Real-time sync every 15 seconds

**Performance:**
- Lightweight (~50KB)
- No heavy libraries
- Smooth animations
- Low CPU usage

## Troubleshooting

### Data tidak muncul?
- Pastikan Supabase config sudah benar di `js/settings.js`
- Check browser console untuk error
- Pastikan koneksi internet stabil

### Slide tidak rotate?
- Refresh page (F5)
- Check browser console
- Pastikan JavaScript enabled

### Font terlalu kecil/besar?
- Adjust browser zoom (Ctrl + / Ctrl -)
- Atau edit font size di `tv.html`

### Fullscreen tidak work?
- Tekan F11 (Windows/Linux)
- Tekan Cmd+Ctrl+F (Mac)
- Atau klik icon fullscreen di browser

## Customization

### Ubah Durasi Slide
Edit di `tv.html` line ~280:
```javascript
}, 15000); // 15 seconds → ubah angka ini
```

### Ubah Warna Theme
Edit di `tv.html`:
- Background: `bg-[#0f172a]` → ganti dengan warna lain
- Accent: `text-yellow-400` → ganti dengan warna lain

### Ubah Jumlah Top Students
Edit di `tv.html` line ~150:
```javascript
.slice(0, 3); // Top 3 → ubah angka ini
```

## Future Enhancements

Fitur yang bisa ditambahkan:
- [ ] Grafik trend poin per hari
- [ ] Animasi confetti untuk halaqah terbaik
- [ ] Sound effect saat slide change
- [ ] QR code untuk akses dashboard
- [ ] Live clock dengan countdown
- [ ] Weather widget
- [ ] Quotes motivasi

## Support

Jika ada masalah atau request fitur, hubungi admin atau buka issue di repository.

---

**Status:** ✅ Ready to Use
**Version:** 1.0.0
**Last Updated:** 2026-02-12
