const pool = require('../config/db');

class Setoran {
    /**
     * Mendapatkan semua setoran
     * @param {number} limit - Batas jumlah data
     * @param {number} offset - Offset untuk pagination
     * @returns {Promise<Array>} - Array data setoran
     */
    static async getAll(limit = 10, offset = 0) {
        try {
            return await pool.query(`
        SELECT s.*, u.nama as user_nama
        FROM setoran s
        JOIN users u ON s.user_id = u.id
        ORDER BY s.tanggal DESC, s.created_at DESC
        LIMIT ? OFFSET ?
      `, [limit, offset]);
        } catch (error) {
            console.error('Error getting all setoran:', error);
            throw error;
        }
    }

    /**
     * Mendapatkan setoran berdasarkan ID
     * @param {number} id - ID setoran
     * @returns {Promise<Object|null>} - Data setoran atau null
     */
    static async getById(id) {
        try {
            const setoran = await pool.query(`
        SELECT s.*, u.nama as user_nama, u.alamat as user_alamat, u.no_telp as user_no_telp
        FROM setoran s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ?
      `, [id]);

            if (setoran.length === 0) return null;

            // Ambil detail setoran
            const detailSetoran = await pool.query(`
        SELECT ds.*, sp.nama as sampah_nama, sp.deskripsi as sampah_deskripsi,
               k.nama as kategori_nama
        FROM detail_setoran ds
        JOIN sampah sp ON ds.sampah_id = sp.id
        JOIN kategori_sampah k ON sp.kategori_id = k.id
        WHERE ds.setoran_id = ?
      `, [id]);

            return {
                ...setoran[0],
                detail_setoran: detailSetoran
            };
        } catch (error) {
            console.error('Error getting setoran by ID:', error);
            throw error;
        }
    }

    /**
     * Mendapatkan setoran berdasarkan user ID
     * @param {number} userId - ID user
     * @param {number} limit - Batas jumlah data
     * @param {number} offset - Offset untuk pagination
     * @returns {Promise<Array>} - Array data setoran
     */
    static async getByUserId(userId, limit = 10, offset = 0) {
        try {
            return await pool.query(`
        SELECT s.*
        FROM setoran s
        WHERE s.user_id = ?
        ORDER BY s.tanggal DESC, s.created_at DESC
        LIMIT ? OFFSET ?
      `, [userId, limit, offset]);
        } catch (error) {
            console.error('Error getting setoran by user ID:', error);
            throw error;
        }
    }

    /**
     * Membuat setoran baru dengan detail
     * @param {Object} setoran - Data setoran
     * @param {Array} detailSetoran - Detail setoran
     * @returns {Promise<Object>} - Data setoran yang baru dibuat
     */
    static async create(setoran, detailSetoran) {
        try {
            // Mulai transaction
            await pool.query('START TRANSACTION');

            // Insert data setoran
            const result = await pool.query(
                'INSERT INTO setoran (user_id, tanggal, status, total_harga, catatan) VALUES (?, ?, ?, ?, ?)',
                [setoran.user_id, setoran.tanggal, setoran.status || 'menunggu', setoran.total_harga, setoran.catatan || '']
            );

            const setoranId = result.insertId;

            // Insert detail setoran
            for (const detail of detailSetoran) {
                await pool.query(
                    'INSERT INTO detail_setoran (setoran_id, sampah_id, berat, harga_satuan, subtotal) VALUES (?, ?, ?, ?, ?)',
                    [setoranId, detail.sampah_id, detail.berat, detail.harga_satuan, detail.subtotal]
                );
            }

            // Commit transaction
            await pool.query('COMMIT');

            return {
                id: setoranId,
                ...setoran
            };
        } catch (error) {
            // Rollback jika terjadi error
            await pool.query('ROLLBACK');
            console.error('Error creating setoran:', error);
            throw error;
        }
    }

    /**
     * Update status setoran
     * @param {number} id - ID setoran
     * @param {string} status - Status baru
     * @returns {Promise<Object>} - Status update
     */
    static async updateStatus(id, status) {
        try {
            await pool.query(
                'UPDATE setoran SET status = ? WHERE id = ?',
                [status, id]
            );

            return { success: true };
        } catch (error) {
            console.error('Error updating setoran status:', error);
            throw error;
        }
    }

