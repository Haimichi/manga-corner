const express = require('express');
const chapterController = require('../controllers/chapterController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { 
  createChapterValidator, 
  updateChapterValidator 
} = require('../middlewares/validators/chapterValidator');

const router = express.Router({ mergeParams: true });

// Public routes
router.get('/:id', chapterController.getChapter);

// Protected routes
router.use(auth.protect);
router.post('/', createChapterValidator, validate, chapterController.createChapter);
router.patch('/:id', updateChapterValidator, validate, chapterController.updateChapter);
router.delete('/:id', chapterController.deleteChapter);

module.exports = router;