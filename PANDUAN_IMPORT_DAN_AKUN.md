# Panduan Import Data & Akun Santri
## Anugrah Halaqah Qur'an

Dokumen ini menjelaskan prosedur import data santri, mekanisme pembuatan akun otomatis, dan pemecahan masalah (troubleshooting) terkait login.

---

### 1. Mekanisme Pembuatan Akun Otomatis
Sistem menggunakan metode **"Lazy Creation"** (Pembuatan Saat Dibutuhkan) untuk efisiensi dan kemudahan pengelolaan.

- **Import Data**: Saat Anda mengimport data Excel, sistem menyimpan data santri (termasuk NIK dan Tanggal Lahir) ke dalam database. Akun pengguna *belum* dibuat saat ini.
- **Login Pertama**: Saat santri/wali santri mencoba login pertama kali menggunakan NIK dan Password Tanggal Lahir:
  1. Sistem mendeteksi bahwa ini adalah login NIK.
  2. Sistem mencocokkan NIK dan Password (Tanggal Lahir) dengan database santri.
  3. Jika cocok, sistem **secara otomatis membuatkan akun pengguna** di background.
  4. Pengguna langsung berhasil login.

**Keuntungan**:
- Tidak perlu membuat ribuan akun kosong sekaligus.
- Akun hanya dibuat untuk santri yang aktif menggunakan aplikasi.
- Mengurangi beban server dan duplikasi data.

---

### 2. Format Data Import (Excel)
Pastikan file Excel Anda mengikuti format berikut agar mapping data berjalan lancar.

| Kolom (Header) | Wajib? | Format / Contoh | Keterangan |
| :--- | :--- | :--- | :--- |
| **No** | Tidak | 1, 2, 3 | Nomor urut |
| **Nama** | **YA** | Abdullah Fulan | Nama lengkap santri |
| **NISN** | Tidak | 1234567890 | Nomor Induk Siswa Nasional (Opsional tapi disarankan) |
| **NIK** | **YA** | 3507123456780001 | **Nomor Induk Kependudukan. Digunakan sebagai Username.** |
| **Halaqah** | Tidak | Ula 1 | Nama kelompok halaqah |
| **Juz** | Tidak | 30 | Hafalan saat ini |
| **TTL** / **Tanggal Lahir** | **YA** | 20-05-2010 | **Digunakan sebagai Password Awal.** Format: DD-MM-YYYY atau YYYY-MM-DD |
| **Jenis Kelamin** | Tidak | L / P | Laki-laki atau Perempuan |

**Catatan Penting**:
- **NIK**: Pastikan kolom NIK diformat sebagai "Text" di Excel agar angka 0 di depan tidak hilang, atau gunakan tanda petik `'` (contoh: `'08123...`).
- **Tanggal Lahir**: Sistem mendukung format `DD-MM-YYYY` (20-05-2010), `YYYY-MM-DD` (2010-05-20), atau `DD/MM/YYYY` (20/05/2010).

---

### 3. Login Pengguna
Setiap santri yang berhasil diimport dapat langsung login dengan kredensial berikut:

- **Username**: Nomor NIK (Contoh: `1971032605110000`)
- **Password**: Tanggal Lahir (Format: `DDMMYYYY`)
  - Contoh: Jika lahir **26 Maret 1971**, passwordnya adalah `26031971`.
  - Contoh: Jika lahir **1 Januari 2010**, passwordnya adalah `01012010`.

---

### 4. Verifikasi Data (Untuk Admin)
Admin dapat memverifikasi kesiapan data santri melalui menu **Admin > Data Induk**.

1. **Status Login**: Kolom baru "Status Login" akan menampilkan indikator:
   - ✅ **Siap**: Data NIK dan Tanggal Lahir lengkap. Santri bisa login.
   - ⚠️ **Data Kurang**: NIK atau Tanggal Lahir kosong. Santri TIDAK bisa login.
2. **Statistik**: Panel atas menampilkan "Siap Login" dan "Data Kurang" untuk gambaran cepat.
3. **Duplikasi**: Sistem akan memperingatkan jika ada NIK ganda.

---

### 5. Troubleshooting (Pemecahan Masalah)

#### Kasus A: "Login gagal: Email/NIK atau Password salah"
**Penyebab**:
1. NIK salah ketik.
2. Password salah (Tanggal lahir tidak sesuai database).
3. Data santri belum ter-import dengan benar.

**Solusi**:
1. Cek data santri di menu **Admin > Data Induk**.
2. Pastikan kolom **NIK** dan **Tanggal Lahir** terisi.
3. Coba cocokkan Tanggal Lahir. Misal di data tertulis `1971-03-26`, pastikan password yang dimasukkan `26031971`.

#### Kasus B: "NIK tidak ditemukan dalam database"
**Penyebab**:
- NIK yang dimasukkan tidak ada di data Excel yang diimport.
**Solusi**:
- Lakukan import ulang atau edit data santri untuk menambahkan NIK.

#### Kasus C: "Data tanggal lahir kosong"
**Penyebab**:
- NIK ditemukan, tapi kolom Tanggal Lahir kosong.
**Solusi**:
- Edit data santri dan lengkapi Tanggal Lahir.

---

### 6. Bantuan Teknis
Jika masalah berlanjut hubungi tim IT dengan menyertakan screenshot pesan error.
