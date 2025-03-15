const { body, param } = require('express-validator');

exports.createChapterValidator = [
  body('chapterNumber')
    .notEmpty()
    .withMessage('Số chapter là bắt buộc')
    .isString()
    .withMessage('Số chapter phải là chuỗi'),

  body('title')
    .optional()
    .isString()
    .withMessage('Tiêu đề phải là chuỗi'),

  body('language')
    .notEmpty()
    .withMessage('Ngôn ngữ là bắt buộc')
    .isIn(['en', 'vi'])
    .withMessage('Ngôn ngữ phải là en hoặc vi'),

  body('pages')
    .isArray()
    .withMessage('Pages phải là một mảng')
    .custom((value) => {
      if (!Array.isArray(value)) return false;
      return value.every(url => typeof url === 'string');
    })
    .withMessage('Mỗi trang phải là URL dạng chuỗi')
];

exports.updateChapterValidator = [
  param('id')
    .isMongoId()
    .withMessage('ID chapter không hợp lệ'),

  body('chapterNumber')
    .optional()
    .isString()
    .withMessage('Số chapter phải là chuỗi'),

  body('title')
    .optional()
    .isString()
    .withMessage('Tiêu đề phải là chuỗi'),

  body('pages')
    .optional()
    .isArray()
    .withMessage('Pages phải là một mảng')
    .custom((value) => {
      if (!Array.isArray(value)) return false;
      return value.every(url => typeof url === 'string');
    })
    .withMessage('Mỗi trang phải là URL dạng chuỗi')
]; 