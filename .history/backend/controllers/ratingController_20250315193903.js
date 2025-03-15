const Rating = require('../models/Rating');
const Manga = require('../models/Manga');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.createRating = catchAsync(async (req, res, next) => {
  const { mangaId } = req.params;
  const userId = req.user._id;
  const { rating, comment } = req.body;

  const newRating = await Rating.create({
    userId,
    mangaId,
    rating,
    comment
  });

  // Cập nhật rating trung bình của manga
  const stats = await Rating.aggregate([
    {
      $match: { mangaId: mongoose.Types.ObjectId(mangaId) }
    },
    {
      $group: {
        _id: '$mangaId',
        avgRating: { $avg: '$rating' },
        numRatings: { $sum: 1 }
      }
    }
  ]);

  await Manga.findByIdAndUpdate(mangaId, {
    avgRating: stats[0].avgRating,
    numRatings: stats[0].numRatings
  });

  res.status(201).json({
    status: 'success',
    data: newRating
  });
});

exports.getMangaRatings = catchAsync(async (req, res, next) => {
  const { mangaId } = req.params;
  const ratings = await Rating.find({ mangaId })
    .populate('userId', 'username')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    data: ratings
  });
});