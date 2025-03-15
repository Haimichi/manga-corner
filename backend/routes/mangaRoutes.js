const express = require('express');
const mangaController = require('../controllers/mangaController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { 
  searchMangaValidator, 
  createMangaValidator,
  updateMangaValidator,
  getMangaByIdValidator 
} = require('../middlewares/validators/mangaValidator');

const router = express.Router();

// Public routes
router.get('/latest', mangaController.getLatestManga);
router.get('/popular', mangaController.getPopularManga);
router.get('/search', searchMangaValidator, validate, mangaController.searchManga);
router.get('/genres', mangaController.getGenres);
router.get('/:id', getMangaByIdValidator, validate, mangaController.getMangaById);
router.get('/:id/chapters', getMangaByIdValidator, validate, mangaController.getMangaChapters);

// Protected routes
router.use(auth.protect);
router.post('/:id/follow', getMangaByIdValidator, validate, mangaController.followManga);
router.delete('/:id/unfollow', getMangaByIdValidator, validate, mangaController.unfollowManga);

module.exports = router;