const User = require('../models/User');
const Setoran = require('../models/Setoran');
const bcrypt = require('bcryptjs');
const { Sampah, Kategori } = require('../models/Sampah');

/**
 * Menampilkan dashboard admin
 */
exports.getDashboard = async (req, res) => {
    try {
        // Mendapatkan total user
        const users = await User.getAll(1000);
        const totalUsers = users.length;
        const totalAdmin = users.filter(user => user.role === 'admin').length;
        const totalMember = users.filter(user => user.role === 'user').length;

        // Mendapatkan total setoran yang menunggu
        const allSetoran = await Setoran.getAll(1000);
        const totalSetoran = allSetoran.length;
        const menungguSetoran = allSetoran.filter(s => s.status === 'menunggu').length;
        const selesaiSetoran = allSetoran.filter(s => s.status === 'selesai').length;

        // Mendapatkan data untuk grafik
        const today = new Date();
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const startDate = lastMonth.toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];

        const laporanHarian = await Setoran.getLaporanHarian(startDate, endDate);
        const laporanKategori = await Setoran.getLaporanKategori(startDate, endDate);

        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            user: req.session.user,
            totalUsers,
            totalAdmin,
            totalMember,
            totalSetoran,
            menungguSetoran,
            selesaiSetoran,
            laporanHarian,
            laporanKategori,
            error: req.flash('error'),
            success: req.flash('success'),
            csrfToken: req.csrfToken()
        });

    } catch (error) {
        console.error('Error in admin dashboard:', error);
        req.flash('error', 'Terjadi kesalahan saat memuat dashboard');
        res.redirect('/');
    }
};

/**
 * Mendapatkan semua user
 */
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        // Get users dengan pagination
        const users = await User.getAll({
            limit,
            offset,
            search
        });

        const total = await User.count({ search });
        const totalPages = Math.ceil(total / limit);

        res.render('admin/users', {
            title: 'Manajemen User',
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages
            },
            search,
            user: req.session.user,
            error: req.flash('error'),
            success: req.flash('success')
        });

    } catch (error) {
        console.error('Error getting all users:', error);
        req.flash('error', 'Terjadi kesalahan saat mengambil data user');
        return res.redirect('/admin/dashboard');
    }
};

/**
 * Mendapatkan detail user
 */
exports.getUserDetail = async (req, res) => {
    try {
        const userId = req.params.id;

        const userData = await User.findById(userId);

        if (!userData) {
            req.flash('error', 'User tidak ditemukan');
            return res.redirect('/admin/users');
        }

        res.render('admin/user-detail', {
            title: 'Detail User',
            userData,
            user: req.session.user,
            error: req.flash('error'),
            success: req.flash('success')
        });

    } catch (error) {
        console.error('Error getting user detail:', error);
        req.flash('error', 'Terjadi kesalahan saat mengambil detail user');
        return res.redirect('/admin/users');
    }
};

/**
 * Update user
 */
exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { nama, email, alamat, no_telp, role } = req.body;

        // Validasi input
        if (!nama) {
            req.flash('error', 'Nama tidak boleh kosong');
            return res.redirect(`/admin/users/${userId}`);
        }

        // Update user
        const updateData = { nama, email, alamat, no_telp, role };
        const updated = await User.update(userId, updateData);

        if (updated) {
            req.flash('success', 'User berhasil diperbarui');
        } else {
            req.flash('error', 'Gagal memperbarui user');
        }

        return res.redirect(`/admin/users/${userId}`);

    } catch (error) {
        console.error('Error updating user:', error);
        req.flash('error', 'Terjadi kesalahan saat memperbarui user');
        return res.redirect('/admin/users');
    }
};

/**
 * Delete user
 */
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Pastikan admin tidak menghapus dirinya sendiri
        if (userId == req.session.user.id) {
            req.flash('error', 'Anda tidak dapat menghapus akun Anda sendiri');
            return res.redirect('/admin/users');
        }

        // Hapus user
        const deleted = await User.delete(userId);

        if (deleted) {
            req.flash('success', 'User berhasil dihapus');
        } else {
            req.flash('error', 'Gagal menghapus user');
        }

        return res.redirect('/admin/users');

    } catch (error) {
        console.error('Error deleting user:', error);
        req.flash('error', 'Terjadi kesalahan saat menghapus user');
        return res.redirect('/admin/users');
    }
};

/**
 * Menampilkan form kategori
 */
exports.getKategoriList = async (req, res) => {
    try {
        const kategori = await Kategori.getAll();

        res.render('admin/kategori-list', {
            title: 'Kelola Kategori Sampah',
            user: req.session.user,
            kategori,
            error: req.flash('error'),
            success: req.flash('success'),
            csrfToken: req.csrfToken()
        });

    } catch (error) {
        console.error('Error in get kategori list:', error);
        req.flash('error', 'Terjadi kesalahan saat memuat daftar kategori');
        res.redirect('/admin/dashboard');
    }
};

/**
 * Menampilkan form tambah kategori
 */
