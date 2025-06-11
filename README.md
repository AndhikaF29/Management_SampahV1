# Aplikasi Manajemen Sampah

Aplikasi web untuk manajemen sampah dengan fokus pada keamanan level aplikasi. Dibangun menggunakan Node.js, Express, dan MySQL.

## Fitur Utama

- Autentikasi dan otorisasi dengan 2 role (admin dan user)
- Manajemen kategori dan jenis sampah
- Setoran sampah dengan perhitungan otomatis
- Laporan dan statistik
- Keamanan aplikasi yang kuat

## Fokus Keamanan

Aplikasi ini menerapkan berbagai teknik keamanan pada level aplikasi dengan pendekatan berlapis (Defense in Depth):

### 1. Authentication & Authorization Layer

- **Password Encryption**: Menggunakan bcrypt untuk hashing password dengan salt
- **Session Management**: Secure session dengan konfigurasi httpOnly dan secure cookies
- **Role-based Access Control**: Pembatasan akses berdasarkan role (admin/user)
- **Authentication Middleware**: Validasi login status di setiap protected route

### 2. Input Validation & Sanitization Layer

- **XSS Prevention**: Menggunakan xss-clean middleware untuk sanitasi input
- **CSRF Protection**: Token CSRF untuk mencegah Cross-Site Request Forgery
- **Input Validation**: Validasi server-side untuk semua form input
- **SQL Injection Prevention**: Menggunakan prepared statements dan parameterized queries

### 3. HTTP Security Headers Layer

- **Helmet.js**: Mengatur security headers seperti:
  - Content Security Policy (CSP)
  - X-Frame-Options (mencegah clickjacking)
  - X-Content-Type-Options (mencegah MIME type sniffing)
  - X-XSS-Protection
  - Strict-Transport-Security (HTTPS enforcement)

### 4. Rate Limiting & DoS Protection Layer

- **Express Rate Limit**: Pembatasan request per IP untuk mencegah brute force
- **Request Size Limiting**: Pembatasan ukuran request body
- **Timeout Configuration**: Timeout untuk request yang terlalu lama

### 5. Session Security Layer

- **Secure Session Configuration**:
  - httpOnly: true (mencegah akses via JavaScript)
  - secure: true (hanya melalui HTTPS di production)
  - maxAge: Expired session otomatis
  - SameSite protection
- **Session Secret**: Environment variable untuk signing session

### 6. Content Security Policy (CSP) Layer

- **Script Source Control**: Hanya mengizinkan script dari domain tertentu
- **Style Source Control**: Pembatasan sumber CSS
- **Image Source Control**: Validasi sumber gambar
- **Font Source Control**: Pembatasan sumber font

### 7. Error Handling & Information Disclosure Prevention

- **Custom Error Pages**: Tidak menampilkan stack trace di production
- **Graceful Error Handling**: Error handling yang aman tanpa bocorkan informasi sensitif
- **Log Security**: Logging yang aman tanpa mencatat data sensitif

### 8. Environment & Configuration Security

- **Environment Variables**: Konfigurasi sensitif disimpan di .env
- **Secret Management**: API keys dan secrets tidak di-hardcode
- **Development vs Production**: Konfigurasi berbeda untuk setiap environment

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

## Fitur Progressive Web App (PWA)

Aplikasi ini sudah dilengkapi dengan service worker dasar (`sw.js`) yang memungkinkan pengembangan fitur PWA di masa depan seperti:

- Offline functionality
- Push notifications
- Background sync
- Caching strategies

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
