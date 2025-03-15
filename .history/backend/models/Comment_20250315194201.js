const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Nội dung bình luận không được để trống'],
    trim: true
  },
  // Có thể là ID của manga hoặc chapter
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  // Phân biệt comment thuộc manga hay chapter
  targetType: {
    type: String,
    enum: ['manga', 'chapter'],
    required: true
  },
  // Cho phép reply comments
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  // Đếm số lượt thích
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate cho replies
commentSchema.virtual('replies', {
  ref: 'Comment',
  foreignField: 'parentId',
  localField: '_id'
});

// Index để tối ưu truy vấn
commentSchema.index({ targetId: 1, targetType: 1 });
commentSchema.index({ parentId: 1 });

module.exports = mongoose.model('Comment', commentSchema);s