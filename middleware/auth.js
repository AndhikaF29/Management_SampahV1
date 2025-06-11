const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

/**
 * Auth middleware
 */

// Middleware to check if user is logged in
exports.isLoggedIn = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    req.flash('error', 'Anda harus login terlebih dahulu');
    res.redirect('/auth/login');
};

// Middleware to check if user is NOT logged in (for login/register pages)
exports.isNotLoggedIn = (req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    res.redirect('/');
};

// Middleware to check if user is admin
exports.isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.status(403).render('error', {
        title: 'Akses Ditolak',
        error: {
            status: 403,
            message: 'Anda tidak memiliki akses ke halaman ini'
        }
    });
};

/**
 * Fungsi untuk membuat JWT token
 */
exports.createJWT = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

/**
 * Logout user
 */
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/auth/login');
    });
};