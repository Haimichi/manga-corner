const Manga = require('../models/Manga');
const Chapter = require('../models/Chapter');
const Follow = require('../models/Follow');
const mangadexService = require('../services/mangadexService');
const cacheService = require('../services/cacheService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getLatestManga = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const cacheKey = cacheService.generateKey('latest-manga', page, limit);
  let manga = await cacheService.get(cacheKey);

  if (!manga) {
    manga = await mangadexService.getLatestManga(limit, offset);
    await cacheService.set(cacheKey, manga);
  }

  res.status(200).json({
    status: 'success',
    data: manga
  });
});

exports.getPopularManga = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const cacheKey = cacheService.generateKey('popular-manga', page, limit);
  let manga = await cacheService.get(cacheKey);

  if (!manga) {
    manga = await mangadexService.getPopularManga(limit, offset);
    await cacheService.set(cacheKey, manga);
  }

  res.status(200).json({
    status: 'success',
    data: manga
  });
});

exports.searchManga = catchAsync(async (req, res, next) => {
  const { query } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const manga = await Manga.find(
    { $text: { $search: query } },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .skip(offset)
    .limit(limit);

  res.status(200).json({
    status: 'success',
    data: manga
  });
});

exports.getMangaById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const manga = await Manga.findById(id);

  if (!manga) {
    return next(new AppError('Không tìm thấy manga', 404));
  }

  res.status(200).json({
    status: 'success',
    data: manga
  });
});

exports.getMangaChapters = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const chapters = await Chapter.find({ mangaId: id })
    .sort('-chapterNumber');

  res.status(200).json({
    status: 'success',
    data: chapters
  });
});

exports.followManga = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const follow = await Follow.create({
    userId,
    mangaId: id
  });

  await Manga.findByIdAndUpdate(id, { $inc: { followCount: 1 } });

  res.status(201).json({
    status: 'success',
    data: follow
  });
});

exports.unfollowManga = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  await Follow.findOneAndDelete({ userId, mangaId: id });
  await Manga.findByIdAndUpdate(id, { $inc: { followCount: -1 } });

  res.status(204).json({
    status: 'success',
    data: null
  });
});