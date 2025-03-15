const { body, query, param } = require('express-validator');

exports.searchMangaValidator = [
  query('query')
    .optional()
    .trim()
    .isString()
    .withMessage('Query phải là chuỗi'),
  
  query('genres')
    .optional()
    .trim()
    .custom((value) => {
      if (value) {
        const genres = value.split(',');
        return genres.every(genre => typeof genre === 'string');
      }
      return true;
    })
    .withMessage('Genres phải là chuỗi được phân tách bằng dấu phẩy'),
  
  query('status')
    .optional()
    .isIn(['ongoing', 'completed', 'hiatus', 'cancelled'])
    .withMessage('Trạng thái không hợp lệ'),
  
  query('sort')
    .optional()
    .isIn(['updatedAt', 'followCount'])
    .withMessage('Tiêu chí sắp xếp không hợp lệ'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Thứ tự sắp xếp không hợp lệ'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Số trang phải là số nguyên dương'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Giới hạn phải từ 1 đến 100')
];

exports.createMangaValidator = [
  body('title.en')
    .notEmpty()
    .withMessage('Tiêu đề tiếng Anh là bắt buộc')
    .isString()
    .withMessage('Tiêu đề phải là chuỗi'),
  
  body('mangadexId')
    .notEmpty()
    .withMessage('MangaDex ID là bắt buộc')
    .isString()
    .withMessage('MangaDex ID phải là chuỗi'),
  
  body('genres')
    .isArray()
    .withMessage('Genres phải là một mảng')
    .custom((value) => {
      if (!Array.isArray(value)) return false;
      return value.every(genre => typeof genre === 'string');
    })
    .withMessage('Mỗi thể loại phải là chuỗi')
];

exports.updateMangaValidator = [
  body('title.en')
    .optional()
    .isString()
    .withMessage('Tiêu đề tiếng Anh phải là chuỗi'),
  
  body('title.vi')
    .optional()
    .isString()
    .withMessage('Tiêu đề tiếng Việt phải là chuỗi'),
  
  body('status')
    .optional()
    .isIn(['ongoing', 'completed', 'hiatus', 'cancelled'])
    .withMessage('Trạng thái không hợp lệ'),
  
  body('genres')
    .optional()
    .isArray()
    .withMessage('Genres phải là một mảng')
    .custom((value) => {
      if (!Array.isArray(value)) return false;
      return value.every(genre => typeof genre === 'string');
    })
    .withMessage('Mỗi thể loại phải là chuỗi')
];

exports.getMangaByIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('ID manga không hợp lệ')
];