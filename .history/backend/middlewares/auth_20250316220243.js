const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');
const config = require('../config/config');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.protect = async (req, res, next) => {
  try {
    // Bỏ qua xác thực cho các routes công khai
    const publicRoutes = [
      // Cả hai phiên bản với và không có /api
      '/auth/login',
      '/auth/register',
      '/auth/verify',
      '/auth/refresh-token',
      '/mangadex/latest',
      '/mangadex/popular',
      '/manga/popular',
      '/chapter',
      '/mangadex/manga',
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/verify',
      '/api/auth/refresh-token',
      '/api/mangadex/latest',
      '/api/mangadex/popular',
      '/api/manga/popular',
      '/api/chapter',
      '/api/mangadex/manga'
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
      return next(new AppError('Bạn chưa đăng nhập! Vui lòng đăng nhập để truy cập.', 401));
    }

    // Verify token
    const decoded = await promisify(jwt.verify)(token, config.JWT_SECRET);
    
    // Kiểm tra user tồn tại
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('Người dùng thuộc về token này không còn tồn tại.', 401));
    }

    // Gán user vào request
    req.user = user;
    next();
  } catch (error) {
    console.error('Lỗi xác thực:', error);
    return next(new AppError('Không được phép truy cập.', 401));
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