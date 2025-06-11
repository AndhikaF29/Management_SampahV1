require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function initDatabase() {
    console.log('Memulai inisialisasi database...');

    // Baca file SQL
    const sqlFilePath = path.join(__dirname, 'init.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, { encoding: 'utf8' });

    // Koneksi ke MySQL tanpa database (untuk membuat database jika belum ada)
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true
    });

    try {
        console.log('Menjalankan script SQL...');

        // Jalankan SQL
        await connection.query(sqlContent);

        console.log('Database berhasil diinisialisasi.');
    } catch (error) {
        console.error('Terjadi kesalahan saat inisialisasi database:', error.message);
    } finally {
        // Tutup koneksi
        await connection.end();
        console.log('Koneksi database ditutup.');
    }
}

// Jalankan inisialisasi
initDatabase().catch(err => {
    console.error('Kesalahan tidak terduga:', err);
    process.exit(1);
});

async function main() {
    try {
        // Buat koneksi ke MySQL
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });

        console.log('Koneksi ke MySQL berhasil.');

        // Buat database jika belum ada
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'manajemen_sampah'}`);
        console.log(`Database '${process.env.DB_NAME || 'manajemen_sampah'}' berhasil dibuat atau sudah ada.`);

        // Gunakan database tersebut
        await connection.query(`USE ${process.env.DB_NAME || 'manajemen_sampah'}`);

        // Buat tabel-tabel
        console.log('Membuat tabel users...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        alamat TEXT,
        no_telp VARCHAR(20),
        role ENUM('admin', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

        console.log('Membuat tabel kategori...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS kategori (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama VARCHAR(100) NOT NULL,
        deskripsi TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

        console.log('Membuat tabel sampah...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS sampah (
        id INT AUTO_INCREMENT PRIMARY KEY,
        kategori_id INT NOT NULL,
        nama VARCHAR(100) NOT NULL,
        deskripsi TEXT,
        harga_per_kg DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (kategori_id) REFERENCES kategori(id)
      )
    `);

        console.log('Membuat tabel setoran...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS setoran (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        tanggal DATETIME NOT NULL,
        total_harga DECIMAL(10, 2) NOT NULL,
        status ENUM('menunggu', 'diproses', 'selesai', 'dibatalkan') DEFAULT 'menunggu',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

        console.log('Membuat tabel setoran_detail...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS setoran_detail (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setoran_id INT NOT NULL,
        sampah_id INT NOT NULL,
        berat DECIMAL(8, 2) NOT NULL,
        harga_satuan DECIMAL(10, 2) NOT NULL,
        total DECIMAL(12, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (setoran_id) REFERENCES setoran(id),
        FOREIGN KEY (sampah_id) REFERENCES sampah(id)
      )
    `);

        // Periksa apakah sudah ada data user
        const [users] = await connection.query('SELECT * FROM users LIMIT 1');

        // Jika belum ada data user, buat default user
        if (users.length === 0) {
            console.log('Membuat user default...');

            // Hash password
            const adminPassword = await bcrypt.hash('admin123', 12);
            const userPassword = await bcrypt.hash('user123', 12);

            // Insert admin dan user biasa
            await connection.query(`
        INSERT INTO users (nama, email, password, alamat, no_telp, role) 
        VALUES 
          ('Admin', 'admin@manajemensampah.com', ?, 'Jl. Admin No. 1', '081234567890', 'admin'),
          ('User', 'user@manajemensampah.com', ?, 'Jl. User No. 2', '081234567891', 'user')
      `, [adminPassword, userPassword]);

            console.log('User default berhasil dibuat.');
        } else {
            console.log('User default sudah ada.');
        }

        // Periksa apakah sudah ada data kategori
        const [categories] = await connection.query('SELECT * FROM kategori LIMIT 1');

        // Jika belum ada data kategori, buat default kategori
        if (categories.length === 0) {
            console.log('Membuat kategori default...');

            // Insert kategori
            await connection.query(`
        INSERT INTO kategori (nama, deskripsi) 
        VALUES 
          ('Organik', 'Sampah yang dapat terurai secara alami'),
          ('Plastik', 'Berbagai jenis sampah plastik untuk didaur ulang'),
          ('Kertas', 'Koran, kardus, kertas bekas, dan sejenisnya'),
          ('Logam', 'Kaleng, besi, dan berbagai jenis logam'),
          ('Elektronik', 'Barang elektronik bekas atau rusak'),
          ('Kaca', 'Botol kaca, pecahan kaca, dan sejenisnya')
      `);

            console.log('Kategori default berhasil dibuat.');
        } else {
            console.log('Kategori default sudah ada.');
        }

        // Periksa apakah sudah ada data sampah
        const [sampah] = await connection.query('SELECT * FROM sampah LIMIT 1');

        // Jika belum ada data sampah, buat default sampah
        if (sampah.length === 0) {
            console.log('Membuat data sampah default...');

            // Dapatkan ID kategori
            const [categories] = await connection.query('SELECT id FROM kategori');
            const categoryMap = {};

            categories.forEach(category => {
                categoryMap[category.id] = category.id;
            });

            // Insert sampah untuk setiap kategori
            for (let catId = 1; catId <= 6; catId++) {
                if (categoryMap[catId]) {
                    await connection.query(`
            INSERT INTO sampah (kategori_id, nama, deskripsi, harga_per_kg)
            VALUES 
              (?, 'Sampah Jenis 1', 'Deskripsi sampah jenis 1', 2500.00),
              (?, 'Sampah Jenis 2', 'Deskripsi sampah jenis 2', 3000.00),
              (?, 'Sampah Jenis 3', 'Deskripsi sampah jenis 3', 1800.00)
          `, [catId, catId, catId]);
                }
            }

            console.log('Data sampah default berhasil dibuat.');
        } else {
            console.log('Data sampah default sudah ada.');
        }

        console.log('Inisialisasi database selesai!');
        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();