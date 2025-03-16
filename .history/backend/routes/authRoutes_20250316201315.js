const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

// Routes người dùng
router.post('/register', authController.register || authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', auth.protect, authController.getCurrentUser || authController.getMe);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

module.exports = router;