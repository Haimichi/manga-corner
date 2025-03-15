const { body } = require('express-validator');

exports.updateProfileValidator = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage('Tên người dùng phải từ 3-20 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Email không hợp lệ'),

  body('bio')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Giới thiệu không được quá 200 ký tự'),

  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Ngày sinh không hợp lệ'),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Giới tính không hợp lệ'),

  body('socialLinks.facebook')
    .optional()
    .isURL()
    .withMessage('Link Facebook không hợp lệ'),

  body('socialLinks.twitter')
    .optional()
    .isURL()
    .withMessage('Link Twitter không hợp lệ'),

  body('socialLinks.instagram')
    .optional()
    .isURL()
    .withMessage('Link Instagram không hợp lệ'),

  body('notifications')
    .optional()
    .isObject()
    .withMessage('Cài đặt thông báo không hợp lệ')
];

exports.updatePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Vui lòng nhập mật khẩu hiện tại'),

  body('password')
    .notEmpty()
    .withMessage('Vui lòng nhập mật khẩu mới')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
]; 