const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { createJWT, logout } = require('../middleware/auth');

/**
 * Menampilkan halaman login
 */
exports.getLoginPage = (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }

    res.render('auth/login', {
        title: 'Login',
        user: null,
        error: req.flash('error'),
        success: req.flash('success'),
        csrfToken: req.csrfToken()
    });
};

/**
 * Menampilkan halaman registrasi
 */
exports.getRegisterPage = (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }

    res.render('auth/register', {
        title: 'Daftar Akun Baru',
        user: null,
        error: req.flash('error'),
        success: req.flash('success'),
        csrfToken: req.csrfToken()
    });
};

/**
 * Proses login
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Login attempt:', { email }); // Log untuk debugging

        // Validasi input
        if (!email || !password) {
            req.flash('error', 'Email dan password harus diisi');
            return res.redirect('/auth/login');
        }

        // Cari user berdasarkan email
        const user = await User.findByEmail(email);
        console.log('User found:', user ? { id: user.id, email: user.email, role: user.role } : 'No'); // Log untuk debugging

        if (!user) {
            req.flash('error', 'Email atau password salah');
            return res.redirect('/auth/login');
        }

        // Verifikasi password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch); // Log untuk debugging

        if (!isMatch) {
            req.flash('error', 'Email atau password salah');
            return res.redirect('/auth/login');
        }

        // Set session user
        req.session.user = {
            id: user.id,
            nama: user.nama,
            email: user.email,
            role: user.role
        };

        // Redirect berdasarkan role
        if (user.role === 'admin') {
            return res.redirect('/admin/dashboard');
        } else {
            return res.redirect('/user/dashboard');
        }

    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'Terjadi kesalahan saat login');
        return res.redirect('/auth/login');
    }
};

/**
 * Proses registrasi
 */
exports.register = async (req, res) => {
    try {
        const { nama, email, password, password_confirm, alamat, no_telp } = req.body;

        // Validasi input
        if (!nama || !email || !password || !password_confirm) {
            req.flash('error', 'Semua field wajib diisi');
            return res.redirect('/auth/register');
        }

        // Validasi password
        if (password !== password_confirm) {
            req.flash('error', 'Password dan konfirmasi password tidak cocok');
            return res.redirect('/auth/register');
        }

        if (password.length < 6) {
            req.flash('error', 'Password minimal 6 karakter');
            return res.redirect('/auth/register');
        }

        // Cek email sudah terdaftar
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            req.flash('error', 'Email sudah terdaftar');
            return res.redirect('/auth/register');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = {
            nama,
            email,
            password: hashedPassword,
            alamat: alamat || '',
            no_telp: no_telp || '',
            role: 'user'
        };

        const userId = await User.create(newUser);

        req.flash('success', 'Registrasi berhasil, silakan login');
        res.redirect('/auth/login');

    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error', 'Terjadi kesalahan saat registrasi');
        return res.redirect('/auth/register');
    }
};

/**
 * Proses logout
 */
exports.logoutUser = (req, res) => {
    logout(req, res);
};