exports.getAddKategoriForm = (req, res) => {
    res.render('admin/kategori-form', {
        title: 'Tambah Kategori Sampah',
        user: req.session.user,
        kategori: null,
        error: req.flash('error'),
        success: req.flash('success'),
        csrfToken: req.csrfToken()
    });
};

/**
 * Proses tambah kategori
 */
exports.createKategori = async (req, res) => {
    try {
        const { nama, deskripsi } = req.body;

        if (!nama) {
            req.flash('error', 'Nama kategori harus diisi');
            return res.redirect('/admin/kategori/add');
        }

        await Kategori.create({ nama, deskripsi });

        req.flash('success', 'Kategori sampah berhasil ditambahkan');
        res.redirect('/admin/kategori');

    } catch (error) {
        console.error('Error in create kategori:', error);
        req.flash('error', 'Terjadi kesalahan saat menambahkan kategori');
        res.redirect('/admin/kategori/add');
    }
};

/**
 * Menampilkan form edit kategori
 */
exports.getEditKategoriForm = async (req, res) => {
    try {
        const id = req.params.id;
        const kategori = await Kategori.getById(id);

        if (!kategori) {
            req.flash('error', 'Kategori tidak ditemukan');
            return res.redirect('/admin/kategori');
        }

        res.render('admin/kategori-form', {
            title: 'Edit Kategori Sampah',
            user: req.session.user,
            kategori,
            error: req.flash('error'),
            success: req.flash('success'),
            csrfToken: req.csrfToken()
        });

    } catch (error) {
        console.error('Error in get edit kategori form:', error);
        req.flash('error', 'Terjadi kesalahan saat memuat form edit kategori');
        res.redirect('/admin/kategori');
    }
};

/**
 * Proses update kategori
 */
exports.updateKategori = async (req, res) => {
    try {
        const id = req.params.id;
        const { nama, deskripsi } = req.body;

        if (!nama) {
            req.flash('error', 'Nama kategori harus diisi');
            return res.redirect(`/admin/kategori/edit/${id}`);
        }

        await Kategori.update(id, { nama, deskripsi });

        req.flash('success', 'Kategori sampah berhasil diperbarui');
        res.redirect('/admin/kategori');

    } catch (error) {
        console.error('Error in update kategori:', error);
        req.flash('error', 'Terjadi kesalahan saat memperbarui kategori');
        res.redirect('/admin/kategori');
    }
};

/**
 * Proses hapus kategori
 */
exports.deleteKategori = async (req, res) => {
    try {
        const id = req.params.id;

        await Kategori.delete(id);

        req.flash('success', 'Kategori sampah berhasil dihapus');
        res.redirect('/admin/kategori');

    } catch (error) {
        console.error('Error in delete kategori:', error);
        req.flash('error', 'Terjadi kesalahan saat menghapus kategori');
        res.redirect('/admin/kategori');
    }
};

/**
 * Menampilkan daftar sampah
 */
exports.getSampahList = async (req, res) => {
    try {
        const sampah = await Sampah.getAll();

        res.render('admin/sampah-list', {
            title: 'Kelola Sampah',
            user: req.session.user,
            sampah,
            error: req.flash('error'),
            success: req.flash('success'),
            csrfToken: req.csrfToken()
        });

    } catch (error) {
        console.error('Error in get sampah list:', error);
        req.flash('error', 'Terjadi kesalahan saat memuat daftar sampah');
        res.redirect('/admin/dashboard');
    }
};

/**
 * Menampilkan form tambah sampah
 */
exports.getAddSampahForm = async (req, res) => {
    try {
        const kategori = await Kategori.getAll();

        res.render('admin/sampah-form', {
            title: 'Tambah Data Sampah',
            user: req.session.user,
            sampah: null,
            kategori,
            error: req.flash('error'),
            success: req.flash('success'),
            csrfToken: req.csrfToken()
        });

    } catch (error) {
        console.error('Error in get add sampah form:', error);
        req.flash('error', 'Terjadi kesalahan saat memuat form tambah sampah');
        res.redirect('/admin/sampah');
    }
};

/**
 * Proses tambah sampah
 */
exports.createSampah = async (req, res) => {
    try {
        const { nama, kategori_id, harga_per_kg, deskripsi } = req.body;

        if (!nama || !kategori_id || !harga_per_kg) {
            req.flash('error', 'Data tidak lengkap');
            return res.redirect('/admin/sampah/add');
        }

        await Sampah.create({
            nama,
            kategori_id: parseInt(kategori_id),
            harga_per_kg: parseFloat(harga_per_kg),
            deskripsi
        });

        req.flash('success', 'Data sampah berhasil ditambahkan');
        res.redirect('/admin/sampah');

    } catch (error) {
        console.error('Error in create sampah:', error);
        req.flash('error', 'Terjadi kesalahan saat menambahkan sampah');
        res.redirect('/admin/sampah/add');
    }
};

/**
 * Menampilkan form edit sampah
 */
