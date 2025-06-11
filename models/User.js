const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
    /**
     * Mencari pengguna berdasarkan email
     * @param {string} email - Email pengguna
     * @returns {Promise<Object|null>} - Data pengguna atau null jika tidak ditemukan
     */
    static async findByEmail(email) {
        try {
            const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
            return rows.length ? rows[0] : null;
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    /**
     * Mencari pengguna berdasarkan ID
     * @param {number} id - ID pengguna
     * @returns {Promise<Object|null>} - Data pengguna atau null jika tidak ditemukan
     */
    static async findById(id) {
        try {
            const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
            return rows.length ? rows[0] : null;
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }

    /**
     * Membuat pengguna baru
     * @param {Object} userData - Data pengguna baru
     * @returns {Promise<Object>} - Data pengguna yang baru dibuat
     */
    static async create({ nama, email, password, role = 'user', alamat = '', no_telp = '' }) {
        try {
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 12);

            // Insert ke database
            const [result] = await pool.query(
                'INSERT INTO users (nama, email, password, role, alamat, no_telp, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
                [nama, email, hashedPassword, role, alamat, no_telp]
            );

            // Return user yang baru dibuat
            return {
                id: result.insertId,
                nama,
                email,
                role,
                alamat,
                no_telp
            };
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }    /**
     * Update data pengguna
     * @param {number} id - ID pengguna
     * @param {Object} userData - Data pengguna yang akan diupdate
     * @returns {Promise<Object>} - Status update
     */
    static async update(id, userData) {
        try {
            const allowedFields = ['nama', 'email', 'password', 'alamat', 'no_telp', 'role'];
            const fields = [];
            const values = [];

            // Build dynamic query based on provided fields
            Object.keys(userData).forEach(key => {
                if (allowedFields.includes(key) && userData[key] !== undefined) {
                    fields.push(`${key} = ?`);
                    values.push(userData[key]);
                }
            });

            if (fields.length === 0) return false;

            fields.push('updated_at = NOW()');
            values.push(id);

            const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

            const [result] = await pool.query(query, values);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    /**
     * Update password pengguna
     * @param {number} id - ID pengguna
     * @param {string} newPassword - Password baru
     * @returns {Promise<Object>} - Status update
     */
    static async updatePassword(id, newPassword) {
        try {
            // Hash password
            const hashedPassword = await bcrypt.hash(newPassword, 12);

            await pool.query(
                'UPDATE users SET password = ? WHERE id = ?',
                [hashedPassword, id]
            );

            return { success: true };
        } catch (error) {
            console.error('Error updating password:', error);
            throw error;
        }
    }    /**
     * Mendapatkan semua pengguna
     * @param {Object} options - Object berisi limit, offset, dan search
     * @returns {Promise<Array>} - Array data pengguna
     */
    static async getAll(options = {}) {
        try {
            const { limit = 10, offset = 0, search } = options;
            let query = 'SELECT id, nama, email, alamat, no_telp, role, created_at, updated_at FROM users';
            const queryParams = [];

            // Add search condition if provided
            if (search) {
                query += ' WHERE nama LIKE ? OR email LIKE ?';
                queryParams.push(`%${search}%`, `%${search}%`);
            }

            query += ' ORDER BY created_at DESC';

            // Add pagination if provided
            if (limit !== undefined && offset !== undefined) {
                query += ' LIMIT ? OFFSET ?';
                queryParams.push(Number(limit), Number(offset));
            }

            const [rows] = await pool.query(query, queryParams);
            return rows;
        } catch (error) {
            console.error('Error getting all users:', error);
            throw error;
        }
    }

    /**
     * Count total users
     * @param {Object} options - Query options (search)
     * @returns {Promise<number>} Total count of users
     */
    static async count(options = {}) {
        try {
            const { search } = options;
            let query = 'SELECT COUNT(*) as total FROM users';
            const queryParams = [];

            // Add search condition if provided
            if (search) {
                query += ' WHERE nama LIKE ? OR email LIKE ?';
                queryParams.push(`%${search}%`, `%${search}%`);
            }

            const [rows] = await pool.query(query, queryParams);
            return rows[0].total;
        } catch (error) {
            console.error('Error counting users:', error);
            throw error;
        }
    }    /**
     * Validasi password
     * @param {string} inputPassword - Password yang diinput
     * @param {string} hashedPassword - Password yang sudah di-hash
     * @returns {Promise<boolean>} - Hasil validasi
     */
    static async validatePassword(inputPassword, hashedPassword) {
        try {
            console.log('Validating password in User model'); // Debug
            return await bcrypt.compare(inputPassword, hashedPassword);
        } catch (error) {
            console.error('Password validation error:', error);
            return false;
        }
    }
}

module.exports = User;