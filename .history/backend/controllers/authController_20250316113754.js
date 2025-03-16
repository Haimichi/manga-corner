const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const crypto = require('crypto');
const emailService = require('../services/emailService');
const bcrypt = require('bcrypt');

const signToken = (id) => {
  return jwt.sign({ id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
};

// Tạo mã OTP 6 chữ số
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const authController = {
  signup: catchAsync(async (req, res, next) => {
    const { username, email, password } = req.body;

    // Kiểm tra thông tin đầu vào
    if (!username || !email || !password) {
      return next(new AppError('Vui lòng cung cấp đầy đủ tên người dùng, email và mật khẩu', 400));
    }

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email đã được sử dụng', 400));
    }

    // Tạo mã OTP
    const otp = generateOTP();
    console.log(`OTP cho tài khoản ${email}: ${otp}`); // Ghi log OTP để kiểm tra trong môi trường phát triển
    
    // Hash OTP trước khi lưu vào database
    const hashedOTP = await bcrypt.hash(otp, 12);

    try {
      // Tạo người dùng mới với trạng thái chưa xác nhận
      const user = await User.create({
        username,
        email,
        password,
        emailVerificationOTP: hashedOTP,
        emailVerificationExpires: Date.now() + 10 * 60 * 1000, // 10 phút
        isEmailVerified: false
      });

      // Kiểm tra kết nối SMTP trước khi gửi
      await emailService.verifyConnection();

      // Gửi email xác nhận
      res.status(201).json({
        status: 'success',
        message: 'Đăng ký thành công! Vui lòng kiểm tra email của bạn để lấy mã OTP xác nhận tài khoản.',
        ...(process.env.NODE_ENV === 'development' && { otp })
      });
      
      // Gửi email sau khi đã trả về response (không cần await)
      emailService.sendVerificationOTP(user, otp)
        .catch(error => console.error('Lỗi gửi email xác nhận (background):', error));
    } catch (error) {
      console.error('Lỗi đăng ký tài khoản:', error);
      return next(new AppError('Đăng ký không thành công: ' + error.message, 500));
    }
  }),

  verifyEmail: catchAsync(async (req, res, next) => {
    const { email, otp } = req.body;
    
    // Kiểm tra thông tin đầu vào
    if (!email || !otp) {
      return next(new AppError('Vui lòng cung cấp email và mã OTP', 400));
    }
    
    // Tìm user với email
    const user = await User.findOne({ 
      email,
      emailVerificationExpires: { $gt: Date.now() }
    });

    // Nếu không tìm thấy user hợp lệ
    if (!user) {
      return next(new AppError('Email không tồn tại hoặc mã OTP đã hết hạn', 400));
    }

    // Kiểm tra OTP có khớp không
    const isOTPValid = await bcrypt.compare(otp, user.emailVerificationOTP);
    if (!isOTPValid) {
      return next(new AppError('Mã OTP không chính xác', 401));
    }

    // Cập nhật thông tin người dùng
    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // Tạo JWT token cho user đã xác thực
    const jwtToken = signToken(user._id);

    // Trả về response thành công
    res.status(200).json({
      status: 'success',
      message: 'Email đã được xác nhận thành công!',
      token: jwtToken,
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

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Email hoặc mật khẩu không chính xác', 401));
    }

    // Kiểm tra xem người dùng đã xác nhận email chưa
    if (!user.isEmailVerified) {
      return next(new AppError('Vui lòng xác nhận email của bạn trước khi đăng nhập', 401));
    }

    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      }
    });
  }),

  forgotPassword: catchAsync(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError('Không tìm thấy người dùng với email này', 404));
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 phút

    await user.save({ validateBeforeSave: false });

    try {
      await emailService.sendPasswordReset(user, resetToken);

      res.status(200).json({
        status: 'success',
        message: 'Token đã được gửi đến email'
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
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
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('Token không hợp lệ hoặc đã hết hạn', 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token
    });
  }),

  resendVerificationEmail: catchAsync(async (req, res, next) => {
    const { email } = req.body;
    
    // Tìm user với email đã cung cấp
    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError('Không tìm thấy người dùng với email này', 404));
    }

    // Kiểm tra xem email đã được xác nhận chưa
    if (user.isEmailVerified) {
      return next(new AppError('Email này đã được xác nhận rồi', 400));
    }

    // Tạo mã OTP mới
    const otp = generateOTP();
    console.log(`OTP mới cho tài khoản ${email}: ${otp}`); // Ghi log OTP để kiểm tra
    
    // Hash OTP trước khi lưu vào database
    const hashedOTP = await bcrypt.hash(otp, 12);
    
    // Cập nhật thông tin người dùng
    user.emailVerificationOTP = hashedOTP;
    user.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 phút
    await user.save({ validateBeforeSave: false });

    try {
      // Gửi lại email xác nhận với OTP mới
      await emailService.sendVerificationOTP(user, otp);

      res.status(200).json({
        status: 'success',
        message: 'Mã OTP xác nhận đã được gửi lại thành công',
        // Trong môi trường phát triển, trả về OTP để thuận tiện kiểm tra
        ...(process.env.NODE_ENV === 'development' && { otp })
      });
    } catch (error) {
      console.error('Lỗi gửi lại email xác nhận:', error);
      return next(new AppError('Không thể gửi lại email xác nhận. Vui lòng thử lại sau.', 500));
    }
  })
};

module.exports = authController;