    /**
     * Hapus setoran
     * @param {number} id - ID setoran
     * @returns {Promise<Object>} - Status delete
     */
    static async delete(id) {
        try {
            await pool.query('START TRANSACTION');

            // Hapus detail setoran
            await pool.query('DELETE FROM detail_setoran WHERE setoran_id = ?', [id]);

            // Hapus setoran
            await pool.query('DELETE FROM setoran WHERE id = ?', [id]);

            await pool.query('COMMIT');

            return { success: true };
        } catch (error) {
            await pool.query('ROLLBACK');
            console.error('Error deleting setoran:', error);
            throw error;
        }
    }

    /**
     * Mendapatkan laporan setoran harian
     * @param {string} startDate - Tanggal awal format YYYY-MM-DD
     * @param {string} endDate - Tanggal akhir format YYYY-MM-DD
     * @returns {Promise<Array>} - Data laporan
     */
    static async getLaporanHarian(startDate, endDate) {
        try {
            return await pool.query(`
        SELECT DATE(tanggal) as tanggal, SUM(total_harga) as total, COUNT(*) as jumlah_setoran
        FROM setoran
        WHERE tanggal BETWEEN ? AND ? AND status = 'selesai'
        GROUP BY DATE(tanggal)
        ORDER BY tanggal
      `, [startDate, endDate]);
        } catch (error) {
            console.error('Error getting laporan harian:', error);
            throw error;
        }
    }

    /**
     * Mendapatkan laporan setoran berdasarkan kategori
     * @param {string} startDate - Tanggal awal format YYYY-MM-DD
     * @param {string} endDate - Tanggal akhir format YYYY-MM-DD
     * @returns {Promise<Array>} - Data laporan
     */
    static async getLaporanKategori(startDate, endDate) {
        try {
            return await pool.query(`
        SELECT k.nama as kategori, SUM(ds.berat) as total_berat, SUM(ds.subtotal) as total_harga
        FROM detail_setoran ds
        JOIN sampah s ON ds.sampah_id = s.id
        JOIN kategori_sampah k ON s.kategori_id = k.id
        JOIN setoran st ON ds.setoran_id = st.id
        WHERE st.tanggal BETWEEN ? AND ? AND st.status = 'selesai'
        GROUP BY k.id
        ORDER BY total_berat DESC
      `, [startDate, endDate]);
        } catch (error) {
            console.error('Error getting laporan kategori:', error);
            throw error;
        }
    }

    /**
     * Mendapatkan setoran berdasarkan ID
     * @param {number} id - ID setoran
     * @returns {Promise<Object|null>} Setoran object atau null jika tidak ditemukan
     */
    static async findById(id) {
        try {
            const [rows] = await pool.query(`
        SELECT s.*, u.nama as user_nama 
        FROM setoran s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ?
      `, [id]);

            return rows.length ? rows[0] : null;
        } catch (error) {
            console.error('Error finding setoran by ID:', error);
            throw error;
        }
    }

    /**
     * Membuat setoran baru
     * @param {Object} setoranData - Data setoran baru
     * @returns {Promise<number>} ID dari setoran yang dibuat
     */
    static async create(setoranData) {
        try {
            const { user_id, tanggal, total_harga, status } = setoranData;

            const [result] = await pool.query(
                'INSERT INTO setoran (user_id, tanggal, total_harga, status, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
                [user_id, tanggal, total_harga, status]
            );

            return result.insertId;
        } catch (error) {
            console.error('Error creating setoran:', error);
            throw error;
        }
    }

    /**
     * Membuat item detail setoran
     * @param {Object} detailData - Data detail setoran
     * @returns {Promise<number>} ID dari detail setoran yang dibuat
     */
    static async createDetailItem(detailData) {
        try {
            const { setoran_id, sampah_id, berat, harga_satuan } = detailData;
            const total = berat * harga_satuan;

            const [result] = await pool.query(
                'INSERT INTO setoran_detail (setoran_id, sampah_id, berat, harga_satuan, total) VALUES (?, ?, ?, ?, ?)',
                [setoran_id, sampah_id, berat, harga_satuan, total]
            );

            return result.insertId;
        } catch (error) {
            console.error('Error creating setoran detail:', error);
            throw error;
        }
    }

    /**
     * Update status setoran
     * @param {number} id - ID setoran
     * @param {string} status - Status baru
     * @returns {Promise<boolean>} Status berhasil atau tidak
     */
    static async updateStatus(id, status) {
        try {
            const [result] = await pool.query(
                'UPDATE setoran SET status = ?, updated_at = NOW() WHERE id = ?',
                [status, id]
            );

            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating setoran status:', error);
            throw error;
        }
    }

