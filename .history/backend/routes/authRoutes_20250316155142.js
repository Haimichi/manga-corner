const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

// Kiểm tra xem các phương thức tồn tại không trước khi sử dụng
// Routes người dùng
router.post('/register', authController.register || authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout || ((req, res) => res.status(200).json({ message: 'Đăng xuất thành công' })));
router.get('/me', auth.protect, authController.getCurrentUser || authController.getMe || ((req, res) => res.status(200).json({ user: req.user })));
router.post('/refresh-token', authController.refreshToken || ((req, res) => res.status(501).json({ message: 'Chức năng chưa được triển khai' })));
router.post('/forgot-password', authController.forgotPassword || ((req, res) => res.status(501).json({ message: 'Chức năng chưa được triển khai' })));
router.patch('/reset-password/:token', authController.resetPassword || ((req, res) => res.status(501).json({ message: 'Chức năng chưa được triển khai' })));

module.exports = router;