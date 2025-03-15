const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new AppError('Dữ liệu không hợp lệ', 400);
    error.errors = errors.array();
    return next(error);
  }
  next();
};