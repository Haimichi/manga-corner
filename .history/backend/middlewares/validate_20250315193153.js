const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');
const { body, query, param } = require('express-validator');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new AppError('Dữ liệu không hợp lệ', 400);
    error.errors = errors.array();
    return next(error);
  }
  next();
};

exports.searchMangaValidator = [
  query('query').optional().trim(),
  query('genres').optional().trim(),
  query('status').optional().isIn(['ongoing', 'completed', 'hiatus', 'cancelled']),
  query('sort').optional().isIn(['updatedAt', 'followCount']),
  query('order').optional().isIn(['asc', 'desc']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
];

exports.createMangaValidator = [
  body('title.en').notEmpty().withMessage('Tiêu đề tiếng Anh là bắt buộc'),
  body('mangadexId').notEmpty().withMessage('MangaDex ID là bắt buộc'),
  body('genres').isArray().withMessage('Genres phải là một mảng')
];