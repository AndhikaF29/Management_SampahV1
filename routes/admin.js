const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');

// Gunakan middleware isAdmin untuk semua rute admin
router.use((req, res, next) => {
    if (!req.session.user) {
        req.flash('error', 'Anda harus login terlebih dahulu');
        return res.redirect('/auth/login');
    }

    if (req.session.user.role !== 'admin') {
        req.flash('error', 'Anda tidak memiliki akses ke halaman admin');
        return res.redirect('/');
    }

    next();
});

// Dashboard admin
router.get('/dashboard', async (req, res) => {
    try {
        // Untuk sementara menggunakan data statis, nanti bisa diganti dengan query database
        const dashboardData = {
            totalUsers: 0,
            totalSetoran: 0,
            totalSampah: 0,
            totalPembayaran: 0,
            recentSetoran: []
        };

        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            user: req.session.user,
            ...dashboardData,
            error: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            user: req.session.user,
            totalUsers: 0,
            totalSetoran: 0,
            totalSampah: 0,
            totalPembayaran: 0,
            recentSetoran: [],
            error: req.flash('error'),
            success: req.flash('success')
        });
    }
});

// Manajemen user
router.get('/users', (req, res) => {
    res.render('admin/users', {
        title: 'Manajemen User',
        users: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
        search: '',
        error: req.flash('error'),
        success: req.flash('success')
    });
});

router.get('/users/:id', (req, res) => {
    res.render('admin/user-detail', {
        title: 'Detail User',
        userData: null,
        error: req.flash('error'),
        success: req.flash('success')
    });
});

router.post('/users/:id', (req, res) => {
    req.flash('success', 'User berhasil diupdate');
    res.redirect('/admin/users');
});

router.get('/users/:id/delete', (req, res) => {
    req.flash('success', 'User berhasil dihapus');
    res.redirect('/admin/users');
});

// Manajemen kategori
router.get('/kategori', (req, res) => {
    res.render('admin/kategori', {
        title: 'Manajemen Kategori',
        kategori: [],
        error: req.flash('error'),
        success: req.flash('success')
    });
});

router.post('/kategori', (req, res) => {
    req.flash('success', 'Kategori berhasil dibuat');
    res.redirect('/admin/kategori');
});

router.post('/kategori/:id', (req, res) => {
    req.flash('success', 'Kategori berhasil diupdate');
    res.redirect('/admin/kategori');
});

router.get('/kategori/:id/delete', (req, res) => {
    req.flash('success', 'Kategori berhasil dihapus');
    res.redirect('/admin/kategori');
});

// Manajemen sampah
router.get('/sampah', (req, res) => {
    res.render('admin/sampah', {
        title: 'Manajemen Sampah',
        sampah: [],
        error: req.flash('error'),
        success: req.flash('success')
    });
});

router.post('/sampah', (req, res) => {
    req.flash('success', 'Sampah berhasil dibuat');
    res.redirect('/admin/sampah');
});

router.post('/sampah/:id', (req, res) => {
    req.flash('success', 'Sampah berhasil diupdate');
    res.redirect('/admin/sampah');
});

router.get('/sampah/:id/delete', (req, res) => {
    req.flash('success', 'Sampah berhasil dihapus');
    res.redirect('/admin/sampah');
});

// Manajemen setoran
router.get('/setoran', (req, res) => {
    res.render('admin/setoran', {
        title: 'Manajemen Setoran',
        setoran: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
        error: req.flash('error'),
        success: req.flash('success')
    });
});

router.get('/setoran/:id', (req, res) => {
    res.render('admin/setoran-detail', {
        title: 'Detail Setoran',
        setoran: null,
        items: [],
        error: req.flash('error'),
        success: req.flash('success')
    });
});

router.post('/setoran/:id/status', (req, res) => {
    req.flash('success', 'Status setoran berhasil diupdate');
    res.redirect('/admin/setoran');
});

// Laporan
router.get('/laporan/harian', (req, res) => {
    res.render('admin/laporan-harian', {
        title: 'Laporan Harian',
        laporan: [],
        error: req.flash('error'),
        success: req.flash('success')
    });
});

router.get('/laporan/kategori', (req, res) => {
    res.render('admin/laporan-kategori', {
        title: 'Laporan Per Kategori',
        laporan: [],
        error: req.flash('error'),
        success: req.flash('success')
    });
});

module.exports = router;