const Manga = require('../models/Manga');
const Chapter = require('../models/Chapter');
const Follow = require('../models/Follow');
const Rating = require('../models/Rating');
const mangadexService = require('../services/mangadexService');
const cacheService = require('../services/cacheService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getLatestManga = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  const manga = await Manga.find()
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Manga.countDocuments();

  res.status(200).json({
    status: 'success',
    data: manga,
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getPopularManga = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  const manga = await Manga.find()
    .sort({ views: -1, followCount: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Manga.countDocuments();

  res.status(200).json({
    status: 'success',
    data: manga,
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
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
  const manga = await Manga.findById(req.params.id);

  if (!manga) {
    return next(new AppError('Không tìm thấy manga với ID này', 404));
  }

  // Tăng số lượt xem
  manga.views += 1;
  await manga.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: manga
  });
});

exports.getChaptersByMangaId = catchAsync(async (req, res, next) => {
  const mangaId = req.params.mangaId;
  const limit = parseInt(req.query.limit) || 20;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  const chapters = await Chapter.find({ manga: mangaId })
    .sort({ number: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Chapter.countDocuments({ manga: mangaId });

  res.status(200).json({
    status: 'success',
    data: chapters,
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.rateManga = catchAsync(async (req, res, next) => {
  const { rating, comment } = req.body;
  const mangaId = req.params.mangaId;
  const userId = req.user.id;

  // Kiểm tra xem người dùng đã đánh giá manga này chưa
  let userRating = await Rating.findOne({
    manga: mangaId,
    user: userId
  });

  if (userRating) {
    // Cập nhật đánh giá hiện có
    userRating.rating = rating;
    userRating.comment = comment;
    await userRating.save();
  } else {
    // Tạo đánh giá mới
    userRating = await Rating.create({
      rating,
      comment,
      manga: mangaId,
      user: userId
    });
  }

  // Cập nhật điểm trung bình của manga
  const allRatings = await Rating.find({ manga: mangaId });
  const avgRating = allRatings.reduce((sum, item) => sum + item.rating, 0) / allRatings.length;

  await Manga.findByIdAndUpdate(mangaId, { 
    avgRating: parseFloat(avgRating.toFixed(1)), 
    ratingCount: allRatings.length 
  });

  res.status(200).json({
    status: 'success',
    data: userRating
  });
});

exports.followManga = catchAsync(async (req, res, next) => {
  const mangaId = req.params.mangaId;
  const userId = req.user.id;

  // Kiểm tra xem manga có tồn tại không
  const manga = await Manga.findById(mangaId);
  if (!manga) {
    return next(new AppError('Không tìm thấy manga với ID này', 404));
  }

  // Kiểm tra xem người dùng đã theo dõi manga này chưa
  const existFollow = await Follow.findOne({
    manga: mangaId,
    user: userId,
    type: 'manga'
  });

  if (existFollow) {
    return next(new AppError('Bạn đã theo dõi manga này rồi', 400));
  }

  // Tạo bản ghi theo dõi mới
  const follow = await Follow.create({
    manga: mangaId,
    user: userId,
    type: 'manga'
  });

  // Cập nhật số lượng người theo dõi cho manga
  manga.followCount = (manga.followCount || 0) + 1;
  await manga.save({ validateBeforeSave: false });

  res.status(201).json({
    status: 'success',
    data: follow
  });
});

exports.unfollowManga = catchAsync(async (req, res, next) => {
  const mangaId = req.params.mangaId;
  const userId = req.user.id;

  // Xóa bản ghi theo dõi
  const follow = await Follow.findOneAndDelete({
    manga: mangaId,
    user: userId,
    type: 'manga'
  });

  if (!follow) {
    return next(new AppError('Bạn chưa theo dõi manga này', 400));
  }

  // Cập nhật số lượng người theo dõi cho manga
  const manga = await Manga.findById(mangaId);
  if (manga) {
    manga.followCount = Math.max((manga.followCount || 0) - 1, 0);
    await manga.save({ validateBeforeSave: false });
  }

  res.status(200).json({
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

exports.createManga = catchAsync(async (req, res, next) => {
  // Thêm người tạo vào dữ liệu
  req.body.creator = req.user.id;
  req.body.translators = [req.user.id];
  
  // Mặc định đặt trạng thái là "chờ duyệt" trừ khi là admin
  if (req.user.role !== 'admin') {
    req.body.publicationStatus = 'pending';
  } else {
    req.body.publicationStatus = req.body.publicationStatus || 'published';
  }

  const newManga = await Manga.create(req.body);

  res.status(201).json({
    status: 'success',
    data: newManga
  });
});

exports.getMyManga = catchAsync(async (req, res, next) => {
  const myManga = await Manga.find({ 
    $or: [
      { creator: req.user.id },
      { translators: req.user.id }
    ]
  }).sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: myManga.length,
    data: myManga
  });
});

exports.updateManga = catchAsync(async (req, res, next) => {
  const manga = await Manga.findById(req.params.id);

  if (!manga) {
    return next(new AppError('Không tìm thấy truyện', 404));
  }

  // Kiểm tra quyền cập nhật
  const isCreator = req.user.id.toString() === manga.creator.toString();
  const isTranslator = manga.translators.some(id => id.toString() === req.user.id.toString());
  const isAdmin = req.user.role === 'admin';

  if (!isCreator && !isTranslator && !isAdmin) {
    return next(new AppError('Bạn không có quyền cập nhật truyện này', 403));
  }

  // Nếu không phải admin thì không được thay đổi trạng thái xuất bản
  if (req.user.role !== 'admin') {
    delete req.body.publicationStatus;
  }

  // Cập nhật truyện
  const updatedManga = await Manga.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: updatedManga
  });
});

exports.deleteManga = catchAsync(async (req, res, next) => {
  const manga = await Manga.findById(req.params.id);

  if (!manga) {
    return next(new AppError('Không tìm thấy truyện', 404));
  }

  // Kiểm tra quyền xóa
  const isCreator = req.user.id.toString() === manga.creator.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isCreator && !isAdmin) {
    return next(new AppError('Bạn không có quyền xóa truyện này', 403));
  }

  await Manga.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getPendingManga = catchAsync(async (req, res, next) => {
  const pendingManga = await Manga.find({ publicationStatus: 'pending' })
    .populate('creator', 'username email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: pendingManga.length,
    data: pendingManga
  });
});

exports.approveManga = catchAsync(async (req, res, next) => {
  const manga = await Manga.findById(req.params.id);

  if (!manga) {
    return next(new AppError('Không tìm thấy truyện', 404));
  }

  if (manga.publicationStatus !== 'pending') {
    return next(new AppError('Truyện này không đang ở trạng thái chờ phê duyệt', 400));
  }

  manga.publicationStatus = 'published';
  await manga.save();

  res.status(200).json({
    status: 'success',
    message: 'Truyện đã được phê duyệt',
    data: manga
  });
});

exports.rejectManga = catchAsync(async (req, res, next) => {
  const manga = await Manga.findById(req.params.id);

  if (!manga) {
    return next(new AppError('Không tìm thấy truyện', 404));
  }

  if (manga.publicationStatus !== 'pending') {
    return next(new AppError('Truyện này không đang ở trạng thái chờ phê duyệt', 400));
  }

  manga.publicationStatus = 'rejected';
  await manga.save();

  res.status(200).json({
    status: 'success',
    message: 'Truyện đã bị từ chối',
    data: manga
  });
});