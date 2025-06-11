const User = require('../models/User');
const Setoran = require('../models/Setoran');
const bcrypt = require('bcryptjs');

/**
 * Menampilkan dashboard user
 */
exports.getDashboard = async (req, res) => {
    try {
        const userId = req.session.user.id;

        // Ambil data setoran user
        const setoran = await Setoran.getByUserId(userId, 5, 0);

        res.render('user/dashboard', {
            title: 'Dashboard',
            user: req.session.user,
            setoran,
            error: req.flash('error'),
            success: req.flash('success'),
            csrfToken: req.csrfToken()
        });

    } catch (error) {
        console.error('Error in user dashboard:', error);
        req.flash('error', 'Terjadi kesalahan saat memuat dashboard');
        res.redirect('/');
    }
};

/**
 * Menampilkan profil user
 */
exports.getProfile = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const userDetail = await User.findById(userId);

        res.render('user/profile', {
            title: 'Profil Saya',
            user: req.session.user,
            userDetail,
            error: req.flash('error'),
            success: req.flash('success'),
            csrfToken: req.csrfToken()
        });

    } catch (error) {
        console.error('Error in get profile:', error);
        req.flash('error', 'Terjadi kesalahan saat memuat profil');
        res.redirect('/user/dashboard');
    }
};

/**
 * Update profil user
 */
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { nama, alamat, no_telp } = req.body;

        // Validasi input
        if (!nama) {
            req.flash('error', 'Nama tidak boleh kosong');
            return res.redirect('/user/profile');
        }

        // Update user
        const updateData = { nama, alamat, no_telp };
        const updated = await User.update(userId, updateData);

        if (updated) {
            // Update session data
            req.session.user = {
                ...req.session.user,
                nama,
            };

            req.flash('success', 'Profil berhasil diperbarui');
        } else {
            req.flash('error', 'Gagal memperbarui profil');
        }

        return res.redirect('/user/profile');

    } catch (error) {
        console.error('Update profile error:', error);
        req.flash('error', 'Terjadi kesalahan saat memperbarui profil');
        return res.redirect('/user/profile');
    }
};

/**
 * Menampilkan form ganti password
 */
exports.getChangePassword = (req, res) => {
    res.render('user/change-password', {
        title: 'Ganti Password',
        user: req.session.user,
        error: req.flash('error'),
        success: req.flash('success'),
        csrfToken: req.csrfToken()
    });
};

/**
 * Proses ganti password
 */
exports.changePassword = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { current_password, new_password, confirm_password } = req.body;

        // Validasi input
        if (!current_password || !new_password || !confirm_password) {
            req.flash('error', 'Semua field harus diisi');
            return res.redirect('/user/change-password');
        }

        if (new_password !== confirm_password) {
            req.flash('error', 'Password baru dan konfirmasi tidak cocok');
            return res.redirect('/user/change-password');
        }

        if (new_password.length < 6) {
            req.flash('error', 'Password minimal 6 karakter');
            return res.redirect('/user/change-password');
        }

        // Get user data
        const user = await User.findById(userId);
        if (!user) {
            req.flash('error', 'User tidak ditemukan');
            return res.redirect('/user/change-password');
        }

        // Verify current password
        const isMatch = await bcrypt.compare(current_password, user.password);
        if (!isMatch) {
            req.flash('error', 'Password saat ini salah');
            return res.redirect('/user/change-password');
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);

        // Update password
        const updated = await User.update(userId, { password: hashedPassword });

        if (updated) {
            req.flash('success', 'Password berhasil diperbarui');
        } else {
            req.flash('error', 'Gagal memperbarui password');
        }

        return res.redirect('/user/change-password');

    } catch (error) {
        console.error('Change password error:', error);
        req.flash('error', 'Terjadi kesalahan saat mengganti password');
        return res.redirect('/user/change-password');
    }
};

/**
 * Menampilkan daftar sampah
 */
exports.getSampahList = async (req, res) => {
    try {
        const kategori = await Kategori.getAll();
        const sampah = await Sampah.getAll();

        res.render('user/sampah-list', {
            title: 'Daftar Sampah',
            user: req.session.user,
            kategori,
            sampah,
            error: req.flash('error'),
            success: req.flash('success'),
            csrfToken: req.csrfToken()
        });

    } catch (error) {
        console.error('Error in get sampah list:', error);
        req.flash('error', 'Terjadi kesalahan saat memuat daftar sampah');
        res.redirect('/user/dashboard');
    }
};

