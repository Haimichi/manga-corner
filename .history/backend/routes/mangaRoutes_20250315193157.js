const express = require('express');
const mangaController = require('../controllers/mangaController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { searchMangaValidator, createMangaValidator } = require('../middlewares/validators/mangaValidator');

const router = express.Router();

// Public routes
router.get('/latest', mangaController.getLatestManga);
router.get('/popular', mangaController.getPopularManga);
router.get('/search', searchMangaValidator, validate, mangaController.searchManga);
router.get('/genres', mangaController.getGenres);
router.get('/:id', mangaController.getMangaById);
router.get('/:id/chapters', mangaController.getMangaChapters);

// Protected routes
router.use(auth.protect);
router.post('/:id/follow', mangaController.followManga);
router.delete('/:id/unfollow', mangaController.unfollowManga);

module.exports = router;