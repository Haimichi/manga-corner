const mongoose = require('mongoose');

const mangaSchema = new mongoose.Schema({
  title: {
    vi: { type: String, required: true },
    en: { type: String }
  },
  alternativeTitles: [String],
  description: {
    vi: { type: String, required: true },
    en: { type: String }
  },
  coverImage: {
    type: String,
    required: [true, 'Truyện phải có ảnh bìa']
  },
  genres: [String],
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'hiatus'],
    default: 'ongoing'
  },
  creator: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Truyện phải có người tạo']
  },
  translators: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  followCount: {
    type: Number,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  avgRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  lastChapter: String,
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  publicationStatus: {
    type: String,
    enum: ['draft', 'pending', 'published', 'rejected'],
    default: 'pending'
  },
  language: {
    type: String,
    enum: ['vi', 'en'],
    default: 'vi'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ảo hóa để lấy danh sách chapter
mangaSchema.virtual('chapters', {
  ref: 'Chapter',
  foreignField: 'manga',
  localField: '_id'
});

const Manga = mongoose.model('Manga', mangaSchema);
module.exports = Manga;