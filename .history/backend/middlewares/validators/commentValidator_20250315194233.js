const { body, param } = require('express-validator');

exports.createCommentValidator = [
  param('targetType')
    .isIn(['manga', 'chapter'])
    .withMessage('Loại target không hợp lệ'),

  param('targetId')
    .isMongoId()
    .withMessage('Target ID không hợp lệ'),

  body('content')
    .notEmpty()
    .withMessage('Nội dung bình luận không được để trống')
    .isString()
    .withMessage('Nội dung phải là chuỗi')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Nội dung phải từ 1-1000 ký tự'),

  body('parentId')
    .optional()
    .isMongoId()
    .withMessage('Parent ID không hợp lệ')
];

exports.updateCommentValidator = [
  param('id')
    .isMongoId()
    .withMessage('Comment ID không hợp lệ'),

  body('content')
    .notEmpty()
    .withMessage('Nội dung bình luận không được để trống')
    .isString()
    .withMessage('Nội dung phải là chuỗi')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Nội dung phải từ 1-1000 ký tự')
]; 