const rateLimit = require('express-rate-limit');

exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Giới hạn 5 lần đăng nhập thất bại
  message: 'Quá nhiều lần đăng nhập thất bại, vui lòng thử lại sau 15 phút'
});

exports.apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 1000, // Giới hạn 1000 request/giờ
  message: 'Quá nhiều yêu cầu, vui lòng thử lại sau'
});