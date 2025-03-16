const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.protect = async (req, res, next) => {
  try {
    // Bỏ qua xác thực cho các routes công khai
    const publicRoutes = [
      '/auth/login',
      '/auth/register',
      '/auth/verify',
      '/auth/refresh-token',
      '/mangadex/latest',
      '/mangadex/popular',
      '/manga/popular',
      '/chapter',
      '/mangadex/manga'
    ];
    
    // Kiểm tra xem đường dẫn hiện tại có phải là route công khai không
    const isPublicRoute = publicRoutes.some(route => req.path.startsWith(route));
    if (isPublicRoute) {
      return next();
    }
    
    let token;
    
    // Lấy token từ Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Vui lòng đăng nhập để truy cập', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Kiểm tra user tồn tại
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('Người dùng không tồn tại', 401));
    }

    // Gán user vào request
    req.user = user;
    next();
  } catch (error) {
    console.error('Lỗi xác thực:', error);
    res.status(401).json({
      status: 'error',
      message: 'Bạn chưa đăng nhập hoặc token đã hết hạn'
    });
  }
};

// Middleware để hạn chế quyền truy cập dựa vào role
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Bạn không có quyền thực hiện hành động này', 403));
    }
    next();
  };
};