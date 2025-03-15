const express = require('express');
const mangaController = require('../controllers/mangaController');
const auth = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.get('/latest', mangaController.getLatestManga);
router.get('/popular', mangaController.getPopularManga);
router.get('/search', mangaController.searchManga);
router.get('/:id', mangaController.getMangaById);
router.get('/:id/chapters', mangaController.getMangaChapters);

// Protected routes
router.use(auth.protect);
router.post('/:id/follow', mangaController.followManga);
router.delete('/:id/unfollow', mangaController.unfollowManga);

module.exports = router;