/**
 * Menampilkan form setoran sampah
 */
exports.getSetoranForm = async (req, res) => {
    try {
        const kategori = await Kategori.getAll();
        const sampah = await Sampah.getAll();

        res.render('user/setoran-form', {
            title: 'Setor Sampah',
            user: req.session.user,
            kategori,
            sampah,
            error: req.flash('error'),
            success: req.flash('success'),
            csrfToken: req.csrfToken()
        });

    } catch (error) {
        console.error('Error in get setoran form:', error);
        req.flash('error', 'Terjadi kesalahan saat memuat form setoran');
        res.redirect('/user/dashboard');
    }
};

/**
 * Proses setoran sampah
 */
exports.createSetoran = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { tanggal, catatan, sampah_id, berat, harga_satuan } = req.body;

        // Validasi input
        if (!tanggal || !sampah_id || !berat) {
            req.flash('error', 'Data tidak lengkap');
            return res.redirect('/user/setoran/create');
        }

        // Handle array atau single value
        const sampahIds = Array.isArray(sampah_id) ? sampah_id : [sampah_id];
        const beratArr = Array.isArray(berat) ? berat : [berat];
        const hargaArr = Array.isArray(harga_satuan) ? harga_satuan : [harga_satuan];

        // Hitung total dan buat detail setoran
        let totalHarga = 0;
        const detailSetoran = [];

        for (let i = 0; i < sampahIds.length; i++) {
            if (!sampahIds[i] || !beratArr[i] || beratArr[i] <= 0) continue;

            const sampahId = parseInt(sampahIds[i]);
            const beratKg = parseFloat(beratArr[i]);
            const hargaSatuan = parseFloat(hargaArr[i]);
            const subtotal = beratKg * hargaSatuan;

            totalHarga += subtotal;

            detailSetoran.push({
                sampah_id: sampahId,
                berat: beratKg,
                harga_satuan: hargaSatuan,
                subtotal
            });
        }

        // Minimal harus ada 1 item
        if (detailSetoran.length === 0) {
            req.flash('error', 'Minimal harus ada satu jenis sampah');
            return res.redirect('/user/setoran/create');
        }

        // Buat data setoran
        const setoran = {
            user_id: userId,
            tanggal,
            status: 'menunggu',
            total_harga: totalHarga,
            catatan
        };

        // Simpan ke database
        await Setoran.create(setoran, detailSetoran);

        req.flash('success', 'Setoran sampah berhasil dibuat');
        res.redirect('/user/setoran');

    } catch (error) {
        console.error('Error in create setoran:', error);
        req.flash('error', 'Terjadi kesalahan saat membuat setoran');
        res.redirect('/user/setoran/create');
    }
};

/**
 * Menampilkan daftar setoran user
 */
exports.getAllSetoran = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Get setoran
        const setoran = await Setoran.getAllByUser(userId, { limit, offset });
        const total = await Setoran.countByUser(userId);

        const totalPages = Math.ceil(total / limit);

        res.render('user/setoran', {
            title: 'Riwayat Setoran',
            user: req.session.user,
            setoran,
            pagination: {
                page,
                limit,
                total,
                totalPages
            },
            error: req.flash('error'),
            success: req.flash('success')
        });

    } catch (error) {
        console.error('Get all setoran error:', error);
        req.flash('error', 'Terjadi kesalahan saat mengambil data setoran');
        return res.redirect('/user/dashboard');
    }
};

/**
 * Mendapatkan detail setoran
 */
exports.getSetoranDetail = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const setoranId = req.params.id;

        // Get setoran
        const setoran = await Setoran.findById(setoranId);

        if (!setoran) {
            req.flash('error', 'Setoran tidak ditemukan');
            return res.redirect('/user/setoran');
        }

        // Make sure it belongs to the current user
        if (setoran.user_id !== userId) {
            req.flash('error', 'Anda tidak memiliki akses ke setoran ini');
            return res.redirect('/user/setoran');
        }

        // Get detail items
        const items = await Setoran.getDetailItems(setoranId);

        res.render('user/setoran-detail', {
            title: 'Detail Setoran',
            user: req.session.user,
            setoran,
            items,
            error: req.flash('error'),
            success: req.flash('success')
        });

    } catch (error) {
        console.error('Get setoran detail error:', error);
        req.flash('error', 'Terjadi kesalahan saat mengambil detail setoran');
        return res.redirect('/user/setoran');
    }
};