const Chapter = require('../models/Chapter');
const Manga = require('../models/Manga');
const notificationService = require('../services/notificationService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getChapter = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const chapter = await Chapter.findById(id);

  if (!chapter) {
    return next(new AppError('Không tìm thấy chapter', 404));
  }

  res.status(200).json({
    status: 'success',
    data: chapter
  });
});

exports.createChapter = catchAsync(async (req, res, next) => {
  const { mangaId } = req.params;
  const manga = await Manga.findById(mangaId);

  if (!manga) {
    return next(new AppError('Không tìm thấy manga', 404));
  }

  const chapter = await Chapter.create({
    ...req.body,
    mangaId
  });

  // Gửi thông báo cho người theo dõi
  await notificationService.notifyNewChapter(manga, chapter);

  res.status(201).json({
    status: 'success',
    data: chapter
  });
});

exports.updateChapter = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const chapter = await Chapter.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  });

  if (!chapter) {
    return next(new AppError('Không tìm thấy chapter', 404));
  }

  res.status(200).json({
    status: 'success',
    data: chapter
  });
});

exports.deleteChapter = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const chapter = await Chapter.findByIdAndDelete(id);

  if (!chapter) {
    return next(new AppError('Không tìm thấy chapter', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});