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
    console.log('Signup request received:', req.body);
    
    const { username, email, password } = req.body;

    // Kiểm tra thông tin đầu vào
    if (!username || !email || !password) {
      console.log('Signup validation failed: Missing fields');
      return next(new AppError('Vui lòng cung cấp đầy đủ tên người dùng, email và mật khẩu', 400));
    }

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Signup failed: Email already exists', email);
      return next(new AppError('Email đã được sử dụng', 400));
    }

    try {
      // Tạo mã OTP
      const otp = generateOTP();
      console.log(`OTP generated for ${email}: ${otp}`);
      
      // Hash OTP trước khi lưu vào database
      const hashedOTP = await bcrypt.hash(otp, 12);

      // Tạo người dùng mới với trạng thái chưa xác nhận
      const user = await User.create({
        username,
        email,
        password,
        emailVerificationOTP: hashedOTP,
        emailVerificationExpires: Date.now() + 10 * 60 * 1000, // 10 phút
        isEmailVerified: false
      });
      
      console.log(`User created successfully with ID: ${user._id}`);

      // Gửi email trước khi trả về response
      try {
        console.log(`Attempting to send verification email to ${email}`);
        
        // Kiểm tra tồn tại và hoạt động của service email
        if (!emailService || typeof emailService.sendVerificationOTP !== 'function') {
          throw new Error('Email service not properly configured');
        }
        
        // Gọi hàm gửi email trực tiếp, không đặt trong Promise
        const emailResult = await emailService.sendVerificationOTP(user, otp);
        console.log(`Email sent successfully to ${email}:`, emailResult.messageId);
      } catch (emailError) {
        // Log lỗi chi tiết nhưng vẫn tiếp tục process
        console.error(`Failed to send verification email to ${email}:`, emailError);
        
        // Thêm một trường vào response để frontend biết có lỗi
        return res.status(201).json({
          status: 'partial_success',
          message: 'Đăng ký thành công nhưng không thể gửi email xác nhận. Vui lòng sử dụng tính năng gửi lại mã.',
          emailSent: false,
          emailError: emailError.message,
          ...(process.env.NODE_ENV === 'development' && { otp })
        });
      }
      
      // Nếu gửi email thành công
      res.status(201).json({
        status: 'success',
        message: 'Đăng ký thành công! Vui lòng kiểm tra email của bạn để lấy mã OTP xác nhận tài khoản.',
        emailSent: true,
        ...(process.env.NODE_ENV === 'development' && { otp })
      });
      
    } catch (error) {
      console.error('Error during registration process:', error);
      return next(new AppError('Đăng ký không thành công: ' + error.message, 500));
    }
  }),

  verifyEmail: catchAsync(async (req, res, next) => {
    console.log('Xác thực email với dữ liệu:', req.body);
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(new AppError('Vui lòng cung cấp email và mã OTP', 400));
    }

    // Tìm người dùng theo email
    const user = await User.findOne({ 
      email,
      emailVerificationExpires: { $gt: Date.now() } // Đảm bảo OTP chưa hết hạn
    });

    if (!user) {
      return next(new AppError('Email không tồn tại hoặc mã OTP đã hết hạn', 400));
    }

    if (user.isEmailVerified) {
      return next(new AppError('Email này đã được xác thực trước đó', 400));
    }

    // Kiểm tra OTP có khớp không
    const isOtpValid = await bcrypt.compare(otp, user.emailVerificationOTP);
    if (!isOtpValid) {
      return next(new AppError('Mã OTP không chính xác', 400));
    }

    // Cập nhật trạng thái xác thực email
    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // Tạo JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    // Loại bỏ password từ output
    user.password = undefined;

    // Gửi response
    res.status(200).json({
      status: 'success',
      message: 'Xác thực email thành công!',
      token,
      user
    });
  }),

  login: catchAsync(async (req, res, next) => {
    try {
      console.log('Đang xử lý đăng nhập cho:', req.body.email);
      
      const { email, password } = req.body;
      
      // Kiểm tra email và password có được cung cấp không
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp email và mật khẩu'
        });
      }
      
      // Tìm user trong database
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email hoặc mật khẩu không đúng'
        });
      }
      
      // Kiểm tra password
      const isMatch = await user.matchPassword(password);
      
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Email hoặc mật khẩu không đúng'
        });
      }
      
      // Kiểm tra xem người dùng đã xác nhận email chưa
      if (!user.isEmailVerified) {
        console.log('Login failed: Email not verified', { userId: user._id });
        return next(new AppError('Vui lòng xác nhận email của bạn trước khi đăng nhập', 401));
      }
      
      // Tạo token
      const token = user.getSignedJwtToken();
      
      // Tạo refresh token
      const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
      });
      
      // Thiết lập cookie với SameSite=None cho môi trường development
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
      
      // Bỏ trường password khỏi user object
      user.password = undefined;
      
      // Nếu đăng nhập thành công, trả về token và thông tin user
      res.status(200).json({
        success: true,
        token,
        data: {
          user
        }
      });
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi đăng nhập',
        error: error.message
      });
    }
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
    console.log('Resend verification request received:', req.body);
    
    const { email } = req.body;
    
    // Tìm user với email đã cung cấp
    const user = await User.findOne({ email });

    if (!user) {
      console.log('Resend verification failed: User not found', { email });
      return next(new AppError('Không tìm thấy người dùng với email này', 404));
    }

    // Kiểm tra xem email đã được xác nhận chưa
    if (user.isEmailVerified) {
      console.log('Resend verification failed: Email already verified', { userId: user._id });
      return next(new AppError('Email này đã được xác nhận rồi', 400));
    }

    // Tạo mã OTP mới
    const otp = generateOTP();
    console.log(`New OTP generated for ${email}: ${otp}`);
    
    // Hash OTP trước khi lưu vào database
    const hashedOTP = await bcrypt.hash(otp, 12);
    
    // Cập nhật thông tin người dùng
    user.emailVerificationOTP = hashedOTP;
    user.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 phút
    await user.save({ validateBeforeSave: false });

    try {
      // Gửi lại email xác nhận với OTP mới
      await emailService.sendVerificationOTP(user, otp);
      console.log(`Verification email resent to ${email}`);

      res.status(200).json({
        status: 'success',
        message: 'Mã OTP xác nhận đã được gửi lại thành công',
        // Trong môi trường phát triển, trả về OTP để thuận tiện kiểm tra
        ...(process.env.NODE_ENV === 'development' && { otp })
      });
    } catch (error) {
      console.error('Error resending verification email:', error);
      return next(new AppError(`Không thể gửi lại email xác nhận: ${error.message}`, 500));
    }
  }),

  refreshToken: catchAsync(async (req, res, next) => {
    try {
      // Lấy refresh token từ cookie
      const refreshToken = req.cookies.refreshToken;
      
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Không tìm thấy refresh token'
        });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      
      // Kiểm tra refresh token trong database/redis
      // ... your code to check refresh token ...

      // Tạo access token mới
      const newToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
      });

      // Lấy thông tin user để trả về
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Người dùng không tồn tại'
        });
      }

      res.status(200).json({
        success: true,
        token: newToken,
        data: {
          user
        }
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn'
      });
    }
  }),

  logout: (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Đăng xuất thành công'
    });
  },

  getCurrentUser: catchAsync(async (req, res, next) => {
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user
      }
    });
  }),

  register: catchAsync(async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      
      // Kiểm tra xem email đã tồn tại chưa
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
      }
      
      // Tạo user mới
      const user = new User({
        username,
        email,
        password // Mật khẩu sẽ được hash trong mongoose middleware
      });
      
      await user.save();
      
      // Tạo token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
      });
      
      // Loại bỏ password trước khi gửi về client
      const userWithoutPassword = {
        _id: user._id,
        username: user.username,
        email: user.email,
        favorites: user.favorites,
        role: user.role,
        createdAt: user.createdAt
      };
      
      res.status(201).json({
        success: true,
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      res.status(500).json({ success: false, message: 'Đăng ký thất bại', error: error.message });
    }
  }),

  resendOtp: catchAsync(async (req, res, next) => {
    console.log('Resend OTP request received:', req.body);
    const { email } = req.body;

    if (!email) {
      return next(new AppError('Vui lòng cung cấp địa chỉ email', 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('Không tìm thấy người dùng với email này', 404));
    }

    if (user.isEmailVerified) {
      return next(new AppError('Email này đã được xác thực', 400));
    }

    // Tạo mã OTP mới
    const otp = generateOTP();
    console.log(`New OTP generated for ${email}: ${otp}`);
    
    // Hash OTP trước khi lưu vào database
    const hashedOTP = await bcrypt.hash(otp, 12);

    // Cập nhật thông tin người dùng
    user.emailVerificationOTP = hashedOTP;
    user.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // Hết hạn sau 10 phút
    await user.save({ validateBeforeSave: false });

    try {
      console.log(`Attempting to send new verification OTP to ${email}`);
      const emailResult = await emailService.sendVerificationOTP(user, otp);
      console.log(`New OTP email sent successfully to ${email}:`, emailResult.messageId);
      
      res.status(200).json({
        status: 'success',
        message: 'Mã OTP mới đã được gửi thành công!',
        ...(process.env.NODE_ENV === 'development' && { otp })
      });
    } catch (error) {
      console.error(`Failed to send new verification OTP to ${email}:`, error);
      
      // Không reset OTP nếu email gửi không thành công
      // Để người dùng có thể thử lại sau
      
      return next(new AppError('Không thể gửi email xác thực. Vui lòng thử lại sau!', 500));
    }
  }),

  getMe: catchAsync(async (req, res, next) => {
    // req.user đã được thiết lập bởi middleware auth.protect
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return next(new AppError('Không tìm thấy người dùng với ID này', 404));
    }
    
    res.status(200).json({
      status: 'success',
      user
    });
  })
};

module.exports = authController;