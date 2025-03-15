const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const crypto = require('crypto');
const emailService = require('../services/emailService');

const signToken = (id) => {
  return jwt.sign({ id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
};

const authController = {
  signup: catchAsync(async (req, res, next) => {
    const { username, email, password } = req.body;

    const user = await User.create({
      username,
      email,
      password,
    });

    const token = signToken(user._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      },
    });
  }),

  login: catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Vui lòng cung cấp email và mật khẩu', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Email hoặc mật khẩu không chính xác', 401));
    }

    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
    });
  }),

  forgotPassword: catchAsync(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError('Không tìm thấy người dùng với email này', 404));
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 phút

    await user.save({ validateBeforeSave: false });

    try {
      await emailService.sendPasswordReset(user, resetToken);

      res.status(200).json({
        status: 'success',
        message: 'Token đã được gửi đến email'
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new AppError('Có lỗi khi gửi email. Vui lòng thử lại sau!', 500));
    }
  }),

  resetPassword: catchAsync(async (req, res, next) => {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('Token không hợp lệ hoặc đã hết hạn', 400));
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token
    });
  })
};

module.exports = authController;