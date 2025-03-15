const User = require('../models/User');
const Follow = require('../models/Follow');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const multer = require('multer');
const sharp = require('sharp');

// Cấu hình multer để upload ảnh
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Không phải file ảnh! Vui lòng upload ảnh.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserAvatar = upload.single('avatar');

exports.resizeUserAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

exports.getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate('readingHistory.manga', 'title coverImage')
    .populate('readingHistory.lastChapter', 'chapterNumber');

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  // 1) Tạo error nếu user cố gắng update password
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('Route này không dùng để cập nhật mật khẩu.', 400));
  }

  // 2) Update user document
  const filteredBody = filterObj(req.body,
    'username',
    'email',
    'bio',
    'dateOfBirth',
    'gender',
    'socialLinks',
    'favoriteGenres',
    'notifications'
  );

  if (req.file) filteredBody.avatar = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if posted password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Mật khẩu hiện tại không đúng', 401));
  }

  // 3) Update password
  user.password = req.body.password;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Mật khẩu đã được cập nhật'
  });
});

exports.updateReadingHistory = catchAsync(async (req, res, next) => {
  const { mangaId, chapterId } = req.body;

  const user = await User.findById(req.user.id);
  
  // Tìm manga trong lịch sử đọc
  const historyIndex = user.readingHistory.findIndex(
    h => h.manga.toString() === mangaId
  );

  if (historyIndex > -1) {
    // Cập nhật chapter mới nhất
    user.readingHistory[historyIndex].lastChapter = chapterId;
    user.readingHistory[historyIndex].lastReadAt = Date.now();
  } else {
    // Thêm manga mới vào lịch sử
    user.readingHistory.push({
      manga: mangaId,
      lastChapter: chapterId
    });
  }

  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Đã cập nhật lịch sử đọc'
  });
});

exports.getReadingHistory = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate({
      path: 'readingHistory.manga',
      select: 'title coverImage'
    })
    .populate({
      path: 'readingHistory.lastChapter',
      select: 'chapterNumber'
    });

  res.status(200).json({
    status: 'success',
    data: {
      history: user.readingHistory
    }
  });
});

exports.updateNotificationSettings = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { notifications: req.body },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      notifications: user.notifications
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

// Helper function to filter allowed fields
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};