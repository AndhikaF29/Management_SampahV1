# Aplikasi Manajemen Sampah

Aplikasi web untuk manajemen sampah dengan fokus pada keamanan level aplikasi. Dibangun menggunakan Node.js, Express, dan MySQL.

## Fitur Utama

- Autentikasi dan otorisasi dengan 2 role (admin dan user)
- Manajemen kategori dan jenis sampah
- Setoran sampah dengan perhitungan otomatis
- Laporan dan statistik
- Keamanan aplikasi yang kuat

## Fokus Keamanan

Aplikasi ini menerapkan berbagai teknik keamanan pada level aplikasi:

- Password encryption dengan bcrypt
- CSRF protection
- XSS prevention
- SQL injection prevention
- Rate limiting
- Secure cookies
- Content Security Policy
- Validasi input yang ketat

## Prasyarat

- Node.js (versi 14 atau lebih baru)
- MySQL/MariaDB (XAMPP)
- npm atau yarn

## Instalasi

1. Clone repositori ini

```bash
git clone https://github.com/username/manajemen-sampah.git
cd manajemen-sampah
```

2. Install dependencies

```bash
npm install
```

3. Buat file `.env` berdasarkan contoh `.env.example`

```bash
cp .env.example .env
```

4. Edit file `.env` dengan informasi database dan konfigurasi keamanan

5. Pastikan MySQL/XAMPP sudah berjalan

6. Inisialisasi database

```bash
node database/init-db.js
```

Jika mengalami masalah login, jalankan seeder untuk user admin dan user biasa:

```bash
node database/seed-users.js
```

7. Jalankan aplikasi

```bash
# Mode development dengan auto-reload
npm run dev

# Mode production
npm start
```

8. Buka aplikasi di browser: `http://localhost:3000`

## Default Users

Aplikasi ini menyediakan dua akun default untuk testing:

- Admin:

  - Email: admin@manajemensampah.com
  - Password: admin123

- User:
  - Email: user@manajemensampah.com
  - Password: user123

## Struktur Proyek

```
manajemen-sampah/
├── config/         # Konfigurasi aplikasi
├── controllers/    # Controller untuk menangani request
├── database/       # File SQL dan inisialisasi database
├── middleware/     # Middleware Express
├── models/         # Model untuk interaksi dengan database
├── public/         # Aset statis (CSS, JS, gambar)
├── routes/         # Definisi rute aplikasi
├── views/          # Template EJS
├── .env            # Environment variables
├── app.js          # Entry point aplikasi
└── package.json    # Dependency dan scripts
```

## Teknologi Utama

- **Backend**: Node.js, Express
- **Database**: MySQL (XAMPP)
- **View Engine**: EJS dengan express-ejs-layouts
- **Keamanan**: helmet, csurf, bcryptjs, xss-clean
- **Frontend**: Bootstrap 5, Font Awesome
