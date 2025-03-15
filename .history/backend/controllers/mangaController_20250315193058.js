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
  const { 
    query,
    genres,
    status,
    sort = 'updatedAt',
    order = 'desc',
    page = 1,
    limit = 20
  } = req.query;

  const filter = {};
  
  if (query) {
    filter.$text = { $search: query };
  }

  if (genres) {
    filter.genres = { $all: genres.split(',') };
  }

  if (status) {
    filter.status = status;
  }

  const sortOptions = {};
  if (sort === 'followCount') {
    sortOptions[sort] = order === 'desc' ? -1 : 1;
  } else if (sort === 'updatedAt') {
    sortOptions[sort] = order === 'desc' ? -1 : 1;
  }

  const cacheKey = `search:${JSON.stringify({ query, genres, status, sort, order, page, limit })}`;
  const cachedResult = await cacheService.get(cacheKey);

  if (cachedResult) {
    return res.status(200).json(cachedResult);
  }

  const skip = (page - 1) * limit;

  const [manga, total] = await Promise.all([
    Manga.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit),
    Manga.countDocuments(filter)
  ]);

  const result = {
    status: 'success',
    data: manga,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    }
  };

  await cacheService.set(cacheKey, result, 300); // Cache trong 5 phút

  res.status(200).json(result);
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

exports.getGenres = catchAsync(async (req, res) => {
  const cacheKey = 'manga:genres';
  let genres = await cacheService.get(cacheKey);

  if (!genres) {
    genres = await Manga.distinct('genres');
    await cacheService.set(cacheKey, genres, 3600); // Cache 1 giờ
  }

  res.status(200).json({
    status: 'success',
    data: genres
  });
});