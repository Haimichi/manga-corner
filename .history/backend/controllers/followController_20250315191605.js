const Follow = require('../models/Follow');
const Manga = require('../models/Manga');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getMyFollows = catchAsync(async (req, res, next) => {
  const follows = await Follow.find({ userId: req.user._id })
    .populate('mangaId')
    .sort('-followedAt');

  res.status(200).json({
    status: 'success',
    data: follows
  });
});

exports.followManga = catchAsync(async (req, res, next) => {
  const { mangaId } = req.params;
  const userId = req.user._id;

  const existingFollow = await Follow.findOne({ userId, mangaId });
  if (existingFollow) {
    return next(new AppError('Bạn đã theo dõi manga này rồi', 400));
  }

  const follow = await Follow.create({
    userId,
    mangaId,
    notifications: true
  });

  await Manga.findByIdAndUpdate(mangaId, { $inc: { followCount: 1 } });

  res.status(201).json({
    status: 'success',
    data: follow
  });
});

exports.unfollowManga = catchAsync(async (req, res, next) => {
  const { mangaId } = req.params;
  const userId = req.user._id;

  const follow = await Follow.findOneAndDelete({ userId, mangaId });
  if (!follow) {
    return next(new AppError('Không tìm thấy theo dõi', 404));
  }

  await Manga.findByIdAndUpdate(mangaId, { $inc: { followCount: -1 } });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.toggleNotifications = catchAsync(async (req, res, next) => {
  const { mangaId } = req.params;
  const userId = req.user._id;

  const follow = await Follow.findOne({ userId, mangaId });
  if (!follow) {
    return next(new AppError('Không tìm thấy theo dõi', 404));
  }

  follow.notifications = !follow.notifications;
  await follow.save();

  res.status(200).json({
    status: 'success',
    data: follow
  });
});