const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Middleware untuk memastikan user sudah login
router.use((req, res, next) => {
    if (!req.session.user) {
        req.flash('error', 'Anda harus login terlebih dahulu');
        return res.redirect('/auth/login');
    }
    next();
});

// Dashboard user
router.get('/dashboard', (req, res) => {
    res.render('user/dashboard', {
        title: 'Dashboard',
        user: req.session.user,
        setoran: [],  // Seharusnya diambil dari database
        error: req.flash('error'),
        success: req.flash('success'),
    });
});

// Profil user
router.get('/profile', (req, res) => {
    res.render('user/profile', {
        title: 'Profil Saya',
        user: req.session.user,
        error: req.flash('error'),
        success: req.flash('success'),
        csrfToken: req.csrfToken()
    });
});

// Update profil
router.post('/profile', async (req, res) => {
    try {
        const { nama, alamat, no_telp } = req.body;

        // Validasi input
        if (!nama) {
            req.flash('error', 'Nama tidak boleh kosong');
            return res.redirect('/user/profile');
        }

        // Update session user dengan data baru
        req.session.user.nama = nama;
        req.session.user.alamat = alamat;
        req.session.user.no_telp = no_telp;

        req.flash('success', 'Profil berhasil diperbarui');
        res.redirect('/user/profile');
    } catch (error) {
        console.error('Error updating profile:', error);
        req.flash('error', 'Terjadi kesalahan saat memperbarui profil');
        res.redirect('/user/profile');
    }
});

// Ganti password
router.get('/change-password', (req, res) => {
    res.render('user/change-password', {
        title: 'Ganti Password',
        user: req.session.user,
        error: req.flash('error'),
        success: req.flash('success'),
        csrfToken: req.csrfToken()
    });
});

// Process ganti password
router.post('/change-password', async (req, res) => {
    try {
        const { current_password, new_password, confirm_password } = req.body;

        // Validasi input
        if (!current_password || !new_password || !confirm_password) {
            req.flash('error', 'Semua field harus diisi');
            return res.redirect('/user/change-password');
        }

        if (new_password !== confirm_password) {
            req.flash('error', 'Password baru dan konfirmasi password tidak sama');
            return res.redirect('/user/change-password');
        }

        if (new_password.length < 6) {
            req.flash('error', 'Password baru minimal 6 karakter');
            return res.redirect('/user/change-password');
        }

        // Untuk sementara, hanya tampilkan pesan sukses
        // Nanti bisa ditambahkan validasi password lama dan update ke database
        req.flash('success', 'Password berhasil diperbarui');
        res.redirect('/user/profile');

    } catch (error) {
        console.error('Error changing password:', error);
        req.flash('error', 'Terjadi kesalahan saat mengganti password');
        res.redirect('/user/change-password');
    }
});

// Riwayat setoran
router.get('/setoran', (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        // Ambil setoran dari session (simulasi database)
        const setoran = req.session.userSetoran || [];
        const total = setoran.length;
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
        console.error('Error:', error);
        req.flash('error', 'Terjadi kesalahan saat mengambil data setoran');
        res.redirect('/user/dashboard');
    }
});

// Detail setoran
router.get('/setoran/:id', (req, res) => {
    const setoranId = req.params.id;
    
    // Cari setoran berdasarkan ID dari session
    const userSetoran = req.session.userSetoran || [];
    const setoran = userSetoran.find(s => s.id.toString() === setoranId);
    
    res.render('user/setoran-detail', {
        title: 'Detail Setoran',
        user: req.session.user,
        setoran: setoran || null,
        items: setoran ? setoran.items : [],
        error: req.flash('error'),
        success: req.flash('success')
    });
});

// Form tambah setoran
router.get('/setoran/create', (req, res) => {
    res.render('user/create-setoran', {
        title: 'Tambah Setoran',
        user: req.session.user,
        error: req.flash('error'),
        success: req.flash('success'),
        csrfToken: req.csrfToken()
    });
});

// Process tambah setoran
router.post('/setoran/create', async (req, res) => {
    try {
        const { sampah_id, berat, harga_satuan, item_total, total_harga } = req.body;
        
        console.log('Data setoran diterima:', req.body); // Debug log
        
        // Validasi input
        if (!total_harga || total_harga <= 0) {
            req.flash('error', 'Total harga tidak valid');
            return res.redirect('/user/setoran/create');
        }
        
        if (!sampah_id || !berat || !harga_satuan) {
            req.flash('error', 'Semua field harus diisi dengan benar');
            return res.redirect('/user/setoran/create');
        }
        
        // Simulasi penyimpanan ke "database" menggunakan session untuk demo
        if (!req.session.userSetoran) {
            req.session.userSetoran = [];
        }
        
        const newSetoran = {
            id: Date.now(), // ID sederhana untuk demo
            user_id: req.session.user.id,
            user_nama: req.session.user.nama,
            tanggal: new Date(),
            total_harga: parseFloat(total_harga),
            status: 'menunggu',
            items: []
        };
        
        // Proses item setoran
        if (Array.isArray(sampah_id)) {
            // Multiple items
            for (let i = 0; i < sampah_id.length; i++) {
                if (sampah_id[i] && berat[i] && harga_satuan[i]) {
                    newSetoran.items.push({
                        sampah_id: sampah_id[i],
                        sampah_nama: `Sampah Jenis ${sampah_id[i]}`,
                        kategori_nama: 'Kategori Demo',
                        berat: parseFloat(berat[i]),
                        harga_satuan: parseFloat(harga_satuan[i]),
                        total: parseFloat(item_total[i])
                    });
                }
            }
        } else {
            // Single item
            newSetoran.items.push({
                sampah_id: sampah_id,
                sampah_nama: `Sampah Jenis ${sampah_id}`,
                kategori_nama: 'Kategori Demo',
                berat: parseFloat(berat),
                harga_satuan: parseFloat(harga_satuan),
                total: parseFloat(item_total)
            });
        }
        
        req.session.userSetoran.push(newSetoran);
        
        req.flash('success', 'Setoran berhasil dibuat dan menunggu verifikasi admin');
        res.redirect('/user/setoran');
        
    } catch (error) {
        console.error('Error creating setoran:', error);
        req.flash('error', 'Terjadi kesalahan saat membuat setoran');
        res.redirect('/user/setoran/create');
    }
});

module.exports = router;