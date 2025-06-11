const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isLoggedIn, isNotLoggedIn } = require('../middleware/auth');

// Login routes
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }

    res.render('auth/login', {
        title: 'Login',
        error: req.flash('error'),
        success: req.flash('success'),
        csrfToken: req.csrfToken()
    });
});

// Process login
router.post('/login', authController.login);

// Register routes
router.get('/register', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }

    res.render('auth/register', {
        title: 'Register',
        error: req.flash('error'),
        success: req.flash('success'),
        csrfToken: req.csrfToken()
    });
});

// Process register
router.post('/register', authController.register);

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/auth/login');
    });
});

module.exports = router;