    /**
     * Get all setoran by user
     * @param {number} userId - ID user
     * @param {Object} options - Query options (limit, offset)
     * @returns {Promise<Array>} Array of setoran objects
     */
    static async getAllByUser(userId, options = {}) {
        try {
            const { limit = 10, offset = 0 } = options;

            const [rows] = await pool.query(`
        SELECT s.*, u.nama as user_nama 
        FROM setoran s
        JOIN users u ON s.user_id = u.id
        WHERE s.user_id = ?
        ORDER BY s.tanggal DESC
        LIMIT ? OFFSET ?
      `, [userId, limit, offset]);

            return rows;
        } catch (error) {
            console.error('Error getting setoran by user:', error);
            throw error;
        }
    }

    /**
     * Count setoran by user
     * @param {number} userId - ID user
     * @returns {Promise<number>} Jumlah setoran
     */
    static async countByUser(userId) {
        try {
            const [rows] = await pool.query(
                'SELECT COUNT(*) as total FROM setoran WHERE user_id = ?',
                [userId]
            );

            return rows[0].total;
        } catch (error) {
            console.error('Error counting setoran by user:', error);
            throw error;
        }
    }

    /**
     * Get all setoran (for admin)
     * @param {Object} options - Query options (limit, offset, status)
     * @returns {Promise<Array>} Array of setoran objects
     */
    static async getAll(options = {}) {
        try {
            const { limit = 10, offset = 0, status } = options;
            let query = `
        SELECT s.*, u.nama as user_nama 
        FROM setoran s
        JOIN users u ON s.user_id = u.id
      `;

            const queryParams = [];

            if (status) {
                query += ' WHERE s.status = ?';
                queryParams.push(status);
            }

            query += ' ORDER BY s.tanggal DESC LIMIT ? OFFSET ?';
            queryParams.push(limit, offset);

            const [rows] = await pool.query(query, queryParams);

            return rows;
        } catch (error) {
            console.error('Error getting all setoran:', error);
            throw error;
        }
    }

    /**
     * Count all setoran (for admin)
     * @param {Object} options - Query options (status)
     * @returns {Promise<number>} Total count of setoran
     */
    static async count(options = {}) {
        try {
            const { status } = options;
            let query = 'SELECT COUNT(*) as total FROM setoran';
            const queryParams = [];

            if (status) {
                query += ' WHERE status = ?';
                queryParams.push(status);
            }

            const [rows] = await pool.query(query, queryParams);
            return rows[0].total;
        } catch (error) {
            console.error('Error counting setoran:', error);
            throw error;
        }
    }

    /**
     * Get detail items for a setoran
     * @param {number} setoranId - ID setoran
     * @returns {Promise<Array>} Array of detail items
     */
    static async getDetailItems(setoranId) {
        try {
            const [rows] = await pool.query(`
        SELECT sd.*, s.nama as sampah_nama, s.kategori_id, k.nama as kategori_nama
        FROM setoran_detail sd
        JOIN sampah s ON sd.sampah_id = s.id
        JOIN kategori k ON s.kategori_id = k.id
        WHERE sd.setoran_id = ?
        ORDER BY sd.id ASC
      `, [setoranId]);

            return rows;
        } catch (error) {
            console.error('Error getting setoran detail items:', error);
            throw error;
        }
    }

    /**
     * Get laporan harian
     * @returns {Promise<Array>} Array of daily report
     */
    static async getLaporanHarian() {
        try {
            const [rows] = await pool.query(`
        SELECT 
          DATE(s.tanggal) as tanggal,
          COUNT(*) as total_setoran,
          SUM(s.total_harga) as total
        FROM 
          setoran s
        WHERE 
          s.status = 'selesai'
        GROUP BY 
          DATE(s.tanggal)
        ORDER BY 
          tanggal DESC
        LIMIT 7
      `);

            return rows;
        } catch (error) {
            console.error('Error getting laporan harian:', error);
            throw error;
        }
    }

    /**
     * Get laporan kategori
     * @returns {Promise<Array>} Array of category report
     */
    static async getLaporanKategori() {
        try {
            const [rows] = await pool.query(`
        SELECT 
          k.nama as kategori,
          SUM(sd.berat) as total_berat,
          SUM(sd.total) as total_harga
        FROM 
          setoran s
        JOIN 
          setoran_detail sd ON s.id = sd.setoran_id
        JOIN 
          sampah sp ON sd.sampah_id = sp.id
        JOIN 
          kategori k ON sp.kategori_id = k.id
        WHERE 
          s.status = 'selesai'
        GROUP BY 
          k.id
        ORDER BY 
          total_berat DESC
      `);

            return rows;
        } catch (error) {
            console.error('Error getting laporan kategori:', error);
            throw error;
        }
    }
}

module.exports = Setoran;