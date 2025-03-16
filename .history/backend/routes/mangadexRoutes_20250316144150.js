const express = require('express');
const router = express.Router();
const mangadexController = require('../controllers/mangadexController');

// Routes cho MangaDex API
router.get('/search', mangadexController.searchManga);
router.get('/manga/:id', mangadexController.getMangaById);
router.get('/manga/:id/chapters', mangadexController.getChapters);
router.get('/chapter/:id', mangadexController.getChapterById);
router.get('/chapter/:id/pages', mangadexController.getChapterPages);
router.get('/api/mangadex/latest', mangadexController.getLatestManga);
router.get('/api/mangadex/popular', mangadexController.getPopularManga);
router.get('/api/mangadex/manga/:mangaId', mangadexController.getMangaDetails);
router.get('/api/mangadex/manga/:mangaId/chapters', mangadexController.getMangaChapters);
router.get('/api/mangadex/chapter/:chapterId', mangadexController.getChapterPages);

// Route để kiểm tra kết nối với MangaDex API
router.get('/check', mangadexController.checkMangaDexAPI);

// Thêm routes mới
router.get('/vietnamese', mangadexController.getAllVietnameseManga);
router.get('/vietnamese/search', mangadexController.searchVietnameseManga);

module.exports = router; 