exports.getEditSampahForm = async (req, res) => {
    try {
        const id = req.params.id;
        const sampah = await Sampah.getById(id);
        const kategori = await Kategori.getAll();

        if (!sampah) {
            req.flash('error', 'Sampah tidak ditemukan');
            return res.redirect('/admin/sampah');
        }

        res.render('admin/sampah-form', {
            title: 'Edit Data Sampah',
            user: req.session.user,
            sampah,
            kategori,
            error: req.flash('error'),
            success: req.flash('success'),
            csrfToken: req.csrfToken()
        });

    } catch (error) {
        console.error('Error in get edit sampah form:', error);
        req.flash('error', 'Terjadi kesalahan saat memuat form edit sampah');
        res.redirect('/admin/sampah');
    }
};

/**
 * Proses update sampah
 */
exports.updateSampah = async (req, res) => {
    try {
        const id = req.params.id;
        const { nama, kategori_id, harga_per_kg, deskripsi } = req.body;

        if (!nama || !kategori_id || !harga_per_kg) {
            req.flash('error', 'Data tidak lengkap');
            return res.redirect(`/admin/sampah/edit/${id}`);
        }

        await Sampah.update(id, {
            nama,
            kategori_id: parseInt(kategori_id),
            harga_per_kg: parseFloat(harga_per_kg),
            deskripsi
        });

        req.flash('success', 'Data sampah berhasil diperbarui');
        res.redirect('/admin/sampah');

    } catch (error) {
        console.error('Error in update sampah:', error);
        req.flash('error', 'Terjadi kesalahan saat memperbarui sampah');
        res.redirect('/admin/sampah');
    }
};

/**
 * Proses hapus sampah
 */
exports.deleteSampah = async (req, res) => {
    try {
        const id = req.params.id;

        await Sampah.delete(id);

        req.flash('success', 'Data sampah berhasil dihapus');
        res.redirect('/admin/sampah');

    } catch (error) {
        console.error('Error in delete sampah:', error);
        req.flash('error', 'Terjadi kesalahan saat menghapus sampah');
        res.redirect('/admin/sampah');
    }
};

/**
 * Menampilkan daftar setoran
 */
exports.getSetoranList = async (req, res) => {
    try {
        const setoran = await Setoran.getAll();

        res.render('admin/setoran-list', {
            title: 'Kelola Setoran Sampah',
            user: req.session.user,
            setoran,
            error: req.flash('error'),
            success: req.flash('success'),
            csrfToken: req.csrfToken()
        });

    } catch (error) {
        console.error('Error in get setoran list:', error);
        req.flash('error', 'Terjadi kesalahan saat memuat daftar setoran');
        res.redirect('/admin/dashboard');
    }
};

/**
 * Menampilkan detail setoran
 */
exports.getSetoranDetail = async (req, res) => {
    try {
        const id = req.params.id;
        const setoran = await Setoran.getById(id);

        if (!setoran) {
            req.flash('error', 'Setoran tidak ditemukan');
            return res.redirect('/admin/setoran');
        }

        res.render('admin/setoran-detail', {
            title: 'Detail Setoran Sampah',
            user: req.session.user,
            setoran,
            error: req.flash('error'),
            success: req.flash('success'),
            csrfToken: req.csrfToken()
        });

    } catch (error) {
        console.error('Error in get setoran detail:', error);
        req.flash('error', 'Terjadi kesalahan saat memuat detail setoran');
        res.redirect('/admin/setoran');
    }
};

/**
 * Proses update status setoran
 */
exports.updateSetoranStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;

        if (!status || !['menunggu', 'diproses', 'selesai', 'dibatalkan'].includes(status)) {
            req.flash('error', 'Status tidak valid');
            return res.redirect(`/admin/setoran/${id}`);
        }

        await Setoran.updateStatus(id, status);

        req.flash('success', 'Status setoran berhasil diperbarui');
        res.redirect(`/admin/setoran/${id}`);

    } catch (error) {
        console.error('Error in update setoran status:', error);
        req.flash('error', 'Terjadi kesalahan saat memperbarui status setoran');
        res.redirect('/admin/setoran');
    }
};

/**
 * Menampilkan halaman laporan
 */
exports.getLaporanPage = async (req, res) => {
    try {
        // Set default date range ke 1 bulan terakhir
        const today = new Date();
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const startDate = req.query.start_date || lastMonth.toISOString().split('T')[0];
        const endDate = req.query.end_date || today.toISOString().split('T')[0];

        // Ambil data laporan
        const laporanHarian = await Setoran.getLaporanHarian(startDate, endDate);
        const laporanKategori = await Setoran.getLaporanKategori(startDate, endDate);

        // Hitung total
        const totalBerat = laporanKategori.reduce((acc, curr) => acc + parseFloat(curr.total_berat), 0);
        const totalPendapatan = laporanHarian.reduce((acc, curr) => acc + parseFloat(curr.total), 0);

        res.render('admin/laporan', {
            title: 'Laporan Manajemen Sampah',
            user: req.session.user,
            startDate,
            endDate,
            laporanHarian,
            laporanKategori,
            totalBerat,
            totalPendapatan,
            error: req.flash('error'),
            success: req.flash('success'),
            csrfToken: req.csrfToken()
        });

    } catch (error) {
        console.error('Error in get laporan page:', error);
        req.flash('error', 'Terjadi kesalahan saat memuat laporan');
        res.redirect('/admin/dashboard');
    }
};