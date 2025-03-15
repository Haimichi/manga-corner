const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Vui lòng đăng nhập để truy cập', 401));
  }

  const decoded = jwt.verify(token, config.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new AppError('Người dùng không tồn tại', 401));
  }

  req.user = user;
  next();
});