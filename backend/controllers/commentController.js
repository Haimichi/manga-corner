const Comment = require('../models/Comment');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getComments = catchAsync(async (req, res, next) => {
  const { targetId, targetType } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Chỉ lấy comment gốc (không phải replies)
  const comments = await Comment.find({
    targetId,
    targetType,
    parentId: null
  })
    .populate('userId', 'username avatar')
    .populate({
      path: 'replies',
      populate: {
        path: 'userId',
        select: 'username avatar'
      }
    })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Comment.countDocuments({
    targetId,
    targetType,
    parentId: null
  });

  res.status(200).json({
    status: 'success',
    data: {
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

exports.createComment = catchAsync(async (req, res, next) => {
  const { targetId, targetType } = req.params;
  const { content, parentId } = req.body;

  // Kiểm tra nếu là reply comment
  if (parentId) {
    const parentComment = await Comment.findById(parentId);
    if (!parentComment) {
      return next(new AppError('Không tìm thấy bình luận gốc', 404));
    }
  }

  const comment = await Comment.create({
    userId: req.user._id,
    targetId,
    targetType,
    content,
    parentId
  });

  await comment.populate('userId', 'username avatar');

  res.status(201).json({
    status: 'success',
    data: comment
  });
});

exports.updateComment = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { content } = req.body;

  const comment = await Comment.findById(id);

  if (!comment) {
    return next(new AppError('Không tìm thấy bình luận', 404));
  }

  // Chỉ cho phép người tạo comment cập nhật
  if (comment.userId.toString() !== req.user._id.toString()) {
    return next(new AppError('Bạn không có quyền cập nhật bình luận này', 403));
  }

  comment.content = content;
  await comment.save();

  res.status(200).json({
    status: 'success',
    data: comment
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const comment = await Comment.findById(id);

  if (!comment) {
    return next(new AppError('Không tìm thấy bình luận', 404));
  }

  // Chỉ cho phép người tạo comment hoặc admin xóa
  if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Bạn không có quyền xóa bình luận này', 403));
  }

  // Xóa cả replies nếu là comment gốc
  if (!comment.parentId) {
    await Comment.deleteMany({ parentId: comment._id });
  }

  await comment.deleteOne();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.likeComment = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const comment = await Comment.findById(id);

  if (!comment) {
    return next(new AppError('Không tìm thấy bình luận', 404));
  }

  const userIdStr = req.user._id.toString();
  const likeIndex = comment.likes.findIndex(id => id.toString() === userIdStr);

  if (likeIndex === -1) {
    comment.likes.push(req.user._id);
  } else {
    comment.likes.splice(likeIndex, 1);
  }

  await comment.save();

  res.status(200).json({
    status: 'success',
    data: comment
  });
});