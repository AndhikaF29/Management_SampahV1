require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seedUsers() {
    try {
        console.log('Memulai seeding users...');

        // Buat koneksi ke database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'manajemen_sampah'
        });

        console.log('Koneksi ke database berhasil');

        // Hapus user yang sudah ada jika diperlukan
        console.log('Menghapus user lama jika ada...');
        await connection.query("DELETE FROM users WHERE email IN ('admin@manajemensampah.com', 'user@manajemensampah.com')");

        // Buat password hash
        console.log('Membuat hash password...');
        const adminPassword = await bcrypt.hash('admin123', 10);
        const userPassword = await bcrypt.hash('user123', 10);

        console.log('Password telah di-hash');

        // Simpan password asli untuk pengecekan
        const adminPlainPassword = 'admin123';
        const userPlainPassword = 'user123';

        // Verifikasi hash password
        const adminVerify = await bcrypt.compare(adminPlainPassword, adminPassword);
        const userVerify = await bcrypt.compare(userPlainPassword, userPassword);

        console.log('Verifikasi password admin hash:', adminVerify);
        console.log('Verifikasi password user hash:', userVerify);

        // Insert user baru
        console.log('Menyimpan user ke database...');
        const [result] = await connection.query(`
      INSERT INTO users (nama, email, password, alamat, no_telp, role, created_at, updated_at)
      VALUES 
        ('Administrator', 'admin@manajemensampah.com', ?, 'Jl. Admin No. 1', '081234567890', 'admin', NOW(), NOW()),
        ('Regular User', 'user@manajemensampah.com', ?, 'Jl. User No. 2', '087654321098', 'user', NOW(), NOW())
    `, [adminPassword, userPassword]);

        console.log(`${result.affectedRows} user berhasil dibuat`);

        // Memverifikasi user tersimpan
        const [users] = await connection.query('SELECT id, nama, email, role FROM users WHERE email IN (?, ?)',
            ['admin@manajemensampah.com', 'user@manajemensampah.com']);

        console.log('User yang tersimpan:');
        console.log(users);

        await connection.end();
        console.log('Seeding users selesai');

    } catch (error) {
        console.error('Error seeding users:', error);
    }
}

// Jalankan seeder
seedUsers();