const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

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
    // Implement forgot password logic
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    });
  }),

  resetPassword: catchAsync(async (req, res, next) => {
    // Implement reset password logic
    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully'
    });
  })
};

module.exports = authController;