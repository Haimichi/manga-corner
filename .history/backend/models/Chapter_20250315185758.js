const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  mangaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manga',
    required: true
  },
  mangadexId: {
    type: String,
    required: true,
    unique: true
  },
  chapterNumber: {
    type: String,
    required: true
  },
  title: String,
  language: {
    type: String,
    required: true
  },
  pages: [String],
  scanlationGroupId: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

chapterSchema.index({ mangaId: 1, chapterNumber: 1 });

module.exports = mongoose.model('Chapter', chapterSchema);