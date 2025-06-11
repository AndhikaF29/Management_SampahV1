const { query } = require('../config/db');

class Kategori {
    /**
     * Mendapatkan semua kategori sampah
     * @returns {Promise<Array>} - Array kategori sampah
     */
    static async getAll() {
        try {
            return await query('SELECT * FROM kategori_sampah ORDER BY nama');
        } catch (error) {
            console.error('Error getting categories:', error);
            throw error;
        }
    }

    /**
     * Mendapatkan kategori berdasarkan ID
     * @param {number} id - ID kategori
     * @returns {Promise<Object|null>} - Data kategori atau null
     */
    static async getById(id) {
        try {
            const result = await query('SELECT * FROM kategori_sampah WHERE id = ?', [id]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error getting category by ID:', error);
            throw error;
        }
    }

    /**
     * Membuat kategori baru
     * @param {Object} data - Data kategori baru
     * @returns {Promise<Object>} - Data kategori yang baru dibuat
     */
    static async create({ nama, deskripsi }) {
        try {
            const result = await query(
                'INSERT INTO kategori_sampah (nama, deskripsi) VALUES (?, ?)',
                [nama, deskripsi]
            );

            return {
                id: result.insertId,
                nama,
                deskripsi
            };
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    }

    /**
     * Update kategori
     * @param {number} id - ID kategori
     * @param {Object} data - Data kategori yang akan diupdate
     * @returns {Promise<Object>} - Status update
     */
    static async update(id, { nama, deskripsi }) {
        try {
            await query(
                'UPDATE kategori_sampah SET nama = ?, deskripsi = ? WHERE id = ?',
                [nama, deskripsi, id]
            );

            return { success: true };
        } catch (error) {
            console.error('Error updating category:', error);
            throw error;
        }
    }

    /**
     * Hapus kategori
     * @param {number} id - ID kategori
     * @returns {Promise<Object>} - Status delete
     */
    static async delete(id) {
        try {
            await query('DELETE FROM kategori_sampah WHERE id = ?', [id]);
            return { success: true };
        } catch (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
    }
}

class Sampah {
    /**
     * Mendapatkan semua data sampah dengan detail kategori
     * @param {number} limit - Batas jumlah data
     * @param {number} offset - Offset untuk pagination
     * @returns {Promise<Array>} - Array data sampah
     */
    static async getAll(limit = 100, offset = 0) {
        try {
            return await query(`
        SELECT s.*, k.nama as kategori_nama
        FROM sampah s
        JOIN kategori_sampah k ON s.kategori_id = k.id
        ORDER BY s.nama
        LIMIT ? OFFSET ?
      `, [limit, offset]);
        } catch (error) {
            console.error('Error getting all sampah:', error);
            throw error;
        }
    }

    /**
     * Mendapatkan sampah berdasarkan kategori
     * @param {number} kategoriId - ID kategori
     * @returns {Promise<Array>} - Array data sampah
     */
    static async getByKategori(kategoriId) {
        try {
            return await query(`
        SELECT s.*, k.nama as kategori_nama
        FROM sampah s
        JOIN kategori_sampah k ON s.kategori_id = k.id
        WHERE s.kategori_id = ?
        ORDER BY s.nama
      `, [kategoriId]);
        } catch (error) {
            console.error('Error getting sampah by category:', error);
            throw error;
        }
    }

    /**
     * Mendapatkan sampah berdasarkan ID
     * @param {number} id - ID sampah
     * @returns {Promise<Object|null>} - Data sampah atau null
     */
    static async getById(id) {
        try {
            const result = await query(`
        SELECT s.*, k.nama as kategori_nama
        FROM sampah s
        JOIN kategori_sampah k ON s.kategori_id = k.id
        WHERE s.id = ?
      `, [id]);

            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error getting sampah by ID:', error);
            throw error;
        }
    }

    /**
     * Membuat sampah baru
     * @param {Object} data - Data sampah baru
     * @returns {Promise<Object>} - Data sampah yang baru dibuat
     */
    static async create({ nama, kategori_id, harga_per_kg, deskripsi }) {
        try {
            const result = await query(
                'INSERT INTO sampah (nama, kategori_id, harga_per_kg, deskripsi) VALUES (?, ?, ?, ?)',
                [nama, kategori_id, harga_per_kg, deskripsi]
            );

            return {
                id: result.insertId,
                nama,
                kategori_id,
                harga_per_kg,
                deskripsi
            };
        } catch (error) {
            console.error('Error creating sampah:', error);
            throw error;
        }
    }

    /**
     * Update sampah
     * @param {number} id - ID sampah
     * @param {Object} data - Data sampah yang akan diupdate
     * @returns {Promise<Object>} - Status update
     */
    static async update(id, { nama, kategori_id, harga_per_kg, deskripsi }) {
        try {
            await query(
                'UPDATE sampah SET nama = ?, kategori_id = ?, harga_per_kg = ?, deskripsi = ? WHERE id = ?',
                [nama, kategori_id, harga_per_kg, deskripsi, id]
            );

            return { success: true };
        } catch (error) {
            console.error('Error updating sampah:', error);
            throw error;
        }
    }

    /**
     * Hapus sampah
     * @param {number} id - ID sampah
     * @returns {Promise<Object>} - Status delete
     */
    static async delete(id) {
        try {
            await query('DELETE FROM sampah WHERE id = ?', [id]);
            return { success: true };
        } catch (error) {
            console.error('Error deleting sampah:', error);
            throw error;
        }
    }
}

module.exports = {
    Kategori,
    Sampah
};