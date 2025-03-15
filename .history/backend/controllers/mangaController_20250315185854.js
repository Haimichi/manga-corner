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

exports.getMangaById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const cacheKey = cacheService.generateKey('manga', id);
  let manga = await cacheService.get(cacheKey);

  if (!manga) {
    manga = await mangadexService.getMangaById(id);
    if (!manga) {
      return next(new AppError('Không tìm thấy manga', 404));
    }
    await cacheService.set(cacheKey, manga);
  }

  res.status(200).json({
    status: 'success',
    data: manga
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