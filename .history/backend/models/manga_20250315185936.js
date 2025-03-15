const mongoose = require('mongoose');

const mangaSchema = new mongoose.Schema({
  mangadexId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    en: {
      type: String,
      required: true
    },
    vi: String
  },
  description: {
    en: String,
    vi: String
  },
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'hiatus', 'cancelled'],
    default: 'ongoing'
  },
  genres: [String],
  coverImage: String,
  lastChapter: String,
  followCount: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

mangaSchema.index({ 'title.en': 'text', 'title.vi': 'text' });

module.exports = mongoose.model('Manga', mangaSchema);