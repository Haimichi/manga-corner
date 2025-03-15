const User = require('../models/User');
const Follow = require('../models/Follow');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const { username, email } = req.body;

  if (req.body.password) {
    return next(new AppError('Route này không dùng để cập nhật mật khẩu', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { username, email },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.getFollowingManga = catchAsync(async (req, res, next) => {
  const follows = await Follow.find({ userId: req.user._id })
    .populate('mangaId')
    .sort('-followedAt');

  res.status(200).json({
    status: 'success',
    data: follows
  });
});