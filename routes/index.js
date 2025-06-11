const express = require('express');
const router = express.Router();

// Home page
router.get('/', async (req, res) => {
    try {
        // Dalam implementasi sebenarnya, kita akan mengambil data dari database
        const kategori = [
            { nama: 'Organik', deskripsi: 'Sampah yang dapat terurai secara alami' },
            { nama: 'Plastik', deskripsi: 'Berbagai jenis sampah plastik untuk didaur ulang' },
            { nama: 'Kertas', deskripsi: 'Koran, kardus, kertas bekas, dan sejenisnya' },
            { nama: 'Logam', deskripsi: 'Kaleng, besi, dan berbagai jenis logam' },
            { nama: 'Elektronik', deskripsi: 'Barang elektronik bekas atau rusak' },
            { nama: 'Kaca', deskripsi: 'Botol kaca, pecahan kaca, dan sejenisnya' }
        ];

        res.render('index', {
            title: 'Beranda',
            kategori: kategori,
            user: req.session.user || null,
            error: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error('Error rendering home page:', error);
        res.status(500).render('error', {
            message: 'Terjadi kesalahan saat memuat halaman',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// About page
router.get('/about', (req, res) => {
    res.render('about', {
        title: 'Tentang Kami',
        user: req.session.user || null,
        error: req.flash('error'),
        success: req.flash('success')
    });
});

// Contact page
router.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Kontak Kami',
        user: req.session.user || null,
        error: req.flash('error'),
        success: req.flash('success')
    });
});

// Process contact form
router.post('/contact', (req, res) => {
    const { nama, email, pesan } = req.body;

    // Validasi input
    if (!nama || !email || !pesan) {
        req.flash('error', 'Semua field harus diisi');
        return res.redirect('/contact');
    }

    // Dalam implementasi sebenarnya, pesan kontak akan disimpan ke database
    // atau dikirim melalui email

    req.flash('success', 'Pesan Anda telah dikirim. Kami akan segera menghubungi Anda.');
    res.redirect('/contact');
});

// Admin routes - reuse redirect untuk keamanan ekstra
router.get('/admin', (req, res) => {
    res.redirect('/admin/dashboard');
});

// User routes - reuse redirect untuk keamanan ekstra
router.get('/user', (req, res) => {
    res.redirect('/user/dashboard');
});

module.exports = router;