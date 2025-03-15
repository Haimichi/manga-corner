const express = require('express');
const commentController = require('../controllers/commentController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { 
  createCommentValidator, 
  updateCommentValidator 
} = require('../middlewares/validators/commentValidator');

const router = express.Router({ mergeParams: true });

// Public routes
router.get('/:targetType/:targetId', commentController.getComments);

// Protected routes
router.use(auth.protect);

router.post(
  '/:targetType/:targetId',
  createCommentValidator,
  validate,
  commentController.createComment
);

router.patch(
  '/:id',
  updateCommentValidator,
  validate,
  commentController.updateComment
);

router.delete('/:id', commentController.deleteComment);

router.post('/:id/like', commentController.likeComment);

module.exports = router; 